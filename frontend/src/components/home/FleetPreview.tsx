"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Snowflake } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Vehicle } from "@/types";

export default function FleetPreview({ vehicles = [] }: { vehicles?: Vehicle[] }) {
  const displayVehicles = vehicles.filter((v) => v.isActive);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayVehicles.map((vehicle, index) => (
            <AnimatedSection key={vehicle._id || vehicle.name} delay={index * 0.1}>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all flex flex-col h-full group">
                {/* Image */}
                <div className="relative bg-gradient-to-b from-slate-100 to-slate-50/50 h-52 overflow-hidden flex items-center justify-center">
                  <Image
                    src={
                      vehicle.imageUrl ||
                      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={vehicle.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-4 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                  {vehicle.badge && (
                    <div className="absolute top-4 left-4 bg-saffron-600 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-full shadow z-10">
                      {vehicle.badge}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-extrabold text-slate-900">{vehicle.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
                    {vehicle.subtitle}
                  </p>

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
                      href={`/vehicles/${vehicle._id}`}
                      className="bg-slate-900 hover:bg-saffron-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all touch-target text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
