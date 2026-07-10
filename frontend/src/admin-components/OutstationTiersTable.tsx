"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
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
    };
    onChange([...value, newTier]);
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleChangeField = (index: number, field: keyof OutstationTier, val: number) => {
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
          <p className="text-[10px] text-slate-500 mt-0.5">Configure day-wise minimum distance and specific prices.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Tier
        </button>
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
                <th className="px-4 py-2">Days</th>
                <th className="px-4 py-2">Min KM</th>
                <th className="px-4 py-2">Price per Km (₹)</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {value.map((tier, index) => (
                <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={1}
                      value={tier.days}
                      onChange={(e) =>
                        handleChangeField(index, "days", parseInt(e.target.value) || 1)
                      }
                      className="w-16 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-saffron-500 outline-none text-center font-bold"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      value={tier.minKm}
                      onChange={(e) =>
                        handleChangeField(index, "minKm", parseInt(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 border border-slate-200 rounded focus:ring-1 focus:ring-saffron-500 outline-none text-center font-semibold"
                    />
                  </td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2 text-right">
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
