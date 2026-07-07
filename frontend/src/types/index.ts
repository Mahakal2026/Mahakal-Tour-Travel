export interface Vehicle {
  _id?: string;
  name: string;
  type: "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo";
  subtitle?: string;
  capacity: string;
  acType: string;
  badge?: string;
  pricePerKm: number;
  localPrice: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface Package {
  _id?: string;
  name: string;
  description: string;
  duration: string;
  features: string[];
  price?: number;
  priceText?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface BookingInquiry {
  _id?: string;
  name?: string;
  phone?: string;
  vehicle: "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo";
  tripType: "local" | "one-way" | "outstation-round" | "package-inquiry" | "general-contact";
  routeOrPackage?: string;
  estimatedFare?: number;
  rawMessage: string;
  status: "pending" | "confirmed" | "cancelled";
  source: string;
  createdAt: string;
}
