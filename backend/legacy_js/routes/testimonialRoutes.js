const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");

const router = express.Router();

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  review: z.string().min(1, "Review text is required"),
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().optional(),
  initials: z.string().optional(),
  isActive: z.boolean().optional()
});

const testimonialIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid testimonial ID"),
});

// Public: Get active testimonials
router.get("/", getTestimonials);

// Admin: Get all testimonials
router.get("/all", auth, getAllTestimonials);

// Admin: CRUD
router.post("/", auth, validate(testimonialSchema), createTestimonial);
router.put(
  "/:id",
  auth,
  validate(testimonialIdSchema, "params"),
  validate(testimonialSchema),
  updateTestimonial
);
router.delete(
  "/:id",
  auth,
  validate(testimonialIdSchema, "params"),
  deleteTestimonial
);

module.exports = router;
