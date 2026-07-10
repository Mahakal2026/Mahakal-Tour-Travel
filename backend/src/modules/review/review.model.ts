import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  customerName: string;
  titleLocation?: string;
  initials?: string;
  rating: number;
  reviewText: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    titleLocation: {
      type: String,
      trim: true,
    },
    initials: {
      type: String,
      trim: true,
      maxlength: [3, "Initials cannot exceed 3 characters"],
      uppercase: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    reviewText: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ReviewSchema.index({ isActive: 1 });
ReviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
export default Review;
