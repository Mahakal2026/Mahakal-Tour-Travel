"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, 
  MapPin, 
  Calendar, 
  Users, 
  Navigation, 
  Plane, 
  Map, 
  ChevronDown
} from "lucide-react";
import { CgSpinner } from "react-icons/cg";
import { FaWhatsapp } from "react-icons/fa";
import { bookingFormSchema, type BookingFormData } from "@/lib/schemas";
import { sendBookingInquiry } from "@/lib/whatsapp";
import { Vehicle } from "@/types";

export default function QuickBookingForm({ vehicles = [] }: { vehicles?: Vehicle[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [passengers, setPassengers] = useState<string>("1 Passenger");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      vehicle: "Sedan",
      name: "",
      phone: "",
      pickup: "",
      drop: "",
      date: "",
    },
  });

  // Geolocation detection handler (reverse-geocoding via OpenStreetMap)
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
          errorMsg = "Location access denied. Please enter manually.";
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
      const vehicleEnum = "sedan"; // Default vehicle type to log

      // Compile custom WhatsApp message text matching the premium styling
      const formattedMessage = `Hello Mahakal Tour & Travels, I would like to book a cab.\n\n` +
        `*Booking Details:*\n` +
        `• *Name:* ${data.name}\n` +
        `• *Phone:* +91 ${data.phone}\n` +
        `• *Pick-up:* ${data.pickup}\n` +
        `• *Travel Date:* ${data.date}\n` +
        `• *Passengers:* ${passengers}\n\n` +
        `Please confirm availability. Thank you!`;

      // Trigger booking flow (calls POST API and opens WhatsApp)
      await sendBookingInquiry({
        name: data.name,
        phone: data.phone,
        vehicle: vehicleEnum,
        tripType: "one-way",
        routeOrPackage: `${data.pickup} (Date: ${data.date}, Passengers: ${passengers})`,
        messageText: formattedMessage,
      });
    } catch (error) {
      console.error("Booking form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900/ backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
      {/* Decorative Top Highlight Line */}
      <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-saffron-500 to-amber-500 rounded-full" />

      {/* Header & Status Indicator */}
      <div className="flex justify-between items-center mb-6 pt-1">
        <h3 className="text-xl font-bold text-white tracking-tight">Book Your Trip</h3>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Driver Online
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("name")}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm text-white placeholder-slate-500"
                placeholder="Full Name"
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Phone
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none text-xs font-semibold">
                +91
              </span>
              <input
                type="tel"
                {...register("phone")}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm text-white placeholder-slate-500"
                placeholder="Phone Number"
              />
            </div>
            {errors.phone && (
              <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Pick-up Location
            </label>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="text-[10px] text-saffron-400 hover:text-saffron-300 font-extrabold flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isLocating ? (
                <>
                  <CgSpinner className="animate-spin text-xs" /> Locating...
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3 rotate-45" /> Locate Me
                </>
              )}
            </button>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
              <MapPin className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              {...register("pickup")}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm text-white placeholder-slate-500"
              placeholder="Pickup Location"
            />
          </div>
          {errors.pickup && (
            <p className="text-red-400 text-xs mt-1">{errors.pickup.message}</p>
          )}
        </div>

        {/* Date & Passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Date
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                {...register("date")}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm text-white placeholder-slate-500 [color-scheme:dark]"
              />
            </div>
            {errors.date && (
              <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Passengers
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                <Users className="w-4 h-4" />
              </span>
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all text-sm text-white appearance-none cursor-pointer text-slate-400"
              >
                <option className="bg-slate-900 text-white" value="1 Passenger">1 Passenger</option>
                <option className="bg-slate-900 text-white" value="2 Passengers">2 Passengers</option>
                <option className="bg-slate-900 text-white" value="3 Passengers">3 Passengers</option>
                <option className="bg-slate-900 text-white" value="4 Passengers">4 Passengers</option>
                <option className="bg-slate-900 text-white" value="5+ Passengers">5+ Passengers</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Submit to WhatsApp */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4 touch-target cursor-pointer duration-300"
        >
          {isSubmitting ? (
            <CgSpinner className="w-5 h-5 animate-spin" />
          ) : (
            <FaWhatsapp className="w-5 h-5" />
          )}
          Book Now via WhatsApp
        </button>

        {/* Footer Sub-links */}
        <div className="flex justify-between items-center text-xs text-slate-400 mt-6 border-t border-white/10 pt-4">
          <a href="#fleet" className="flex items-center gap-1 hover:text-saffron-400 transition-colors">
            <Plane className="w-3.5 h-3.5" /> Airport Transfer
          </a>
          <a href="#packages" className="flex items-center gap-1 hover:text-saffron-400 transition-colors">
            <Map className="w-3.5 h-3.5" /> Mahakal Darshan
          </a>
        </div>
      </form>
    </div>
  );
}
