"use client";

import { Star } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Testimonial } from "@/lib/constants";

export default function Testimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader subtitle="Testimonials" title="What Our Customers Say" />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={testimonial.name} delay={index * 0.1}>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between h-full">
                <div>
                  {/* Stars */}
                  <div className="flex text-amber-500 gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    {testimonial.text}
                  </p>
                </div>
                <div className="flex items-center gap-3.5 mt-6 border-t border-slate-200/60 pt-4">
                  <div className="w-10 h-10 bg-saffron-100 rounded-full flex items-center justify-center font-bold text-saffron-700 text-sm">
                    {testimonial.initials}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{testimonial.name}</h5>
                    <span className="text-xs text-slate-400">{testimonial.location}</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
