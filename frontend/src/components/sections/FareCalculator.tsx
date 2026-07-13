"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, Info, Loader2 } from "lucide-react";
import { Vehicle } from "@/types";
import CabSelect from "../ui/CabSelect";
import { buildAndSendBooking } from "@/lib/whatsapp";
import { apiClient } from "@/lib/api";
import axios from "axios";
import { getMinKm } from "@/lib/fareFormula";

interface FareCalculatorProps {
  vehicles: Vehicle[];
}

interface FareBreakdown { 
  basePrice?: number;
  excessKmCharge?: number;
  isExtrapolated?: boolean;
}

export default function FareCalculator({ vehicles: vehiclesProp = [] }: FareCalculatorProps) {
  const [tripType, setTripType] = useState<"local" | "outstation-round">("local");
  const [selectedVehicleName, setSelectedVehicleName] = useState<string>("");
  const [km, setKm] = useState<number>(250);
  const [days, setDays] = useState<number>(1);
  
  const [price, setPrice] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<FareBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Client-side vehicles state — starts with SSR prop, self-fetches if empty
  const [vehicles, setVehicles] = useState<Vehicle[]>(vehiclesProp);
  const [vehiclesLoading, setVehiclesLoading] = useState<boolean>(false);

  // If SSR sent empty vehicles (backend was unavailable), fetch client-side
  useEffect(() => {
    if (vehiclesProp.length > 0) {
      setVehicles(vehiclesProp);
      return;
    }
    // SSR gave empty — fetch fresh from API on client
    setVehiclesLoading(true);
    const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
    fetch(`${url}/vehicles`)
      .then((res) => res.json())
      .then((json) => {
        const data: Vehicle[] = json?.data || (Array.isArray(json) ? json : []);
        setVehicles(data.filter((v) => v.isActive));
      })
      .catch(() => {/* silently ignore — user sees empty state */})
      .finally(() => setVehiclesLoading(false));
  }, [vehiclesProp]);

  const activeVehicles = vehicles.filter((v) => v.isActive);
  const selectedVehicle = activeVehicles.find((v) => v.name === selectedVehicleName) || activeVehicles[0];

  useEffect(() => {
    if (activeVehicles.length > 0 && !selectedVehicleName) {
      setSelectedVehicleName(activeVehicles[0].name);
    }
  }, [activeVehicles, selectedVehicleName]);

  // Auto-sync KM field when days or tripType changes
  useEffect(() => {
    if (tripType === "outstation-round") {
      setKm(getMinKm(days));
    }
  }, [days, tripType]);

  // Fetch calculation on input changes
  useEffect(() => {
    if (!selectedVehicle?._id) return;

    const controller = new AbortController();

    const calculateFare = async () => {
      // Validate parameters to prevent 400 Bad Request during input typing
      if (tripType === "outstation-round") {
        if (!km || km <= 0 || !days || days <= 0 || isNaN(km) || isNaN(days)) {
          setPrice(null);
          setBreakdown(null);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const payload: any = {
          vehicleId: selectedVehicle._id,
          tripType,
        };

        if (tripType === "outstation-round") {
          payload.km = km;
          payload.days = days;
        }

        const res = await apiClient.post("/fare/calculate", payload, {
          signal: controller.signal,
        });
        if (res.data?.success) {
          setPrice(res.data.data.price);
          setBreakdown(res.data.data.breakdown || null);
        } else {
          setPrice(res.data.price);
          setBreakdown(res.data.breakdown || null);
        }
      } catch (err: any) {
        if (axios.isCancel(err)) return;
        console.error("Fare calculation error:", err);
        setError("Unable to calculate fare. Please try again.");
        setPrice(null);
        setBreakdown(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const delayDebounceFn = setTimeout(() => {
      calculateFare();
    }, 300); // Debounce to prevent multiple quick calls

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [selectedVehicle?._id, tripType, km, days]);

  const handleBook = async () => {
    if (!selectedVehicle) return;
    if (price === null) return;

    await buildAndSendBooking({
      vehicle: selectedVehicle,
      tripType,
      km: tripType !== "local" ? km : undefined,
      days: tripType === "outstation-round" ? days : undefined,
      price: price,
      breakdown: breakdown || undefined,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
    });
  };

  return (
    <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="block text-xs font-bold uppercase tracking-widest text-saffron-600 mb-2">Estimate Your Journey</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-cinzel tracking-tight">Taxi Fare Calculator</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">Get an instant, reliable fare estimate powered directly by our live rates.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-saffron-600 to-amber-gold p-8 text-white text-center md:text-left md:flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight font-cinzel">Dynamic Fare Calculator</h3>
              <p className="text-orange-100 text-xs mt-1">Provide details to calculate transparent estimates</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-xs tracking-wider uppercase font-bold">
              100% Transparent Billing
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Trip Type Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                Select Journey Type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTripType("local")}
                  className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    tripType === "local"
                      ? "bg-white text-saffron-700 shadow-md border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Local (8h / 80km)
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("outstation-round")}
                  className={`py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    tripType === "outstation-round"
                      ? "bg-white text-saffron-700 shadow-md border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Outstation Round-Trip
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom Cab Dropdown */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Select Cab Model
                </label>
                {activeVehicles.length > 0 ? (
                  <CabSelect
                    vehicles={activeVehicles}
                    value={selectedVehicleName}
                    onChange={setSelectedVehicleName}
                  />
                ) : vehiclesLoading ? (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-saffron-500" />
                    Loading cabs...
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400">
                    No cabs available
                  </div>
                )}
              </div>

              {/* Dynamic input side */}
              <div>
                {tripType === "local" ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                      Local Details
                    </label>
                    <div className="bg-saffron-50 border border-saffron-100 rounded-xl p-3 text-xs text-saffron-800 flex items-start gap-3">
                      <Info className="w-4 h-4 text-saffron-600 mt-0.5 flex-shrink-0" />
                      <span>
                        Fixed package includes 8 Hours and 80 Kilometers. Excess kilometers will be charged dynamically per kilometer.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                        Estimated Distance (in Km)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-xs">KM</span>
                        <input
                          type="number"
                          min={1}
                          value={km}
                          onChange={(e) => setKm(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stepper duration for outstation */}
            {tripType === "outstation-round" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Trip Duration (Days)
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden max-w-[200px]">
                    <button
                      type="button"
                      onClick={() => setDays(Math.max(1, days - 1))}
                      className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-r border-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-center py-2 focus:outline-none font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setDays(days + 1)}
                      className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-l border-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                  ⚠️ Outstation policy: Minimum billing of {getMinKm(1)} Km applies per day of booking.
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4">Your Contact Details (Optional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp Mobile Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                />
              </div>
            </div>

            {/* Results Block */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="w-full md:w-auto">
                <span className="block text-xs uppercase font-extrabold tracking-widest text-slate-400">
                  Estimated Total Fare
                </span>
                
                {loading ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader2 className="w-6 h-6 text-saffron-600 animate-spin" />
                    <span className="text-sm font-semibold text-slate-500">Calculating...</span>
                  </div>
                ) : error ? (
                  <span className="text-sm font-bold text-red-500 block mt-2">{error}</span>
                ) : price !== null ? (
                  <div className="mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-cinzel">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      *Excludes tolls, parking, and state permits.
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-slate-400 block mt-2">Select parameters to view price</span>
                )}
              </div>

              {price !== null && !loading && (
                <button
                  onClick={handleBook}
                  className="w-full md:w-auto bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-saffron-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book At This Price
                </button>
              )}
            </div>

            {/* Fare Breakdown display */}
            {price !== null && !loading && (
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-saffron-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-saffron-600 flex-shrink-0" />
                  Fare Breakup details
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600 font-medium">
                  {tripType === "local" ? (
                    <div>
                      • Local package base rate for {selectedVehicle?.name}: <span className="font-bold text-slate-800">₹{selectedVehicle?.localPrice || price}</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        • Minimum Outstation billing distance ({days} Days × {getMinKm(1)} Km): <span className="font-bold text-slate-800">{getMinKm(days)} Km</span>
                      </div>
                      <div>
                        • Billable distance: <span className="font-bold text-slate-800">{Math.max(km, getMinKm(days))} Km</span>
                      </div>
                      {breakdown?.basePrice && (
                        <div>
                          • Base Outstation Tier Rate: <span className="font-bold text-slate-800">₹{breakdown.basePrice.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {breakdown?.excessKmCharge !== undefined && breakdown.excessKmCharge > 0 && (
                        <div>
                          • Excess Kilometer Charge: <span className="font-bold text-slate-800">+ ₹{breakdown.excessKmCharge.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                    </>
                  )}
                  {breakdown?.isExtrapolated && (
                    <div className="text-[10px] text-saffron-700 bg-saffron-50 p-2.5 rounded-lg border border-saffron-100 font-bold mt-2">
                      💡 Estimated price for extended trips. Final billing will be adjusted based on actual travel.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
