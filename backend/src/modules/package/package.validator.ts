import { z } from "zod";

const parseInclusions = (val: any) => {
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }
  return val;
};

export const createPackageSchema = z.object({
  name: z.string().trim().min(1, "Package name is required"),
  description: z.string().trim().min(1, "Description is required"),
  duration: z.string().trim().min(1, "Duration is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  priceLabel: z.string().trim().optional(),
  vehicleName: z.string().trim().optional(),
  pricingType: z.enum(["flat", "km", "oneway"]).optional(),
  inclusions: z.preprocess(
    parseInclusions,
    z
      .array(z.string().min(1, "Inclusion cannot be empty"))
      .min(1, "At least one inclusion required")
  ),
  image: z.string().min(1, "Package image URL is required"),
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

export const updatePackageSchema = createPackageSchema.partial();
