// ============================================
// Business Constants — Single Source of Truth
// ============================================

export const BUSINESS = {
  name: "Mahakal Tour and Travels",
  shortName: "MAHAKAL",
  tagline: "Tour & Travels",
  phone: "6269643919",
  phoneFormatted: "+91 62696 43919",
  whatsappNumber: "916269643919",
  email: "mahakaltt.gwalior@gmail.com",
  address: {
    street: "Kampoo, Lashkar",
    city: "Gwalior",
    state: "Madhya Pradesh",
    pincode: "474001",
    country: "India",
    full: "Mahakal Tour and Travels, Kampoo, Lashkar, Gwalior - 474001, Madhya Pradesh, India",
  },
  hours: "24/7 Car Rental Assistance",
  website: "https://mahakaltourandtravels.com",
  copyright: `© ${new Date().getFullYear()} Mahakal Tour and Travels. All rights reserved.`,
  description:
    "Gwalior's premium taxi service for local sightseeing, outstation trips, Ujjain Mahakal Darshan, and family pilgrimages. Book via WhatsApp.",
} as const;

// ============================================
// Navigation Links
// ============================================

export const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Our Taxi Fleet", href: "/#fleet" },
  { label: "Tour Packages", href: "/#packages" },
] as const;



export type TripType = "local" | "outstation-round" | "one-way";





// ============================================
// Why Choose Us Features (from original HTML)
// ============================================

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const WHY_CHOOSE_US_FEATURES: Feature[] = [
  {
    icon: "clock",
    title: "Absolute Punctuality",
    description:
      "We understand your schedules are crucial. Our professionally trained drivers will arrive at least 10 minutes early at your pick-up point.",
  },
  {
    icon: "shield",
    title: "Safe & Verified Drivers",
    description:
      "Safety is paramount. All our cab drivers are strictly background-verified, licensed, and highly experienced with regional route navigation.",
  },
  {
    icon: "sparkles",
    title: "Sanitized & Clean Fleets",
    description:
      "No foul smells, zero clutter. Every ride undergoes full deep interior cleaning, seat sterilization, and quality checks prior to pick-up.",
  },
  {
    icon: "receipt",
    title: "100% Transparent Bills",
    description:
      "No surcharges or surprise dynamic fees at the end of the trip. Get crystal clear breakdowns of state taxes, tolls, and standard per-kilometer values.",
  },
];

// ============================================
// Popular Routes (NEW section)
// ============================================

export interface PopularRoute {
  from: string;
  to: string;
  distance: string;
  estimatedFare: string;
  vehicleType: string;
}

export const POPULAR_ROUTES: PopularRoute[] = [
  {
    from: "Gwalior",
    to: "Ujjain",
    distance: "460 km",
    estimatedFare: "₹5,520",
    vehicleType: "Sedan",
  },
  {
    from: "Gwalior",
    to: "Agra",
    distance: "120 km",
    estimatedFare: "₹1,440",
    vehicleType: "Sedan",
  },
  {
    from: "Gwalior",
    to: "Delhi",
    distance: "320 km",
    estimatedFare: "₹3,840",
    vehicleType: "Sedan",
  },
  {
    from: "Gwalior",
    to: "Jaipur",
    distance: "340 km",
    estimatedFare: "₹4,080",
    vehicleType: "Sedan",
  },
  {
    from: "Gwalior",
    to: "Orchha",
    distance: "130 km",
    estimatedFare: "₹1,560",
    vehicleType: "Sedan",
  },
  {
    from: "Gwalior",
    to: "Khajuraho",
    distance: "280 km",
    estimatedFare: "₹3,360",
    vehicleType: "Sedan",
  },
];

// ============================================
// FAQ Data (NEW section)
// ============================================

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I book a taxi with Mahakal Tour and Travels?",
    answer:
      "You can book directly through WhatsApp by clicking the 'Book via WhatsApp' button on our website, or call us at +91 62696 43919. We're available 24/7.",
  },
  {
    question: "What are your taxi rates per kilometer?",
    answer:
      "Our rates start from ₹9/km for Hatchback, ₹12/km for Sedan, ₹15/km for SUV (Ertiga), ₹20/km for Premium SUV (Innova Crysta), and ₹25/km for Tempo Traveller. Local packages start at ₹1,500 for 8 hours / 80 km.",
  },
  {
    question: "Do you provide outstation taxi services from Gwalior?",
    answer:
      "Yes, we provide outstation services to all major cities including Ujjain, Agra, Delhi, Jaipur, Orchha, Khajuraho, Jhansi, and more. Both one-way and round-trip options are available.",
  },
  {
    question: "Are your drivers verified and licensed?",
    answer:
      "Absolutely. All our drivers are background-verified, hold valid commercial driving licenses, and have extensive experience navigating regional routes. Your safety is our top priority.",
  },
  {
    question: "Is there any hidden charge or surge pricing?",
    answer:
      "No. We maintain 100% transparent billing. The fare you see in our calculator is what you pay, plus standard tolls, parking, and state border permits which are clearly mentioned upfront.",
  },
];
