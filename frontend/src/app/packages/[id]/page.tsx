import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, CircleCheck, MapPin } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyWhatsAppCTA from "@/components/layout/StickyWhatsAppCTA";

async function getPackage(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/packages/${id}`, {
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
  const pkg = await getPackage(params.id);
  if (!pkg) {
    return {
      title: "Package Not Found | Mahakal Tour and Travels",
    };
  }

  return {
    title: `${pkg.title} | Mahakal Tour and Travels`,
    description: pkg.description,
    openGraph: {
      title: `${pkg.title} | Mahakal Tour and Travels`,
      description: pkg.description,
      images: [{ url: pkg.imageUrl || "/og-image.jpg" }],
    },
  };
}

export default async function PackageDetailsPage({ params }: { params: { id: string } }) {
  const pkg = await getPackage(params.id);

  if (!pkg || !pkg.isActive) {
    notFound();
  }

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    image: pkg.imageUrl || "https://mahakaltourandtravels.com/og-image.jpg",
    description: pkg.description,
    brand: {
      "@type": "Brand",
      name: "Mahakal Tour and Travels",
    },
    offers: {
      "@type": "Offer",
      url: `https://mahakaltourandtravels.com/packages/${pkg._id}`,
      priceCurrency: "INR",
      price: pkg.price.replace(/[^0-9]/g, "") || "0", // Extract numbers
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
                  src={pkg.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"}
                  alt={pkg.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 bg-saffron-600/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
                  <Clock className="w-4 h-4" />
                  {pkg.duration}
                </div>
              </div>

              {/* Content Section */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
                <span className="text-saffron-600 font-bold uppercase tracking-widest text-sm mb-2 block">
                  Exclusive Tour Package
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-cinzel leading-tight">
                  {pkg.title}
                </h1>
                
                <p className="text-slate-600 mt-6 text-lg leading-relaxed">
                  {pkg.description}
                </p>

                <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-saffron-600" /> Key Highlights
                  </h3>
                  <ul className="space-y-4">
                    {pkg.features?.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-700">
                        <CircleCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-sm text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                      {pkg.priceLabel || "Package Fare"}
                    </span>
                    <span className="text-4xl font-extrabold text-saffron-600">
                      {pkg.price}
                    </span>
                  </div>
                  <a
                    href={`https://wa.me/916269643919?text=Hello,%20I%20am%20interested%20in%20booking%20the%20*${pkg.title}*%20package%20(${pkg.price}).`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all text-center flex items-center justify-center gap-2"
                  >
                    Enquire Now
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
