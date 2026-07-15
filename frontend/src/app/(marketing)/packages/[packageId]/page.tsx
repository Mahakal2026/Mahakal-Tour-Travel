export const revalidate = 60;

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock, CircleCheck, MapPin, MessageCircle } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { getTouristTripSchema } from "@/lib/seo";
import { BookPackageButtonWrapper } from "@/components/ui/ClientBookButtons";

interface PageProps {
  params: Promise<{ packageId: string }>;
}

async function getPackage(id: string) {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
  try {
    const res = await fetch(`${url}/packages/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch (err: any) {
    if (err.digest === "DYNAMIC_SERVER_USAGE" || err.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.error("Single package fetch error:", err.message || err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { packageId } = await params;
  const pkg = await getPackage(packageId);
  if (!pkg) {
    return {
      title: "Package Not Found | Mahakal Tour and Travels",
    };
  }

  return {
    title: `${pkg.name} - Tour Package in Gwalior | Mahakal Tour and Travels`,
    description: pkg.description.substring(0, 155),
    openGraph: {
      title: `${pkg.name} | Mahakal Tour and Travels`,
      description: pkg.description.substring(0, 155),
      images: [{ url: pkg.image || "/og-image.jpg" }],
    },
  };
}

export default async function PackageDetailsPage({ params }: PageProps) {
  const { packageId } = await params;
  const pkg = await getPackage(packageId);

  if (!pkg) {
    notFound();
  }

  let displayLabel = "";
  let priceStr = "";

  if (pkg.pricingType === "km") {
    displayLabel = "Package Fare Starts";
    priceStr = pkg.price > 0 ? `₹${pkg.price}/Km` : "Based on Km";
  } else if (pkg.pricingType === "oneway") {
    displayLabel = `${pkg.vehicleName || "Sedan"} One-Way`;
    priceStr = `₹${pkg.price.toLocaleString("en-IN")}`;
  } else {
    displayLabel = `${pkg.vehicleName || "Sedan"} Car Price`;
    priceStr = `₹${pkg.price.toLocaleString("en-IN")}`;
  }

  const jsonLd = getTouristTripSchema(pkg);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mt-20 bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl  mx-auto">
        <AnimatedSection>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 h-64 sm:h-80 md:h-[420px] lg:h-[500px] overflow-hidden rounded-2xl bg-white flex items-center justify-center p-4">
              {pkg.image ? (
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-semibold">
                  No Image Available
                </div>
              )}

              <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-saffron-600/90 backdrop-blur-md text-white px-3 py-2 md:px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                <Clock className="w-4 h-4" />
                {pkg.duration}
              </div>
            </div>
            {/* Content Section */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
              <span className="text-saffron-600 font-extrabold uppercase tracking-widest text-xs mb-2 block">
                Exclusive Tour Package
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-cinzel leading-tight">
                {pkg.name}
              </h1>

              <p className="text-slate-600 mt-6 text-sm leading-relaxed font-medium">{pkg.description}</p>

              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <MapPin className="w-4 h-4 text-saffron-600" /> Package Inclusions
                  </h3>
                  <ul className="space-y-3.5">
                    {pkg.inclusions.map((inclusion: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700 text-xs font-semibold">
                        <CircleCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-10 flex flex-col sm:flex-row md:flex-col lg:flex-row items-center justify-between md:items-start lg:items-center gap-6">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-extrabold block mb-1">
                    {displayLabel}
                  </span>
                  <span
                    className={`font-extrabold text-saffron-600 font-cinzel ${
                      priceStr.includes("Based")
                        ? "text-xl sm:text-2xl"
                        : pkg.pricingType === "km" && pkg.price === 12
                        ? "text-3xl"
                        : "text-3xl sm:text-4xl"
                    }`}
                  >
                    {priceStr}
                  </span>
                </div>

                <BookPackageButtonWrapper pkg={pkg} />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
