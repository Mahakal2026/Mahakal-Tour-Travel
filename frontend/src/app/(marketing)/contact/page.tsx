"use client";

import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import { BUSINESS } from "@/lib/constants";
import { buildAndSendBooking } from "@/lib/whatsapp";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setSubmitting(true);
    try {
      await buildAndSendBooking({
        vehicle: "General Contact",
        tripType: "general-contact" as any, // maps to booking validator
        price: 0,
        packageName: `Inquiry from website: ${message}`,
        customerName: name,
        customerPhone: phone,
      });
      // Clear inputs
      setName("");
      setPhone("");
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* Info Side */}
          <div className="bg-slate-950 text-slate-300 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-widest text-saffron-500 mb-2">Connect With Us</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-cinzel leading-tight">Get in Touch</h1>
              <p className="text-slate-500 text-xs mt-3 leading-relaxed font-semibold">Have custom routes or large corporate booking inquiries? Send a message or call directly.</p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-saffron-500 flex-shrink-0">
                    <FaPhoneAlt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Call 24/7 Assistance</span>
                    <a href={`tel:${BUSINESS.phone}`} className="text-white hover:text-saffron-500 font-bold transition-colors">
                      {BUSINESS.phoneFormatted}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-saffron-500 flex-shrink-0">
                    <FaEnvelope className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Email Address</span>
                    <span className="text-white font-bold">{BUSINESS.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-saffron-500 flex-shrink-0">
                    <FaMapMarkerAlt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Head Office Address</span>
                    <span className="text-white font-bold leading-relaxed">{BUSINESS.address.full}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-6 mt-10 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
              {BUSINESS.copyright}
            </div>
          </div>

          {/* Form Side */}
          <div className="p-8 sm:p-12">
            <h2 className="text-xl font-bold text-slate-950 font-cinzel mb-2">Send an Instant Message</h2>
            <p className="text-xs text-slate-500 mb-6 font-semibold">Fill out the fields to sync details and initiate a WhatsApp conversation.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sanjay Singh"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Message / Inquiry Details</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your trip details, days, group size..."
                  className="w-full res px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:bg-white text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-whatsapp-green hover:bg-whatsapp-green-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
              >
                <FaWhatsapp className="w-4.5 h-4.5" />
                {submitting ? "Initiating Chat..." : "Chat on WhatsApp"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
