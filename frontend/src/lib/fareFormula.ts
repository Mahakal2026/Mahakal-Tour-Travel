/**
 * ⚠️ CANONICAL MIRROR — this formula mirrors backend/src/utils/fareCalculator.ts 1-to-1.
 * Any change here MUST be mirrored in fareCalculator.ts, and vice versa.
 */

export interface FareBreakdown {
  basePrice: number;
  includedKm: number;
  excessKm: number;
  excessRate: number;
  excessKmCharge: number;
  isExtrapolated: boolean;
  requiresCustomQuote: boolean;
  customQuoteMessage?: string | null;
  calculationType?: string;
}

export interface FareCalculationResult {
  price: number;
  breakdown: FareBreakdown;
}

export function getMinKm(days: number): number {
  return (Number(days) || 1) * 250;
}

export function calculateOutstationFare(
  tiers: { days: number; minKm: number; price: number; flatDayPrice?: number | null }[],
  pricePerKm: number,
  days: number,
  km: number
): FareCalculationResult {
  const numDays = Math.max(1, Number(days) || 1);
  const numKm = Math.max(numDays * 250, Number(km) || numDays * 250);
  const standardMinKm = numDays * 250;
  const rateOutstation = pricePerKm || 0;

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

  // Priority 2: Configured Outstation Tiers
  if (tiers && tiers.length > 0) {
    const sortedTiers = [...tiers].sort((a, b) => Number(a.days) - Number(b.days));
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
}

export function calculateLocalFare(
  localPrice: number | undefined,
  pricePerKm: number
): FareCalculationResult {
  const rateOutstation = pricePerKm || 0;
  const rateLocal = localPrice || rateOutstation * 80;

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
      calculationType: localPrice ? "admin_local_flat" : "standard_local_fallback",
    },
  };
}

export function calculateClientSideFare(
  vehicle: any,
  tripType: "local" | "outstation-round" | "one-way",
  km?: number,
  days?: number
): FareCalculationResult {
  if (tripType === "local") {
    return calculateLocalFare(vehicle.localPrice, vehicle.pricePerKm);
  } else if (tripType === "outstation-round") {
    return calculateOutstationFare(
      vehicle.outstationTiers || [],
      vehicle.pricePerKm,
      days || 1,
      km || (days || 1) * 250
    );
  } else {
    // one-way
    const numKm = Math.max(0, Number(km) || 0);
    const price = numKm * (vehicle.pricePerKm || 0);
    return {
      price,
      breakdown: {
        basePrice: price,
        includedKm: numKm,
        excessKm: 0,
        excessRate: vehicle.pricePerKm || 0,
        excessKmCharge: 0,
        isExtrapolated: false,
        requiresCustomQuote: false,
        calculationType: "one_way_per_km",
      },
    };
  }
}
