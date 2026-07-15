"use client";

import React from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { OutstationTier } from "@/types";

interface OutstationTiersTableProps {
  value?: OutstationTier[];
  onChange: (tiers: OutstationTier[]) => void;
}

export default function OutstationTiersTable({
  value = [],
  onChange,
}: OutstationTiersTableProps) {
  const handlePopulateDays1To4 = () => {
    const existingDays = new Set(value.map((t) => Number(t.days)));
    const newTiers = [...value];
    for (let d = 1; d <= 4; d++) {
      if (!existingDays.has(d)) {
        newTiers.push({
          days: d,
          minKm: d * 250,
          price: 12,
          flatDayPrice: undefined,
        });
      }
    }
    newTiers.sort((a, b) => a.days - b.days);
    onChange(newTiers);
  };

  const handleAdd = () => {
    const nextDay = value.length > 0 ? Math.max(...value.map((t) => t.days)) + 1 : 1;
    const newTier: OutstationTier = {
      days: nextDay,
      minKm: nextDay * 250, // Default outstation policy minimum
      price: 12,
      flatDayPrice: undefined,
    };
    onChange([...value, newTier]);
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleChangeField = (index: number, field: keyof OutstationTier, val: number | undefined) => {
    const updated = value.map((tier, idx) => {
      if (idx === index) {
        return { ...tier, [field]: val };
      }
      return tier;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Outstation Pricing Matrix</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Configure day-wise minimum distance, per-km rate, and optional flat day price.</p>
        </div>
        <div className="flex items-center gap-2">
          {value.length < 4 && (
            <button
              type="button"
              onClick={handlePopulateDays1To4}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Populate Day 1 (250km), Day 2 (500km), Day 3 (750km), Day 4 (1000km)"
            >
              ⚡ Pre-fill Days 1-4
            </button>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Tier
          </button>
        </div>
      </div>

      {/* Info box explaining flat day price */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-2.5 items-start text-[10px] text-blue-700">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
        <span>
          <strong>Fixed Estimate Price (₹)</strong> — Set a fixed base price (like ₹3000 for Day 1). 
          If set, this estimate will be used for the included KM, and the vehicle's master <strong>"Price Per Km"</strong> will automatically apply to any extra KM beyond the Min KM.
        </span>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-4 text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-xl">
          No tiers configured. Default vehicle per-km rate will be used.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-3 py-2.5">Days</th>
                <th className="px-3 py-2.5">Min KM</th>
                <th className="px-3 py-2.5">
                  <span className="flex items-center gap-1">
                    Fixed Estimate Price (₹)
                  </span>
                </th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {value.map((tier, index) => (
                <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  {/* Days */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={tier.days}
                      onChange={(e) =>
                        handleChangeField(index, "days", parseInt(e.target.value) || 1)
                      }
                      className="w-14 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-saffron-500 outline-none text-center font-bold"
                    />
                  </td>

                  {/* Min KM */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={tier.minKm}
                      onChange={(e) =>
                        handleChangeField(index, "minKm", parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-saffron-500 outline-none text-center font-semibold"
                    />
                  </td>

                  {/* Price per KM (Hidden as we now use master vehicle pricePerKm) */}
                  <td className="hidden">
                    <input
                      type="hidden"
                      value={tier.price}
                    />
                  </td>

                  {/* Flat Day Price (admin can set manually) */}
                  <td className="px-3 py-2">
                    <div className="relative flex items-center">
                      <span className="absolute left-2 text-slate-400 text-[10px] font-bold">₹</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 2500"
                        value={tier.flatDayPrice ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          handleChangeField(
                            index,
                            "flatDayPrice",
                            raw === "" ? undefined : parseFloat(raw) || 0
                          );
                        }}
                        className={`w-24 pl-5 pr-2 py-1 border rounded focus:ring-1 focus:ring-saffron-500 outline-none text-center font-bold transition-colors ${
                          tier.flatDayPrice !== undefined && tier.flatDayPrice > 0
                            ? "border-saffron-400 bg-saffron-50 text-saffron-700"
                            : "border-slate-200 text-slate-400"
                        }`}
                      />
                    </div>
                    {tier.flatDayPrice !== undefined && tier.flatDayPrice > 0 && (
                      <p className="text-[9px] text-saffron-600 font-semibold mt-0.5 ml-0.5">✓ Flat override active</p>
                    )}
                  </td>

                  {/* Delete */}
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
