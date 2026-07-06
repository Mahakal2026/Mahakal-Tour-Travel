"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, MapPin, MapPinned, MessageCircle, Loader2 } from "lucide-react";
import { bookingFormSchema, type BookingFormData } from "@/lib/schemas";
import { buildBookingMessage, openWhatsApp } from "@/lib/whatsapp";
import { apiClient } from "@/lib/api";

export default function QuickBookingForm({ vehicles = [] }: { vehicles?: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      vehicle: vehicles.length > 0 ? vehicles[0].name : "",
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Submit to backend API
      await apiClient.post("/leads", {
        name: data.name,
        phone: data.phone,
        pickup: data.pickup,
        drop: data.drop,
        date: data.date,
        vehicle: data.vehicle,
        source: "hero-form",
      });
    } catch (error) {
      console.error("Failed to save lead:", error);
      // Even if backend fails, we still want to open WhatsApp so they don't lose the lead
    } finally {
      setIsSubmitting(false);
      // 2. Open WhatsApp
      const message = buildBookingMessage({
        name: data.name,
        phone: data.phone,
        vehicle: data.vehicle,
        pickup: data.pickup,
        drop: data.drop,
        date: data.date,
      });
      openWhatsApp(message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">
        Book Your Ride
      </h3>
      <p className="text-slate-500 text-sm mb-6">
        Quick inquiry and direct reservations via WhatsApp.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("name")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="font-bold text-[10px]">+91</span>
              </span>
              <input
                type="tel"
                {...register("phone")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
                placeholder="10-digit number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Pickup & Drop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Pick-up Location
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("pickup")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
                placeholder="e.g. Gwalior Stn"
              />
            </div>
            {errors.pickup && (
              <p className="text-red-500 text-xs mt-1">
                {errors.pickup.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Drop-off Location
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPinned className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("drop")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
                placeholder="e.g. Ujjain"
              />
            </div>
            {errors.drop && (
              <p className="text-red-500 text-xs mt-1">
                {errors.drop.message}
              </p>
            )}
          </div>
        </div>

        {/* Date & Vehicle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Travel Date
            </label>
            <input
              type="date"
              {...register("date")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
            />
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">
                {errors.date.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Vehicle
            </label>
            <select
              {...register("vehicle")}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
            >
              {vehicles.map((v) => (
                <option key={v._id} value={v.name}>
                  {v.name} ({v.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2 touch-target"
        >
          <MessageCircle className="w-5 h-5" />
          Book/Inquire via WhatsApp
        </button>
      </form>
    </div>
  );
}
