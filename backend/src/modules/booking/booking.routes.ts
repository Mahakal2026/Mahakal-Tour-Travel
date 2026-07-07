import { Router } from "express";
import * as bookingController from "./booking.controller";
import { createBookingSchema, queryBookingsSchema, updateBookingStatusSchema } from "./booking.validator";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { bookingLimiter } from "../../middlewares/rateLimiter";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Public: Submit a booking inquiry (rate limited)
router.post(
  "/",
  bookingLimiter,
  validate(createBookingSchema),
  asyncHandler(bookingController.createBooking)
);

// Admin: Get all inquiries (paginated & filtered)
router.get(
  "/",
  auth,
  validate(queryBookingsSchema, "query"),
  asyncHandler(bookingController.getBookings)
);

// Admin: Update inquiry status (pending/confirmed/cancelled)
router.patch(
  "/:id",
  auth,
  validate(updateBookingStatusSchema),
  asyncHandler(bookingController.updateBookingStatus)
);

export default router;
