"use client";

import { Landmark, ArrowRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";

const TEMPLES = [
  {
    name: "Mahakaleshwar Temple",
    location: "Ujjain",
    description:
      "One of the 12 Jyotirlingas, the sacred Mahakaleshwar Temple is the most revered Shiva temple in India. Experience the divine Bhasma Aarti.",
    image:
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Gwalior Fort",
    location: "Gwalior",
    description:
      "The impregnable hill fortress known as the 'Pearl amongst fortresses in India'. Houses the Man Mandir Palace, Gujari Mahal, and Sas-Bahu temples.",
    image:
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Jai Vilas Palace",
    location: "Gwalior",
    description:
      "A stunning European-style palace built by Jayajirao Scindia. Home to the world's largest pair of chandeliers and the Scindia Museum.",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Orchha Temples",
    location: "Orchha",
    description:
      "Ancient Bundela dynasty temples along the serene Betwa River. Visit Ram Raja Temple, Chaturbhuj Temple, and the royal cenotaphs.",
    image:
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=600&q=80",
  },
];

export default function TempleShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            subtitle="Sacred & Historical Destinations"
            title="Must-Visit Temples & Monuments"
            description="Explore the spiritual and historical gems of Madhya Pradesh with comfortable taxi service from Mahakal Travels."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEMPLES.map((temple, index) => (
            <AnimatedSection key={temple.name} delay={index * 0.1}>
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-2xl transition-all group h-full flex flex-col">
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={temple.image}
                    alt={temple.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-saffron-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <Landmark className="w-3 h-3 inline mr-1" />
                    {temple.location}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {temple.name}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-grow">
                    {temple.description}
                  </p>
                  <a
                    href={buildWhatsAppUrl(
                      `Hello Mahakal Tour & Travels, I want to plan a visit to *${temple.name}, ${temple.location}*. Please help with taxi booking.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-saffron-600 hover:text-saffron-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    Plan Visit
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
