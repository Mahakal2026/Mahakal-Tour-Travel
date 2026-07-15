import Review, { IReview } from "./review.model";
import { AppError } from "../../utils/appError";

export class ReviewService {
  /**
   * Create a new review record
   */
  public static async createReview(data: Partial<IReview>): Promise<IReview> {
    return await Review.create(data);
  }

  /**
   * List reviews, optionally filtered by isActive
   */
  public static async listReviews(filters: { activeOnly?: boolean }): Promise<IReview[]> {
    const query: any = {};
    if (filters.activeOnly) {
      query.isActive = true;
    }
    return await Review.find(query).sort({ createdAt: -1 }).lean();
  }

  /**
   * Get single review details by ID
   */
  public static async getReviewById(id: string): Promise<any> {
    const review = await Review.findById(id).lean();
    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }
    return review;
  }

  /**
   * Update review details
   */
  public static async updateReview(id: string, data: Partial<IReview>): Promise<IReview> {
    const review = await Review.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }
    return review;
  }

  /**
   * Hard delete a review record
   */
  public static async deleteReview(id: string): Promise<void> {
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }
  }
}

export default ReviewService;
