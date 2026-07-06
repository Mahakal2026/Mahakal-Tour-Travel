"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { POPULAR_ROUTES } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function PopularRoutes() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            subtitle="Most Booked Destinations"
            title="Popular Routes from Gwalior"
            description="Quick fare estimates for the most popular outstation routes. All prices are approximate for Sedan (Swift Dzire) one-way trips."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_ROUTES.map((route, index) => (
            <AnimatedSection key={`${route.from}-${route.to}`} delay={index * 0.08}>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:bg-white transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center group-hover:bg-saffron-600 group-hover:text-white transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    {route.from}
                    <ArrowRight className="w-4 h-4 text-saffron-500" />
                    {route.to}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                  <div>
                    <span className="block text-slate-400">Distance</span>
                    <span className="font-bold text-slate-900">{route.distance}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Est. Fare</span>
                    <span className="font-bold text-saffron-600">{route.estimatedFare}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Vehicle</span>
                    <span className="font-bold text-slate-900">{route.vehicleType}</span>
                  </div>
                </div>

                <a
                  href={buildWhatsAppUrl(
                    `Hello Mahakal Tour & Travels, I want to book a taxi from *${route.from}* to *${route.to}*. Please share availability and fare details.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 hover:bg-saffron-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 touch-target"
                >
                  Book This Route
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
