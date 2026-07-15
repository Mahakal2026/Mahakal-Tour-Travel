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
    requiresCustomQuote: false,
    customQuoteMessage: null,
  };

  const rateOutstation = vehicle.pricePerKm || 0;
  const rateLocal = vehicle.localPrice || (rateOutstation * 80);

  if (tripType === "local") {
    price = rateLocal;
    breakdown.basePrice = rateLocal;
    breakdown.includedKm = 80;
    breakdown.excessKm = 0;
    breakdown.excessRate = rateOutstation;
    breakdown.excessKmCharge = 0;
    breakdown.calculationType = vehicle.localPrice ? "admin_local_flat" : "standard_local_fallback";
  } else if (tripType === "outstation-round") {
    const numDays = Number(days) || 1;
    const numKm = Number(km) || numDays * 250;

    if (numDays <= 0) {
      throw new AppError("days must be greater than zero for outstation round-trip", 400, "BAD_REQUEST");
    }
    if (numKm <= 0) {
      throw new AppError("km must be greater than zero for outstation round-trip", 400, "BAD_REQUEST");
    }

    // Standard policy minimum: 250 km included per day
    const standardMinKm = numDays * 250;
    
    let basePrice = 0;
    let includedKm = standardMinKm;
    let excessKm = 0;
    let excessRate = rateOutstation;
    let excessCharge = 0;
    let calculationType = "standard_per_km";

    if (numDays > 4) {
      breakdown.requiresCustomQuote = true;
      breakdown.customQuoteMessage = "Trips longer than 4 days require custom pricing. Please contact us on call or WhatsApp for the best estimate.";
    }

    // Priority 1: Configured Outstation Tiers
    if (vehicle.outstationTiers && vehicle.outstationTiers.length > 0) {
      const sortedTiers = [...vehicle.outstationTiers].sort((a, b) => a.days - b.days);
      const exactMatch = sortedTiers.find((t) => Number(t.days) === numDays);

      if (exactMatch) {
        includedKm = exactMatch.minKm || standardMinKm;
        
        if (exactMatch.flatDayPrice && exactMatch.flatDayPrice > 0) {
          basePrice = exactMatch.flatDayPrice;
          excessKm = Math.max(0, numKm - includedKm);
          excessRate = rateOutstation;
          excessCharge = excessKm * excessRate;
          calculationType = "tier_flat_override";
        } else {
          const tierPrice = exactMatch.price || rateOutstation;
          if (tierPrice > 100) {
            // Flat base price stored in tier.price (legacy)
            basePrice = tierPrice;
            excessKm = Math.max(0, numKm - includedKm);
            excessRate = rateOutstation;
            excessCharge = excessKm * excessRate;
            calculationType = "tier_flat_rate";
          } else {
            // Per-km rate tier
            basePrice = includedKm * rateOutstation;
            excessKm = Math.max(0, numKm - includedKm);
            excessRate = rateOutstation;
            excessCharge = excessKm * excessRate;
            calculationType = "tier_per_km_rate";
          }
        }
      } else {
        // No exact tier match for numDays -> check if extrapolated or closest
        const maxTier = sortedTiers[sortedTiers.length - 1];
        if (numDays > maxTier.days) {
          breakdown.isExtrapolated = true;
          includedKm = standardMinKm;
          basePrice = includedKm * rateOutstation;
          excessKm = Math.max(0, numKm - includedKm);
          excessRate = rateOutstation;
          excessCharge = excessKm * excessRate;
          calculationType = "extrapolated_standard_rate";
        } else {
          const nextTier = sortedTiers.find((t) => t.days > numDays) || maxTier;
          includedKm = standardMinKm;
          const tierPrice = nextTier.price > 100 ? rateOutstation : nextTier.price;
          basePrice = includedKm * tierPrice;
          excessKm = Math.max(0, numKm - includedKm);
          excessRate = tierPrice;
          excessCharge = excessKm * excessRate;
          calculationType = "fallback_tier_rate";
        }
      }
    } 
    // Priority 2: Standard fallback (250 km/day × pricePerKm)
    else {
      includedKm = standardMinKm;
      basePrice = includedKm * rateOutstation;
      excessKm = Math.max(0, numKm - includedKm);
      excessRate = rateOutstation;
      excessCharge = excessKm * excessRate;
      calculationType = "standard_per_km";
    }

    price = basePrice + excessCharge;
    breakdown.basePrice = basePrice;
    breakdown.includedKm = includedKm;
    breakdown.excessKm = excessKm;
    breakdown.excessRate = excessRate;
    breakdown.excessKmCharge = excessCharge;
    breakdown.calculationType = calculationType;
  } else if (tripType === "one-way") {
    const numKm = Number(km) || 0;
    if (numKm <= 0) {
      throw new AppError("km must be greater than zero for one-way trip", 400, "BAD_REQUEST");
    }
    price = numKm * rateOutstation;
    breakdown.basePrice = price;
    breakdown.includedKm = numKm;
    breakdown.excessKm = 0;
    breakdown.excessRate = rateOutstation;
    breakdown.excessKmCharge = 0;
    breakdown.calculationType = "standard_one_way";
  } else {
    throw new AppError("Invalid trip type", 400, "BAD_REQUEST");
  }

  sendSuccess(res, { price, breakdown });
};
