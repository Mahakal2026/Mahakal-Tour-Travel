"use client";

import Link from "next/link";
import { Clock, CircleCheck } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Package } from "@/types";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function PackageShowcase({ packages: packagesProp = [] }: { packages?: Package[] }) {
  const [packages, setPackages] = useState<Package[]>(packagesProp);

  useEffect(() => {
    setPackages(packagesProp);
  }, [packagesProp]);

  useEffect(() => {
    if (packagesProp.length === 0) {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
      fetch(`${url}/packages`)
        .then((res) => res.json())
        .then((json) => {
          const data: Package[] = json?.data || (Array.isArray(json) ? json : []);
          setPackages(data);
        })
        .catch((err) => console.warn("Could not load fresh packages on client:", err));
    }
  }, [packagesProp]);

  const displayPackages = packages.filter((p) => p.isActive).slice(0, 3); // show 3 on home page

  if (displayPackages.length === 0) return null;

  return (
    <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            subtitle="Tailor-Made Itineraries"
            title="Exclusive Mahakal Tour Packages"
            description="Handpicked routes crafted for beautiful local historical explorations and spiritual experiences with convenient point-to-point drop facility."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPackages.map((pkg, index) => {
            let formattedPrice = "";
            let displayLabel = "";

            if (pkg.pricingType === "km") {
              displayLabel = "Package Fare Starts";
              formattedPrice = pkg.price > 0 ? `₹${pkg.price}/Km` : "Based on Km";
            } else if (pkg.pricingType === "oneway") {
              displayLabel = `${pkg.vehicleName || "Sedan"} One-Way`;
              formattedPrice = `₹${pkg.price.toLocaleString("en-IN")}`;
            } else {
              displayLabel = `${pkg.vehicleName || "Sedan"} Car Price`;
              formattedPrice = `₹${pkg.price.toLocaleString("en-IN")}`;
            }

            return (
              <AnimatedSection key={pkg._id || pkg.name} delay={index * 0.1}>
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-2xl transition-all flex flex-col h-full">
                  {/* Image */}
                  <div className="relative h-56 bg-white flex items-center justify-center p-4">
                    <Image
                      src={
                        pkg.image ||
                        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={pkg.name}
                      fill
                      priority={index <= 1}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 z-10">
                      <Clock className="w-3.5 h-3.5 text-saffron-400" />
                      {pkg.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 font-cinzel">{pkg.name}</h3>
                    <p className="text-slate-500 text-sm mt-2 leading-relaxed line-clamp-3">{pkg.description}</p>

                    <ul className="my-5 space-y-2.5 text-xs text-slate-600">
                      {pkg.inclusions?.slice(0, 3).map((inclusion, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CircleCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {inclusion}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">
                          {displayLabel}
                        </span>
                        <span className={`font-extrabold text-saffron-600 ${pkg.pricingType === "km" ? "text-xl" : "text-2xl"}`}>
                          {formattedPrice}
                        </span>
                      </div>
                      <Link
                        href={`/packages/${pkg._id}`}
                        className="bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all touch-target flex items-center justify-center text-center whitespace-nowrap"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
