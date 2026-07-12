import mongoose from "mongoose";
import { Vehicle } from "./modules/vehicle/vehicle.model";
import { TourPackage } from "./modules/package/package.model";
import { Review } from "./modules/review/review.model";
import { logger } from "./config/logger";

const MONGODB_URI = "mongodb+srv://animate:k0Bz8eZfrJe7UM1E@mtt.qagmkjb.mongodb.net/test?retryWrites=true&w=majority";

const vehiclesData = [
  {
    name: "Swift Wagon R",
    type: "sedan",
    capacity: "4+1 Seats",
    acType: "AC",
    pricePerKm: 10,
    localPrice: 1500,
    subtitle: "Compact Hatchback",
    image: "/SwiftWagonR.png",
    isActive: true,
    outstationTiers: []
  },
  {
    name: "Swift Dzire / Aura",
    type: "sedan",
    capacity: "4+1 Seats",
    acType: "AC",
    pricePerKm: 12,
    localPrice: 1800,
    subtitle: "Comfortable Sedan",
    image: "/SwiftDzireAmaze.png",
    isActive: true,
    outstationTiers: [
      { days: 1, minKm: 250, price: 12 },
      { days: 2, minKm: 500, price: 12 }
    ]
  },
  {
    name: "Maruti Ertiga",
    type: "suv",
    capacity: "6+1 Seats",
    acType: "AC",
    pricePerKm: 15,
    localPrice: 2500,
    subtitle: "Spacious Family SUV",
    image: "/MarutiErtiga.png",
    isActive: true,
    outstationTiers: [
      { days: 1, minKm: 250, price: 15 },
      { days: 2, minKm: 500, price: 15 }
    ]
  },
  {
    name: "Innova Crysta",
    type: "premium-suv",
    capacity: "7+1 Seats",
    acType: "AC",
    pricePerKm: 20,
    localPrice: 3500,
    subtitle: "Premium Executive SUV",
    image: "/InnovaCrysta.png",
    isActive: true,
    outstationTiers: [
      { days: 1, minKm: 250, price: 20 },
      { days: 2, minKm: 500, price: 20 }
    ]
  },
  {
    name: "Tempo Traveller",
    type: "tempo",
    capacity: "12+1 Seats",
    acType: "AC",
    pricePerKm: 25,
    localPrice: 5000,
    subtitle: "Group Travel Coach",
    image: "/TempoTraveller.png",
    isActive: true,
    outstationTiers: [
      { days: 1, minKm: 300, price: 25 },
      { days: 2, minKm: 600, price: 25 }
    ]
  }
];

const packagesData = [
  {
    name: "Ujjain Mahakal Darshan",
    description: "Spiritual pilgrimage package to Ujjain Mahakaleshwar Jyotirlinga, Harsiddhi Temple, and Kal Bhairav temple. Includes roundtrip transport, sightseeing, and lodging.",
    duration: "2 Days 1 Night",
    price: 2999,
    priceLabel: "Per Person",
    inclusions: [
      "Premium Sanitized Cab (Gwalior-Ujjain Roundtrip)",
      "Standard Hotel Stay (AC Room)",
      "Breakfast Included",
      "Temple Sightseeing Guide Assist"
    ],
    image: "/istockphoto-492362277-612x612.jpg",
    isActive: true
  },
  {
    name: "Gwalior Local Sightseeing",
    description: "Explore the royal city of Gwalior. Visit the majestic Gwalior Fort (Maan Singh Palace, Sahastrabahu Temple, Teli Ka Mandir), Jai Vilas Palace Museum, and Sun Temple.",
    duration: "1 Day (8 Hours)",
    price: 2000,
    priceLabel: "Flat Rate",
    vehicleName: "Sedan",
    pricingType: "flat",
    inclusions: [
      "Private Sedan Cab (8h / 80km)",
      "Fuel & Driver Allowances Included",
      "Sightseeing Map Guide",
      "Drop back to Hotel/Station"
    ],
    image: "/SwiftDzireAmaze.png",
    isActive: true
  },
  {
    name: "Orchha & Jhansi Heritage Tour",
    description: "Walk through the historic palaces and cenotaphs of Orchha (Jahangir Mahal, Raja Mahal, Ram Raja Temple) and the iconic Jhansi Fort.",
    duration: "1 Day",
    price: 0,
    priceLabel: "Based on Km",
    vehicleName: "Sedan",
    pricingType: "km",
    inclusions: [
      "Private Sanitized Sedan",
      "Toll & State Tax Included",
      "Sightseeing in Orchha & Jhansi",
      "Experienced Driver-cum-Guide"
    ],
    image: "/MarutiErtiga.png",
    isActive: true
  },
  {
    name: "Ujjain Holy Mahakal Darshan",
    description: "Our namesake special trip. Seamless journey from Gwalior straight to Ujjain. Complete support for temple darshan, local holy site coordination, and safe return drops.",
    duration: "2 Days / 1 Night",
    price: 7999,
    priceLabel: "One-Way Drop",
    vehicleName: "Sedan",
    pricingType: "oneway",
    inclusions: [
      "Safe, experienced night driving",
      "Direct drop to Mahakal Temple corridor",
      "Toll tax & state transport permits pre-handled"
    ],
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
    isActive: true
  }
];

const reviewsData = [
  {
    customerName: "Rupesh Sharma",
    titleLocation: "Gwalior, MP",
    initials: "RS",
    rating: 5,
    reviewText: "Highly professional service! Booked a Sedan for Gwalior to Delhi trip. The driver was 15 minutes early, vehicle was extremely clean, and pricing was fully transparent as estimated on their calculator. Highly recommended!",
    isActive: true
  },
  {
    customerName: "Gaurav Shivhare",
    titleLocation: "Bhopal, MP",
    initials: "GS",
    rating: 5,
    reviewText: "Fantastic experience with the Ujjain Mahakal Darshan package. The hotel provided was very comfortable, driver was well-behaved, and the entire journey was smooth and spiritually fulfilling. Five stars!",
    isActive: true
  },
  {
    customerName: "Anjali Dubey",
    titleLocation: "Indore, MP",
    initials: "AD",
    rating: 5,
    reviewText: "Very reliable taxi service in Gwalior. I book their local packages frequently. The cars are always fresh and neat. The pricing is also very reasonable compared to standard operators.",
    isActive: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB Atlas.");

    // Delete existing records
    await Vehicle.deleteMany({});
    logger.info("Cleared old vehicles.");

    await TourPackage.deleteMany({});
    logger.info("Cleared old packages.");

    await Review.deleteMany({});
    logger.info("Cleared old reviews.");

    // Seed new records
    await Vehicle.insertMany(vehiclesData);
    logger.info("Successfully seeded new vehicles!");

    await TourPackage.insertMany(packagesData);
    logger.info("Successfully seeded new packages!");

    await Review.insertMany(reviewsData);
    logger.info("Successfully seeded new reviews!");

  } catch (err: any) {
    logger.error(`Seed error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    logger.info("Database connection closed.");
  }
}

seed();
