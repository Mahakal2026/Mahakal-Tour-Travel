import { z } from "zod";

export const createReviewSchema = z.object({
  customerName: z.string().trim().min(1, "Customer name is required"),
  titleLocation: z.string().trim().optional(),
  initials: z
    .string()
    .trim()
    .max(3, "Initials cannot exceed 3 characters")
    .transform((val) => val?.toUpperCase())
    .optional(),
  rating: z.coerce
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
  reviewText: z.string().trim().min(1, "Review text is required"),
  isActive: z.preprocess(
    (val) =>
      val === "true" || val === true
        ? true
        : val === "false" || val === false
        ? false
        : undefined,
    z.boolean().optional()
  ),
});

export const updateReviewSchema = createReviewSchema.partial();
