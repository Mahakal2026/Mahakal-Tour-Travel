import { z } from "zod";

export const createBookingSchema = z.object({
  name: z.string().trim().max(100, "Name cannot exceed 100 characters").optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        // Treat empty/blank string as absent (no phone given)
        if (!val || val.trim() === "") return true;
        const cleanVal = val.replace(/[^\d+]/g, "");
        // Must be empty (no phone) or a valid Indian mobile number
        if (cleanVal === "") return true;
        return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleanVal);
      },
      {
        message: "Invalid Indian phone number format (must be a valid 10-digit number, optionally prefixed with +91 or 91)",
      }
    ),
  vehicle: z.enum(["hatchback", "sedan", "suv", "premium-suv", "tempo"], {
    message: "Vehicle must be one of: hatchback, sedan, suv, premium-suv, tempo",
  }),
  tripType: z.enum(["local", "one-way", "outstation-round", "package-inquiry", "general-contact"], {
    message: "Trip type must be one of: local, one-way, outstation-round, package-inquiry, general-contact",
  }),
  routeOrPackage: z.string().trim().max(200, "Route/Package description too long").optional(),
  estimatedFare: z.number().min(0, "Estimated fare cannot be negative").optional(),
  rawMessage: z.string().trim().min(1, "Raw WhatsApp message text is required"),
  source: z.string().trim().default("website"),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"], {
    message: "Status must be one of: pending, confirmed, cancelled",
  }),
});

export const queryBookingsSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
