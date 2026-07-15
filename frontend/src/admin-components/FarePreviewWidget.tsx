"use client";

import React, { useState, useEffect } from "react";
import { Calculator, Info, MapPin, Navigation } from "lucide-react";
import { calculateOutstationFare, getMinKm } from "@/lib/fareFormula";
import { OutstationTier } from "@/types";

interface FarePreviewWidgetProps {
  tiers: OutstationTier[];
  pricePerKm: number;
  localPrice?: number;
  outstationPrice?: number;
}

export default function FarePreviewWidget({
  tiers = [],
  pricePerKm,
  localPrice,
  outstationPrice,
}: FarePreviewWidgetProps) {
  const [days, setDays] = useState<number>(1);
  const [km, setKm] = useState<number>(250);

  // Auto-sync KM field when days changes
  useEffect(() => {
    setKm(getMinKm(days));
  }, [days]);

  // Check if standard or custom tier matches
  const exactMatch = tiers.find((t) => Number(t.days) === days);

  // Calculate fare using the pure shared formula
  const { price, breakdown } = calculateOutstationFare(tiers, pricePerKm, days, km, outstationPrice);

  const excessRate = (breakdown as any)?.excessRate || pricePerKm;
  const excessKmVal = (breakdown as any)?.excessKm || 0;
  const includedKmVal = (breakdown as any)?.includedKm || days * 250;

  // Local fare — use admin-set value or fallback to per-km calculation
  const localFareDisplay =
    localPrice !== undefined && localPrice > 0
      ? localPrice
      : pricePerKm * 80; // default fallback: 80km × rate
  const isLocalCustom = localPrice !== undefined && localPrice > 0;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-slate-800 my-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Calculator className="w-5 h-5 text-saffron-600" />
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Live Fare Preview
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Test pricing tiers exactly as customers see them.
          </p>
        </div>
      </div>

      {/* ── LOCAL FARE SECTION ─────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3.5 h-3.5 text-green-600" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-green-700">
            Local Sightseeing (8h / 80km)
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Flat Fare:
          </span>
          <span
            className={`text-sm font-extrabold font-cinzel ${
              isLocalCustom ? "text-green-700" : "text-slate-400"
            }`}
          >
            ₹{localFareDisplay.toLocaleString("en-IN")}
          </span>
        </div>

        {isLocalCustom ? (
          <p className="text-[9px] text-green-600 font-semibold">
            ✓ Admin-set flat rate (8h/80km) — from "Local Price" field above
          </p>
        ) : (
          <p className="text-[9px] text-orange-500 font-semibold">
            ⚠ No local price set — showing fallback (80km × ₹{pricePerKm}/km). Set
            "Local Price (8h/80km Flat)" above to fix.
          </p>
        )}
      </div>

      {/* ── OUTSTATION FARE SECTION ────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Navigation className="w-3.5 h-3.5 text-saffron-600" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-saffron-700">
            Outstation Trip
          </span>
        </div>

        {/* Days & KM Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Days Selector Stepper */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              Days Duration
            </label>
            <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg overflow-hidden max-w-[140px]">
              <button
                type="button"
                onClick={() => setDays(Math.max(1, days - 1))}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-r border-slate-200 cursor-pointer transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={days}
                onChange={(e) =>
                  setDays(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full text-center py-1 focus:outline-none font-bold text-xs bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setDays(days + 1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-l border-slate-200 cursor-pointer transition-colors"
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
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-[10px]">
                KM
              </span>
              <input
                type="number"
                min={getMinKm(days)}
                value={km}
                onBlur={() => {
                  if (km < getMinKm(days)) setKm(getMinKm(days));
                }}
                onChange={(e) =>
                  setKm(parseInt(e.target.value) || 0)
                }
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron-500 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Outstation price output */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Estimated Trip Price:
            </span>
            <span className="text-sm font-extrabold text-slate-900 font-cinzel">
              ₹{price.toLocaleString("en-IN")}
            </span>
          </div>

          {(breakdown as any)?.requiresCustomQuote && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-800 font-semibold">
              ⚠️ For trips &gt; 4 days, customers will see a message prompting them to talk/WhatsApp directly for a custom quote.
            </div>
          )}

          {/* Outstation breakdown details showing fixed km + excess */}
          <div className="text-[10px] text-slate-600 mt-2 font-semibold bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
            <div className="flex justify-between">
              <span>• Fixed Package ({includedKmVal} Km included):</span>
              <span className="font-bold text-slate-800">₹{breakdown.basePrice.toLocaleString("en-IN")}</span>
            </div>
            {excessKmVal > 0 && (
              <div className="flex justify-between text-saffron-700">
                <span>• Extra Distance ({excessKmVal} Km × ₹{excessRate}/km):</span>
                <span className="font-bold">+ ₹{breakdown.excessKmCharge.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900">
              <span>Total Estimated Fare:</span>
              <span>₹{price.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[9px] text-slate-400 flex items-center gap-1.5 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>
          This preview uses the same calculation as the live Fare Calculator on
          your website. Remember to click Save for these numbers to go live.
        </span>
      </div>
    </div>
  );
}
