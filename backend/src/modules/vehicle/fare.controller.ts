import { Request, Response } from "express";
import { Vehicle } from "./vehicle.model";
import { AppError } from "../../utils/appError";
import { sendSuccess } from "../../utils/apiResponse";
import { calculateCanonicalFare } from "../../utils/fareCalculator";

/**
 * Calculates the exact dynamic fare choices using the canonical shared calculation utility.
 * POST /api/fare/calculate
 */
export const calculateFare = async (req: Request, res: Response): Promise<void> => {
  const { vehicleId, tripType, km, days } = req.body;

  if (!vehicleId) {
    throw new AppError("vehicleId is required", 400, "BAD_REQUEST");
  }

  const vehicle: any = await Vehicle.findById(vehicleId).lean();
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "NOT_FOUND");
  }

  if (tripType === "outstation-round") {
    const numDays = Number(days) || 1;
    const numKm = Number(km) || numDays * 250;
    if (numDays <= 0) {
      throw new AppError("days must be greater than zero for outstation round-trip", 400, "BAD_REQUEST");
    }
    if (numKm <= 0) {
      throw new AppError("km must be greater than zero for outstation round-trip", 400, "BAD_REQUEST");
    }
  } else if (tripType === "one-way") {
    const numKm = Number(km) || 0;
    if (numKm <= 0) {
      throw new AppError("km must be greater than zero for one-way trip", 400, "BAD_REQUEST");
    }
  }

  const { price, breakdown } = calculateCanonicalFare(vehicle, tripType, km, days);

  sendSuccess(res, { price, breakdown });
};
