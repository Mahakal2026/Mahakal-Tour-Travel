import React from "react";
import { Metadata } from "next";
import Packages from "@/components/sections/Packages";

export const metadata: Metadata = {
  title: "Tour Packages & Pilgrimage Itineraries in Gwalior | Mahakal Tour and Travels",
  description: "Explore our premium, customized travel tour packages including Ujjain Holy Mahakal Darshan pilgrimages, Gwalior sightseeing tours, Orchha-Jhansi heritage packages.",
};

async function getPackages() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${url}/packages`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json?.data || (Array.isArray(json) ? json : []);
  } catch (err) {
    console.error("Packages page fetch error:", err);
    return [];
  }
}

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div className="bg-slate-50 min-h-screen pt-10">
      <Packages packages={packages} />
    </div>
  );
}
