"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import Image from "next/image";



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
              <div className=" w-16 h-16 overflow-hidden rounded-xl">
                {/* <i className="fa-solid fa-om text-lg"></i>s */}
                 <Image
                  src="/logo.png"
                  alt="Logo"
                  width={45}
                  height={45}
                  className="w-16 h-16  object-cover"
                />
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
                  href="/contact"
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
