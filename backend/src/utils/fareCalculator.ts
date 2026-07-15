export interface IOutstationTier {
  days: number;
  minKm: number;
  price: number;
  flatDayPrice?: number | null;
}

export interface IFareBreakdown {
  basePrice?: number;
  includedKm?: number;
  excessKm?: number;
  excessRate?: number;
  excessKmCharge?: number;
  isExtrapolated?: boolean;
  requiresCustomQuote?: boolean;
  customQuoteMessage?: string | null;
  calculationType?: string;
}

export interface IFareCalculationResult {
  price: number;
  breakdown: IFareBreakdown;
}

export interface IVehicleInput {
  pricePerKm?: number;
  localPrice?: number;
  outstationPrice?: number;
  outstationTiers?: IOutstationTier[];
}

export function calculateCanonicalFare(
  vehicle: IVehicleInput,
  tripType: string,
  km?: number,
  days?: number
): IFareCalculationResult {
  const rateOutstation = vehicle.pricePerKm || 0;
  const rateLocal = vehicle.localPrice || rateOutstation * 80;

  if (tripType === "local") {
    return {
      price: rateLocal,
      breakdown: {
        basePrice: rateLocal,
        includedKm: 80,
        excessKm: 0,
        excessRate: rateOutstation,
        excessKmCharge: 0,
        isExtrapolated: false,
        requiresCustomQuote: false,
        customQuoteMessage: null,
        calculationType: vehicle.localPrice ? "admin_local_flat" : "standard_local_fallback",
      },
    };
  } else if (tripType === "one-way") {
    const numKm = Number(km) || 0;
    const price = numKm * rateOutstation;
    return {
      price,
      breakdown: {
        basePrice: price,
        includedKm: numKm,
        excessKm: 0,
        excessRate: rateOutstation,
        excessKmCharge: 0,
        isExtrapolated: false,
        requiresCustomQuote: false,
        customQuoteMessage: null,
        calculationType: "standard_one_way",
      },
    };
  } else if (tripType === "outstation-round") {
    const numDays = Math.max(1, Number(days) || 1);
    const numKm = Math.max(numDays * 250, Number(km) || numDays * 250);
    const standardMinKm = numDays * 250;

    let basePrice = 0;
    let includedKm = standardMinKm;
    let excessKm = 0;
    let excessRate = rateOutstation;
    let excessCharge = 0;
    let isExtrapolated = false;
    const requiresCustomQuote = numDays > 4;
    const customQuoteMessage = requiresCustomQuote
      ? "Trips longer than 4 days require custom pricing. Please contact us on call or WhatsApp for the best estimate."
      : null;
    let calculationType = "standard_per_km";

    // Priority 1: Top-level outstationPrice override (e.g., Innova Crysta flat day rate)
    if (vehicle.outstationPrice && vehicle.outstationPrice > 0) {
      includedKm = standardMinKm;
      basePrice = numDays * vehicle.outstationPrice;
      excessKm = Math.max(0, numKm - includedKm);
      excessRate = rateOutstation;
      excessCharge = excessKm * excessRate;
      calculationType = "admin_flat_day_rate";
    }
    // Priority 2: Configured Outstation Tiers
    else if (vehicle.outstationTiers && vehicle.outstationTiers.length > 0) {
      const sortedTiers = [...vehicle.outstationTiers].sort((a, b) => Number(a.days) - Number(b.days));
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
            basePrice = tierPrice;
            excessKm = Math.max(0, numKm - includedKm);
            excessRate = rateOutstation;
            excessCharge = excessKm * excessRate;
            calculationType = "tier_flat_rate";
          } else {
            basePrice = includedKm * rateOutstation;
            excessKm = Math.max(0, numKm - includedKm);
            excessRate = rateOutstation;
            excessCharge = excessKm * excessRate;
            calculationType = "tier_per_km_rate";
          }
        }
      } else {
        const maxTier = sortedTiers[sortedTiers.length - 1];
        if (numDays > maxTier.days) {
          isExtrapolated = true;
          includedKm = standardMinKm;
          basePrice = includedKm * rateOutstation;
          excessKm = Math.max(0, numKm - includedKm);
          excessRate = rateOutstation;
          excessCharge = excessKm * excessRate;
          calculationType = "extrapolated_standard_rate";
        } else {
          const nextTier = sortedTiers.find((t) => Number(t.days) > numDays) || maxTier;
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
    // Priority 3: Standard fallback (250 km/day × pricePerKm)
    else {
      includedKm = standardMinKm;
      basePrice = includedKm * rateOutstation;
      excessKm = Math.max(0, numKm - includedKm);
      excessRate = rateOutstation;
      excessCharge = excessKm * excessRate;
      calculationType = "standard_per_km";
    }

    const price = basePrice + excessCharge;

    return {
      price,
      breakdown: {
        basePrice,
        includedKm,
        excessKm,
        excessRate,
        excessKmCharge: excessCharge,
        isExtrapolated,
        requiresCustomQuote,
        customQuoteMessage,
        calculationType,
      },
    };
  } else {
    // Default fallback
    return {
      price: 0,
      breakdown: {
        calculationType: "unknown_trip_type",
      },
    };
  }
}
