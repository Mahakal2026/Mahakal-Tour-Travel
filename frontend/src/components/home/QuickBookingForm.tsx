"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaUser, FaMapPin, FaMapMarked, FaWhatsapp, FaLocationArrow } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import { BiTargetLock } from "react-icons/bi";
import { bookingFormSchema, type BookingFormData } from "@/lib/schemas";
import { buildBookingMessage, sendBookingInquiry } from "@/lib/whatsapp";
import { Vehicle } from "@/types";

export default function QuickBookingForm({ vehicles = [] }: { vehicles?: Vehicle[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      vehicle: vehicles.length > 0 ? vehicles[0].name : "",
    },
  });

  // Geolocation detection handler
  const handleLocateMe = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse-geocode coordinates using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
                "User-Agent": "MahakalTravelsGeolocation/1.0",
              },
            }
          );

          if (!response.ok) throw new Error("Reverse geocoding failed");

          const data = await response.json();
          const addr = data.address;
          
          // Formulate a clean, brief address
          const street = addr.road || addr.suburb || addr.neighbourhood || "";
          const city = addr.city || addr.town || addr.village || "";
          const state = addr.state ? `, ${addr.state}` : "";
          
          const cleanAddress = street 
            ? `${street}, ${city}` 
            : `${city}${state}`;

          setValue("pickup", cleanAddress || `My Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } catch (error) {
          console.error("Nominatim reverse geocoding failed, falling back to coordinates:", error);
          setValue("pickup", `My Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation request failed:", error);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === 1) {
          errorMsg = "Location access denied by user. Please type location manually.";
        }
        alert(errorMsg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Map frontend vehicle choice string to backend Enum
      let vehicleEnum: "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo" = "sedan";
      const cleanVehicle = data.vehicle.toLowerCase();
      
      if (cleanVehicle.includes("hatchback") || cleanVehicle.includes("swift") || cleanVehicle.includes("wagon")) {
        vehicleEnum = "hatchback";
      } else if (cleanVehicle.includes("sedan") || cleanVehicle.includes("dzire") || cleanVehicle.includes("amaze")) {
        vehicleEnum = "sedan";
      } else if (cleanVehicle.includes("ertiga") || cleanVehicle.includes("suv")) {
        vehicleEnum = "suv";
      } else if (cleanVehicle.includes("innova") || cleanVehicle.includes("crysta")) {
        vehicleEnum = "premium-suv";
      } else if (cleanVehicle.includes("tempo") || cleanVehicle.includes("traveller")) {
        vehicleEnum = "tempo";
      }

      const formattedMessage = buildBookingMessage({
        name: data.name,
        phone: data.phone,
        vehicle: data.vehicle,
        pickup: data.pickup,
        drop: data.drop,
        date: data.date,
      });

      // Fire non-blocking WhatsApp booking inquiry flow
      await sendBookingInquiry({
        name: data.name,
        phone: data.phone,
        vehicle: vehicleEnum,
        tripType: "one-way", // Quick form drops are typically one-way trips
        routeOrPackage: `${data.pickup} to ${data.drop} (Date: ${data.date})`,
        messageText: formattedMessage,
      });
    } catch (error) {
      console.error("Booking form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
      <h3 className="text-2xl font-bold text-slate-900 mb-2 font-cinzel">Book Your Ride</h3>
      <p className="text-slate-500 text-sm mb-6">Quick inquiry and direct reservations via WhatsApp.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FaUser className="w-4 h-4" />
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
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Pickup & Drop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Pick-up Location
              </label>
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="text-[10px] text-saffron-600 hover:text-saffron-700 font-extrabold flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isLocating ? (
                  <>
                    <CgSpinner className="animate-spin text-xs" /> Locating...
                  </>
                ) : (
                  <>
                    <BiTargetLock className="text-xs" /> Locate Me
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FaMapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("pickup")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
                placeholder="e.g. Gwalior Stn"
              />
            </div>
            {errors.pickup && (
              <p className="text-red-500 text-xs mt-1">{errors.pickup.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Drop-off Location
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <FaMapMarked className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("drop")}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all text-sm text-slate-800"
                placeholder="e.g. Ujjain"
              />
            </div>
            {errors.drop && (
              <p className="text-red-500 text-xs mt-1">{errors.drop.message}</p>
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
              <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
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
                <option key={v._id || v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-2 touch-target cursor-pointer"
        >
          {isSubmitting ? (
            <CgSpinner className="w-5 h-5 animate-spin" />
          ) : (
            <FaWhatsapp className="w-5 h-5" />
          )}
          Book/Inquire via WhatsApp
        </button>
      </form>
    </div>
  );
}
