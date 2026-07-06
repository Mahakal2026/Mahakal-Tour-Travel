// ============================================
// WhatsApp Message Builder Utility
// Preserves exact message format from original HTML
// ============================================

import { BUSINESS } from "./constants";

const WA_BASE_URL = `https://wa.me/${BUSINESS.whatsappNumber}`;

/**
 * Build a WhatsApp URL with pre-filled message
 */
export function buildWhatsAppUrl(message: string): string {
  return `${WA_BASE_URL}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp with a pre-filled message
 */
export function openWhatsApp(message: string): void {
  window.open(buildWhatsAppUrl(message), "_blank");
}

/**
 * Hero booking form → WhatsApp message
 * Exact format from original HTML
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
 * Exact format from original HTML
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
 * Exact format from original HTML
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
 * Exact format from original HTML
 */
export function buildCarInquiryMessage(carName: string): string {
  return `Hello Mahakal Tour & Travels, I'm interested in renting the *${carName}* cab. Please share rates, package deals and driver options for an outstation trip.`;
}

/**
 * Package inquiry → WhatsApp message
 * Exact format from original HTML
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
