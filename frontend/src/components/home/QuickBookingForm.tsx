"use client";
import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
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
import PremiumDatePicker from "./PremiumDatePicker";

export default function QuickBookingForm({ vehicles = [] }: { vehicles?: Vehicle[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [passengers, setPassengers] = useState<string>("1 Passenger");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const selectedDate = watch("date");

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
        `• *Pick-up Location:* ${data.pickup}\n` +
        (data.drop ? `• *Drop Location:* ${data.drop}\n` : "") +
        `• *Travel Date:* ${data.date}\n` +
        `• *Passengers:* ${passengers}\n\n` +
        `Please confirm availability. Thank you!`;

      const routeText = data.pickup + (data.drop ? ` to ${data.drop}` : "");

      // Trigger booking flow (calls POST API and opens WhatsApp)
      await sendBookingInquiry({
        name: data.name,
        phone: data.phone,
        vehicle: vehicleEnum,
        tripType: "one-way",
        routeOrPackage: `${routeText} (Date: ${data.date}, Passengers: ${passengers})`,
        messageText: formattedMessage,
      });
    } catch (error) {
      console.error("Booking form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const passengerOptions = [
    "1 Passenger",
    "2 Passengers",
    "3 Passengers",
    "4 Passengers",
    "5+ Passengers",
  ];

  const [passengerOpen, setPassengerOpen] = useState(false);

  const passengerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        passengerRef.current &&
        !passengerRef.current.contains(e.target as Node)
      ) {
        setPassengerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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


        {/* Pickup & Drop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pickup */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Pick-up Location
              </label>

              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="text-[10px] text-saffron-400 hover:text-saffron-300 font-bold flex items-center gap-1 uppercase tracking-wider disabled:opacity-50 transition"
              >
                {isLocating ? (
                  <>
                    <CgSpinner className="animate-spin text-xs" />
                    Locating...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3 rotate-45" />
                    Locate Me
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                {...register("pickup")}
                placeholder="Pickup Location"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:outline-none text-white placeholder-slate-500"
              />
            </div>

            {errors.pickup && (
              <p className="text-red-400 text-xs mt-1">
                {errors.pickup.message}
              </p>
            )}
          </div>

          {/* Drop */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Drop Location
            </label>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              <input
                type="text"
                {...register("drop")}
                placeholder="Drop Location"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-saffron-500 focus:outline-none text-white placeholder-slate-500"
              />
            </div>

            {errors.drop && (
              <p className="text-red-400 text-xs mt-1">
                {errors.drop.message}
              </p>
            )}
          </div>
        </div>
        {/* Date & Passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* <div>
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
           */}
          <div>
            <PremiumDatePicker
              value={selectedDate}
              onChange={(value) => setValue("date", value, { shouldValidate: true })}
            />
            {errors.date && (
              <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Passengers
            </label>

            <div className="relative" ref={passengerRef}>
              {/* Button */}
              <button
                type="button"
                onClick={() => setPassengerOpen(!passengerOpen)}
                className={`w-full h-[52px] rounded-xl border transition-all duration-300
      ${passengerOpen
                    ? "border-saffron-500 ring-2 ring-saffron-500/30"
                    : "border-white/10 hover:border-white/20"
                  }
      bg-white/5 backdrop-blur-md
      px-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-400" />

                  <span className="text-white text-sm font-medium">
                    {passengers}
                  </span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${passengerOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown */}
              {passengerOpen && (
                <div
                  className="absolute left-0 right-0 mt-2 z-50  rounded-2xl  border border-white/10  bg-slate-950/95  backdrop-blur-2xl  shadow-[0_20px_60px_rgba(0,0,0,.45)]  overflow-hidden  animate-in fade-in zoom-in-95 duration-200"
                >
                  {passengerOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setPassengers(item);
                        setPassengerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
            ${passengers === item
                          ? "bg-saffron-500/15 text-saffron-400"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <span>{item}</span>

                      {passengers === item && (
                        <Check className="w-4 h-4 text-saffron-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
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
