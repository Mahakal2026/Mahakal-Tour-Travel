
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
  tiers: { days: number; minKm: number; price: number }[],
  pricePerKm: number,
  days: number,
  km: number
): FareCalculationResult {
  const minAllowedKm = getMinKm(days);
  
  let basePrice = 0;
  let excessKm = 0;
  let excessCharge = 0;
  let isExtrapolated = false;

  if (tiers && tiers.length > 0) {
    const sortedTiers = [...tiers].sort((a, b) => a.days - b.days);
    const exactMatch = sortedTiers.find((t) => t.days === days);

    if (exactMatch) {
      const tierPrice = exactMatch.price;
      if (tierPrice > 100) {
        // Flat base price tier (e.g. ₹2,500 flat rate for day 1)
        basePrice = tierPrice;
        excessKm = Math.max(0, km - exactMatch.minKm);
        excessCharge = excessKm * pricePerKm;
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
        isExtrapolated = true;
        const tierPrice = maxTier.price;
        if (tierPrice > 100) {
          const dailyRate = tierPrice / maxTier.days;
          basePrice = days * dailyRate;
          excessKm = Math.max(0, km - minAllowedKm);
          excessCharge = excessKm * pricePerKm;
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
          excessCharge = excessKm * pricePerKm;
        } else {
          basePrice = minAllowedKm * tierPrice;
          excessKm = Math.max(0, km - minAllowedKm);
          excessCharge = excessKm * tierPrice;
        }
      }
    }
  } else {
    // No tiers configured, fallback to standard per-km rate
    basePrice = minAllowedKm * pricePerKm;
    excessKm = Math.max(0, km - minAllowedKm);
    excessCharge = excessKm * pricePerKm;
  }

  const price = basePrice + excessCharge;

  return {
    price,
    breakdown: {
      basePrice,
      excessKmCharge: excessCharge,
      isExtrapolated,
    },
  };
}
