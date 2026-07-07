"use client";

import { usePathname } from "next/navigation";
import TopInfoBar from "./TopInfoBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StickyWhatsAppCTA from "./StickyWhatsAppCTA";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="flex-grow flex flex-col">{children}</div>;
  }

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
