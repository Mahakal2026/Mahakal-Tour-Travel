"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Calendar, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Package } from "@/types";
import { buildAndSendBooking } from "@/lib/whatsapp";

interface PackageBookModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PackageBookModal({ pkg, isOpen, onClose }: PackageBookModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [travelNotes, setTravelNotes] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !pkg) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setApiError("Please provide your name and 10-digit mobile number.");
      return;
    }

    const cleanDigits = customerPhone.replace(/[^\d]/g, "").slice(-10);
    if (cleanDigits.length < 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
      setApiError("Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).");
      return;
    }

    startTransition(async () => {
      setApiError(null);
      const vehicleObj = {
        _id: pkg._id,
        name: pkg.vehicleName || "Sedan / Cab",
        type: "sedan" as const,
        capacity: "4+1",
        acType: "AC" as const,
        pricePerKm: 12,
        image: pkg.image || "",
        isActive: true,
      };

      const result = await buildAndSendBooking({
        vehicle: vehicleObj,
        tripType: "package-inquiry",
        packageId: pkg._id,
        packageName: `${pkg.name}${travelNotes ? ` (Notes: ${travelNotes})` : ""}`,
        price: pkg.price || 0,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
      });

      if (!result.success) {
        setApiError(result.error || "Could not verify inquiry. Please check details and try again.");
      } else {
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-saffron-600 to-amber-500 p-6 text-white relative flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-100 block">
              Mahakal Tour & Travels
            </span>
            <h3 className="text-xl font-bold font-cinzel mt-1 line-clamp-1">{pkg.name}</h3>
            <p className="text-orange-50/80 text-xs mt-1">
              Duration: {pkg.duration} | {pkg.pricingType === "km" ? "Custom Distance Rate" : `Estimated Cost: ₹${pkg.price.toLocaleString("en-IN")}`}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {apiError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={100}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Mobile Number (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your 10-digit Indian mobile number for instant WhatsApp confirmation.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Travel Date / Special Requirements (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={travelNotes}
                  onChange={(e) => setTravelNotes(e.target.value)}
                  placeholder="e.g. Next weekend, 4 passengers, need pickup from Railway Station"
                  maxLength={200}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="bg-whatsapp-green hover:bg-whatsapp-green-hover disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-whatsapp-green/30 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FaWhatsapp className="w-4.5 h-4.5" />
                    Confirm & Open WhatsApp
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
