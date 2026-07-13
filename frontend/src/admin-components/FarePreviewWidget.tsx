"use client";

import React, { useState, useEffect } from "react";
import { Calculator, Info, MapPin, Navigation } from "lucide-react";
import { calculateOutstationFare, getMinKm } from "@/lib/fareFormula";
import { OutstationTier } from "@/types";

interface FarePreviewWidgetProps {
  tiers: OutstationTier[];
  pricePerKm: number;
  localPrice?: number;
  outstationPrice?: number; // Admin-set flat per-day rate
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

  // If flatDayPrice is set, use it as base price directly
  const flatOverride =
    exactMatch?.flatDayPrice && exactMatch.flatDayPrice > 0
      ? exactMatch.flatDayPrice
      : undefined;

  // Calculate fare using the pure shared formula
  const { price, breakdown } = calculateOutstationFare(tiers, pricePerKm, days, km);

  const excessRate = flatOverride
    ? pricePerKm
    : exactMatch
    ? exactMatch.price
    : pricePerKm;
  const excessKmVal = exactMatch
    ? Math.max(0, km - exactMatch.minKm)
    : Math.max(0, km - getMinKm(days));

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
                min={1}
                value={km}
                onChange={(e) =>
                  setKm(Math.max(1, parseInt(e.target.value) || 0))
                }
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron-500 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Outstation price output */}
        <div className="border-t border-slate-100 pt-3">
          {/* Admin-set flat day rate — shown prominently like local price */}
          {outstationPrice !== undefined && outstationPrice > 0 ? (
            <div className="mb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Flat Day Rate (Admin-Set):</span>
                <span className="text-[9px] text-saffron-600 font-semibold">✓ Per-day flat price — overrides tier-based calc</span>
              </div>
              <span className="text-sm font-extrabold text-saffron-700 font-cinzel">₹{outstationPrice.toLocaleString("en-IN")}<span className="text-[10px] text-slate-400 font-normal">/day</span></span>
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-[9px] text-slate-400 font-semibold">
                💡 "Outstation Price (Per Day Flat)" set nahi kiya — tier matrix ya per-km rate use hoga.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {outstationPrice && outstationPrice > 0 ? "Estimated Trip Price:" : "Outstation Trip Price:"}
            </span>
            {!exactMatch && !(outstationPrice && outstationPrice > 0) ? (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded">
                No tier for {days} day(s) — add one below
              </span>
            ) : (
              <span className="text-sm font-extrabold text-slate-900 font-cinzel">
                ₹{(outstationPrice && outstationPrice > 0 ? outstationPrice * days : price).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {outstationPrice && outstationPrice > 0 && (
            <p className="text-[9px] text-slate-500 mt-1 font-semibold">
              {days} day(s) × ₹{outstationPrice.toLocaleString("en-IN")}/day = ₹{(outstationPrice * days).toLocaleString("en-IN")}
            </p>
          )}

          {/* Outstation breakdown details */}
          {exactMatch && (
            <div className="text-[9px] text-slate-500 mt-1.5 font-semibold space-y-0.5">
              {flatOverride ? (
                <span className="text-saffron-600 font-bold">
                  🏷️ Flat Day Price: ₹{flatOverride.toLocaleString("en-IN")} +
                  Excess ({excessKmVal}km × ₹{excessRate}/km) = ₹
                  {breakdown.excessKmCharge.toLocaleString("en-IN")}
                </span>
              ) : (
                <span>
                  Base: ₹{breakdown.basePrice.toLocaleString("en-IN")} + Excess
                  ({excessKmVal}km × ₹{excessRate}/km) = ₹
                  {breakdown.excessKmCharge.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}
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
