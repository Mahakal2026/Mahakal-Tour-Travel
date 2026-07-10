import { Request, Response } from "express";
import { Vehicle } from "./vehicle.model";
import { AppError } from "../../utils/appError";
import { sendSuccess } from "../../utils/apiResponse";

/**
 * Calculates the exact dynamic fare choices for standard local sightseeing and tiered outstation itineraries.
 * POST /api/fare/calculate
 */
export const calculateFare = async (req: Request, res: Response): Promise<void> => {
  const { vehicleId, tripType, km, days } = req.body;

  if (!vehicleId) {
    throw new AppError("vehicleId is required", 400, "BAD_REQUEST");
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404, "NOT_FOUND");
  }

  let price = 0;
  const breakdown: any = {
    isExtrapolated: false,
  };

  const rateOutstation = vehicle.pricePerKm || 0;
  const rateLocal = vehicle.localPrice || (rateOutstation * 80);

  if (tripType === "local") {
    price = rateLocal;
    breakdown.basePrice = rateLocal;
    breakdown.excessKmCharge = 0;
  } else if (tripType === "outstation-round") {
    if (!days || days <= 0) {
      throw new AppError("days is required and must be greater than zero for outstation round-trip", 400, "BAD_REQUEST");
    }
    if (!km || km <= 0) {
      throw new AppError("km is required and must be greater than zero for outstation round-trip", 400, "BAD_REQUEST");
    }

    // Standard Gwalior outstation policy: minimum allowed 250km per day billing
    const minAllowedKm = days * 250;
    const billableKm = Math.max(km, minAllowedKm);

    // Determine outstation rate based on tiers
    let outstationRate = rateOutstation;

    if (vehicle.outstationTiers && vehicle.outstationTiers.length > 0) {
      const sortedTiers = [...vehicle.outstationTiers].sort((a, b) => a.days - b.days);
      const exactMatch = sortedTiers.find((t) => t.days === days);

      if (exactMatch) {
        outstationRate = exactMatch.price;
      } else {
        const maxTier = sortedTiers[sortedTiers.length - 1];
        if (days > maxTier.days) {
          // If days exceed our highest tier, extrapolate using the lowest rate from the max tier
          outstationRate = maxTier.price;
          breakdown.isExtrapolated = true;
        } else {
          // Fallback to the closest higher tier
          const nextTier = sortedTiers.find((t) => t.days > days) || maxTier;
          outstationRate = nextTier.price;
        }
      }
    }

    price = billableKm * outstationRate;

    // Build the fare breakdown object for the frontend breakdown display
    breakdown.basePrice = minAllowedKm * outstationRate;
    breakdown.excessKmCharge = Math.max(0, km - minAllowedKm) * outstationRate;
  } else {
    throw new AppError("Invalid trip type", 400, "BAD_REQUEST");
  }

  sendSuccess(res, { price, breakdown });
};
