"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2, X, Image as ImageIcon } from "lucide-react";
import { Vehicle, OutstationTier } from "@/types";
import OutstationTiersTable from "./OutstationTiersTable";
import FarePreviewWidget from "./FarePreviewWidget";

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSubmit: (data: any, imageFile: File | null) => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
}

export default function VehicleForm({
  initialData,
  onSubmit,
  isSaving,
  onClose,
}: VehicleFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      type: "sedan" as "sedan" | "suv" | "premium-suv" | "tempo",
      capacity: "",
      acType: "AC" as "AC" | "Non-AC",
      pricePerKm: 12,
      localPrice: undefined as number | undefined,
      subtitle: "",
      isActive: true,
      outstationTiers: [] as OutstationTier[],
    },
  });

  const pricePerKm = watch("pricePerKm");
  const localPrice = watch("localPrice");
  const outstationTiers = watch("outstationTiers");

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        capacity: initialData.capacity,
        acType: initialData.acType,
        pricePerKm: initialData.pricePerKm,
        localPrice: initialData.localPrice,
        subtitle: initialData.subtitle || "",
        isActive: initialData.isActive,
        outstationTiers: initialData.outstationTiers || [],
      });
      setImagePreview(initialData.image || null);
    } else {
      reset({
        name: "",
        type: "sedan",
        capacity: "",
        acType: "AC",
        pricePerKm: 12,
        localPrice: undefined,
        subtitle: "",
        isActive: true,
        outstationTiers: [],
      });
      setImagePreview(null);
    }
    setImageFile(null);
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (data: any) => {
    // Coerce numeric types
    const cleanedData = {
      ...data,
      pricePerKm: parseFloat(data.pricePerKm),
      localPrice: data.localPrice ? parseFloat(data.localPrice) : undefined,
    };
    await onSubmit(cleanedData, imageFile);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold font-cinzel text-slate-900">
            {initialData ? "Modify Vehicle details" : "Add New Cab to Fleet"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Cab Name</label>
              <input
                type="text"
                required
                {...register("name", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. Swift Dzire / Toyota Aura"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Cab Type</label>
              <select
                {...register("type", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV (6+1 Seater)</option>
                <option value="premium-suv">Premium SUV (Innova)</option>
                <option value="tempo">Tempo Traveller</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Seating Capacity</label>
              <input
                type="text"
                required
                {...register("capacity", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. 4+1 Seater"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">AC Status</label>
              <select
                {...register("acType", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
              >
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Price Per Km (₹)</label>
              <input
                type="number"
                step="0.1"
                required
                {...register("pricePerKm", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm font-bold"
                placeholder="e.g. 12"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Local Price (8h/80km Flat)</label>
              <input
                type="number"
                {...register("localPrice")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm font-bold"
                placeholder="e.g. 1800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subtitle Description</label>
              <input
                type="text"
                {...register("subtitle")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. Extra legroom and separate trunk storage"
              />
            </div>
          </div>

          {/* Outstation Pricing Tiers Table */}
          <div>
            <Controller
              name="outstationTiers"
              control={control}
              render={({ field }) => (
                <OutstationTiersTable
                  value={field.value}
                  onChange={(val) => setValue("outstationTiers", val)}
                />
              )}
            />
          </div>

          <FarePreviewWidget
            tiers={outstationTiers || []}
            pricePerKm={Number(pricePerKm) || 0}
            localPrice={localPrice ? Number(localPrice) : undefined}
          />

          {/* Image Upload Input */}
          <div className="border-t border-slate-100 pt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Vehicle Photo</label>
            <div className="flex items-center gap-5">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-16 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!initialData} // Required only for new vehicles
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-saffron-50 file:text-saffron-700 hover:file:bg-saffron-100 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Upload a clear side or front view image of the cab.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="w-4 h-4 text-saffron-600 rounded focus:ring-saffron-500"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer">
              Visible on Landing Page
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? "Save changes" : "Add vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
