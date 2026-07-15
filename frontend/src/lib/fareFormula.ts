
/**
 * ⚠️ KEEP IN SYNC — this formula is duplicated in backend/src/modules/vehicle/fare.controller.ts
 * because frontend and backend are separate codebases. Any change here MUST be mirrored there, and vice versa.
 */
export interface FareCalculationResult {
  price: number;
  breakdown: {
    basePrice: number;
    excessKmCharge: number;
    isExtrapolated: boolean;
  };
}

export function getMinKm(days: number): number {
  return days * 250;
}

export function calculateOutstationFare(
  tiers: { days: number; minKm: number; price: number; flatDayPrice?: number | null }[],
  pricePerKm: number,
  days: number,
  km: number
): FareCalculationResult {
  const numDays = Number(days) || 1;
  const numKm = Number(km) || numDays * 250;
  const standardMinKm = numDays * 250;

  let basePrice = 0;
  let includedKm = standardMinKm;
  let excessKm = 0;
  let excessRate = pricePerKm;
  let excessCharge = 0;
  let isExtrapolated = false;
  let requiresCustomQuote = numDays > 4;

  // Priority 1: Configured Outstation Tiers
  if (tiers && tiers.length > 0) {
    const sortedTiers = [...tiers].sort((a, b) => a.days - b.days);
    const exactMatch = sortedTiers.find((t) => Number(t.days) === numDays);

    if (exactMatch) {
      includedKm = exactMatch.minKm || standardMinKm;

      if (exactMatch.flatDayPrice && exactMatch.flatDayPrice > 0) {
        basePrice = exactMatch.flatDayPrice;
        excessKm = Math.max(0, numKm - includedKm);
        excessRate = pricePerKm;
        excessCharge = excessKm * excessRate;
      } else {
        const tierPrice = exactMatch.price || pricePerKm;
        if (tierPrice > 100) {
          basePrice = tierPrice;
          excessKm = Math.max(0, numKm - includedKm);
          excessRate = pricePerKm;
          excessCharge = excessKm * excessRate;
        } else {
          basePrice = includedKm * pricePerKm;
          excessKm = Math.max(0, numKm - includedKm);
          excessRate = pricePerKm;
          excessCharge = excessKm * excessRate;
        }
      }
    } else {
      const maxTier = sortedTiers[sortedTiers.length - 1];
      if (numDays > maxTier.days) {
        isExtrapolated = true;
        includedKm = standardMinKm;
        basePrice = includedKm * pricePerKm;
        excessKm = Math.max(0, numKm - includedKm);
        excessRate = pricePerKm;
        excessCharge = excessKm * excessRate;
      } else {
        const nextTier = sortedTiers.find((t) => t.days > numDays) || maxTier;
        includedKm = standardMinKm;
        const tierPrice = nextTier.price > 100 ? pricePerKm : nextTier.price;
        basePrice = includedKm * tierPrice;
        excessKm = Math.max(0, numKm - includedKm);
        excessRate = tierPrice;
        excessCharge = excessKm * excessRate;
      }
    }
  }
  // Priority 2: Standard fallback (250 km/day × pricePerKm)
  else {
    includedKm = standardMinKm;
    basePrice = includedKm * pricePerKm;
    excessKm = Math.max(0, numKm - includedKm);
    excessRate = pricePerKm;
    excessCharge = excessKm * excessRate;
  }

  const price = basePrice + excessCharge;

  return {
    price,
    breakdown: {
      basePrice,
      excessKmCharge: excessCharge,
      isExtrapolated,
      requiresCustomQuote,
      includedKm,
      excessKm,
      excessRate,
    } as any,
  };
}
