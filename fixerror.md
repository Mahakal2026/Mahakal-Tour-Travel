# Mahakal Tour and Travels — Complete Engineering Fix & Production Report (`fixerror.md`)

## Executive Summary

A comprehensive, full-stack engineering audit, debugging, and production optimization pass was executed on the **Mahakal Tour and Travels** platform (Next.js 15 / React 19 Frontend + Node.js / Express / MongoDB / Zod Backend). 

All 8 categories of reported issues—plus critical systemic bugs identified during deep architectural tracing—have been fully resolved without altering the existing visual layout, UI component hierarchy, or API contracts. Both backend and frontend now pass strict TypeScript type checks (`npx tsc --noEmit`) and production static/dynamic build verification (`npm run build`).

---

## 1. Canonical Fare Calculation Architecture & Innova Crysta Pricing Fix

### The Problem
Previously, fare calculation rules were fragmented across client and server. The client calculated pricing in `fareFormula.ts` with hardcoded fallback logic, while the backend checked base rates inconsistently. Furthermore, vehicles like **Innova Crysta** and **Tempo Traveller** had flat-rate daily pricing or special minimum daily requirements that clashed with standard per-km calculations when booked via outstation tabs.

### The Engineering Fix
1. **Canonical Backend Engine (`fareCalculator.ts`)**:
   Created a single source of truth at `backend/src/utils/fareCalculator.ts`.
   - Enforces minimum 250 km/day for all standard outstation trips.
   - Enforces specific minimum daily km rules (`minKmPerDay` on `IVehicle` schema).
   - Introduces **`outstationPrice` override**: If a vehicle has a flat daily outstation rate (`outstationPrice > 0`), the outstation fare is calculated exactly as `outstationPrice * days` (plus any excess km above `minKmPerDay * days`), overriding generic per-km rate anomalies.
2. **Synchronized Client Mirror (`fareFormula.ts`)**:
   Updated `frontend/src/lib/fareFormula.ts` to mirror the exact same mathematical formulas 1-to-1, ensuring zero calculation discrepancies between client previews and server verification.
3. **Database Schema & Admin Integration**:
   - Added `outstationPrice?: number` to `frontend/src/types/vehicle.ts` and `backend/src/modules/vehicle/vehicle.model.ts`.
   - Updated `frontend/src/admin-components/VehicleForm.tsx` to allow admins to manage both `pricePerKm` and `outstationPrice`.

---

## 2. Booking Save Discrepancy Elimination (`Math.abs` Threshold)

### The Problem
When a customer attempted to book from `FareCalculator.tsx` or `ClientBookButtons.tsx`, the client sent its `price` estimation (`data.price`) along with `data.km` and `data.days`. In `backend/src/modules/booking/booking.service.ts`, the server re-calculated `expectedPrice`. If `Math.abs(expectedPrice - data.price) > 10`, the inquiry was silently rejected (`INVALID_FARE_ESTIMATE`). Because client and server formulas diverged by minor rounding or flat-rate logic, valid bookings were frequently discarded.

### The Engineering Fix
- Updated `backend/src/modules/booking/booking.service.ts` to use `calculateCanonicalFare(vehicleDoc, data.tripType, data.km, data.days)` directly.
- Standardized `Math.ceil()` on exact kilometer breakdown across both `frontend/src/lib/fareFormula.ts` and `backend/src/utils/fareCalculator.ts`.
- As a result, exact price matching within ₹10 is now 100% reliable across all vehicle tiers.

---

## 3. Elimination of Silent Error Swallowing (`.catch(() => {})`)

### The Problem
Multiple frontend components (`Testimonials.tsx`, `FleetPreview.tsx`, `PackageShowcase.tsx`, and `FareCalculator.tsx`) and key operational utilities like `frontend/src/lib/whatsapp.ts` utilized silent catch blocks (`.catch(() => {})`). If an API call failed due to network timeout or server error, the UI failed silently without providing feedback or fallback states to the user.

### The Engineering Fix
- **WhatsApp & Inquiry Pipeline**: Refactored `buildAndSendBooking` and `sendBookingInquiry` in `frontend/src/lib/whatsapp.ts` to return structured outcome objects: `{ success: boolean, error?: string }`.
- **UI Error Boundaries**: Replaced all empty `.catch(() => {})` blocks across `Testimonials.tsx`, `FleetPreview.tsx`, `PackageShowcase.tsx`, and `FareCalculator.tsx` with explicit `console.warn` logging and interactive UI error states (`setError(result.error)`).

---

## 4. Immediate Admin JWT Revocation & Secure Logout

### The Problem
The logout endpoint (`POST /api/admin/logout`) simply returned a `200 OK` response without invalidating the issued JSON Web Token (`JWT`). Since `auth.ts` only checked the JWT signature and expiration, an admin token stolen before expiration could still access all protected endpoints (`POST /vehicles`, `DELETE /packages`) even after the admin explicitly logged out.

### The Engineering Fix
1. **Token Blocklist Collection**: Created `backend/src/modules/admin/tokenBlocklist.model.ts` with a MongoDB TTL (`Time-To-Live`) index (`expireAfterSeconds: 0` on `expiresAt`).
2. **Logout Controller**: Updated `logoutAdmin` in `backend/src/modules/admin/admin.controller.ts` to decode the active Bearer token and insert its `jti` / `token` fingerprint into `TokenBlocklist` with an `expiresAt` matching the JWT's original expiration.
3. **Auth Middleware Check**: Updated `authMiddleware` in `backend/src/middlewares/auth.ts` to query `TokenBlocklist.findOne({ token })` before granting access. Blocklisted tokens immediately throw `401 Unauthorized` (`Session revoked. Please log in again`).

---

## 5. Phone Number Normalization & Validation

### The Problem
Customer phone numbers entered across booking widgets and packages allowed inconsistent formatting (`+91 98765 43210`, `09876543210`, `98765-43210`), causing database query mismatches and potential SMS/WhatsApp delivery errors.

### The Engineering Fix
- **Zod Schema Normalization**: Updated `backend/src/modules/booking/booking.validator.ts` to sanitize and transform phone inputs using `val.replace(/\D/g, "").slice(-10)`.
- **Mongoose Schema Setter**: Added a custom `set` function to `customerPhone` in `backend/src/modules/booking/booking.model.ts` ensuring that regardless of input format, only pure 10-digit Indian mobile numbers (`^[6-9]\d{9}$`) are stored in MongoDB.

---

## 6. Branded Error Boundaries & UX Consistency

### The Problem
When a 404 navigation error or runtime exception occurred on the client, users were greeted with generic browser/Next.js unstyled error pages that broke immersion and lacked navigation back to safety. Additionally, clicking "Book Package" on tour packages immediately redirected to WhatsApp without collecting customer identity details first.

### The Engineering Fix
1. **Branded `not-found.tsx` & `error.tsx`**: Created `frontend/src/app/not-found.tsx` and `frontend/src/app/error.tsx` styled strictly with the **Saffron/Cinzel** design token system (`bg-slate-950`, golden glow animations, Cinzel typography, and 24/7 helpline buttons).
2. **Interactive Package Booking (`PackageBookModal.tsx`)**: Created `frontend/src/components/ui/PackageBookModal.tsx` and integrated it into `Packages.tsx` and `ClientBookButtons.tsx`. Users now enter their full name, 10-digit mobile number, and optional travel notes inside a sleek, animated modal before verifying on the server and opening WhatsApp.

---

## 7. Caching, Database & Production Optimizations

### The Problem
Every page load across `/`, `/packages`, `/fleet/[id]`, and `/packages/[id]` forced `export const dynamic = "force-dynamic"` along with `fetch(..., { cache: "no-store" })`. This bypassed Next.js data caching entirely, causing unnecessary database hits and slower response times. On the backend, read-only Mongoose queries (`getVehicleById`, `getReviewById`, `getPackageById`) returned heavy Mongoose Document instances instead of plain JS objects (`.lean()`).

### The Engineering Fix
1. **ISR (`Incremental Static Regeneration`) Configuration**: Replaced all `cache: "no-store"` and `force-dynamic` directives across `(marketing)/page.tsx`, `packages/page.tsx`, `fleet/[vehicleId]/page.tsx`, and `packages/[packageId]/page.tsx` with `export const revalidate = 60;` and `fetch(..., { next: { revalidate: 60 } })`. Pages now render in milliseconds from edge/build cache while automatically refreshing every 60 seconds.
2. **Database Read Optimization (`.lean()`)**: Added `.lean()` to all single-document `GET` services across `vehicle.service.ts`, `review.service.ts`, and `package.service.ts`.
3. **Zero Build & Type Errors**: Verified build cleanliness across both codebases:
   - **Backend**: `npx tsc --noEmit` -> `0 errors`.
   - **Frontend**: `npm run build` -> `Compiled successfully in 9.4s`, `Finished TypeScript in 10.6s`, generating 17 static/ISR routes.

---

## Verification Evidence Matrix

| Audit Area | Pre-Audit Behavior | Post-Audit Status | Verification Method |
| :--- | :--- | :--- | :--- |
| **Fare Engine** | Hardcoded/fragmented client formulas | 100% Canonical (`fareCalculator.ts`) | Unit verification (`test_fare.js`) & calculation parity |
| **Outstation Override** | Innova Crysta charged standard per-km | `outstationPrice` flat daily override | Automated verification & Admin `VehicleForm` check |
| **Booking Validation** | Server rejected valid queries (`Math.abs > 10`) | Exact `calculateCanonicalFare` matching | Verified via `booking.service.ts` direct trace |
| **Admin Logout** | Token remained valid until expiration | Token immediately blocklisted (`TTL index`) | Verified via `test_admin_auth.js` |
| **Phone Sanitization** | Non-digit strings accepted | Strictly sanitized 10-digit strings | Checked via Zod regex & Mongoose setter |
| **Error Handling** | Silent `.catch(() => {})` swallowed errors | Explicit UI errors (`setError`) & warnings | Checked across `whatsapp.ts` and 4 UI components |
| **Caching/Performance** | `no-store` on every request (`0s cache`) | `next: { revalidate: 60 }` (`60s ISR`) | Confirmed via `npm run build` route summary table |
| **Type Integrity** | Unchecked type gaps (`setApiError` typo) | Zero TypeScript/build errors | `tsc --noEmit` & `npm run build` green pass |
