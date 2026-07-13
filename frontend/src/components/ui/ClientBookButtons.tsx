"use client";

import React, { useTransition, useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { X, Compass, Navigation, ChevronLeft, Calendar, Info, Loader2, User, Phone, ArrowRight } from "lucide-react";
import { buildAndSendBooking, sendBookingInquiry } from "@/lib/whatsapp";
import { apiClient } from "@/lib/api";
import { getMinKm } from "@/lib/fareFormula";
import { motion, AnimatePresence } from "framer-motion";

interface BookButtonWrapperProps {
  vehicle: any;
  className?: string;
  label?: string;
}

export function BookButtonWrapper({ vehicle, className, label }: BookButtonWrapperProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1 = Selection, 2 = Details form
  const [tripType, setTripType] = useState<"local" | "outstation-round">("local");

  // Outstation/local inputs
  const [km, setKm] = useState<number>(250);
  const [days, setDays] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  // Fare calculations
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-sync KM field when days changes (same as FareCalculator)
  useEffect(() => {
    if (tripType === "outstation-round") {
      setKm(getMinKm(days));
    }
  }, [days, tripType]);

  // Dynamic Fare Calculation Effect
  useEffect(() => {
    if (!isOpen || !vehicle?._id) return;

    if (tripType === "local") {
      setEstimatedPrice(vehicle.localPrice || 0);
      setBreakdown(null);
      setApiError(null);
      return;
    }

    if (tripType === "outstation-round") {
      if (!km || km <= 0 || !days || days <= 0) {
        setEstimatedPrice(null);
        setBreakdown(null);
        return;
      }
    }

    const controller = new AbortController();

    const calculateFare = async () => {
      setIsCalculating(true);
      setApiError(null);
      try {
        const payload: any = {
          vehicleId: vehicle._id,
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
          setEstimatedPrice(res.data.data.price);
          setBreakdown(res.data.data.breakdown || null);
        } else {
          setEstimatedPrice(res.data.price);
          setBreakdown(res.data.breakdown || null);
        }
      } catch (err: any) {
        if (err.name === "CanceledError" || err.message === "canceled" || controller.signal.aborted) {
          return;
        }
        console.error("Modal live calculation error:", err);
        setApiError("Unable to calculate fare.");
        setEstimatedPrice(null);
        setBreakdown(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsCalculating(false);
        }
      }
    };

    const delayTimer = setTimeout(() => {
      calculateFare();
    }, 300);

    return () => {
      clearTimeout(delayTimer);
      controller.abort();
    };
  }, [isOpen, tripType, km, days, vehicle?._id, vehicle?.localPrice]);

  const handleOpen = () => {
    setIsOpen(true);
    setStep(1);
    setTripType("local");
    setKm(250);
    setDays(1);
    setApiError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const selectTripType = (type: "local" | "outstation-round") => {
    setTripType(type);
    setStep(2);
  };

  const handleBook = () => {
    if (estimatedPrice === null) return;

    startTransition(async () => {
      await buildAndSendBooking({
        vehicle,
        tripType,
        km: tripType !== "local" ? km : undefined,
        days: tripType === "outstation-round" ? days : undefined,
        price: estimatedPrice,
        breakdown: breakdown || undefined,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      handleClose();
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={className || "w-full sm:w-auto bg-slate-950 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider whitespace-nowrap"}
      >
        <FaWhatsapp className="w-4 h-4 flex-shrink-0" />
        <span>{label || "Book Cab Now"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 z-10 flex flex-col max-h-[90vh]"
            >
              {/* Saffron Gradient Header */}
              <div className="bg-gradient-to-r from-saffron-600 to-amber-500 p-6 text-white relative flex-shrink-0">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
                  aria-label="Close booking modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-100 block">
                  Mahakal Tour & Travels
                </span>
                <h3 className="text-xl font-bold font-cinzel mt-1">Book {vehicle.name}</h3>
                <p className="text-orange-50/80 text-xs mt-1">Select your ride preferences to continue</p>
              </div>

              {/* Scrollable Form Area */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {step === 1 ? (
                  /* Step 1: Select Trip Type */
                  <div className="space-y-4">
                    <h4 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                      Choose Journey Type
                    </h4>
                    
                    {/* Local Sightseeing Selection Card */}
                    <button
                      onClick={() => selectTripType("local")}
                      className="group w-full p-5 text-left bg-slate-50 hover:bg-saffron-50/40 border-2 border-slate-100 hover:border-saffron-400 rounded-2xl transition-all duration-300 flex items-start gap-4 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="p-3.5 bg-white group-hover:bg-saffron-100 rounded-xl text-saffron-600 transition-colors shadow-sm">
                        <Compass className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h5 className="font-extrabold text-slate-800 group-hover:text-saffron-950">
                            Local Sightseeing
                          </h5>
                          {vehicle.localPrice && (
                            <span className="font-extrabold text-saffron-600 text-sm font-cinzel whitespace-nowrap">
                              ₹{vehicle.localPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Fixed 8 Hours / 80 Kilometers package. Best for city travel and local visits.
                        </p>
                      </div>
                    </button>

                    {/* Outstation Selection Card */}
                    <button
                      onClick={() => selectTripType("outstation-round")}
                      className="group w-full p-5 text-left bg-slate-50 hover:bg-saffron-50/40 border-2 border-slate-100 hover:border-saffron-400 rounded-2xl transition-all duration-300 flex items-start gap-4 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <div className="p-3.5 bg-white group-hover:bg-saffron-100 rounded-xl text-saffron-600 transition-colors shadow-sm">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h5 className="font-extrabold text-slate-800 group-hover:text-saffron-950">
                            Outstation Trip
                          </h5>
                          <span className="font-extrabold text-saffron-600 text-sm font-cinzel whitespace-nowrap">
                            ₹{vehicle.pricePerKm}/Km
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Multi-day round trip journey. Standard minimum billing of 250 Km/day applies.
                        </p>
                      </div>
                    </button>
                  </div>
                ) : (
                  /* Step 2: Configure Details & Contact Info */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-saffron-600 text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {tripType === "local" ? "Local" : "Outstation"} Package
                      </span>
                    </div>

                    {/* Dynamic Configuration Fields */}
                    {tripType === "outstation-round" && (
                      <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h5 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                          Outstation Journey Configuration
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Duration (Days) Stepper */}
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                              Duration (Days)
                            </label>
                            <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden">
                              <button
                                type="button"
                                onClick={() => {
                                  const newDays = Math.max(1, days - 1);
                                  setDays(newDays);
                                  setKm(getMinKm(newDays));
                                }}
                                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-r border-slate-200 cursor-pointer transition-colors"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={days}
                                onChange={(e) => {
                                  const newDays = Math.max(1, parseInt(e.target.value) || 1);
                                  setDays(newDays);
                                  setKm(getMinKm(newDays));
                                }}
                                className="w-full text-center py-2 focus:outline-none font-bold text-sm bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newDays = days + 1;
                                  setDays(newDays);
                                  setKm(getMinKm(newDays));
                                }}
                                className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border-l border-slate-200 cursor-pointer transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Distance (KM) Input */}
                          <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                              Est. Distance (Km)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-extrabold text-xs">
                                KM
                              </span>
                              <input
                                type="number"
                                min={1}
                                value={km}
                                onChange={(e) => setKm(Math.max(1, parseInt(e.target.value) || 0))}
                                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 text-sm font-semibold"
                              />
                            </div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 italic">
                          * Minimum daily billing limit of {getMinKm(1)} Km applies ({getMinKm(days)} Km total).
                        </p>
                      </div>
                    )}

                    {/* Customer Personal Details */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                        Enter Contact Information
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <User className="w-4 h-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="Your Full Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                          />
                        </div>

                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                            <Phone className="w-4 h-4" />
                          </span>
                          <input
                            type="tel"
                            placeholder="WhatsApp Number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Estimation Results Panel */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
                          Estimated Fare
                        </span>
                        {isCalculating ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="w-4 h-4 text-saffron-600 animate-spin" />
                            <span className="text-xs font-semibold text-slate-500">Calculating...</span>
                          </div>
                        ) : apiError ? (
                          <span className="text-xs font-bold text-red-500">{apiError}</span>
                        ) : estimatedPrice !== null ? (
                          <span className="text-2xl font-extrabold text-slate-900 font-cinzel">
                            ₹{estimatedPrice.toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </div>

                      {/* Fare Breakdown Details */}
                      {!isCalculating && estimatedPrice !== null && (
                        <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-200/60 pt-3">
                          {tripType === "local" ? (
                            <div className="flex items-start gap-1.5">
                              <Info className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0 mt-0.5" />
                              <span>Local sightseeing includes 8 Hrs and 80 Kms. Tolls & parking excluded.</span>
                            </div>
                          ) : (
                            <div className="space-y-1 font-medium">
                              <div>• Billable Distance: <span className="font-bold text-slate-800">{Math.max(km, days * 250)} Km</span></div>
                              {breakdown?.basePrice && (
                                <div>• Base fare for {days * 250} Km: <span className="font-bold text-slate-800">₹{breakdown.basePrice.toLocaleString("en-IN")}</span></div>
                              )}
                              {breakdown?.excessKmCharge > 0 && (
                                <div>• Excess Km charge ({km - days * 250} Km): <span className="font-bold text-slate-800">+ ₹{breakdown.excessKmCharge.toLocaleString("en-IN")}</span></div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Book CTA Button */}
                    <button
                      onClick={handleBook}
                      disabled={isPending || isCalculating || estimatedPrice === null}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <FaWhatsapp className="w-4 h-4" />
                          <span>Book via WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface BookPackageButtonWrapperProps {
  pkg: any;
}

export function BookPackageButtonWrapper({ pkg }: BookPackageButtonWrapperProps) {
  const [isPending, startTransition] = useTransition();

  const handleBook = () => {
    startTransition(async () => {
      let formattedMessage = "";
      let rateText = "";

      if (pkg.pricingType === "km") {
        rateText = pkg.price > 0 ? `₹${pkg.price}/Km` : "Based on Km";
        formattedMessage = `Hello Mahakal Tour & Travels, I would like to get a custom quote for the package.\n\n` +
          `*Package Details:*\n` +
          `• *Package Name:* ${pkg.name}\n` +
          `• *Duration:* ${pkg.duration}\n` +
          `• *Estimated Rate:* ${rateText}\n\n` +
          `Please confirm availability and share details. Thank you!`;
      } else {
        rateText = `₹${pkg.price.toLocaleString("en-IN")}`;
        formattedMessage = `Hello Mahakal Tour & Travels, I would like to book a cab package.\n\n` +
          `*Package Details:*\n` +
          `• *Package Name:* ${pkg.name}\n` +
          `• *Duration:* ${pkg.duration}\n` +
          `• *Price:* ${rateText}\n\n` +
          `Please confirm availability. Thank you!`;
      }

      await sendBookingInquiry({
        name: "Valued Customer",
        vehicle: "sedan", // default
        tripType: "package-inquiry",
        routeOrPackage: `${pkg.name} (${pkg.duration})`,
        estimatedFare: pkg.pricingType === "km" ? undefined : pkg.price,
        messageText: formattedMessage,
      });
    });
  };

  return (
    <button
      onClick={handleBook}
      disabled={isPending}
      className="w-full sm:w-auto bg-slate-950 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider whitespace-nowrap"
    >
      <FaWhatsapp className="w-4 h-4 flex-shrink-0" />
      <span>{isPending ? "Connecting..." : pkg.pricingType === "km" ? "Get Custom Quote" : "Book Package"}</span>
    </button>
  );
}
