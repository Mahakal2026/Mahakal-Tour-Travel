const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const {
  getVehicles,
  getVehicleById,
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

const router = express.Router();

const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  type: z.enum(["hatchback", "sedan", "suv", "premium-suv", "tempo"], {
    errorMap: () => ({ message: "Invalid vehicle type" })
  }),
  capacity: z.string().min(1, "Capacity is required"),
  pricePerKm: z.number({ required_error: "Price per km is required", invalid_type_error: "Price per km must be a number" }),
  localPrice: z.number().optional(),
  subtitle: z.string().optional(),
  acType: z.string().optional(),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional()
});

const vehicleIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid vehicle ID"),
});

// Public: Get active vehicles
router.get("/", getVehicles);

// Public: Get single vehicle by ID
router.get("/:id", validate(vehicleIdSchema, "params"), getVehicleById);

// Admin: Get all vehicles
router.get("/all", auth, getAllVehicles);

// Admin: CRUD
router.post("/", auth, validate(vehicleSchema), createVehicle);
router.put(
  "/:id",
  auth,
  validate(vehicleIdSchema, "params"),
  validate(vehicleSchema),
  updateVehicle
);
router.delete(
  "/:id",
  auth,
  validate(vehicleIdSchema, "params"),
  deleteVehicle
);

module.exports = router;
