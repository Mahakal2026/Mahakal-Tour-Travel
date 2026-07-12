"use client";

import React from "react";
import Link from "next/link";
import { FaClock, FaTags, FaWhatsapp } from "react-icons/fa";
import { Package } from "@/types";
import { sendBookingInquiry } from "@/lib/whatsapp";

interface PackagesProps {
  packages: Package[];
}

export default function Packages({ packages = [] }: PackagesProps) {
  const activePackages = packages.filter((p) => p.isActive);

  const handleBookPackage = async (pkg: Package) => {
    let formattedMessage = "";
    let rateText = "";

    if (pkg.pricingType === "km") {
      rateText = pkg.price > 0 ? `₹${pkg.price}/Km` : "Based on Km";
      formattedMessage = `Hello Mahakal Tour & Travels, I would like to get a custom quote for the package.\n\n` +
        `*Package Details:*\n` +
        `• *Package Name:* ${pkg.name}\n` +
        `• *Duration:* ${pkg.duration}\n` +
        `• *Estimated Rate:* ${rateText}\n\n` +
        `Please confirm availability and share details. Thank you!`;
    } else {
      rateText = `₹${pkg.price.toLocaleString("en-IN")}`;
      formattedMessage = `Hello Mahakal Tour & Travels, I would like to book a cab package.\n\n` +
        `*Package Details:*\n` +
        `• *Package Name:* ${pkg.name}\n` +
        `• *Duration:* ${pkg.duration}\n` +
        `• *Price:* ${rateText}\n\n` +
        `Please confirm availability. Thank you!`;
    }

    await sendBookingInquiry({
      name: "Valued Customer",
      vehicle: "sedan", // default
      tripType: "package-inquiry",
      routeOrPackage: `${pkg.name} (${pkg.duration})`,
      estimatedFare: pkg.pricingType === "km" ? undefined : pkg.price,
      messageText: formattedMessage,
    });
  };


  return (
    <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="block text-xs font-bold uppercase tracking-widest text-saffron-600 mb-2">Exclusive Sightseeing</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-cinzel tracking-tight">Tour Packages</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">Explore the historical, royal, and sacred spiritual destinations with custom curated itineraries.</p>
        </div>

        {activePackages.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-semibold">
            No tour packages available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activePackages.map((p) => {
              const fixed = p.pricingType !== "km";
              return (
                <div
                  key={p._id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image */}
                  <div className="h-56 relative bg-slate-100 overflow-hidden">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                        Package Image
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      {fixed ? (
                        <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wider shadow-sm">
                          Fixed Price
                        </span>
                      ) : (
                        <span className="bg-saffron-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-lg border border-saffron-500/20 uppercase tracking-wider shadow-sm">
                          Customizable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-950 font-cinzel leading-snug group-hover:text-saffron-600 transition-colors">
                          {p.name}
                        </h3>
                      </div>

                      {/* Duration info */}
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-4">
                        <FaClock className="text-saffron-500" />
                        <span>{p.duration}</span>
                      </div>

                      <p className="text-slate-600 text-xs line-clamp-3 mb-6 leading-relaxed font-medium">
                        {p.description}
                      </p>
                    </div>

                    <div>
                      {/* Price Section */}
                      <div className="flex items-baseline justify-between border-t border-slate-100 pt-4 mb-5">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <FaTags className="text-slate-300" /> Cost Estimate
                        </span>
                        <div className="text-right">
                          {p.pricingType === "km" ? (
                            <>
                              <span className="text-[10px] text-slate-500 font-bold block">Package Fare Starts</span>
                              <span className="text-xl font-extrabold text-saffron-600">
                                {p.price > 0 ? `₹${p.price}/Km` : "Based on Km"}
                              </span>
                            </>
                          ) : p.pricingType === "oneway" ? (
                            <>
                              <span className="text-[10px] text-slate-500 font-bold block">
                                {p.vehicleName || "Sedan"} One-Way
                              </span>
                              <span className="text-2xl font-extrabold text-slate-950">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-slate-500 font-bold block">
                                {p.vehicleName || "Sedan"} Car Price
                              </span>
                              <span className="text-2xl font-extrabold text-slate-950">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`/packages/${p._id}`}
                          className="py-3 text-center border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 text-slate-800 transition-colors uppercase tracking-wider block"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleBookPackage(p)}
                          className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                        >
                          <FaWhatsapp className="w-4.5 h-4.5" />
                          {p.pricingType === "km" ? "Get Quote" : "Book Package"}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
