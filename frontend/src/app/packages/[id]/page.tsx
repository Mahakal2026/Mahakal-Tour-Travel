import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, CircleCheck, MapPin, MessageCircle } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { PACKAGES } from "@/lib/constants";
import { buildPackageInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pkg = PACKAGES.find((p) => p._id === id);
  if (!pkg) {
    return {
      title: "Package Not Found | Mahakal Tour and Travels",
    };
  }

  return {
    title: `${pkg.name} | Mahakal Tour and Travels`,
    description: pkg.description,
    openGraph: {
      title: `${pkg.name} | Mahakal Tour and Travels`,
      description: pkg.description,
      images: [{ url: pkg.imageUrl || "/og-image.jpg" }],
    },
  };
}

export async function generateStaticParams() {
  return PACKAGES.map((pkg) => ({
    id: pkg._id,
  }));
}

export default async function PackageDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const pkg = PACKAGES.find((p) => p._id === id);

  if (!pkg || !pkg.isActive) {
    notFound();
  }

  const priceStr = pkg.price ? `₹${pkg.price.toLocaleString("en-IN")}` : pkg.priceText || "Custom Quote";

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.name,
    image: `https://mahakaltourandtravels.com${pkg.imageUrl || "/og-image.jpg"}`,
    description: pkg.description,
    brand: {
      "@type": "Brand",
      name: "Mahakal Tour and Travels",
    },
    offers: {
      "@type": "Offer",
      url: `https://mahakaltourandtravels.com/packages/${pkg._id}`,
      priceCurrency: "INR",
      price: pkg.price?.toString() || "0",
      availability: "https://schema.org/InStock",
    },
  };

  const whatsappMessage = buildPackageInquiryMessage(`${pkg.name} (${priceStr})`);
  const waUrl = buildWhatsAppUrl(whatsappMessage);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-slate-900">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{
                  backgroundImage: `url('${pkg.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80"}')`,
                }}
              />
              <div className="absolute top-6 left-6 bg-saffron-600/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg z-10">
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
                {pkg.name}
              </h1>

              <p className="text-slate-600 mt-6 text-lg leading-relaxed">{pkg.description}</p>

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
                    {pkg.price ? pkg.priceText || "Package Price" : "Quote Policy"}
                  </span>
                  <span className="text-4xl font-extrabold text-saffron-600">{priceStr}</span>
                </div>
                <Link
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all text-center flex items-center justify-center gap-2 touch-target"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enquire Now
                </Link>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
