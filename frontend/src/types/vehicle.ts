export interface OutstationTier {
  days: number;
  minKm: number;
  price: number;
  flatDayPrice?: number; // Optional: Admin-set flat base price for this day tier (overrides km-based calculation)
}

export interface Vehicle {
  _id: string;
  name: string;
  type: "sedan" | "suv" | "premium-suv" | "tempo";
  capacity: string;
  acType: "AC" | "Non-AC";
  pricePerKm: number;
  localPrice?: number;
  subtitle?: string;
  image: string; // URL from API
  isActive: boolean;
  outstationTiers?: OutstationTier[];
  createdAt?: string;
  updatedAt?: string;
}
