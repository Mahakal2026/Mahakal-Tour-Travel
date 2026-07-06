const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const {
  getPackages,
  getPackageById,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");

const router = express.Router();

const packageSchema = z.object({
  title: z.string().min(1, "Package title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.string().min(1, "Duration is required"),
  price: z.string().min(1, "Price is required"),
  priceLabel: z.string().optional(),
  features: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional()
});

const packageIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid package ID"),
});

// Public: Get active packages
router.get("/", getPackages);

// Public: Get single package by ID
router.get("/:id", validate(packageIdSchema, "params"), getPackageById);

// Admin: Get all packages
router.get("/all", auth, getAllPackages);

// Admin: CRUD
router.post("/", auth, validate(packageSchema), createPackage);
router.put(
  "/:id",
  auth,
  validate(packageIdSchema, "params"),
  validate(packageSchema),
  updatePackage
);
router.delete(
  "/:id",
  auth,
  validate(packageIdSchema, "params"),
  deletePackage
);

module.exports = router;
