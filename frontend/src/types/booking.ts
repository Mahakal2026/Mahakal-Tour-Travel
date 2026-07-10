export interface BookingInquiry {
  _id: string;
  name?: string;
  phone?: string;
  vehicle: "sedan" | "suv" | "premium-suv" | "tempo";
  tripType: "local" | "outstation-round" | "package-inquiry" | "general-contact";
  routeOrPackage?: string;
  estimatedFare?: number;
  rawMessage: string;
  source?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt?: string;
}
