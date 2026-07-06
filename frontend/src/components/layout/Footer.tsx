"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

// Custom Om icon SVG (same as Navbar)
function OmIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M360.6 61c-6.2 2.1-10.6 7.8-10.6 14.5c0 8.5 6.9 15.5 15.5 15.5c2.1 0 4.1-.4 5.9-1.2c2 2.5 3.8 5.3 5.3 8.4c-3.5 1.1-6.7 3.3-9 6.5c-2.8-1.3-5.9-2-9.2-2c-12.1 0-22 9.8-22 22s9.8 22 22 22c4.1 0 7.9-1.1 11.2-3.1c1.3 4.5 2 9.2 2 14.1c0 13.5-5.2 25.8-13.6 35c-2.8-3.6-7.2-5.9-12.1-5.9c-8.5 0-15.5 6.9-15.5 15.5s6.9 15.5 15.5 15.5c.5 0 1.1 0 1.6-.1c-12.8 19.3-34.8 32.1-59.7 32.1c-26.2 0-49.1-14.2-61.6-35.2c.5-2.5 .8-5.2 .8-7.9c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 1.2 .1 2.5 .2 3.7C116.1 257.5 89.5 309 89.5 367c0 75.1 60.9 136 136 136s136-60.9 136-136c0-32.5-11.4-62.4-30.4-85.8c26.6-10.7 49.8-29.9 65.5-56c5.4 3.7 11.9 5.8 18.9 5.8c18.8 0 34-15.2 34-34s-15.2-34-34-34c-.5 0-1 0-1.4 0c2-10.3 3-21 3-31.8c0-20.1-3.6-39.4-10.1-57.2c1.4-4.2 2.1-8.7 2.1-13.4c0-24.3-19.7-44-44-44c-14 0-26.4 6.5-34.5 16.6zM225.5 367c0-44.2 35.8-80 80-80c9.4 0 18.5 1.6 26.9 4.6c8.8 15.7 13.9 33.8 13.9 53c0 2.8-.1 5.5-.3 8.2c-9.6-5.4-20.6-8.4-32.3-8.4c-36.5 0-66.1 29.6-66.1 66.1c0 36.5 29.6 66.1 66.1 66.1c27.4 0 50.8-16.7 60.8-40.4c-16.6 42.4-57.8 72.4-105.9 72.4c-62.8 0-113.7-50.9-113.7-113.7c0-1.6 0-3.2 .1-4.7c12.3 7.9 26.8 12.5 42.4 12.5c3.6 0 7.2-.2 10.7-.7c-1.2-5.6-1.8-11.5-1.8-17.5c0-5.6 .5-11.1 1.5-16.3c-3.4 .5-6.8 .7-10.4 .7c-22.6 0-42.7-10.5-55.7-26.9c6.2-11.1 15.1-20.3 25.8-26.9z" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-slate-950 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-900 text-sm">
      <div className="max-w-7xl mx-auto">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="bg-saffron-600 text-white p-2 rounded-lg">
                <OmIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-white font-extrabold tracking-tight font-cinzel leading-none">
                  {BUSINESS.shortName}
                </span>
                <span className="block text-[10px] font-semibold text-saffron-500 tracking-widest uppercase mt-0.5">
                  {BUSINESS.tagline}
                </span>
              </div>
            </Link>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
              {BUSINESS.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/#fleet"
                  className="text-slate-400 hover:text-saffron-400 transition-colors text-xs"
                >
                  Our Taxi Fleet
                </Link>
              </li>
              <li>
                <Link
                  href="/#packages"
                  className="text-slate-400 hover:text-saffron-400 transition-colors text-xs"
                >
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/#calculator"
                  className="text-slate-400 hover:text-saffron-400 transition-colors text-xs"
                >
                  Fare Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-slate-400 hover:text-saffron-400 transition-colors text-xs"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-wider">
              Contact Info
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-saffron-500 mt-0.5 flex-shrink-0" />
                <span>
                  {BUSINESS.address.street}, {BUSINESS.address.city} - {BUSINESS.address.pincode}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-saffron-500 flex-shrink-0" />
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="text-saffron-400 hover:text-saffron-300 font-semibold transition-colors"
                >
                  {BUSINESS.phoneFormatted}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-saffron-500 flex-shrink-0" />
                <span>{BUSINESS.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px]">
          <p>{BUSINESS.copyright}</p>
          <p className="text-slate-500">
            Designed for quick, premium, & reliable taxi bookings in Gwalior, MP.
          </p>
        </div>
      </div>
    </footer>
  );
}
