"use client";

import Link from "next/link";
import { Clock, CircleCheck } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function PackageShowcase({ packages = [] }: { packages?: any[] }) {
  // Only show active packages
  const displayPackages = packages.filter(p => p.isActive);

  if (displayPackages.length === 0) return null;

  return (
    <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <SectionHeader
            subtitle="Tailor-Made Itineraries"
            title="Exclusive Mahakal Tour Packages"
            description="Handpicked routes crafted for beautiful local historical explorations and spiritual experiences with convenient point-to-point drop facility."
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPackages.map((pkg, index) => (
            <AnimatedSection key={pkg._id || pkg.title} delay={index * 0.1}>
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-2xl transition-all flex flex-col h-full">
                {/* Image */}
                <div className="relative h-56 bg-slate-900">
                  <img
                    src={pkg.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80"}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-saffron-400" />
                    {pkg.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900">
                    {pkg.title}
                  </h3>
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                    {pkg.description}
                  </p>

                  <ul className="my-5 space-y-2.5 text-xs text-slate-600">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CircleCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto border-t border-slate-100 pt-5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">
                        {pkg.priceLabel}
                      </span>
                      <span className="text-2xl font-extrabold text-saffron-600">
                        {pkg.price}
                      </span>
                    </div>
                    <Link
                      href={`/packages/${pkg._id}`}
                      className="bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all touch-target text-center"
                    >
                      View Details
                    </Link>
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
