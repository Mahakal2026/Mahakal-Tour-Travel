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
    
    let basePrice = 0;
    let excessKm = 0;
    let excessCharge = 0;

    if (vehicle.outstationTiers && vehicle.outstationTiers.length > 0) {
      const sortedTiers = [...vehicle.outstationTiers].sort((a, b) => a.days - b.days);
      const exactMatch = sortedTiers.find((t) => t.days === days);

      if (exactMatch) {
        const tierPrice = exactMatch.price;
        if (tierPrice > 100) {
          // Flat base price tier (e.g. ₹2,500 flat rate for day 1)
          basePrice = tierPrice;
          excessKm = Math.max(0, km - exactMatch.minKm);
          excessCharge = excessKm * rateOutstation;
        } else {
          // Price per Km tier (e.g. ₹12/km)
          basePrice = minAllowedKm * tierPrice;
          excessKm = Math.max(0, km - minAllowedKm);
          excessCharge = excessKm * tierPrice;
        }
      } else {
        const maxTier = sortedTiers[sortedTiers.length - 1];
        if (days > maxTier.days) {
          // Extrapolate using the highest tier rate/ratio
          breakdown.isExtrapolated = true;
          const tierPrice = maxTier.price;
          if (tierPrice > 100) {
            const dailyRate = tierPrice / maxTier.days;
            basePrice = days * dailyRate;
            excessKm = Math.max(0, km - minAllowedKm);
            excessCharge = excessKm * rateOutstation;
          } else {
            basePrice = minAllowedKm * tierPrice;
            excessKm = Math.max(0, km - minAllowedKm);
            excessCharge = excessKm * tierPrice;
          }
        } else {
          // Fallback to the closest higher tier
          const nextTier = sortedTiers.find((t) => t.days > days) || maxTier;
          const tierPrice = nextTier.price;
          if (tierPrice > 100) {
            basePrice = tierPrice;
            excessKm = Math.max(0, km - nextTier.minKm);
            excessCharge = excessKm * rateOutstation;
          } else {
            basePrice = minAllowedKm * tierPrice;
            excessKm = Math.max(0, km - minAllowedKm);
            excessCharge = excessKm * tierPrice;
          }
        }
      }
    } else {
      // No tiers configured, fallback to standard per-km rate
      basePrice = minAllowedKm * rateOutstation;
      excessKm = Math.max(0, km - minAllowedKm);
      excessCharge = excessKm * rateOutstation;
    }

    price = basePrice + excessCharge;
    breakdown.basePrice = basePrice;
    breakdown.excessKmCharge = excessCharge;
  } else if (tripType === "one-way") {
    if (!km || km <= 0) {
      throw new AppError("km is required and must be greater than zero for one-way trip", 400, "BAD_REQUEST");
    }
    price = km * rateOutstation;
    breakdown.basePrice = price;
    breakdown.excessKmCharge = 0;
  } else {
    throw new AppError("Invalid trip type", 400, "BAD_REQUEST");
  }

  sendSuccess(res, { price, breakdown });
};
