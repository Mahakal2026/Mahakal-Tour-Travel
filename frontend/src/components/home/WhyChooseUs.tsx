"use client";

import { Clock, Shield, Sparkles, Receipt } from "lucide-react";
import { WHY_CHOOSE_US_FEATURES } from "@/lib/constants";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";

const iconMap: Record<string, React.ElementType> = {
  clock: Clock,
  shield: Shield,
  sparkles: Sparkles,
  receipt: Receipt,
};

export default function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            subtitle="Unmatched Safety & Comfort"
            title="Why Choose Mahakal Travels?"
            description="We are dedicated to providing the ultimate travel experience within Gwalior, Madhya Pradesh, and across India with a highly professional system."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {WHY_CHOOSE_US_FEATURES.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Sparkles;
            return (
              <AnimatedSection key={feature.title} delay={index * 0.1}>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-xl hover:bg-white transition-all group h-full">
                  <div className="w-12 h-12 rounded-xl bg-saffron-100 text-saffron-600 flex items-center justify-center mb-5 group-hover:bg-saffron-600 group-hover:text-white transition-all">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
