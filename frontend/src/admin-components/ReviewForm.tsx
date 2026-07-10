"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X, Star } from "lucide-react";
import { Review } from "@/types";

interface ReviewFormProps {
  initialData?: Review | null;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
}

export default function ReviewForm({
  initialData,
  onSubmit,
  isSaving,
  onClose,
}: ReviewFormProps) {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      customerName: "",
      titleLocation: "",
      initials: "",
      rating: 5,
      reviewText: "",
      isActive: true,
    },
  });

  const ratingValue = watch("rating");

  useEffect(() => {
    if (initialData) {
      reset({
        customerName: initialData.customerName,
        titleLocation: initialData.titleLocation || "",
        initials: initialData.initials || "",
        rating: initialData.rating,
        reviewText: initialData.reviewText,
        isActive: initialData.isActive,
      });
    } else {
      reset({
        customerName: "",
        titleLocation: "",
        initials: "",
        rating: 5,
        reviewText: "",
        isActive: true,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: any) => {
    // Generate initials if not specified
    let finalInitials = data.initials?.trim();
    if (!finalInitials && data.customerName) {
      finalInitials = data.customerName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 3)
        .toUpperCase();
    }

    const cleanedData = {
      ...data,
      rating: parseInt(data.rating.toString(), 10),
      initials: finalInitials || undefined,
    };
    await onSubmit(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold font-cinzel text-slate-900">
            {initialData ? "Edit Customer Review" : "Add New Testimonial"}
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Customer Name</label>
              <input
                type="text"
                required
                {...register("customerName", { required: true })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. Rupesh Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Location / Label (Optional)</label>
              <input
                type="text"
                {...register("titleLocation")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                placeholder="e.g. Tourist, Delhi"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Initials (Optional)</label>
              <input
                type="text"
                maxLength={3}
                {...register("initials")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm uppercase"
                placeholder="e.g. RS"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Review Rating</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                {...register("rating", { required: true })}
                className="w-full max-w-[200px] accent-saffron-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="font-bold flex items-center gap-1 text-sm text-amber-500">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                {ratingValue} Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Review Feedback</label>
            <textarea
              required
              rows={4}
              {...register("reviewText", { required: true })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
              placeholder="Paste or write the customer feedback here..."
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register("isActive")}
              className="w-4 h-4 text-saffron-600 rounded focus:ring-saffron-500"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer">
              Visible on landing page
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
              {initialData ? "Save changes" : "Add review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
