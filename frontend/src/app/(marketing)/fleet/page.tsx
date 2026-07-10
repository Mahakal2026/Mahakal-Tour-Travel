import React from "react";
import { Metadata } from "next";
import Fleet from "@/components/sections/Fleet";
import { getTaxiServiceSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Our Taxi Fleet - Sedan, SUV, Innova, Tempo Traveller Rental in Gwalior",
  description: "Browse our premium fleet of sanitized taxis in Gwalior. Hire Swift Dzire, Toyota Aura, Maruti Ertiga, Innova Crysta, or Tempo Traveller at transparent per-kilometer rates.",
};

async function getVehicles() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${url}/vehicles`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json?.data || (Array.isArray(json) ? json : []);
  } catch (err) {
    console.error("Fleet page fetch error:", err);
    return [];
  }
}

export default async function FleetPage() {
  const vehicles = await getVehicles();

  const jsonLd = getTaxiServiceSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-slate-50 min-h-screen pt-10">
        <Fleet vehicles={vehicles} />
      </div>
    </>
  );
}
