"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { BUSINESS } from "@/lib/constants";
import { buildWhatsAppUrl, buildGenericGreeting } from "@/lib/whatsapp";

export default function StickyWhatsAppCTA() {
  const pathname = usePathname();
  const whatsappUrl = buildWhatsAppUrl(buildGenericGreeting());

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl shadow-emerald-500/30 transition-all hover:scale-110 touch-target group"
      aria-label={`Chat on WhatsApp with ${BUSINESS.name}`}
    >
      <MessageCircle className="w-7 h-7" />
      {/* Pulse ring animation */}
      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
      {/* Tooltip on hover (desktop only) */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
