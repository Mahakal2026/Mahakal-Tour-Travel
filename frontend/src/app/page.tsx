import HeroSection from "@/components/home/HeroSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FareCalculator from "@/components/home/FareCalculator";
import FleetPreview from "@/components/home/FleetPreview";
import PackageShowcase from "@/components/home/PackageShowcase";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

async function getVehicles() {
  try {
    const res = await fetch(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/vehicles`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

async function getPackages() {
  try {
    const res = await fetch(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/packages`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

async function getTestimonials() {
  try {
    const res = await fetch(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/testimonials`, { next: { revalidate: 60 } });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const [vehicles, packages, testimonials] = await Promise.all([
    getVehicles(),
    getPackages(),
    getTestimonials(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection vehicles={vehicles} />
      <WhyChooseUs />
      <FareCalculator vehicles={vehicles} />
      <FleetPreview vehicles={vehicles} />
      <PackageShowcase packages={packages} />
      <FinalCTA />
      <Testimonials testimonials={testimonials} />
      <FAQ />
    </div>
  );
}
