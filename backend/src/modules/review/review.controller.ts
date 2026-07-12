import { Request, Response } from "express";
import ReviewService from "./review.service";
import { sendSuccess } from "../../utils/apiResponse";
import { logger } from "../../config/logger";

/**
 * Create a new customer review (Admin only)
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  const review = await ReviewService.createReview(req.body);
  logger.debug(`📝 [ReqID: ${req.id}] Review created: ID ${review._id} by ${review.customerName}`);
  sendSuccess(res, review, 201);
};

/**
 * Fetch all reviews (Admin dashboard route)
 */
export const getAdminReviews = async (req: Request, res: Response): Promise<void> => {
  const reviews = await ReviewService.listReviews({});
  sendSuccess(res, reviews);
};

/**
 * Fetch only active reviews (Public testimonials route)
 */
export const getPublicReviews = async (req: Request, res: Response): Promise<void> => {
  const reviews = await ReviewService.listReviews({ activeOnly: true });
  sendSuccess(res, reviews);
};

/**
 * Get review details by ID
 */
export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const review = await ReviewService.getReviewById(id as string);
  sendSuccess(res, review);
};

/**
 * Update review details (Admin only)
 */
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const review = await ReviewService.updateReview(id as string, req.body);
  logger.debug(`📝 [ReqID: ${req.id}] Review updated: ID ${id} by ${review.customerName}`);
  sendSuccess(res, review);
};

/**
 * Delete a review record (Admin only)
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await ReviewService.deleteReview(id as string);
  logger.debug(`🗑️ [ReqID: ${req.id}] Review deleted: ID ${id}`);
  sendSuccess(res, { message: "Review deleted successfully" });
};
