import { z } from "zod";

export const createVehicleSchema = z.object({
  name: z.string().trim().min(1, "Vehicle name is required"),
  type: z.enum(["hatchback", "sedan", "suv", "premium-suv", "tempo"], {
    message: "Type must be one of: hatchback, sedan, suv, premium-suv, tempo",
  }),
  capacity: z.string().trim().min(1, "Vehicle capacity is required"),
  acType: z.enum(["AC", "Non-AC"], {
    message: "AC type must be AC or Non-AC",
  }),
  pricePerKm: z.coerce.number().min(0, "Price per KM must be 0 or greater"),
  localPrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(0, "Local price must be 0 or greater").optional()
  ),
  outstationPrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
    z.number().min(0, "Outstation price must be 0 or greater").optional()
  ),
  subtitle: z.string().trim().max(100, "Subtitle cannot exceed 100 characters").optional(),
  image: z.string().min(1, "Vehicle image URL is required"),
  outstationTiers: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      }
      return val;
    },
    z.array(
      z.object({
        days: z.coerce.number().int().positive(),
        minKm: z.coerce.number().min(0),
        price: z.coerce.number().min(0),
        flatDayPrice: z.coerce.number().min(0).optional().nullable(),
      })
    ).optional()
  ),
  isActive: z.preprocess(
    (val) => (val === "true" || val === true ? true : val === "false" || val === false ? false : undefined),
    z.boolean().optional()
  ),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const queryVehiclesSchema = z.object({
  activeOnly: z.preprocess(
    (val) => val === "true" || val === true,
    z.boolean()
  ).optional(),
});
