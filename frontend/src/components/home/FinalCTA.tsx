"use client";

import { PhoneCall, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { buildWhatsAppUrl, buildGenericGreeting } from "@/lib/whatsapp";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function FinalCTA() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-slate-850 to-saffron-950 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(249,115,22,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <AnimatedSection>
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-cinzel">
            Planning an Emergency or Immediate Outstation Ride?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Get a verified, sanitized cab booked in under 10 minutes. Our
            dispatch service works 24/7 without holidays.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a
              href={`tel:${BUSINESS.phone}`}
              className="w-full sm:w-auto bg-saffron-600 hover:bg-saffron-700 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-saffron-600/30 transition-all flex items-center justify-center gap-2 text-lg touch-target"
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              Call {BUSINESS.phoneFormatted}
            </a>
            <a
              href={buildWhatsAppUrl(buildGenericGreeting())}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-lg touch-target"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
