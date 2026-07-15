# Website Health Check — 2026-07-15

## Summary
Overall, the "Mahakal Tour and Travels" website is in excellent shape, utilizing a highly robust and secure architecture. The Next.js frontend seamlessly integrates with the Node.js backend. Canonical fare calculation logic is flawlessly synced between client and server, rate limiters and authentication flows are active and secure, and the UI is responsive and data-driven. However, there are a few minor SEO asset oversights and image optimization opportunities that should be addressed before final production marketing.

## ✅ Working Correctly

**Fare Calculator & Core Logic**
- **Dynamic Calculation**: Local tab and Outstation tab auto-calculate correctly using base price + excess KM logic. Minimum KM syncs automatically when Days change. Negative fares are prevented using `Math.max(0, excessKm)`.
- **Extrapolation**: Requesting days outside predefined tiers behaves safely, displaying a clean "requires custom quote" message for >4 days.
- **Custom UI**: The Cab Dropdown uses a fully custom React component (`CabSelect.tsx`), pulling live data from the API and retaining proper focus/keyboard navigation.
- **Booking Flow**: "Book At This Price" buttons trigger the unified `buildAndSendBooking` flow, logging the exact fare details to the backend database (201 Created) and reliably launching WhatsApp.

**Backend & Security**
- **Validation & Pricing Checks**: The server actively rejects bookings (`400 Bad Request`) if a client attempts to submit a spoofed or tampered fare price that differs from the server-calculated canonical price by more than ₹10.
- **Token Security & Admin Access**: Admin routes (`/api/admin/*`) strictly enforce JWT authorization (`401 Unauthorized` without a token). Logouts successfully invalidate tokens using a database TTL blocklist.
- **Rate Limiting & CORS**: `POST /api/bookings` is protected by `bookingLimiter` (15 requests/15m). CORS is properly configured as the top-level middleware, explicitly allowing known frontend origins with `credentials: true`.
- **Database Maintenance**: The MongoDB `BookingInquiry` collection has an active TTL index configured correctly (`expireAfterSeconds: 604800` / 7 Days).
- **Health Verification**: `GET /api/health` successfully returns active MongoDB connection status.
- **Secrets Management**: `bcryptjs` is correctly utilized for admin password hashing. `.env` and `.env.local` files are properly excluded in both backend and frontend `.gitignore` files. No raw secrets were found in the codebase.

**Frontend SEO & Layout**
- **Dynamic SEO**: Next.js `MetadataRoute` handles `sitemap.ts` cleanly, auto-generating URLs for all dynamic active vehicles. `robots.ts` correctly blocks the `/admin/` and `/api/` paths. 
- **Error Handling**: A branded `not-found.tsx` and custom `error.tsx` exist, providing a styled fallback rather than generic framework pages. The frontend gracefully switches to client-side API requests if SSR vehicle fetching encounters delays.

## 🐛 Problems Found

### [Raw `<img>` Tags Missing Optimization]
- **Where:** `src/components/sections/Fleet.tsx`, `Packages.tsx`, `PackageShowcase.tsx`, `FleetPreview.tsx`, and Admin panels.
- **What's wrong:** The codebase extensively uses standard HTML `<img src="..." />` tags instead of the highly optimized `next/image` component. This causes the browser to download full unoptimized ImageKit/CDN images, impacting core web vitals and mobile load speeds.
- **Expected:** Should use `import Image from "next/image"` to automatically provide WebP conversion, lazy loading, and responsive resizing.
- **Severity:** Medium (works but degrades performance)

### [Missing OpenGraph Image Asset]
- **Where:** `src/app/layout.tsx` (Metadata) and `public/` directory.
- **What's wrong:** The global SEO configuration in `layout.tsx` references an OG Image (`url: "/og-image.jpg"`) for social sharing (WhatsApp/Facebook previews). However, `og-image.jpg` does not exist inside the `frontend/public/` folder.
- **Expected:** An actual `/og-image.jpg` banner (1200x630) must exist in the `public` folder so link sharing previews load a branded cover rather than a blank square.
- **Severity:** Low (cosmetic/minor)

## 📋 Recommended Next Steps
1. **(Medium)** Refactor all standard `<img src...>` tags across the public marketing pages (`Fleet`, `Packages`, `Home`) to use `<Image />` from `next/image` for automatic lazy loading and WebP optimization.
2. **(Low)** Generate or upload a branded `og-image.jpg` to the `frontend/public/` folder to ensure rich link previews work when sharing the website URL on WhatsApp and Social Media.
