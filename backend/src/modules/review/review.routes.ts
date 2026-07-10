import { Router } from "express";
import * as reviewController from "./review.controller";
import { createReviewSchema, updateReviewSchema } from "./review.validator";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/asyncHandler";

export const publicRouter = Router();
export const adminRouter = Router();

// ==========================
// PUBLIC ROUTES
// ==========================

// GET /api/reviews - Get active testimonials
publicRouter.get(
  "/",
  asyncHandler(reviewController.getPublicReviews)
);

// GET /api/reviews/:id - Get details of a single review
publicRouter.get(
  "/:id",
  asyncHandler(reviewController.getReviewById)
);

// ==========================
// ADMIN ROUTES (JWT required)
// ==========================

// POST /api/admin/reviews - Create a review
adminRouter.post(
  "/",
  auth,
  validate(createReviewSchema),
  asyncHandler(reviewController.createReview)
);

// GET /api/admin/reviews - List all reviews for dashboard
adminRouter.get(
  "/",
  auth,
  asyncHandler(reviewController.getAdminReviews)
);

// PATCH /api/admin/reviews/:id - Update review details
adminRouter.patch(
  "/:id",
  auth,
  validate(updateReviewSchema),
  asyncHandler(reviewController.updateReview)
);

// DELETE /api/admin/reviews/:id - Remove a review
adminRouter.delete(
  "/:id",
  auth,
  asyncHandler(reviewController.deleteReview)
);
