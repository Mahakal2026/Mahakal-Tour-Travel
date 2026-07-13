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
        <button
          type="button"
          onClick={handleAdd}
          className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Tier
        </button>
      </div>

      {/* Info box explaining flat day price */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-2.5 items-start text-[10px] text-blue-700">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
        <span>
          <strong>Flat Day Price (₹)</strong> — Apne haath se har day ke liye ek fixed base price set karo (jaise Local ka 8h/80km flat price).
          Agar set hai to yeh automatically per-km calculation ko override karega. Khaali chhod do to per-km rate se calculate hoga.
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
                <th className="px-3 py-2.5">Price per KM (₹)</th>
                <th className="px-3 py-2.5">
                  <span className="flex items-center gap-1">
                    Flat Day Price (₹)
                    <span className="bg-saffron-100 text-saffron-700 rounded px-1 py-0.5 text-[8px] font-extrabold tracking-wide">NEW</span>
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

                  {/* Price per KM */}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      value={tier.price}
                      onChange={(e) =>
                        handleChangeField(index, "price", parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-saffron-500 outline-none text-center font-bold text-saffron-600"
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
