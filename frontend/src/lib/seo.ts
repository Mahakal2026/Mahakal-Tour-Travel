import { Vehicle, Package } from "@/types";

export const SEO_KEYWORDS = [
  "taxi service Gwalior",
  "cab booking Gwalior",
  "Mahakal Tour and Travels",
  "Ujjain Mahakal Darshan taxi",
  "outstation cab Gwalior",
  "Gwalior to Ujjain taxi",
  "Gwalior Jhansi Orchha taxi package",
  "local sightseeing Gwalior",
  "tempo traveller Gwalior",
  "Innova Crysta hire Gwalior",
];

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mahakal Tour and Travels",
    "description": "Premium taxi and outstation cab booking service in Gwalior, specializing in local sightseeing and pilgrim tours.",
    "url": "https://mahakaltourandtravels.com",
    "telephone": "+916269643919",
    "email": "mahakaltt.gwalior@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Kampoo, Lashkar",
      "addressLocality": "Gwalior",
      "addressRegion": "Madhya Pradesh",
      "postalCode": "474001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 26.2183,
      "longitude": 78.1828
    },
    "priceRange": "₹₹",
    "image": "https://mahakaltourandtravels.com/og-image.jpg"
  };
}

export function getTaxiServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": "Mahakal Tour and Travels Taxi Service",
    "description": "Safe, reliable, and premium taxi booking service for local sightseeing and outstation packages from Gwalior.",
    "provider": {
      "@type": "LocalBusiness",
      "name": "Mahakal Tour and Travels",
      "telephone": "+916269643919"
    },
    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Gwalior" },
      { "@type": "AdministrativeArea", "name": "Madhya Pradesh" },
      { "@type": "AdministrativeArea", "name": "Ujjain" },
      { "@type": "AdministrativeArea", "name": "Jhansi" },
      { "@type": "AdministrativeArea", "name": "Orchha" }
    ],
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "description": "Taxi services starting from ₹11/km for sedan, ₹15/km for Ertiga SUV."
    }
  };
}

export function getTouristTripSchema(pkg: Package) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": pkg.name,
    "description": pkg.description,
    "touristType": "Sightseeing / Pilgrim",
    "offers": {
      "@type": "Offer",
      "price": pkg.price,
      "priceCurrency": "INR",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": pkg.price,
        "priceCurrency": "INR",
        "valueAddedTaxIncluded": true
      }
    },
    "itinerary": {
      "@type": "ItemList",
      "numberOfItems": pkg.inclusions.length,
      "itemListElement": pkg.inclusions.map((inc, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": inc
      }))
    }
  };
}

export function getVehicleProductSchema(vehicle: Vehicle) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": vehicle.name,
    "image": vehicle.image,
    "description": vehicle.subtitle || `${vehicle.name} (${vehicle.type.toUpperCase()}) - ${vehicle.capacity} AC taxi rental service.`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": vehicle.localPrice || vehicle.pricePerKm,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": vehicle.pricePerKm,
        "priceCurrency": "INR",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": 1,
          "unitCode": "KMT" // Kilometers
        }
      }
    }
  };
}
