"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, X, Plus, Image as ImageIcon } from "lucide-react";
import { Package } from "@/types";

interface PackageFormProps {
  initialData?: Package | null;
  onSubmit: (data: any, imageFile: File | null) => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
}

export default function PackageForm({
  initialData,
  onSubmit,
  isSaving,
  onClose,
}: PackageFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: 0,
      priceLabel: "",
      vehicleName: "Sedan",
      pricingType: "flat",
      isActive: true,
      inclusions: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inclusions",
  });

  useEffect(() => {
    if (initialData) {
      const inclusionsList = initialData.inclusions?.map((i) => ({ value: i })) || [{ value: "" }];
      reset({
        name: initialData.name,
        description: initialData.description,
        duration: initialData.duration,
        price: initialData.price,
        priceLabel: initialData.priceLabel || "",
        vehicleName: initialData.vehicleName || "Sedan",
        pricingType: (initialData.pricingType as any) || "flat",
        isActive: initialData.isActive,
        inclusions: inclusionsList,
      });
      setImagePreview(initialData.image || null);
    } else {
      reset({
        name: "",
        description: "",
        duration: "",
        price: 0,
        priceLabel: "",
        vehicleName: "Sedan",
        pricingType: "flat",
        isActive: true,
        inclusions: [{ value: "" }],
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
    // Filter blank inclusions and convert to array of strings
    const inclusionsArr = data.inclusions
      .map((i: any) => i.value.trim())
      .filter((i: string) => i !== "");

    const cleanedData = {
      ...data,
      price: parseFloat(data.price),
      inclusions: inclusionsArr,
    };
    await onSubmit(cleanedData, imageFile);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold font-cinzel text-slate-900">
            {initialData ? "Modify Tour Package details" : "Create New Tour Package"}
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
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Package Title / Route Name</label>
              <input
                type="text"
                required
                {...register("name", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. Ujjain Holy Mahakal Darshan"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description Summary</label>
              <textarea
                required
                rows={3}
                {...register("description", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="Briefly state itinerary highlights, cities visited, guidance options..."
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Duration</label>
              <input
                type="text"
                required
                {...register("duration", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. 2 Days / 1 Night"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Base Price (₹)</label>
              <input
                type="number"
                required
                {...register("price", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm font-bold"
                placeholder="e.g. 7999"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Price Label / Condition (Optional)</label>
              <input
                type="text"
                {...register("priceLabel")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. Sedan Cab flat price / Based on Kilometer calculations"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Name</label>
              <input
                type="text"
                required
                {...register("vehicleName", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. Sedan, SUV, Premium SUV"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Pricing Type</label>
              <select
                required
                {...register("pricingType", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm bg-white"
              >
                <option value="flat">Flat Rate (e.g. Sedan Car Price)</option>
                <option value="km">Km Based (e.g. Based on Km / Custom Quote)</option>
                <option value="oneway">One-Way Drop (e.g. Sedan One-Way)</option>
              </select>
            </div>
          </div>

          {/* Dynamic inclusions table */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Package Inclusions / Highlights</label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    required
                    {...register(`inclusions.${index}.value` as const, { required: true })}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                    placeholder="e.g. State permit & toll tax charges included"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ value: "" })}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-2 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Highlights
              </button>
            </div>
          </div>

          {/* Photo */}
          <div className="border-t border-slate-100 pt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Package Photo</label>
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
                  required={!initialData}
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-saffron-50 file:text-saffron-700 hover:file:bg-saffron-100 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Upload a travel destination photo.</p>
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
              Visible on website
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
              {initialData ? "Save changes" : "Create package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
