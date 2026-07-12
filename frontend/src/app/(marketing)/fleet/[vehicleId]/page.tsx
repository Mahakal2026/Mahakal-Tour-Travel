import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users, Snowflake, CheckCircle2, MessageCircle } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { getVehicleProductSchema } from "@/lib/seo";
import { BookButtonWrapper } from "@/components/ui/ClientBookButtons";

interface PageProps {
  params: Promise<{ vehicleId: string }>;
}

async function getVehicle(id: string) {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
  try {
    const res = await fetch(`${url}/vehicles/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch (err) {
    console.error("Single vehicle fetch error:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = await getVehicle(vehicleId);
  if (!vehicle) {
    return {
      title: "Vehicle Not Found | Mahakal Tour and Travels",
    };
  }

  return {
    title: `${vehicle.name} (${vehicle.type.toUpperCase()}) Rental in Gwalior | Mahakal Tour and Travels`,
    description: `Rent ${vehicle.name} in Gwalior for local city sightseeing or outstation journeys (Ujjain, Orchha, Jhansi). Outstation rates starting at ₹${vehicle.pricePerKm}/km.`,
    openGraph: {
      title: `Book ${vehicle.name} in Gwalior | Mahakal Tour and Travels`,
      description: `Premium rental taxi starting from ₹${vehicle.pricePerKm}/km. Capacity: ${vehicle.capacity}.`,
      images: [{ url: vehicle.image || "/og-image.jpg" }],
    },
  };
}

export default async function VehicleDetailsPage({ params }: PageProps) {
  const { vehicleId } = await params;
  const vehicle = await getVehicle(vehicleId);

  if (!vehicle || !vehicle.isActive) {
    notFound();
  }

  const jsonLd = getVehicleProductSchema(vehicle);



  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mt-20 bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-gradient-to-br from-slate-100 to-slate-200/50 flex items-center justify-center p-8">
              {vehicle.image ? (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="max-h-64 md:max-h-96 object-contain p-4"
                />
              ) : (
                <div className="w-32 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
              <span className="text-saffron-600 font-extrabold uppercase tracking-widest text-xs mb-2 block">
                {vehicle.subtitle || `${vehicle.type.toUpperCase()} Taxi`}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-cinzel leading-tight">
                {vehicle.name}
              </h1>

              <div className="grid grid-cols-2 gap-4 mt-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-extrabold">
                    Capacity
                  </span>
                  <span className="font-bold text-slate-950 flex items-center gap-2 text-base">
                    <Users className="w-4 h-4 text-saffron-500" />
                    {vehicle.capacity}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] mb-1 uppercase tracking-wider font-extrabold">
                    A/C status
                  </span>
                  <span className="font-bold text-slate-950 flex items-center gap-2 text-base">
                    <Snowflake className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: "5s" }} />
                    {vehicle.acType}
                  </span>
                </div>
              </div>

              {/* Standard benefits list */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Experienced and verified commercial driver</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Cleaned & fully sanitized interiors</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>100% transparent billing & per-km pricing</span>
                </div>
              </div>

              {/* Outstation Pricing Tiers Table */}
              {vehicle.outstationTiers && vehicle.outstationTiers.length > 0 && (
                <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outstation Multi-Day Pricing</span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/50 text-slate-400 font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2">Days</th>
                        <th className="px-4 py-2">Min Km Required</th>
                        <th className="px-4 py-2 text-right">Price per Km</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicle.outstationTiers.map((tier: any, i: number) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/55 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-slate-800">{tier.days} Day{tier.days > 1 ? "s" : ""}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-600">{tier.minKm} Km</td>
                          <td className="px-4 py-2.5 text-right font-bold text-saffron-600">₹{tier.price}/km</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pricing section and CTA */}
              <div className="mt-8 border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-extrabold block mb-1">
                    Standard Rate
                  </span>
                  <span className="text-4xl font-extrabold text-slate-950 font-cinzel">
                    ₹{vehicle.pricePerKm} <span className="text-sm text-slate-500 font-normal">/ Km</span>
                  </span>
                  {vehicle.localPrice && (
                    <span className="block text-xs text-emerald-600 font-bold mt-1">
                      Local flat rate: ₹{vehicle.localPrice.toLocaleString("en-IN")} (8 Hrs / 80 Km)
                    </span>
                  )}
                </div>
                
                {/* Book Cab Now Client Action Wrapper */}
                <BookButtonWrapper vehicle={vehicle} />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
