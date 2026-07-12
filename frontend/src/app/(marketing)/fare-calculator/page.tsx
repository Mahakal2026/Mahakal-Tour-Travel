import React from "react";
import { Metadata } from "next";
import FareCalculator from "@/components/sections/FareCalculator";

export const metadata: Metadata = {
  title: "Gwalior Taxi Fare Calculator - Instant Cab Rate Estimate",
  description: "Calculate local and outstation taxi rates instantly from Gwalior. Get transparent estimates for Ujjain pilgrimage tours, sedan or SUV hire, with no hidden costs.",
};

async function getVehicles() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
  try {
    const res = await fetch(`${url}/vehicles`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json?.data || (Array.isArray(json) ? json : []);
  } catch (err) {
    console.error("Fare Calculator page fetch error:", err);
    return [];
  }
}

export default async function FareCalculatorPage() {
  const vehicles = await getVehicles();

  return (
    <div className="bg-slate-50 min-h-screen pt-12">
      <FareCalculator vehicles={vehicles} />
    </div>
  );
}
