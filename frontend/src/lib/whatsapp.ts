import { BUSINESS } from "./constants";
import { apiClient } from "./api";

const WA_BASE_URL = `https://wa.me/${BUSINESS.whatsappNumber}`;

/**
 * Build a WhatsApp URL with pre-filled message
 */
export function buildWhatsAppUrl(message: string): string {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || BUSINESS.whatsappNumber;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp with a pre-filled message
 */
export function openWhatsApp(message: string): void {
  if (typeof window !== "undefined") {
    window.open(buildWhatsAppUrl(message), "_blank");
  }
}

/**
 * Core Non-blocking Booking Flow:
 * Posts inquiry details to backend in background and redirects immediately to WhatsApp.
 */
export async function sendBookingInquiry(payload: {
  name?: string;
  phone?: string;
  vehicle: "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo";
  tripType: "local" | "one-way" | "outstation-round" | "package-inquiry" | "general-contact";
  routeOrPackage?: string;
  estimatedFare?: number;
  messageText: string;
}): Promise<void> {
  // 1. Post to API in background without blocking the UI redirect thread
  apiClient
    .post("/bookings", {
      name: payload.name,
      phone: payload.phone,
      vehicle: payload.vehicle,
      tripType: payload.tripType,
      routeOrPackage: payload.routeOrPackage,
      estimatedFare: payload.estimatedFare,
      rawMessage: payload.messageText,
      source: "website",
    })
    .catch((error) => {
      // Handle failures silently so user conversion flow is never interrupted by network issues
      console.error("Non-blocking booking log request failed:", error);
    });

  // 2. Open WhatsApp deep link immediately in a new window/tab
  openWhatsApp(payload.messageText);
}

/**
 * Hero booking form → WhatsApp message
 */
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

/**
 * Contact form → WhatsApp message
 */
export function buildContactMessage(data: {
  name: string;
  phone: string;
  message: string;
}): string {
  return `Hello Mahakal Tour & Travels,\n\nI have an inquiry from your website:\n• *Name:* ${data.name}\n• *Phone:* ${data.phone}\n• *Message:* ${data.message}`;
}

/**
 * Fare calculator → WhatsApp booking
 */
export function buildFareBookingMessage(data: {
  tripType: string;
  vehicle: string;
  price: string;
}): string {
  return `Hello Mahakal Tour & Travels, I calculated a fare on your website and want to book:\n\n• *Trip Type:* ${data.tripType}\n• *Cab Model:* ${data.vehicle}\n• *Estimated Total:* ${data.price}\n\nPlease help me complete this booking!`;
}

/**
 * Vehicle inquiry → WhatsApp message
 */
export function buildCarInquiryMessage(carName: string): string {
  return `Hello Mahakal Tour & Travels, I'm interested in renting the *${carName}* cab. Please share rates, package deals and driver options for an outstation trip.`;
}

/**
 * Package inquiry → WhatsApp message
 */
export function buildPackageInquiryMessage(packageName: string): string {
  return `Hello Mahakal Tour & Travels, I would like to book the *${packageName}* package. Please let me know the booking schedule and payment terms.`;
}

/**
 * Generic WhatsApp greeting
 */
export function buildGenericGreeting(): string {
  return "Hello Mahakal Travels, I want to book a taxi.";
}
