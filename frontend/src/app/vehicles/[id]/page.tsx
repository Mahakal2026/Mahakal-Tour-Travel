import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users, Snowflake, CheckCircle2 } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyWhatsAppCTA from "@/components/layout/StickyWhatsAppCTA";

async function getVehicle(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/vehicles/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const vehicle = await getVehicle(params.id);
  if (!vehicle) {
    return {
      title: "Vehicle Not Found | Mahakal Tour and Travels",
    };
  }

  return {
    title: `Hire ${vehicle.name} in Gwalior | Mahakal Tour and Travels`,
    description: `Book ${vehicle.name} (${vehicle.capacity}) for local and outstation trips from Gwalior. Outstation rate: ₹${vehicle.pricePerKm}/Km. Clean, sanitized, and reliable cabs.`,
    openGraph: {
      title: `Hire ${vehicle.name} in Gwalior | Mahakal Tour and Travels`,
      description: `Book ${vehicle.name} for local and outstation trips from Gwalior. Starts at ₹${vehicle.pricePerKm}/Km.`,
      images: [{ url: vehicle.imageUrl || "/og-image.jpg" }],
    },
  };
}

export default async function VehicleDetailsPage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicle(params.id);

  if (!vehicle || !vehicle.isActive) {
    notFound();
  }

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.name,
    image: vehicle.imageUrl || "https://mahakaltourandtravels.com/og-image.jpg",
    description: `Hire ${vehicle.name} in Gwalior. Capacity: ${vehicle.capacity}. A/C: ${vehicle.acType}.`,
    brand: {
      "@type": "Brand",
      name: "Mahakal Tour and Travels",
    },
    offers: {
      "@type": "Offer",
      url: `https://mahakaltourandtravels.com/vehicles/${vehicle._id}`,
      priceCurrency: "INR",
      price: vehicle.pricePerKm.toString(),
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: vehicle.pricePerKm,
        priceCurrency: "INR",
        unitText: "KMT" // Kilometer
      },
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-slate-900">
                <img
                  src={vehicle.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"}
                  alt={vehicle.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {vehicle.badge && (
                  <div className={`absolute top-6 left-6 ${vehicle.badgeColor || 'bg-saffron-600'} text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg uppercase tracking-wider`}>
                    {vehicle.badge}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                <span className="text-saffron-600 font-bold uppercase tracking-widest text-sm mb-2 block">
                  {vehicle.subtitle || "Premium Taxi"}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-cinzel leading-tight">
                  {vehicle.name}
                </h1>

                <div className="grid grid-cols-2 gap-4 mt-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="block text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">
                      Capacity
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5 text-saffron-500" />
                      {vehicle.capacity}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-sm mb-1 uppercase tracking-wider font-semibold">
                      A/C status
                    </span>
                    <span className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <Snowflake className="w-5 h-5 text-sky-500 animate-spin" style={{ animationDuration: "4s" }} />
                      {vehicle.acType || "Available"}
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Experienced and verified driver</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Clean & sanitized interiors</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Transparent per-kilometer billing</span>
                  </div>
                </div>

                <div className="mt-auto pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                      Outstation Rate
                    </span>
                    <span className="text-4xl font-extrabold text-slate-900">
                      ₹{vehicle.pricePerKm} <span className="text-lg text-slate-500 font-medium">/ Km</span>
                    </span>
                    {vehicle.localPrice && (
                      <span className="block text-sm text-emerald-600 font-bold mt-1">
                        Local: ₹{vehicle.localPrice} (8 Hrs / 80 Km)
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://wa.me/916269643919?text=Hello,%20I%20am%20interested%20in%20booking%20the%20*${vehicle.name}*%20for%20my%20trip.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all text-center flex items-center justify-center gap-2"
                  >
                    Book Cab Now
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
      <StickyWhatsAppCTA />
    </div>
  );
}
