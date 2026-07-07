import { Vehicle, Package } from "../types";

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
  { label: "Why Choose Us", href: "/#why-choose-us" },
  { label: "Fare Calculator", href: "/#calculator" },
  { label: "Our Taxi Fleet", href: "/#fleet" },
  { label: "Tour Packages", href: "/#packages" },
  { label: "Contact", href: "/#contact" },
] as const;

export type TripType = "local" | "outstation-round" | "one-way";

// ============================================
// Vehicle Data (from original HTML)
// ============================================

export const VEHICLES: Vehicle[] = [
  {
    _id: "hatchback",
    name: "Swift / WagonR",
    type: "hatchback",
    subtitle: "Perfect for light, agile city transit",
    capacity: "4+1 Seater",
    acType: "Super Cool AC",
    badge: "Popular",
    pricePerKm: 11,
    localPrice: 1500,
    imageUrl: "/SwiftWagonR.png",
    isActive: true,
  },
  {
    _id: "sedan",
    name: "Swift Dzire / Amaze",
    type: "sedan",
    subtitle: "Extra legroom and separate trunk storage",
    capacity: "4+1 Seater",
    acType: "Climate Control",
    badge: "Best Seller",
    pricePerKm: 12,
    localPrice: 1800,
    imageUrl: "/SwiftDzireAmaze.png",
    isActive: true,
  },
  {
    _id: "suv",
    name: "Maruti Ertiga",
    type: "suv",
    subtitle: "Ultimate value for small group voyages",
    capacity: "6+1 Seater",
    acType: "Dual A/C vents",
    badge: "Family Choice",
    pricePerKm: 15,
    localPrice: 2600,
    imageUrl: "/MarutiErtiga.png",
    isActive: true,
  },
  {
    _id: "premium-suv",
    name: "Innova Crysta",
    type: "premium-suv",
    subtitle: "Premium executive luxury experience",
    capacity: "6+1/7+1 Seater",
    acType: "Ind. Auto Climate",
    badge: "Elite",
    pricePerKm: 20,
    localPrice: 3000,
    imageUrl: "/InnovaCrysta.png",
    isActive: true,
  },
  {
    _id: "tempo",
    name: "Tempo Traveller",
    type: "tempo",
    subtitle: "Perfect for marriage functions & pilgrimages",
    capacity: "12 to 16 Seater",
    acType: "Pushback Seats / AC",
    badge: "Mega Group",
    pricePerKm: 25,
    localPrice: 7500,
    imageUrl: "/TempoTraveller.png",
    isActive: true,
  },
];

// ============================================
// Rate Matrix
// ============================================

export const RATE_MATRIX = {
  hatchback: { local: 1500, outstation: 11, excessHour: 150, excessKm: 11 },
  sedan: { local: 1800, outstation: 12, excessHour: 200, excessKm: 12 },
  suv: { local: 2600, outstation: 15, excessHour: 200, excessKm: 15 },
  "premium-suv": { local: 3000, outstation: 20, excessHour: 300, excessKm: 20 },
  tempo: { local: 7500, outstation: 25, excessHour: 500, excessKm: 25 },
};

// ============================================
// Tour Packages Data (from original HTML)
// ============================================

export const PACKAGES: Package[] = [
  {
    _id: "package-1",
    name: "Gwalior Local Tour (8 Hrs)",
    description:
      "Discover the historical majesty of Gwalior. Explore the stunning Gwalior Fort, Man Mandir Palace, Jai Vilas Palace (Scindia Museum), and the sacred tomb of Tansen.",
    duration: "Full Day Sightseeing",
    features: [
      "Local tour guide suggestions",
      "Dedicated clean premium hatchback / Sedan",
      "No stress on toll taxes (Inclusive)",
    ],
    price: 2999,
    priceText: "Sedan Car Price",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
    isActive: true,
  },
  {
    _id: "package-2",
    name: "Gwalior - Jhansi - Orchha",
    description:
      "Immerse yourself in history. Spend day one exploring Jhansi Fort's legendary heroics, followed by the majestic temples, royal cenotaphs, and serene Betwa River of Orchha on day two.",
    duration: "2 Days / 1 Night",
    features: [
      "Custom Hotel / Lodging suggestions",
      "Multi-day dedicated vehicle",
      "Transparent per-kilometer calculations",
    ],
    priceText: "Based on Km",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
    isActive: true,
  },
  {
    _id: "package-3",
    name: "Ujjain Holy Mahakal Darshan",
    description:
      "Our namesake special trip. Seamless journey from Gwalior straight to Ujjain. Complete support for temple darshan, local holy site coordination, and safe return drops.",
    duration: "Holy Pilgrim Tour",
    features: [
      "Safe, experienced night driving",
      "Direct drop to Mahakal Temple corridor",
      "Toll tax & state transport permits pre-handled",
    ],
    price: 7999,
    priceText: "Sedan One-Way",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
    isActive: true,
  },
];

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

// ============================================
// Testimonials (from original HTML)
// ============================================

export interface Testimonial {
  name: string;
  location: string;
  initials: string;
  rating: number;
  text: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Rahul K.",
    location: "Regular Customer, Gwalior",
    initials: "RK",
    rating: 5,
    text: '"Booked Mahakal Travels for a family trip from Gwalior to Ujjain. The driver was exceptionally disciplined, car was very hygienic, and they took care of all toll routes and stops perfectly. Highly recommended!"',
  },
  {
    name: "Sanjay Sharma",
    location: "Business Manager, Lashkar",
    initials: "SS",
    rating: 5,
    text: '"I have used their local cab package (8h/80km) for corporate delegates visiting Gwalior. Transparent pricing and beautiful condition of the Innova Crysta left a great impression."',
  },
  {
    name: "Megha Singh",
    location: "Traveller, Indore",
    initials: "MS",
    rating: 5,
    text: '"Very supportive customer helpdesk. Had to modify the ride date last minute for an Orchha trip and they resolved it instantly with zero cancellation fee. Honest values!"',
  },
];
