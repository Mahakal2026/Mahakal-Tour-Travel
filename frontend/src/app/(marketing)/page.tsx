import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FareCalculator from "@/components/sections/FareCalculator";
import FleetPreview from "@/components/home/FleetPreview";
import PackageShowcase from "@/components/home/PackageShowcase";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import ContactSection from "@/components/home/ContactSection";

async function getHomeData() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  try {
    const [vehiclesRes, packagesRes, reviewsRes] = await Promise.all([
      fetch(`${url}/vehicles`, { next: { revalidate: 60 } }).then((res) => res.json()),
      fetch(`${url}/packages`, { next: { revalidate: 60 } }).then((res) => res.json()),
      fetch(`${url}/reviews`, { next: { revalidate: 60 } }).then((res) => res.json()),
    ]);

    return {
      vehicles: vehiclesRes?.data || (Array.isArray(vehiclesRes) ? vehiclesRes : []),
      packages: packagesRes?.data || (Array.isArray(packagesRes) ? packagesRes : []),
      reviews: reviewsRes?.data || (Array.isArray(reviewsRes) ? reviewsRes : []),
    };
  } catch (err) {
    console.error("Home page Server Component fetch error:", err);
    return { vehicles: [], packages: [], reviews: [] };
  }
}

export default async function Home() {
  const { vehicles, packages, reviews } = await getHomeData();

  // Filters for active items
  const activeVehicles = vehicles.filter((v: any) => v.isActive);
  const activePackages = packages.filter((p: any) => p.isActive);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection vehicles={activeVehicles} />
      <WhyChooseUs />
      <FareCalculator vehicles={activeVehicles} />
      <FleetPreview vehicles={activeVehicles} />
      <PackageShowcase packages={activePackages} />
      <FinalCTA />
      <Testimonials testimonials={reviews} />
      <ContactSection />
      <FAQ />
    </div>
  );
}
