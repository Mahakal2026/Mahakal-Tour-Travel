import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

const helvetica = localFont({
  src: "../../public/Helvetica.ttf",
  variable: "--font-helvetica",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mahakaltourandtravels.com"),
  title: {
    default: "Mahakal Tour and Travels - Gwalior's Premium Taxi Service",
    template: "%s | Mahakal Tour and Travels",
  },
  description:
    "Book affordable & reliable taxi services in Gwalior, Madhya Pradesh. Outstation trips, Ujjain Mahakal Darshan, local sightseeing, airport transfers. 24/7 service. Call +91 62696 43919.",
  keywords: [
    "taxi service Gwalior",
    "cab booking Gwalior",
    "Mahakal Tour and Travels",
    "Ujjain Mahakal Darshan taxi",
    "outstation cab Gwalior",
    "Gwalior to Ujjain taxi",
    "Gwalior to Delhi cab",
    "Gwalior to Agra taxi",
    "local sightseeing Gwalior",
    "car rental Gwalior",
    "tempo traveller Gwalior",
    "Innova Crysta hire Gwalior",
  ],
  authors: [{ name: "Mahakal Tour and Travels" }],
  creator: "Mahakal Tour and Travels",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mahakaltourandtravels.com",
    siteName: "Mahakal Tour and Travels",
    title: "Mahakal Tour and Travels - Gwalior's Premium Taxi Service",
    description:
      "Book affordable & reliable taxi services in Gwalior, MP. Outstation trips, Ujjain Mahakal Darshan, local sightseeing. 24/7 service.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mahakal Tour and Travels - Premium Taxi Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahakal Tour and Travels - Gwalior's Premium Taxi Service",
    description:
      "Book affordable & reliable taxi services in Gwalior, MP. 24/7 service. Call +91 62696 43919.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mahakaltourandtravels.com",
  },
};

// JSON-LD Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://mahakaltourandtravels.com/#business",
      name: "Mahakal Tour and Travels",
      description:
        "Premium taxi service in Gwalior, Madhya Pradesh offering local sightseeing, outstation trips, Ujjain Mahakal Darshan, and pilgrimage tours.",
      url: "https://mahakaltourandtravels.com",
      telephone: "+916269643919",
      email: "mahakaltt.gwalior@gmail.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Kampoo, Lashkar",
        addressLocality: "Gwalior",
        addressRegion: "Madhya Pradesh",
        postalCode: "474001",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 26.2183,
        longitude: 78.1828,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      priceRange: "₹₹",
      image: "/og-image.jpg",
      sameAs: [],
    },
    {
      "@type": "TravelAgency",
      "@id": "https://mahakaltourandtravels.com/#agency",
      name: "Mahakal Tour and Travels",
      description:
        "Tour packages for Ujjain Mahakal Darshan, Gwalior sightseeing, Orchha-Jhansi tours, and custom pilgrimage itineraries.",
      url: "https://mahakaltourandtravels.com",
      telephone: "+916269643919",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Kampoo, Lashkar",
        addressLocality: "Gwalior",
        addressRegion: "Madhya Pradesh",
        postalCode: "474001",
        addressCountry: "IN",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${helvetica.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased">
        <Providers>
          {/* Skip navigation link for accessibility */}
          <a href="#home" className="skip-nav">
            Skip to main content
          </a>

          {children}
        </Providers>
      </body>
    </html>
  );
}
