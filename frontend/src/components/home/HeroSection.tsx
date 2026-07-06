"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import QuickBookingForm from "./QuickBookingForm";

export default function HeroSection({ vehicles = [] }: { vehicles?: any[] }) {
  return (
    <header
      id="home"
      className="relative min-h-[90vh] flex items-center py-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Background with gradient overlay */}
      <div
        className="absolute inset-0 hero-gradient"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 to-black/85" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Text Intro Block */}
        <motion.div
          className="lg:col-span-7 text-white space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 bg-saffron-600/30 border border-saffron-500/50 text-saffron-300 font-semibold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Best Taxi Service in Gwalior & Madhya Pradesh
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Your Trustworthy Travel Partner{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 to-amber-400">
              Mahakal Tours
            </span>
          </h1>

          <p className="text-lg text-slate-200 max-w-2xl font-light">
            Explore local architectural marvels like Gwalior Fort, take
            outstation spiritual trips to Ujjain Mahakal, or book affordable
            outstation tours with clean cars and licensed professional drivers.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/#calculator"
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all transform hover:-translate-y-0.5 touch-target"
            >
              Calculate Ride Fare
            </Link>
            <Link
              href="/#packages"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 touch-target"
            >
              Explore Packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg">
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold text-saffron-400 font-cinzel">
                24/7
              </p>
              <p className="text-xs text-slate-300 uppercase tracking-widest mt-1">
                Availability
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold text-saffron-400 font-cinzel">
                ₹9/km
              </p>
              <p className="text-xs text-slate-300 uppercase tracking-widest mt-1">
                Starting Price
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-extrabold text-saffron-400 font-cinzel">
                100%
              </p>
              <p className="text-xs text-slate-300 uppercase tracking-widest mt-1">
                Clean & Safe Cabs
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Booking Widget */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <QuickBookingForm vehicles={vehicles} />
        </motion.div>
      </div>
    </header>
  );
}
