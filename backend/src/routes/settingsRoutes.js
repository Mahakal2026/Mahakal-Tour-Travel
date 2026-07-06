const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { getSettings, updateSettings } = require("../controllers/settingsController");

const router = express.Router();

const settingsSchema = z.object({
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional()
});

// Public: Get settings
router.get("/", getSettings);

// Admin: Update settings
router.put("/", auth, validate(settingsSchema), updateSettings);

module.exports = router;
