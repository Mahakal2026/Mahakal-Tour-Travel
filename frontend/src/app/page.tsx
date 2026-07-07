import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FareCalculator from "@/components/home/FareCalculator";
import FleetPreview from "@/components/home/FleetPreview";
import PackageShowcase from "@/components/home/PackageShowcase";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import { VEHICLES, PACKAGES, TESTIMONIALS } from "@/lib/constants";

// Force static rendering for optimal SEO and loading performance
export const dynamic = "error";

export default function Home() {
  // Filter active vehicles and packages from constants
  const activeVehicles = VEHICLES.filter((v) => v.isActive);
  const activePackages = PACKAGES.filter((p) => p.isActive);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection vehicles={activeVehicles} />
      <WhyChooseUs />
      <FareCalculator vehicles={activeVehicles} />
      <FleetPreview vehicles={activeVehicles} />
      <PackageShowcase packages={activePackages} />
      <FinalCTA />
      <Testimonials testimonials={TESTIMONIALS} />
      <FAQ />
    </div>
  );
}
