"use client";

import { usePathname } from "next/navigation";
import { FaMapMarkerAlt, FaRegClock, FaPhoneAlt } from "react-icons/fa";
import { BUSINESS } from "@/lib/constants";

export default function TopInfoBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="bg-slate-900 text-slate-300 text-xs sm:text-sm py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <FaMapMarkerAlt className="w-3.5 h-3.5 text-saffron-500 mr-2" />
            {BUSINESS.address.street}, {BUSINESS.address.city}
          </span>
          <span className="hidden md:flex items-center">
            <FaRegClock className="w-3.5 h-3.5 text-saffron-500 mr-2" />
            {BUSINESS.hours}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href={`tel:${BUSINESS.phone}`}
            className="flex items-center text-saffron-100 hover:text-saffron-500 font-semibold transition-colors"
          >
            <FaPhoneAlt className="w-3 h-3 text-saffron-500 mr-2 animate-bounce" style={{ animationDuration: "2s" }} />
            Call Support: {BUSINESS.phoneFormatted}
          </a>
        </div>
      </div>
    </div>
  );
}
