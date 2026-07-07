const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { createLead, getLeads, deleteLead } = require("../controllers/leadController");

const router = express.Router();

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  message: z.string().optional(),
  pickup: z.string().optional(),
  drop: z.string().optional(),
  date: z.string().optional(),
  vehicle: z.string().optional(),
  source: z.enum(["hero-form", "contact-form", "fare-calculator", "vehicle-inquiry", "package-inquiry"]),
});

const deleteLeadSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid lead ID"),
});

// Public: Submit a lead
router.post(
  "/",
  validate(leadSchema),
  createLead
);

// Admin: Get all leads
router.get("/", auth, getLeads);

// Admin: Delete a lead
router.delete(
  "/:id",
  auth,
  validate(deleteLeadSchema, "params"),
  deleteLead
);

module.exports = router;
