import { Router } from "express";
import * as packageController from "./package.controller";
import { createPackageSchema, updatePackageSchema } from "./package.validator";
import { auth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { uploadToImageKit } from "../../middlewares/upload";
import { asyncHandler } from "../../utils/asyncHandler";

export const publicRouter = Router();
export const adminRouter = Router();

// ==========================
// PUBLIC ROUTES
// ==========================

// GET /api/packages - Get active packages
publicRouter.get(
  "/",
  asyncHandler(packageController.getPublicPackages)
);

// GET /api/packages/:id - Get details of a single package
publicRouter.get(
  "/:id",
  asyncHandler(packageController.getPackageById)
);

// ==========================
// ADMIN ROUTES (JWT required)
// ==========================

// POST /api/admin/packages - Create package with image upload
adminRouter.post(
  "/",
  auth,
  uploadToImageKit("image", "mahakal/packages"),
  (req: any, res: any, next: any) => {
    if (req.file && req.file.path) {
      req.body.image = req.file.path;
    }
    next();
  },
  validate(createPackageSchema),
  asyncHandler(packageController.createPackage)
);

// GET /api/admin/packages - List all packages for dashboard
adminRouter.get(
  "/",
  auth,
  asyncHandler(packageController.getAdminPackages)
);

// PATCH /api/admin/packages/:id - Update package details
adminRouter.patch(
  "/:id",
  auth,
  uploadToImageKit("image", "mahakal/packages"),
  (req: any, res: any, next: any) => {
    if (req.file && req.file.path) {
      req.body.image = req.file.path;
    }
    next();
  },
  validate(updatePackageSchema),
  asyncHandler(packageController.updatePackage)
);

// DELETE /api/admin/packages/:id - Remove a package
adminRouter.delete(
  "/:id",
  auth,
  asyncHandler(packageController.deletePackage)
);
