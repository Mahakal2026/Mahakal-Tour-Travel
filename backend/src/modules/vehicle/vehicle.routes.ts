import { Router } from "express";
import * as vehicleController from "./vehicle.controller";
import { createVehicleSchema, updateVehicleSchema } from "./vehicle.validator";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { uploadToImageKit } from "../../middlewares/upload";
import { asyncHandler } from "../../utils/asyncHandler";

export const publicRouter = Router();
export const adminRouter = Router();

// ==========================
// PUBLIC ROUTES
// ==========================

// GET /api/vehicles - List active fleet vehicles
publicRouter.get(
  "/",
  asyncHandler(vehicleController.getPublicVehicles)
);

// GET /api/vehicles/:id - Fetch single vehicle details
publicRouter.get(
  "/:id",
  asyncHandler(vehicleController.getVehicleById)
);

// ==========================
// ADMIN ROUTES (JWT required)
// ==========================

// POST /api/admin/vehicles - Create a new vehicle with image upload
adminRouter.post(
  "/",
  auth,
  uploadToImageKit("image", "mahakal/vehicles"),
  (req: any, res: any, next: any) => {
    if (req.file && req.file.path) {
      req.body.image = req.file.path;
    }
    next();
  },
  validate(createVehicleSchema),
  asyncHandler(vehicleController.createVehicle)
);

// GET /api/admin/vehicles - List all fleet vehicles (active and inactive) for dashboard
adminRouter.get(
  "/",
  auth,
  asyncHandler(vehicleController.getAdminVehicles)
);

// PATCH /api/admin/vehicles/:id - Update vehicle details (image upload is optional)
adminRouter.patch(
  "/:id",
  auth,
  uploadToImageKit("image", "mahakal/vehicles"),
  (req: any, res: any, next: any) => {
    if (req.file && req.file.path) {
      req.body.image = req.file.path;
    }
    next();
  },
  validate(updateVehicleSchema),
  asyncHandler(vehicleController.updateVehicle)
);

// DELETE /api/admin/vehicles/:id - Remove a vehicle
adminRouter.delete(
  "/:id",
  auth,
  asyncHandler(vehicleController.deleteVehicle)
);
