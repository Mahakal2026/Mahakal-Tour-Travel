"use client";
import Image from "next/image";

import React from "react";
import Link from "next/link";
import { FaUsers, FaSnowflake, FaWhatsapp } from "react-icons/fa";
import { Vehicle } from "@/types";
import { BookButtonWrapper } from "@/components/ui/ClientBookButtons";

interface FleetProps {
  vehicles: Vehicle[];
}

export default function Fleet({ vehicles = [] }: FleetProps) {
  const activeVehicles = vehicles.filter((v) => v.isActive);

  return (
    <section id="fleet" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="block text-xs font-bold uppercase tracking-widest text-saffron-600 mb-2">Our Premium Fleet</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-cinzel tracking-tight">Cabs for Every Journey</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">Choose from our sanitized, comfortable range of commercial cabs driven by verified pilots.</p>
        </div>

        {activeVehicles.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-semibold">
            No cabs available in the fleet at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeVehicles.map((v) => (
              <div
                key={v._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Container */}
                <div className="h-56 relative bg-slate-100 overflow-hidden flex items-center justify-center p-4">
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={v.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-slate-400 font-bold">Cab Image</span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-950 font-cinzel group-hover:text-saffron-600 transition-colors">
                        {v.name}
                      </h3>
                      <span className="text-xs font-extrabold bg-saffron-50 text-saffron-600 px-3 py-1 rounded-full border border-saffron-100 uppercase tracking-wide">
                        {v.type}
                      </span>
                    </div>

                    {v.subtitle && (
                      <p className="text-xs text-slate-500 italic mb-4 font-medium">{v.subtitle}</p>
                    )}

                    {/* Specs Row */}
                    <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                        <FaUsers className="text-slate-400 w-4 h-4" />
                        <span>{v.capacity}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                        <FaSnowflake className="text-slate-400 w-3.5 h-3.5" />
                        <span>{v.acType}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Price display */}
                    <div className="flex justify-between items-end mb-5">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outstation Rate</span>
                        <span className="text-2xl font-extrabold text-slate-950">₹{v.pricePerKm}</span>
                        <span className="text-xs text-slate-500 font-medium"> / Km</span>
                      </div>
                      {v.localPrice && (
                        <div className="text-right">
                          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Local Flat Rate</span>
                          <span className="text-lg font-bold text-slate-700">₹{v.localPrice.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-slate-500 block">(8h/80km)</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href={`/fleet/${v._id}`}
                        className="py-3 text-center border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 text-slate-800 transition-colors uppercase tracking-wider block"
                      >
                        View Details
                      </Link>
                      <BookButtonWrapper
                        vehicle={v}
                        className="bg-whatsapp-green hover:bg-whatsapp-green-hover text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider w-full text-center justify-center"
                        label="Book Now"
                      />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
