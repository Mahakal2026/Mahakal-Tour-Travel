import React from "react";
import TopInfoBar from "@/components/layout/TopInfoBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyWhatsAppCTA from "@/components/layout/StickyWhatsAppCTA";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopInfoBar />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <StickyWhatsAppCTA />
    </>
  );
}
