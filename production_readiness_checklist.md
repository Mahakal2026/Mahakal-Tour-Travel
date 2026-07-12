# 🚀 Mahakal Tour & Travels — Production Readiness Checklist

> **Goal**: Get the website live on a production domain (`mahakaltourandtravels.com`) and handle **500+ concurrent users** reliably.

> [!IMPORTANT]
> This document is your complete work-list. Items are grouped by priority. Every single issue was found by auditing all source files and terminal logs.

---

## Table of Contents

1. [🔴 CRITICAL — Must Fix Before Going Live](#-critical--must-fix-before-going-live)
2. [🟠 HIGH — Required for 500-User Capacity](#-high--required-for-500-user-capacity)
3. [🟡 MEDIUM — Important for Stability & Maintainability](#-medium--important-for-stability--maintainability)
4. [🟢 LOW — Nice-to-Have / Post-Launch Polish](#-low--nice-to-have--post-launch-polish)
5. [📋 Deployment Architecture Recommendation](#-deployment-architecture-recommendation)
6. [✅ What's Already Done Well](#-whats-already-done-well)

---

## 🔴 CRITICAL — Must Fix Before Going Live

These items will cause **downtime, security breaches, or broken features** if not addressed.

### 1. 🔐 Hardcoded Database Credentials in `seed.ts`

| File | Issue |
|---|---|
| [seed.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/seed.ts#L7) | MongoDB Atlas connection string with username `animate` and password `k0Bz8eZfrJe7UM1E` is **hardcoded in plain text** |

**Action**: 
- [ ] Remove the hardcoded connection string from `seed.ts`
- [ ] Use `env.MONGODB_URI` instead (import from `config/env.ts`)
- [ ] **Rotate the leaked password immediately** on MongoDB Atlas → Database Access
- [ ] Add `seed.ts` to a script in `package.json` that loads `.env` properly

---

### 2. 🌐 Frontend API URL Hardcoded to `localhost`

| File | Issue |
|---|---|
| [frontend/.env](file:///c:/Users/akans/OneDrive/Desktop/MTT/frontend/.env) | `NEXT_PUBLIC_API_URL=http://localhost:5000/api` — will not work in production |

**Action**:
- [ ] Create separate `.env.production` file: `NEXT_PUBLIC_API_URL=https://api.mahakaltourandtravels.com/api`
- [ ] Or set the env variable on your hosting platform (Vercel, etc.)

---

### 3. 🌐 Backend CORS Only Allows `localhost`

| File | Issue |
|---|---|
| [app.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/app.ts#L54) | `allowedOrigins` only lists `localhost` and `FRONTEND_URL` from env |

**Action**:
- [ ] Set `FRONTEND_URL` in production `.env` to `https://mahakaltourandtravels.com`
- [ ] Add `https://www.mahakaltourandtravels.com` to `allowedOrigins` as well (with/without www)

---

### 4. 🍪 Cookie `sameSite: "strict"` Will Block Cross-Origin Refresh Token

| File | Issue |
|---|---|
| [admin.controller.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/modules/admin/admin.controller.ts#L18) | If frontend (Vercel) and backend (Railway/Render) are on different domains, `sameSite: "strict"` cookies **won't be sent** |

**Action**:
- [ ] Change `sameSite` to `"none"` for cross-domain deployment (requires `secure: true`)
- [ ] **OR** deploy frontend and backend on the same domain (e.g., `api.mahakaltourandtravels.com` for backend)

---

### 5. 🖼️ Missing `og-image.jpg` (SEO will be broken)

| File | Issue |
|---|---|
| [layout.tsx](file:///c:/Users/akans/OneDrive/Desktop/MTT/frontend/src/app/layout.tsx#L46) | References `/og-image.jpg` but this file **does not exist** in `/public` |

**Action**:
- [ ] Create a 1200×630px OG image for social media sharing
- [ ] Place it at `frontend/public/og-image.jpg`

---

### 6. 🔒 `.env.example` is Missing Required Variables

| File | Issue |
|---|---|
| [.env.example](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/.env.example) | Missing `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` which are required by `env.ts` |

**Action**:
- [ ] Add the missing variables to `.env.example`:
  ```env
  JWT_REFRESH_SECRET=your_refresh_secret_key_here
  ADMIN_EMAIL=admin@mahakaltravels.com
  ADMIN_PASSWORD_HASH=$2a$10$your_bcrypt_hash_here
  ```

---

### 7. 🔓 Dual Auth Systems — Potential Security Confusion

| Files | Issue |
|---|---|
| [useAuth.tsx](file:///c:/Users/akans/OneDrive/Desktop/MTT/frontend/src/hooks/useAuth.tsx) + [AdminAuthContext.tsx](file:///c:/Users/akans/OneDrive/Desktop/MTT/frontend/src/context/AdminAuthContext.tsx) | Two separate auth systems exist. `useAuth.tsx` still uses `localStorage.getItem("admin_token")` and the basic `apiClient` (no auth header). `AdminAuthContext.tsx` uses httpOnly cookies + interceptors correctly |

**Action**:
- [ ] Determine which auth system is actually in use (it appears `AdminAuthContext` is the active one)
- [ ] Remove or deprecate the old `useAuth.tsx` hook to prevent confusion
- [ ] Ensure no component is importing the old `useAuth` hook

---

### 8. ⚡ `globalLimiter` is Defined But Never Applied

| File | Issue |
|---|---|
| [rateLimiter.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/middlewares/rateLimiter.ts#L4) | `globalLimiter` (100 req/15min) is exported but **never used** in `app.ts`. Anyone can flood your server |

**Action**:
- [ ] Apply the global rate limiter in `app.ts`:
  ```typescript
  app.use(globalLimiter);
  ```

---

## 🟠 HIGH — Required for 500-User Capacity

These items directly affect **performance and scalability** under load.

### 9. 🗄️ MongoDB Connection Pooling Not Configured

| File | Issue |
|---|---|
| [db.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/config/db.ts) | `mongoose.connect(env.MONGODB_URI)` uses default pool size of 5 connections — far too low for 500 users |

**Action**:
- [ ] Configure connection pool options:
  ```typescript
  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 50,
    minPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  ```

---

### 10. 🏗️ No Reverse Proxy / Clustering (Single Process = Single Core)

| File | Issue |
|---|---|
| [server.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/server.ts) | Node.js is single-threaded. A single process will cap out around ~200 concurrent connections |

**Action**:
- [ ] **Option A (Recommended)**: Deploy behind a reverse proxy with PM2 cluster mode:
  ```bash
  # ecosystem.config.js
  module.exports = {
    apps: [{
      name: "mtt-backend",
      script: "dist/server.js",
      instances: "max",  // Uses all CPU cores
      exec_mode: "cluster",
    }]
  };
  ```
- [ ] **Option B**: Use a platform like Railway/Render that can auto-scale instances
- [ ] **Option C**: Use Docker with multiple container replicas behind a load balancer

---

### 11. 📦 No Build Step Verification

| Issue |
|---|
| `tsc` compilation has never been tested based on terminal logs — dev uses `ts-node` |

**Action**:
- [ ] Run `npm run build` (which runs `tsc`) and fix any compilation errors
- [ ] Test `npm start` (which runs `node dist/server.js`) to verify the production build works
- [ ] Add a CI step that runs `npm run build` on every push

---

### 12. 🧹 Image Cleanup on Deletion

| Files | Issue |
|---|---|
| [vehicle.service.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/modules/vehicle/vehicle.service.ts#L51), [package.service.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/modules/package/package.service.ts#L51) | When vehicles/packages are deleted, their images on ImageKit are **never deleted** — orphaned storage over time |

**Action**:
- [ ] Add ImageKit `deleteFile` call in the `deleteVehicle` and `deletePackage` service methods
- [ ] Also delete the old image when updating with a new one

---

### 13. 📊 No MongoDB Indexes on Admin Model

| File | Issue |
|---|---|
| [admin.model.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/modules/admin/admin.model.ts) | The `email` field has `unique: true` (which creates an index), but there's no index for queries. This is fine for a single admin, but should be verified |

**Action**:
- [ ] Verify the unique index was actually created on MongoDB Atlas (check the Indexes tab)

---

### 14. 🔄 No Health Check for Database State

| File | Issue |
|---|---|
| [health.routes.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/modules/health/health.routes.ts) | Health endpoint only returns uptime — it doesn't check if MongoDB is actually connected |

**Action**:
- [ ] Add MongoDB readiness check to health endpoint:
  ```typescript
  const dbState = mongoose.connection.readyState; // 1 = connected
  ```

---

### 15. 🕐 Graceful Shutdown Timeout Missing

| File | Issue |
|---|---|
| [server.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/server.ts#L50) | `server.close()` has no timeout — if connections hang, the process will never exit |

**Action**:
- [ ] Add a forced kill timeout:
  ```typescript
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000).unref();
  ```

---

### 16. 🔄 `next.config.ts` Missing ImageKit Domain for `<Image />`

| File | Issue |
|---|---|
| [next.config.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/frontend/next.config.ts#L6) | Only `images.unsplash.com` is whitelisted. ImageKit URLs (used for vehicle/package images) will **fail** with Next.js `<Image />` component |

**Action**:
- [ ] Add your ImageKit domain to `remotePatterns`:
  ```typescript
  { protocol: "https", hostname: "ik.imagekit.io" },
  ```

---

## 🟡 MEDIUM — Important for Stability & Maintainability

### 17. 🗑️ Legacy Code Cleanup

| Directory | Issue |
|---|---|
| [backend/legacy_js/](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/legacy_js) | Old JavaScript version of the backend is still in the repo (7 directories + server.js) |
| [Index.html](file:///c:/Users/akans/OneDrive/Desktop/MTT/Index.html) | 66KB monolithic HTML file at root — appears to be the old static site |

**Action**:
- [ ] Delete `backend/legacy_js/` directory entirely
- [ ] Delete `Index.html` from root (it's already in `.gitignore`)

---

### 18. 📧 No Email Notification System Active

| File | Issue |
|---|---|
| [.env.example](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/.env.example#L13) | `nodemailer` is installed and SMTP config is in `.env.example`, but **no code actually sends emails** |

**Action**:
- [ ] Decide: Do you want email notifications for new booking inquiries?
- [ ] If yes, implement email sending in the booking controller
- [ ] If no, remove `nodemailer` from `package.json` to reduce dependencies

---

### 19. 📱 Unhandled AxiosError in Frontend

| Terminal Log | Issue |
|---|---|
| `[browser] ⨯ unhandledRejection: AxiosError: Request failed with status code 400` | An unhandled promise rejection on the homepage — likely the booking form or fare calculator sending invalid data |

**Action**:
- [ ] Add proper error handling with try/catch around all `apiClient` and `adminApi` calls
- [ ] Add user-facing error toast notifications
- [ ] Investigate which exact component triggers the 400 error on page load

---

### 20. 🔢 Fare Calculator Missing Input Validation on Route

| File | Issue |
|---|---|
| [fare.routes.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/modules/vehicle/fare.routes.ts) | `POST /api/fare/calculate` has **no Zod validation middleware** — raw `req.body` is used directly |

**Action**:
- [ ] Add a `fareCalculateSchema` validator:
  ```typescript
  const fareCalculateSchema = z.object({
    vehicleId: z.string().min(1),
    tripType: z.enum(["local", "outstation-round", "one-way"]),
    km: z.number().positive().optional(),
    days: z.number().int().positive().optional(),
  });
  ```

---

### 21. 📁 `logs/` Directory Committed to Git

| Issue |
|---|
| The `logs/` directory with `combined.log` and `error.log` is at the project root and likely committed to git |

**Action**:
- [ ] Add `logs/` to root `.gitignore`
- [ ] Remove from git tracking: `git rm -r --cached logs/`
- [ ] Ensure the `logs/` directory is created automatically in production (or log to stdout for cloud platforms)

---

### 22. 🔐 npm Audit Vulnerabilities

| Terminal Log | Issue |
|---|---|
| Both backend and frontend have **2 moderate severity vulnerabilities** each |

**Action**:
- [ ] Run `npm audit` in both directories to identify the packages
- [ ] Run `npm audit fix` to patch what's safe
- [ ] Document any remaining vulnerabilities that require `--force`

---

### 23. 📊 No Request Logging for Public Routes in Development

| File | Issue |
|---|---|
| [app.ts](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/src/app.ts#L69) | Morgan logging is only enabled in production — dev has no HTTP request logs |

**Action**:
- [ ] Consider enabling a lighter Morgan format in development too (e.g., `"dev"` format to console)

---

## 🟢 LOW — Nice-to-Have / Post-Launch Polish

### 24. 📈 Add Google Analytics / Tracking

- [ ] Install Google Analytics 4 (GA4) tag
- [ ] Add Google Search Console verification
- [ ] Set up conversion tracking for WhatsApp booking clicks

### 25. 🔐 HTTPS & SSL Certificates

- [ ] Ensure SSL is configured on both frontend and backend domains
- [ ] Frontend on Vercel gets free SSL automatically
- [ ] Backend on Railway/Render also gets free SSL
- [ ] Set `HSTS` headers (Helmet already handles some of this)

### 26. 📋 Add `robots.txt` Verification

- [ ] Verify `robots.ts` generates correct output after deployment
- [ ] Submit sitemap to Google Search Console

### 27. 🧪 Add Basic Automated Tests

- [ ] API endpoint smoke tests (health check, vehicle listing, package listing)
- [ ] Frontend build test (`npm run build` in CI)

### 28. 📊 Add Production Monitoring

- [ ] Set up uptime monitoring (UptimeRobot, Better Uptime — free tiers available)
- [ ] Set up error tracking (Sentry free tier)
- [ ] Set up basic APM for response times

### 29. 🔄 Backup Strategy for MongoDB

- [ ] Enable MongoDB Atlas automated backups (M10+ cluster)
- [ ] Or set up `mongodump` cron for M0/Free tier clusters

### 30. 🌐 CDN for Static Assets

- [ ] Vercel automatically CDN-caches Next.js static assets
- [ ] Consider Cloudflare in front of the backend for DDoS protection

### 31. ⚡ Add Response Caching for Public APIs

- [ ] Vehicles list (`GET /api/vehicles`) changes infrequently — add `Cache-Control` headers
- [ ] Packages list (`GET /api/packages`) — same treatment
- [ ] Reviews list (`GET /api/reviews`) — same treatment

### 32. 🖥️ Dockerfile Uses `npm ci --only=production` (Deprecated Flag)

| File | Issue |
|---|---|
| [Dockerfile](file:///c:/Users/akans/OneDrive/Desktop/MTT/backend/Dockerfile#L15) | `--only=production` is deprecated in npm 7+. Use `--omit=dev` instead |

**Action**:
- [ ] Change to: `RUN npm ci --omit=dev`

---

## 📋 Deployment Architecture Recommendation

For **500 concurrent users**, here's the recommended production setup:

```
                    ┌──────────────────┐
                    │   Cloudflare     │
                    │   (DNS + CDN)    │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐       ┌───────────▼──────────┐
    │   Vercel (Free)   │       │  Railway / Render    │
    │   Next.js Frontend│       │  Node.js Backend     │
    │   + CDN + SSL     │       │  + PM2 Cluster       │
    └───────────────────┘       │  + SSL               │
                                └───────────┬──────────┘
                                            │
                                ┌───────────▼──────────┐
                                │  MongoDB Atlas M10   │
                                │  (3-node Replica Set)│
                                │  + Auto Backups      │
                                └──────────────────────┘
```

### Recommended Platforms & Costs

| Component | Platform | Free Tier? | Monthly Cost |
|---|---|---|---|
| Frontend | **Vercel** | ✅ Generous free tier | ₹0 (free for personal/small biz) |
| Backend | **Railway** or **Render** | ✅ Free tier available | ₹0–₹500/mo |
| Database | **MongoDB Atlas M0** | ✅ Free forever (512MB) | ₹0 (M10 ≈ ₹4,500/mo for scale) |
| Image CDN | **ImageKit** | ✅ Free tier (20GB/mo) | ₹0 |
| DNS | **Cloudflare** | ✅ Free plan | ₹0 |
| Domain | **GoDaddy / Namecheap** | ❌ | ≈ ₹800/year |
| Monitoring | **UptimeRobot** | ✅ Free (50 monitors) | ₹0 |

### Production `.env` Template for Backend

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://mahakaltourandtravels.com

MONGODB_URI=mongodb+srv://<user>:<new_password>@mtt.qagmkjb.mongodb.net/production?retryWrites=true&w=majority

JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-different-64-char-random-string>

ADMIN_EMAIL=admin@mahakaltravels.com
ADMIN_PASSWORD_HASH=<bcrypt-hash-of-your-admin-password>

IMAGEKIT_PUBLIC_KEY=<your-key>
IMAGEKIT_PRIVATE_KEY=<your-key>
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your-id>
```

### Production `.env` for Frontend

```env
NEXT_PUBLIC_API_URL=https://api.mahakaltourandtravels.com/api
NEXT_PUBLIC_WHATSAPP_NUMBER=916269643919
```

---

## ✅ What's Already Done Well

Your codebase has a **strong foundation**. Here's what's already production-grade:

| Area | Status |
|---|---|
| ✅ **Modular architecture** | Clean feature-based modules (admin, booking, vehicle, package, review) |
| ✅ **Input validation** | Zod schemas on all routes (except fare calculator) |
| ✅ **Error handling** | Centralized `errorHandler` middleware with proper error classification |
| ✅ **Security headers** | Helmet middleware applied |
| ✅ **Compression** | gzip compression enabled |
| ✅ **NoSQL injection prevention** | `express-mongo-sanitize` applied |
| ✅ **Rate limiting** | Applied on booking + login routes |
| ✅ **Request ID tracking** | UUID-based request tracing |
| ✅ **Graceful shutdown** | SIGTERM/SIGINT handlers with DB disconnection |
| ✅ **JWT with refresh tokens** | Proper access + refresh token pattern with httpOnly cookies |
| ✅ **TTL auto-cleanup** | Booking inquiries auto-delete after 7 days via MongoDB TTL index |
| ✅ **Database indexes** | Compound indexes on booking, vehicle, package, review models |
| ✅ **Dockerfile** | Multi-stage Docker build ready |
| ✅ **SEO** | JSON-LD schema, sitemap, robots.txt, meta tags, OG tags |
| ✅ **Accessibility** | Skip navigation link, focus-visible styles |
| ✅ **Winston logger** | File + console logging with log levels |
| ✅ **Admin auth flow** | Proper silent refresh, interceptors, token rotation |
| ✅ **TypeScript** | Fully typed backend and frontend |

---

## 📊 Priority Execution Order

> Do these in this exact order to go live fastest:

1. **Rotate the leaked MongoDB password** (item 1) — ⏱️ 5 min
2. **Fix `.env` files for production** (items 2, 3, 6) — ⏱️ 15 min
3. **Apply global rate limiter** (item 8) — ⏱️ 2 min
4. **Fix cookie sameSite** (item 4) — ⏱️ 5 min
5. **Create og-image.jpg** (item 5) — ⏱️ 10 min
6. **Remove dual auth system** (item 7) — ⏱️ 15 min
7. **Run `npm run build`** to verify TypeScript compiles (item 11) — ⏱️ 10 min
8. **Add MongoDB pool config** (item 9) — ⏱️ 5 min
9. **Add ImageKit domain to next.config** (item 16) — ⏱️ 2 min
10. **Fix Dockerfile npm flag** (item 32) — ⏱️ 1 min
11. **Deploy backend** to Railway/Render — ⏱️ 30 min
12. **Deploy frontend** to Vercel — ⏱️ 20 min
13. **Test everything end-to-end** — ⏱️ 30 min
14. **Clean up legacy code** (item 17) — ⏱️ 5 min
15. **Set up monitoring** (item 28) — ⏱️ 15 min

**Total estimated time: ~3 hours to go live** 🎯
