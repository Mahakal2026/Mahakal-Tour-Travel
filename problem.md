# Diagnostic Audit Report: Mahakal Tour & Travels

**Date:** 2026-07-15  
**Review Type:** Complete Read-Only Diagnostic Inspection & Live Testing Pass  
**Scope:** Next.js 15 Frontend + Node.js/Express/MongoDB Backend  
**Rule Adherence:** Strictly read-only pass (no source code modified or refactored).

---

## Executive Summary

A rigorous diagnostic inspection and live API verification pass was executed across the Mahakal Tour & Travels web application. The application architecture consists of a Next.js 15 frontend communicating with a modular TypeScript/Express backend backed by MongoDB and ImageKit.

Overall, the application demonstrates solid structural integrity: environment variables are strictly validated on startup using Zod, public routes gracefully handle complete backend outages without crashing, rate limiting (`express-rate-limit`) is actively applied to booking and auth routes, and sensitive endpoints require valid JWT authentication.

However, several **critical logic discrepancies, stateless authentication gaps, and missing UX resilience patterns** were uncovered during deep tracing and live endpoint verification:

1. **Critical Drift Between Frontend & Backend Fare Calculations:** The backend API (`fare.controller.ts`) prioritizes a top-level `outstationPrice` (if `> 0`) or `admin_flat_day_rate` over `outstationTiers`. The shared client formula (`fareFormula.ts`) lacks this prioritization check. For vehicles like **Innova Crysta** (`outstationPrice: 2499`), the public Fare Calculator returns **₹2,499** (via API), while the Admin Fare Preview Widget and fallback formula calculate **₹4,299** for 1 day.
2. **Booking Verification Failures Silently Dropped:** Because `BookingService.createBooking()` enforces server-side price verification (`Math.abs(estimatedFare - expectedPrice) > 10`), submitting a booking inquiry where `estimatedFare` came from the client-side `fareFormula.ts` (or any price mismatch) throws a `400 Bad Request`. On the frontend (`whatsapp.ts`), the `.catch()` block silently ignores this error and opens WhatsApp anyway—meaning **no booking inquiry record is saved to MongoDB** when price drift occurs.
3. **Stateless JWT Logout Gap:** Calling `POST /api/admin/logout` clears the `refreshToken` HttpOnly cookie, but the 15-minute `accessToken` JWT is verified statelessly (`jwt.verify()`) without a revocation check or blocklist. Old access tokens continue to be accepted until their expiration timestamp.
4. **Phone Number Storage Unnormalized:** While Zod validates Indian phone formats correctly, `BookingInquirySchema` stores exact raw strings (`+9198...`, `098...`, `98...`) without stripping prefixes, complicating admin search and filtering.
5. **Missing Custom Error & 404 Pages:** Neither `not-found.tsx` nor `error.tsx` exist in the Next.js `app` directory, causing the site to render default Next.js 404/error pages instead of brand-styled fallbacks.

---

## Section 1: Fare Calculator (`/api/fare/calculate` & `FareCalculator.tsx`)

### 1.1 Local Tab Verification
- **Test Result:** ✅ **Pass**
- **Observation:** Selecting vehicles in the Local tab correctly pulls the exact `localPrice` from the database (`sedan`: ₹1,699, `premium-suv`: ₹2,699, `tempo`: ₹4,500). If `localPrice` is unset, the backend falls back to `pricePerKm * 80`.

### 1.2 Outstation Tab Days × KM Auto-Update
- **Test Result:** ✅ **Pass**
- **Observation:** Both the public `FareCalculator.tsx` and admin `FarePreviewWidget.tsx` listen for `days` state changes and immediately sync `km` via `getMinKm(days)` (`days * 250`).

### 1.3 Minimum/Excess KM Calculations
- **Test Result:** ✅ **Pass (Formula Verification)**
- **Observation:** Entering kilometers above `days * 250` computes `basePrice + (km - includedKm) * rate`. Entering kilometers below or equal to the minimum clamps the billable distance to `includedKm` (`Math.max(0, km - includedKm)`). Total price never drops below the base tier/rate and cannot be negative.

### 1.4 Unconfigured Day Counts & Extrapolation
- **Test Result:** ✅ **Pass**
- **Observation:** When requesting a day count greater than the highest configured tier (e.g., 4 days on `hatchback` where max tier is 3 days), `calculateOutstationFare` in `fareFormula.ts` and `fare.controller.ts` automatically extrapolate using the highest tier's `price` per kilometer (`includedKm * rate + excessKm * rate`). The calculation flags `isExtrapolated: true`, which prompts a subtle user notice in the UI.

### 1.5 Multi-Day Custom Quote CTA (>4 Days)
- **Test Result:** ✅ **Pass**
- **Observation:** When `days > 4` is selected on the Outstation tab, `FareCalculator.tsx` conditionally renders an `amber-50` highlighted notice prompting customers to call or WhatsApp directly for multi-day custom pricing. Clickable `tel:` and `https://wa.me/` CTA buttons are provided.

---

## Section 2: Fleet, Packages & Testimonials Sections

### 2.1 Live Data Loading vs. Hardcoded Fallbacks
- **Test Result:** ✅ **Pass**
- **Observation:** `Fleet.tsx`, `Packages.tsx`, and `Testimonials.tsx` receive dynamically fetched data from `getHomeData()` (`page.tsx`) or self-fetch from `/api/vehicles`, `/api/packages`, and `/api/reviews` on client mount. Comprehensive search across `src/app` and `src/components` confirmed zero leftover hardcoded dummy vehicles or Ujjain package arrays.

### 2.2 Testimonials Zero-Review Hiding Behavior
- **Test Result:** ✅ **Pass**
- **Observation:** In `Testimonials.tsx` (Lines 33-35), if `activeReviews.length === 0`, the component immediately executes `return null;`. The section completely disappears from the DOM when no active reviews exist.

### 2.3 "Book on WhatsApp" Button Consistency
- **Test Result:** ⚠️ **UX/Behavioral Discrepancy Found**
- **Observation:**
  - On **Fleet Cards & Vehicle Details (`BookButtonWrapper`)**: Clicking "Book Now" opens an interactive modal overlay asking the user to choose Local vs Outstation, enter trip duration/KM, check live price calculation, and input Name/Phone before opening WhatsApp.
  - On **Package Cards & Package Details (`BookPackageButtonWrapper` / `Packages.tsx`)**: Clicking "Book Package" or "Get Quote" opens WhatsApp immediately without any modal, without prompting for customer name or phone number, and sends a generic `"Valued Customer"` inquiry string to the `/api/bookings` endpoint.

---

## Section 3: Admin Panel (`/admin`)

### 3.1 Authentication & Credentials Handling
- **Test Result:** ✅ **Pass**
- **Observation:** `POST /api/admin/login` validates credentials against the seeded MongoDB admin record using `bcrypt.compare()`. Invalid email/password combinations return clean `401 Unauthorized` (`"Invalid email or password"`) responses. `loginLimiter` (`express-rate-limit`) strictly throttles login attempts to 5 per 15 minutes per IP.

### 3.2 Session Persistence Across Refresh
- **Test Result:** ✅ **Pass**
- **Observation:** `AdminAuthContext.tsx` checks `localStorage.getItem("admin_token")` on initialization and calls `GET /api/admin/verify`. If the access token is missing or expired (`401`), it automatically sends a silent request to `POST /api/admin/refresh` using the `HttpOnly` refresh cookie (`refreshToken`). Sessions persist across browser refreshes seamlessly.

### 3.3 Logout & Stateless JWT Invalidation
- **Test Result:** ⚠️ **Security Bug Found (Stateless Access Token)**
- **Observation:** `POST /api/admin/logout` calls `res.clearCookie("refreshToken", ...)` and clears local storage on the frontend. However, `auth.ts` verifies `accessToken` statelessly via `jwt.verify(token, env.JWT_SECRET)`. Because there is no token revocation check or blocklist, an old access token remains fully valid until its 15-minute expiration window expires.

### 3.4 CRUD Operations & Live Site Image Uploads
- **Test Result:** ✅ **Pass**
- **Observation:** All Admin CRUD endpoints (`POST/PATCH/DELETE` on `/api/admin/vehicles`, `/packages`, `/reviews`) correctly require valid JWT Bearer tokens (`401` when tested unauthenticated). The `uploadToImageKit` middleware intercepts multipart files, uploads them to ImageKit via API keys, and assigns the CDN image URL (`https://ik.imagekit.io/...`) to `req.body.image`, immediately reflecting on public live routes.

### 3.5 Outstation Tiers Editor & Live Fare Preview Widget
- **Test Result:** 🚨 **Critical Bug Found (Drift vs. Public Calculator)**
- **Observation:** The Admin `FarePreviewWidget.tsx` calculates estimates using `calculateOutstationFare()` from `fareFormula.ts`. However, the live `FareCalculator.tsx` fetches prices from `POST /api/fare/calculate` (`fare.controller.ts`).
  - **The Drift:** In `fare.controller.ts`, if `vehicleDoc.outstationPrice > 0`, the server ignores tier formulas and returns `days * vehicleDoc.outstationPrice + excessKm * rate`. In contrast, `fareFormula.ts` does not check `outstationPrice` and immediately applies tier rates or per-km rates.
  - **Live Impact:** For **Innova Crysta** (`outstationPrice = 2499`), the live Fare Calculator returns **₹2,499** for 1 Day / 250 Km. The Admin Live Fare Preview Widget returns **₹4,299** (`250 Km * ₹17.19/km`).

### 3.6 Bookings Table & Status Updates
- **Test Result:** ✅ **Pass**
- **Observation:** `GET /api/bookings` returns paginated inquiries using `.skip().limit().lean()` and compound indexing (`{ status: 1, createdAt: -1 }`). `PATCH /api/bookings/:id` (`updateBookingStatus`) updates status (`pending` -> `confirmed` / `cancelled`) cleanly.

### 3.7 Public Admin Registration Route Audit
- **Test Result:** ✅ **Pass**
- **Observation:** Zero public admin registration (`/register`, `/signup`) routes exist anywhere in the codebase. Admin user creation happens strictly during server boot in `server.ts` if `Admin.countDocuments() === 0`.

---

## Section 4: Backend Architecture & Data Flow (`backend/src`)

### 4.1 Startup Environment Verification (`env.ts`)
- **Test Result:** ✅ **Pass**
- **Observation:** `env.ts` parses `process.env` against a comprehensive `Zod` schema (`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_PASSWORD_HASH`, `IMAGEKIT_*`). If any key is missing or malformed on startup, the server logs a formatted validation error and halts immediately (`process.exit(1)`).

### 4.2 Booking Inquiry Lifecycle & Silent Database Failures
- **Test Result:** 🚨 **Critical Bug Found (Verification Mismatch & Silent Catch)**
- **Trace Flow:** Client `buildAndSendBooking()` (`whatsapp.ts`) -> `apiClient.post("/bookings")` -> `bookingLimiter` -> `validate(createBookingSchema)` -> `BookingController.createBooking` -> `BookingService.createBooking`.
- **The Failure:** `BookingService.createBooking` recalculates `expectedPrice` on the server and enforces:
  ```ts
  if (expectedPrice > 0 && Math.abs(data.estimatedFare - expectedPrice) > 10) {
    throw new AppError(`Price verification failed...`, 400, "BAD_REQUEST");
  }
  ```
  Whenever `estimatedFare` submitted by the client deviates from the server calculation (or if an offline estimation from `fareFormula.ts` is submitted), `POST /api/bookings` returns a `400 Bad Request`.
  On the frontend (`whatsapp.ts` Lines 142-146), this API call is wrapped in:
  ```ts
  await apiClient.post("/bookings", { ... }).catch(() => {
    // Silently swallow — booking log is non-critical, WhatsApp still opens
  });
  ```
  Because the error is swallowed, **the user successfully opens WhatsApp, but no booking inquiry record is ever saved to the database.**

### 4.3 Booking Rate Limiting
- **Test Result:** ✅ **Pass**
- **Observation:** `bookingLimiter` is mounted directly on `POST /api/bookings`, throttling requests to 15 per 15 minutes per IP in production (and 100 in development).

### 4.4 Inquiry Cleanup Cron Job vs. MongoDB TTL Index
- **Test Result:** ✅ **Pass (Verified Role)**
- **Observation:** `startInquiryCleanupJob()` (`ttlHealthCheck.cron.ts`) does **not** delete documents (`deleteMany` is never called). Instead, it acts as a **safety-net audit monitor**: in production (`0 0 * * *`), it queries for `BookingInquiry` documents older than 7 days (`createdAt: { $lt: sevenDaysAgo }`). If MongoDB's native TTL index (`BookingInquirySchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 })`) has fallen behind or stalled, the cron logs a warning (`🧹 [Safety Net Cron] Found X BookingInquiry documents older than 7 days...`).

### 4.5 Phone Number Storage Normalization
- **Test Result:** ⚠️ **Data Quality Discrepancy Found**
- **Observation:** `booking.validator.ts` verifies that `phone` matches Indian mobile patterns (`/^(?:\+91|91|0)?[6-9]\d{9}$/`). However, `BookingInquirySchema` stores the exact unnormalized input string (`+919876543210`, `09876543210`, or `9876543210`). The absence of a pre-save normalization step creates fragmented records across admin queries.

---

## Section 5: SEO, Metadata & Accessibility

### 5.1 Dynamic Route Metadata
- **Test Result:** ✅ **Pass**
- **Observation:** `generateMetadata()` on `fleet/[vehicleId]/page.tsx` and `packages/[packageId]/page.tsx` fetches single records and outputs accurate, highly specific titles (`"${vehicle.name} (${vehicle.type.toUpperCase()}) Rental in Gwalior | Mahakal Tour and Travels"`), descriptions, and OpenGraph tags.

### 5.2 Dynamic `sitemap.xml` & `robots.txt`
- **Test Result:** ✅ **Pass**
- **Observation:** `sitemap.ts` dynamically queries `/api/vehicles` and `/api/packages`, iterating through active items to generate absolute canonical URLs (`https://mahakaltourandtravels.com/fleet/...`). `robots.ts` explicitly blocks `/admin/` and `/api/`.

### 5.3 Custom 404 & Error Page Styling
- **Test Result:** ⚠️ **UX Defect Found**
- **Observation:** Neither `not-found.tsx` nor `error.tsx` exist inside `src/app` or `src/app/(marketing)`. If a user visits an invalid URL (e.g., `/fleet/invalid-id` where `getVehicle()` returns `null` and triggers `notFound()`), Next.js displays its unstyled default 404 page (`"404 - This page could not be found."`).

---

## Section 6: Performance, Resilience & Caching

### 6.1 Backend Outage Survivability
- **Test Result:** ✅ **Pass**
- **Observation:** `getHomeData()` (`page.tsx`) catches network errors (`signal: AbortSignal.timeout(5000)`) and returns `{ vehicles: [], packages: [], reviews: [] }` with a console warning. Client components (`HeroSection`, `WhyChooseUs`, `FleetPreview`, `PackageShowcase`) verify array lengths, attempt a non-blocking client-side fetch, and render clean empty states (`"No active fleet vehicles found."`) or return `null` without crashing the page.

### 6.2 Caching Strategy Inconsistency
- **Test Result:** ⚠️ **Performance Optimization Opportunity**
- **Observation:**
  - `fleet/page.tsx` applies `{ next: { revalidate: 60 } }` (Cached for 60 seconds).
  - `page.tsx` (Homepage) and `packages/page.tsx` apply `{ cache: "no-store" }` (No caching, queried on every single hit).
  - While `no-store` ensures real-time accuracy, applying short ISR (`revalidate: 60` or `120`) to the high-traffic homepage would significantly reduce MongoDB connection overhead during traffic spikes.

---

## Section 7: Mobile & Responsiveness

### 7.1 Mobile Sticky CTAs
- **Test Result:** ✅ **Pass**
- **Observation:** `StickyWhatsAppCTA.tsx` renders a fixed floating WhatsApp icon at `bottom-6 right-6 z-50` across all public viewports, accompanied by a subtle CSS ping animation (`animate-ping`).

### 7.2 Tap Target Sizing & Accessibility
- **Test Result:** ✅ **Pass**
- **Observation:** Primary buttons and interactive cards utilize the `.touch-target` utility (`min-height: 48px; min-width: 48px;` defined in `globals.css`), comfortably satisfying WCAG 2.1 touch target minimums (`44×44px`).

---

## Summary Table of Actionable Findings (For Future Remediation Passes)

| ID | Component / Area | Issue Description | Severity | Impact |
|---|---|---|---|---|
| **ERR-01** | `fare.controller.ts` vs `fareFormula.ts` | Backend checks `outstationPrice` / `admin_flat_day_rate`; frontend formula does not. | 🚨 **Critical** | Inconsistent fare estimates between public calculator and admin preview (e.g., Innova Crysta ₹2,499 vs ₹4,299). |
| **ERR-02** | `whatsapp.ts` & `booking.service.ts` | Price verification mismatches (`> ₹10`) throw 400 errors that are silently swallowed by `catch()`. | 🚨 **Critical** | WhatsApp opens successfully, but zero inquiry log is created in MongoDB when frontend/backend formulas differ. |
| **ERR-03** | `auth.ts` & `admin.controller.ts` | `POST /api/admin/logout` clears refresh cookie but does not invalidate/revoke the 15-min JWT access token. | ⚠️ **Medium** | Logged-out access tokens remain usable for up to 15 minutes after sign-out. |
| **ERR-04** | `BookingInquirySchema` | Phone numbers validated by Zod are saved raw without stripping prefixes (`+91`, `0`). | ⚠️ **Low** | Inconsistent phone formats stored in DB (`+9198...` vs `98...`), complicating admin searches. |
| **ERR-05** | `src/app/not-found.tsx` | Missing brand-styled `not-found.tsx` and `error.tsx` root error boundary pages. | ⚠️ **Medium** | Unhandled 404s or runtime crashes display default Next.js system pages instead of branded fallbacks. |
| **ERR-06** | `ClientBookButtons.tsx` | "Book on WhatsApp" opens interactive details modal for vehicles, but skips modal entirely for packages. | ℹ️ **Low** | Inconsistent user interaction flow between fleet bookings and package inquiries. |
| **ERR-07** | `page.tsx` & `packages/page.tsx` | Homepage and packages route use `cache: "no-store"` instead of ISR revalidation (`revalidate: 60`). | ℹ️ **Low** | Unnecessary repeated database queries for static/semi-static marketing data. |
