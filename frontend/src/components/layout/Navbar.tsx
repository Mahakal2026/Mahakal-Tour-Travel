"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaPhoneAlt } from "react-icons/fa";
import { BUSINESS, NAV_LINKS } from "@/lib/constants";



export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/#home"
              className="flex items-center space-x-3"
              onClick={closeMenu}
            >
              <div className="bg-gradient-to-tr from-saffron-600 to-amber-500 text-white p-2.5 rounded-xl shadow-lg shadow-saffron-500/20">
                <i className="fa-solid fa-om text-2xl"></i>
              </div>
              <div>
                <span className="block text-xl font-extrabold text-slate-900 tracking-tight font-cinzel leading-none">
                  {BUSINESS.shortName}
                </span>
                <span className="block text-xs font-semibold text-saffron-600 tracking-widest uppercase mt-1">
                  {BUSINESS.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Links (Centered via Flexbox) */}
          <div className="hidden lg:flex items-center justify-center flex-grow mx-4 space-x-4 xl:space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-700 hover:text-saffron-600 font-medium transition-colors text-sm xl:text-base whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button (Right) */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <a
              href={`tel:${BUSINESS.phone}`}
              className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPhoneAlt className="w-3.5 h-3.5" />
              Book Cab Now
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="text-slate-700 hover:text-saffron-600 focus:outline-none p-2 rounded-md touch-target"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 shadow-inner">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-saffron-50 hover:text-saffron-600 touch-target"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-100">
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="w-full text-center bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-md block touch-target"
                >
                  <FaPhoneAlt className="w-3.5 h-3.5 inline mr-2" />
                  Call to Book: {BUSINESS.phone}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
