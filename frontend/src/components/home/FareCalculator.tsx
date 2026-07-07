"use client";

import { CalendarCheck, Info } from "lucide-react";
import { type TripType } from "@/lib/constants";
import { useFareCalculator } from "@/hooks/useFareCalculator";
import { buildFareBookingMessage, sendBookingInquiry } from "@/lib/whatsapp";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Vehicle } from "@/types";

const TRIP_TABS: { key: TripType; label: string }[] = [
  { key: "local", label: "Local (8h / 80km)" },
  { key: "outstation-round", label: "Outstation Round-Trip" },
  { key: "one-way", label: "One-Way Drop" },
];

const DAYS_OPTIONS = [
  { value: 1, label: "1 Day (Minimum 250 km policy applies)" },
  { value: 2, label: "2 Days (Minimum 500 km policy applies)" },
  { value: 3, label: "3 Days (Minimum 750 km policy applies)" },
  { value: 4, label: "4+ Days (Custom Booking Recommended)" },
];

export default function FareCalculator({ vehicles = [] }: { vehicles?: Vehicle[] }) {
  const {
    tripType,
    setTripType,
    vehicle,
    setVehicle,
    distance,
    setDistance,
    days,
    setDays,
    formattedFare,
    getTripDescription,
    getVehicleLabel,
  } = useFareCalculator(vehicles);

  const handleBookAtPrice = async () => {
    // Map vehicle name to backend enum
    let vehicleEnum: "hatchback" | "sedan" | "suv" | "premium-suv" | "tempo" = "sedan";
    const selectedVehicle = vehicles.find((v) => v.name === vehicle);
    if (selectedVehicle) {
      vehicleEnum = selectedVehicle.type;
    }

    const message = buildFareBookingMessage({
      tripType: getTripDescription(),
      vehicle: getVehicleLabel(),
      price: formattedFare,
    });

    const numericFare = parseInt(formattedFare.replace(/[^0-9]/g, ""), 10) || 0;

    await sendBookingInquiry({
      vehicle: vehicleEnum,
      tripType: tripType, // matches local, outstation-round, one-way enums
      routeOrPackage: getTripDescription(),
      estimatedFare: numericFare,
      messageText: message,
    });
  };

  return (
    <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-saffron-600 to-amber-600 p-8 text-white text-center md:text-left md:flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight font-cinzel">
                  Taxi Fare Calculator
                </h2>
                <p className="text-saffron-100 text-sm mt-1">
                  Get an instant, reliable fare estimate for your journey
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-xs tracking-wider uppercase">
                No Hidden Charges
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-6">
              {/* Trip Type Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Trip Type
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl">
                  {TRIP_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTripType(tab.key)}
                      className={`py-3 px-2 rounded-lg font-bold text-sm transition-all touch-target cursor-pointer ${
                        tripType === tab.key
                          ? "bg-white text-saffron-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Cab
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                  >
                    {vehicles.map((v) => (
                      <option key={v._id || v.name} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Input Block */}
                <div>
                  {tripType === "local" ? (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Standard Inclusions
                      </label>
                      <div className="bg-saffron-50 border border-saffron-100 rounded-xl p-3 text-xs text-saffron-800 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          Fixed package includes 8 Hours and 80 Kilometers.
                          Excess kilometers will be charged dynamically per
                          kilometer.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Estimated Distance (in Km)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold text-xs">
                          KM
                        </span>
                        <input
                          type="number"
                          value={distance}
                          min={1}
                          onChange={(e) =>
                            setDistance(parseInt(e.target.value, 10) || 0)
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Days (for Round Trip) */}
              {tripType === "outstation-round" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Trip Duration (Days)
                  </label>
                  <select
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                  >
                    {DAYS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Calculated Fare Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <span className="block text-xs uppercase font-extrabold tracking-widest text-slate-400">
                    Estimated Total Fare
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-cinzel">
                    {formattedFare}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    *Excludes actual Tolls, Parking, and State Border permits
                  </span>
                </div>
                <button
                  onClick={handleBookAtPrice}
                  className="w-full sm:w-auto bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-saffron-500/10 transition-all flex items-center justify-center gap-2 touch-target cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Book At This Price
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
