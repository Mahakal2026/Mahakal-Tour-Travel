// ============================================
// Zod Validation Schemas
// ============================================

import { z } from "zod";

/**
 * Hero Booking Form Schema
 */
export const bookingFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  pickup: z
    .string()
    .min(2, "Pick-up location is required")
    .max(200, "Location too long"),
  drop: z
    .string()
    .max(200, "Location too long")
    .optional()
    .or(z.literal("")),
  date: z.string().min(1, "Travel date is required"),
  vehicle: z.string().min(1, "Please select a vehicle"),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

/**
 * Contact Form Schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message too long"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Fare Calculator Input Schema
 */
export const fareCalculatorSchema = z.object({
  vehicle: z.string(),
  tripType: z.enum(["local", "outstation-round", "one-way"]),
  distance: z.number().min(1).optional(),
  days: z.number().min(1).max(30).optional(),
});

export type FareCalculatorData = z.infer<typeof fareCalculatorSchema>;

/**
 * Lead Submission Schema (for backend POST)
 */
export const leadSubmissionSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  pickup: z.string().optional(),
  drop: z.string().optional(),
  date: z.string().optional(),
  vehicle: z.string().optional(),
  message: z.string().optional(),
  source: z.enum(["hero-form", "contact-form", "fare-calculator", "vehicle-inquiry", "package-inquiry"]),
});

export type LeadSubmissionData = z.infer<typeof leadSubmissionSchema>;
