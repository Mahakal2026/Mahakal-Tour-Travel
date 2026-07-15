"use client";

import Link from "next/link";
import { Users, Snowflake } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Vehicle } from "@/types";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function FleetPreview({ vehicles: vehiclesProp = [] }: { vehicles?: Vehicle[] }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesProp);

  useEffect(() => {
    setVehicles(vehiclesProp);
  }, [vehiclesProp]);

  useEffect(() => {
    if (vehiclesProp.length === 0) {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
      fetch(`${url}/vehicles`)
        .then((res) => res.json())
        .then((json) => {
          const data: Vehicle[] = json?.data || (Array.isArray(json) ? json : []);
          setVehicles(data);
        })
        .catch((err) => console.warn("Could not load fresh fleet preview on client:", err));
    }
  }, [vehiclesProp]);

  const displayVehicles = vehicles.filter((v) => v.isActive).slice(0, 6); // show up to 6 on home page

  const getBadge = (name: string, index: number) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("hatchback") || lowercaseName.includes("wagon") || lowercaseName.includes("swift")) {
      return { text: "Popular", bg: "bg-saffron-600" };
    }
    if (lowercaseName.includes("dzire") || lowercaseName.includes("sedan") || lowercaseName.includes("amaze")) {
      return { text: "Best Seller", bg: "bg-emerald-600" };
    }
    if (lowercaseName.includes("ertiga") || lowercaseName.includes("suv")) {
      return { text: "Family Choice", bg: "bg-saffron-600" };
    }
    if (lowercaseName.includes("innova") || lowercaseName.includes("crysta")) {
      return { text: "Elite", bg: "bg-amber-500" };
    }
    if (lowercaseName.includes("tempo") || lowercaseName.includes("traveller")) {
      return { text: "Mega Group", bg: "bg-purple-600" };
    }
    if (index === 0) return { text: "Popular", bg: "bg-saffron-600" };
    if (index === 1) return { text: "Best Seller", bg: "bg-emerald-600" };
    if (index === 2) return { text: "Family Choice", bg: "bg-saffron-600" };
    return { text: "Elite", bg: "bg-amber-500" };
  };

  return (
    <section id="fleet" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            subtitle="Luxury Travel Fleet"
            title="Select Your Comfort Companion"
            description="We maintain a modern and pristine selection of vehicles for every requirement, from dynamic solo trips to large family pilgrimages."
          />
        </AnimatedSection>

        {displayVehicles.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-semibold">
            No active fleet vehicles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayVehicles.map((vehicle, index) => {
              const badge = getBadge(vehicle.name, index);
              return (
                <AnimatedSection key={vehicle._id || vehicle.name} delay={index * 0.1}>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all flex flex-col h-full group">
                    {/* Image */}
                    <div className="relative bg-white h-52 overflow-hidden flex items-center justify-center border-b border-slate-100">
                      <div className="absolute top-4 left-4 bg-saffron-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow z-10 class-badge-override" style={{ backgroundColor: badge.bg.includes("emerald") ? "#059669" : badge.bg.includes("purple") ? "#9333ea" : badge.bg.includes("amber") ? "#d97706" : "#ea580c" }}>
                        {badge.text}
                      </div>
                      <Image
                        src={
                          vehicle.image ||
                          "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={vehicle.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-all duration-500 opacity-90 p-0"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-extrabold text-slate-900">{vehicle.name}</h3>
                      {vehicle.subtitle && (
                        <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
                          {vehicle.subtitle}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 my-5 bg-white p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600">
                        <div>
                          <span className="block text-slate-400 mb-0.5">Capacity</span>
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-saffron-500" />
                            {vehicle.capacity}
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-400 mb-0.5">A/C status</span>
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Snowflake
                              className="w-3.5 h-3.5 text-sky-500 animate-spin"
                              style={{ animationDuration: "4s" }}
                            />
                            {vehicle.acType}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto border-t border-slate-200 pt-5 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block">Outstation rate</span>
                          <span className="text-xl font-extrabold text-slate-900">
                            ₹{vehicle.pricePerKm}{" "}
                            <span className="text-xs text-slate-500 font-normal">/ Km</span>
                          </span>
                        </div>
                        <Link
                          href={`/fleet/${vehicle._id}`}
                          className="flex items-center justify-center bg-saffron-600 hover:bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer touch-target"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        )}
      </div>
    </section>
  );
}
