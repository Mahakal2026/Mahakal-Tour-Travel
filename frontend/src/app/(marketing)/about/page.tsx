import React from "react";
import { Metadata } from "next";
import { ShieldCheck, Clock, Award, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - Mahakal Tour & Travels Gwalior",
  description: "Learn more about Mahakal Tour and Travels, Gwalior's premium taxi service. Specialized in outstation tours to Ujjain, Orchha, Jhansi and clean local cab rentals.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-8 sm:p-12 space-y-10">
          <div className="text-center border-b border-slate-100 pb-8">
            <span className="block text-xs font-bold uppercase tracking-widest text-saffron-600 mb-2">Our Story</span>
            <h1 className="text-4xl font-extrabold text-slate-900 font-cinzel leading-tight">About Mahakal Travels</h1>
            <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto font-medium">Gwalior's trusted partner for premium local sightseeing and secure outstation pilgrimage tours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 font-medium text-sm leading-relaxed">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-cinzel">Dedicated to Safety & Comfort</h2>
              <p>
                Mahakal Tour and Travels was founded on the principles of reliability, absolute transparency, and premium customer service. Specializing in outstation round-trips from Gwalior to Ujjain, Jhansi, Orchha, and Agra, we ensure your journeys are smooth, relaxing, and memorable.
              </p>
              <p>
                Every cab in our fleet undergoes strict maintenance and sterilization audits before departures. We believe in providing commercial cabs that feel premium and executives who carry licensed, background-verified credentials.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-cinzel">Spiritual Pilgrimage Specialists</h2>
              <p>
                As a Gwalior-based travel brand, we specialize in pilgrim coordination. Our namesake tour package - Ujjain Holy Mahakal Darshan - handles everything from state permits and tolls to direct Drops near the Mahakal corridor.
              </p>
              <p>
                We do not include hidden billing adjustments, surge price calculations, or dynamic driver fees. The pricing calculated on our fare calculator is exactly what we charge.
              </p>
            </div>
          </div>

          {/* Pillars of success */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-600 mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Verified Pilots</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Experienced drivers with background verifications and highway route experience.</p>
            </div>
            <div className="text-center space-y-2 border-y sm:border-y-0 sm:border-x border-slate-200 py-6 sm:py-0">
              <div className="w-10 h-10 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-600 mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">On-Time Guarantees</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Punctuality is a pledge. Cabs arrive 10 minutes prior to scheduled slots.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-600 mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Transparent Billing</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Zero surge rates. Easy-to-read invoices showing toll taxes, permits, and KM fares.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
