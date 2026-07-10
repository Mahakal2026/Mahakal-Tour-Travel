import { Request, Response } from "express";
import VehicleService from "./vehicle.service";
import { sendSuccess } from "../../utils/apiResponse";
import { logger } from "../../config/logger";

/**
 * Create a new vehicle record (Admin only)
 */
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await VehicleService.createVehicle(req.body);
  logger.info(`🚗 [ReqID: ${req.id}] Vehicle created: ID ${vehicle._id} - ${vehicle.name}`);
  sendSuccess(res, vehicle, 201);
};

/**
 * Fetch all vehicles (Admin dashboard route)
 */
export const getAdminVehicles = async (req: Request, res: Response): Promise<void> => {
  const vehicles = await VehicleService.listVehicles({});
  sendSuccess(res, vehicles);
};

/**
 * Fetch only active vehicles (Public fleet route)
 */
export const getPublicVehicles = async (req: Request, res: Response): Promise<void> => {
  const vehicles = await VehicleService.listVehicles({ activeOnly: true });
  sendSuccess(res, vehicles);
};

/**
 * Get a single vehicle details by ID
 */
export const getVehicleById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const vehicle = await VehicleService.getVehicleById(id as string);
  sendSuccess(res, vehicle);
};

/**
 * Update an existing vehicle record (Admin only)
 */
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const vehicle = await VehicleService.updateVehicle(id as string, req.body);
  logger.info(`🚗 [ReqID: ${req.id}] Vehicle updated: ID ${id} - ${vehicle.name}`);
  sendSuccess(res, vehicle);
};

/**
 * Delete a vehicle record (Admin only)
 */
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await VehicleService.deleteVehicle(id as string);
  logger.info(`🗑️ [ReqID: ${req.id}] Vehicle deleted: ID ${id}`);
  sendSuccess(res, { message: "Vehicle deleted successfully" });
};
