"use client";

import React, { useState } from "react";
import { Calculator, Info } from "lucide-react";
import { calculateOutstationFare } from "@/lib/fareFormula";
import { OutstationTier } from "@/types";

interface FarePreviewWidgetProps {
  tiers: OutstationTier[];
  pricePerKm: number;
  localPrice?: number;
}

export default function FarePreviewWidget({
  tiers = [],
  pricePerKm,
  localPrice,
}: FarePreviewWidgetProps) {
  const [days, setDays] = useState<number>(1);
  const [km, setKm] = useState<number>(250);

  // Check if standard or custom tier matches
  const exactMatch = tiers.find((t) => Number(t.days) === days);
  
  // Calculate fare using the pure shared formula
  const { price, breakdown } = calculateOutstationFare(tiers, pricePerKm, days, km);

  const excessRate = exactMatch ? (exactMatch.price > 100 ? pricePerKm : exactMatch.price) : pricePerKm;
  const excessKmVal = exactMatch ? Math.max(0, km - exactMatch.minKm) : Math.max(0, km - days * 250);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-slate-800 my-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Calculator className="w-5 h-5 text-saffron-600" />
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Live Fare Preview</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Test pricing tiers exactly as customers see them.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Days Selector Stepper */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Days Duration
          </label>
          <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden max-w-[140px]">
            <button
              type="button"
              onClick={() => setDays(Math.max(1, days - 1))}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-r border-slate-200 cursor-pointer transition-colors"
            >
              -
            </button>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full text-center py-1 focus:outline-none font-bold text-xs bg-white"
            />
            <button
              type="button"
              onClick={() => setDays(days + 1)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-l border-slate-200 cursor-pointer transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Kilometers Input */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            Distance (Km)
          </label>
          <div className="relative max-w-[160px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-[10px]">KM</span>
            <input
              type="number"
              min={1}
              value={km}
              onChange={(e) => setKm(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron-500 text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Estimations Output block */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        {/* Outstation Estimate */}
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Outstation Trip Price:</span>
          {!exactMatch ? (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded">
              No tier configured for {days} day(s) yet — add one below
            </span>
          ) : (
            <span className="text-sm font-extrabold text-slate-900 font-cinzel">
              ₹{price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Outstation breakdown details */}
        {exactMatch && (
          <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-semibold">
            Base Price: ₹{breakdown.basePrice.toLocaleString("en-IN")} + Excess Charge ({excessKmVal}km × ₹{excessRate}/km) = ₹{breakdown.excessKmCharge.toLocaleString("en-IN")}
          </div>
        )}

        {/* Local Sightseeing flat price preview */}
        {localPrice !== undefined && (
          <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-[10px]">
            <span className="uppercase font-bold text-slate-400 tracking-wider">Local (8h/80km) Fare:</span>
            <span className="font-bold text-slate-700">₹{localPrice.toLocaleString("en-IN")}</span>
          </div>
        )}
      </div>

      <div className="text-[9px] text-slate-400 flex items-center gap-1.5 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>This preview uses the same calculation as the live Fare Calculator on your website. Remember to click Save for these numbers to go live.</span>
      </div>
    </div>
  );
}
