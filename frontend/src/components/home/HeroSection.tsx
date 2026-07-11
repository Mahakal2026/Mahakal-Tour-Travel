"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import QuickBookingForm from "./QuickBookingForm";

const POPULAR_ROUTES = [
  { label: "Indore to Ujjain", link: "/#calculator" },
  { label: "Ujjain to Omkareshwar", link: "/#calculator" },
  { label: "Airport to Mahakal", link: "/#calculator" },
  { label: "Indore to Bhopal", link: "/#calculator" },
  { label: "Ujjain to Pachmarhi", link: "/#calculator" },
];

export default function HeroSection({ vehicles = [] }: { vehicles?: any[] }) {
  return (
    <header
      id="home"
      className="relative min-h-screen flex flex-col justify-between pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-950"
    >
      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/hero.png')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/15 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-8">
        {/* Left Side: Text and Badges */}
        <motion.div
          className="lg:col-span-7 space-y-6 text-left"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-white font-medium px-4 py-1.5 rounded-full text-xs uppercase tracking-wider backdrop-blur-sm select-none">
            <span className="text-saffron-500">★</span> Trusted Taxi Service in Madhya Pradesh
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Travel Smarter, Ride Better with{" "}
            <span className="block text-saffron-500 mt-1">
              Mahakal Tours.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-xl font-light leading-relaxed">
            Affordable taxi booking for Local, Outstation, Airport Transfers and Ujjain Mahakal trips. Experience premium comfort at the most competitive rates.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/#calculator"
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-saffron-600/20 hover:shadow-saffron-600/40 transition-all duration-300 transform hover:-translate-y-0.5 touch-target flex items-center gap-2 cursor-pointer"
            >
              Book Ride <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/#packages"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold px-8 py-3.5 rounded-xl transition-all duration-300 touch-target cursor-pointer"
            >
              View Packages
            </Link>
          </div>

          {/* Grid of Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 max-w-2xl">
            {[
              { val: "24/7", lbl: "Service" },
              { val: "₹9/km", lbl: "Starting" },
              { val: "100%", lbl: "Verified" },
              { val: "5000+", lbl: "Customers" },
            ].map((badge) => (
              <div
                key={badge.lbl}
                className="bg-white/5 border border-white/10 backdrop-blur-sm p-4 rounded-2xl text-center flex flex-col justify-center transition-all duration-300 hover:bg-white/10"
              >
                <p className="text-xl sm:text-2xl font-extrabold text-saffron-400 font-sans">
                  {badge.val}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-semibold">
                  {badge.lbl}
                </p>
              </div>
            ))}
          </div>

          {/* Google Review Badge */}
          <div className="flex items-center gap-3 mt-4">
            <div className="bg-saffron-500 text-white font-bold text-sm h-10 w-10 flex items-center justify-center rounded-full shadow-lg shadow-saffron-500/30">
              4.7
            </div>
            <div className="space-y-0.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-saffron-400 text-saffron-400" />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Google Rating 4.7 (1.2k Reviews)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <QuickBookingForm vehicles={vehicles} />
        </motion.div>
      </div>

      {/* Popular Routes Section */}
      <div className="max-w-7xl w-full mx-auto relative z-10 border-t border-white/10 pt-6 mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
          Popular Routes:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {POPULAR_ROUTES.map((route) => (
            <Link
              key={route.label}
              href={route.link}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs py-1.5 px-4 rounded-full transition-all duration-300 cursor-pointer"
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
