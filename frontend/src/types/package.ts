export interface Package {
  _id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  priceLabel?: string;
  vehicleName?: string;
  pricingType?: "flat" | "km" | "oneway";
  inclusions: string[];
  image: string; // URL from API
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
