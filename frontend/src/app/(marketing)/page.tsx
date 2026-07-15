export const revalidate = 60;

import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FareCalculator from "@/components/sections/FareCalculator";
import FleetPreview from "@/components/home/FleetPreview";
import PackageShowcase from "@/components/home/PackageShowcase";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

async function getHomeData() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
  try {
    const [vehiclesRes, packagesRes, reviewsRes] = await Promise.all([
      fetch(`${url}/vehicles`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }).then((res) => res.json()),
      fetch(`${url}/packages`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }).then((res) => res.json()),
      fetch(`${url}/reviews`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }).then((res) => res.json()),
    ]);

    return {
      vehicles: vehiclesRes?.data || (Array.isArray(vehiclesRes) ? vehiclesRes : []),
      packages: packagesRes?.data || (Array.isArray(packagesRes) ? packagesRes : []),
      reviews: reviewsRes?.data || (Array.isArray(reviewsRes) ? reviewsRes : []),
    };
  } catch (err: any) {
    if (err.digest === "DYNAMIC_SERVER_USAGE" || err.message?.includes("Dynamic server usage")) {
      throw err;
    }
    // Log as warn (not error) — page gracefully falls back to empty arrays
    console.warn("Home page: backend unavailable, rendering with empty data.", err.message || err);
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
      <FAQ />
    </div>
  );
}
