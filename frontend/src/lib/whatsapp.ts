  import { BUSINESS } from "./constants";
import { apiClient } from "./api";

/** Valid vehicle types accepted by the backend booking validator */
type ValidVehicleType = "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo";

/**
 * Normalizes any vehicle type string to a valid backend enum value.
 * Handles cases like "Sedan", "SUV", "Tempo Traveller", "Premium SUV", etc.
 */
function normalizeVehicleType(raw: string | undefined): ValidVehicleType {
  if (!raw) return "sedan";
  const lower = raw.toLowerCase().trim();
  if (lower.includes("hatchback")) return "hatchback";
  if (lower.includes("premium") && lower.includes("suv")) return "premium-suv";
  if (lower.includes("tempo") || lower.includes("traveller") || lower.includes("traveler")) return "tempo";
  if (lower.includes("suv")) return "suv";
  if (lower.includes("sedan")) return "sedan";
  // Fallback: return as-is if it already matches, else default to sedan
  const VALID: ValidVehicleType[] = ["hatchback", "sedan", "suv", "premium-suv", "tempo"];
  return VALID.includes(lower as ValidVehicleType) ? (lower as ValidVehicleType) : "sedan";
}

export interface BookingPayload {
  vehicle: any; // Can be a Vehicle object or vehicle string name
  tripType: "local" | "outstation-round" | "one-way" | "package-inquiry" | "general-contact";
  km?: number;
  days?: number;
  packageId?: string;
  packageName?: string;
  price: number;
  breakdown?: {
    basePrice?: number;
    excessKmCharge?: number;
    isExtrapolated?: boolean;
  };
  customerName?: string;
  customerPhone?: string;
}

/**
 * Core WhatsApp Booking Flow:
 * 1. Builds a structured WhatsApp message text.
 * 2. Fires a non-blocking POST to /api/bookings to log the inquiry.
 * 3. Immediately redirects to WhatsApp in a new tab.
 */
export async function buildAndSendBooking({
  vehicle,
  tripType,
  km,
  days,
  packageId,
  packageName,
  price,
  breakdown,
  customerName = "Valued Customer",
  customerPhone = "",
}: BookingPayload): Promise<{ success: boolean; error?: string }> {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || BUSINESS.whatsappNumber;

  let messageText = `Hello Mahakal Tour & Travels, I would like to book a trip!\n\n`;
  let routeOrPackage = "";
  const vehicleName = vehicle?.name || (typeof vehicle === "string" ? vehicle : "Sedan");
  const vehicleType = vehicle?.type || "sedan";

  if (tripType === "package-inquiry") {
    messageText += `*Trip Type:* Tour Package Booking\n`;
    messageText += `*Package Name:* ${packageName || vehicleName || "Custom Tour"}\n`;
    messageText += `*Duration:* ${vehicle?.duration || "As specified in details"}\n`;
    messageText += `*Price:* ₹${price.toLocaleString("en-IN")}\n`;
    routeOrPackage = packageName || vehicleName || "Package Inquiry";
  } else if (tripType === "local") {
    messageText += `*Trip Type:* Local Sightseeing (8h/80km)\n`;
    messageText += `*Vehicle Model:* ${vehicleName}\n`;
    messageText += `*Rate:* ₹${price.toLocaleString("en-IN")} flat rate\n`;
    routeOrPackage = `Local 8h/80km - ${vehicleName}`;
  } else if (tripType === "outstation-round") {
    messageText += `*Trip Type:* Outstation Round-Trip\n`;
    messageText += `*Vehicle Model:* ${vehicleName}\n`;
    messageText += `*Duration:* ${days} Days\n`;
    messageText += `*Distance:* ${km} Km\n`;
    messageText += `*Estimated Fare:* ₹${price.toLocaleString("en-IN")}\n`;

    if (breakdown) {
      messageText += `\n*Fare Breakdown:*\n`;
      if (breakdown.basePrice) {
        messageText += `• Base Tier Price: ₹${breakdown.basePrice.toLocaleString("en-IN")}\n`;
      }
      if (breakdown.excessKmCharge) {
        messageText += `• Excess KM Charge: ₹${breakdown.excessKmCharge.toLocaleString("en-IN")}\n`;
      }
      if (breakdown.isExtrapolated) {
        messageText += `\n*(Note: Estimated price for extended trips)*\n`;
      }
    }
    routeOrPackage = `Outstation Round-Trip - ${km}km / ${days} days (${vehicleName})`;
  } else if (tripType === "one-way") {
    messageText += `*Trip Type:* One-Way Drop\n`;
    messageText += `*Vehicle Model:* ${vehicleName}\n`;
    messageText += `*Distance:* ${km} Km\n`;
    messageText += `*Estimated Fare:* ₹${price.toLocaleString("en-IN")}\n`;
    routeOrPackage = `One-Way Drop - ${km}km (${vehicleName})`;
  } else if ((tripType as string) === "general-contact") {
    messageText += `*Trip Type:* General Inquiry\n`;
    messageText += `*Message:* ${packageName || ""}\n`;
    routeOrPackage = "General Contact Inquiry";
  }

  messageText += `\n*Customer Info:*\n`;
  messageText += `• Name: ${customerName}\n`;
  if (customerPhone) {
    messageText += `• Phone: ${customerPhone}\n`;
  }
  messageText += `\nPlease confirm availability. Thank you!`;

  const rawPhone = customerPhone.replace(/[^\d]/g, "").trim();
  const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : undefined;

  try {
    await apiClient.post("/bookings", {
      name: customerName || undefined,
      phone: cleanPhone,
      vehicle: normalizeVehicleType(vehicleType),
      tripType:
        tripType === "package-inquiry"
          ? "package-inquiry"
          : tripType === "local"
          ? "local"
          : tripType === "one-way"
          ? "one-way"
          : tripType === "general-contact"
          ? "general-contact"
          : "outstation-round",
      routeOrPackage,
      estimatedFare: price,
      vehicleId: vehicle?._id,
      km: km,
      days: days,
      rawMessage: messageText,
      source: "website",
    });

    if (typeof window !== "undefined") {
      const encoded = encodeURIComponent(messageText);
      window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, "_blank");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Booking verification or logging failed:", error);
    const deepDetail =
      error?.response?.data?.error?.details?.details?.[0]?.message ||
      error?.response?.data?.error?.details?.[0]?.message ||
      error?.response?.data?.error?.message ||
      error?.response?.data?.message;
    const errorMessage = deepDetail || error?.message || "Failed to verify and log booking inquiry on server.";
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// Legacy Helpers (Preserved to maintain compilation in unchanged components)
// ============================================================================

export function buildWhatsAppUrl(message: string): string {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || BUSINESS.whatsappNumber;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string): void {
  if (typeof window !== "undefined") {
    window.open(buildWhatsAppUrl(message), "_blank");
  }
}

export async function sendBookingInquiry(payload: {
  name?: string;
  phone?: string;
  vehicle: "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo";
  tripType: string;
  routeOrPackage?: string;
  estimatedFare?: number;
  messageText: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const rawPhone = payload.phone ? payload.phone.replace(/[^\d]/g, "").trim() : undefined;
    const cleanPhone = rawPhone && rawPhone.length >= 10 ? rawPhone.slice(-10) : undefined;

    await apiClient.post("/bookings", {
      name: payload.name,
      phone: cleanPhone,
      vehicle: normalizeVehicleType(payload.vehicle),
      tripType: payload.tripType === "one-way" ? "outstation-round" : payload.tripType,
      routeOrPackage: payload.routeOrPackage,
      estimatedFare: payload.estimatedFare,
      rawMessage: payload.messageText,
      source: "website",
    });

    openWhatsApp(payload.messageText);
    return { success: true };
  } catch (error: any) {
    console.error("sendBookingInquiry verification or logging failed:", error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to verify and log booking inquiry on server.";
    return { success: false, error: errorMessage };
  }
}

export function buildBookingMessage(data: {
  name: string;
  phone: string;
  vehicle: string;
  pickup: string;
  drop: string;
  date: string;
}): string {
  return `Hello Mahakal Tour & Travels, I would like to book a cab.\n\n*Booking Details:*\n• *Name:* ${data.name}\n• *Phone:* ${data.phone}\n• *Cab Choice:* ${data.vehicle}\n• *Pick-up Location:* ${data.pickup}\n• *Drop Location:* ${data.drop}\n• *Travel Date:* ${data.date}\n\nPlease confirm availability. Thank you!`;
}

export function buildGenericGreeting(): string {
  return "Hello Mahakal Travels, I want to book a taxi.";
}

export function buildContactMessage(data: {
  name: string;
  phone: string;
  message: string;
}): string {
  return `Hello Mahakal Tour & Travels,\n\nI have an inquiry from your website:\n• *Name:* ${data.name}\n• *Phone:* ${data.phone}\n• *Message:* ${data.message}`;
}
