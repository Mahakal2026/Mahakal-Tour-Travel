import { Request, Response } from "express";
import PackageService from "./package.service";
import { sendSuccess } from "../../utils/apiResponse";
import { logger } from "../../config/logger";

/**
 * Create a new tour package (Admin only)
 */
export const createPackage = async (req: Request, res: Response): Promise<void> => {
  const tourPackage = await PackageService.createPackage(req.body);
  logger.info(`📦 [ReqID: ${req.id}] Package created: ID ${tourPackage._id} - ${tourPackage.name}`);
  sendSuccess(res, tourPackage, 201);
};

/**
 * Fetch all tour packages (Admin dashboard)
 */
export const getAdminPackages = async (req: Request, res: Response): Promise<void> => {
  const packages = await PackageService.listPackages({});
  sendSuccess(res, packages);
};

/**
 * Fetch active tour packages (Public listing)
 */
export const getPublicPackages = async (req: Request, res: Response): Promise<void> => {
  const packages = await PackageService.listPackages({ activeOnly: true });
  sendSuccess(res, packages);
};

/**
 * Get details of a single package by ID
 */
export const getPackageById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const tourPackage = await PackageService.getPackageById(id as string);
  sendSuccess(res, tourPackage);
};

/**
 * Update package details (Admin only)
 */
export const updatePackage = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const tourPackage = await PackageService.updatePackage(id as string, req.body);
  logger.info(`📦 [ReqID: ${req.id}] Package updated: ID ${id} - ${tourPackage.name}`);
  sendSuccess(res, tourPackage);
};

/**
 * Delete a package (Admin only)
 */
export const deletePackage = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await PackageService.deletePackage(id as string);
  logger.info(`🗑️ [ReqID: ${req.id}] Package deleted: ID ${id}`);
  sendSuccess(res, { message: "Package deleted successfully" });
};
