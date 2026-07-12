"use client";

import React, { useTransition } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { buildAndSendBooking, sendBookingInquiry } from "@/lib/whatsapp";

interface BookButtonWrapperProps {
  vehicle: any;
}

export function BookButtonWrapper({ vehicle }: BookButtonWrapperProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await buildAndSendBooking({
        vehicle,
        tripType: "local",
        price: vehicle.localPrice || 0,
      });
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full sm:w-auto bg-slate-950 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider whitespace-nowrap"
    >
      <FaWhatsapp className="w-4 h-4 flex-shrink-0" />
      <span>{isPending ? "Connecting..." : "Book Cab Now"}</span>
    </button>
  );
}

interface BookPackageButtonWrapperProps {
  pkg: any;
}

export function BookPackageButtonWrapper({ pkg }: BookPackageButtonWrapperProps) {
  const [isPending, startTransition] = useTransition();

  const handleBook = () => {
    startTransition(async () => {
      let formattedMessage = "";
      let rateText = "";

      if (pkg.pricingType === "km") {
        rateText = pkg.price > 0 ? `₹${pkg.price}/Km` : "Based on Km";
        formattedMessage = `Hello Mahakal Tour & Travels, I would like to get a custom quote for the package.\n\n` +
          `*Package Details:*\n` +
          `• *Package Name:* ${pkg.name}\n` +
          `• *Duration:* ${pkg.duration}\n` +
          `• *Estimated Rate:* ${rateText}\n\n` +
          `Please confirm availability and share details. Thank you!`;
      } else {
        rateText = `₹${pkg.price.toLocaleString("en-IN")}`;
        formattedMessage = `Hello Mahakal Tour & Travels, I would like to book a cab package.\n\n` +
          `*Package Details:*\n` +
          `• *Package Name:* ${pkg.name}\n` +
          `• *Duration:* ${pkg.duration}\n` +
          `• *Price:* ${rateText}\n\n` +
          `Please confirm availability. Thank you!`;
      }

      await sendBookingInquiry({
        name: "Valued Customer",
        vehicle: "sedan", // default
        tripType: "package-inquiry",
        routeOrPackage: `${pkg.name} (${pkg.duration})`,
        estimatedFare: pkg.pricingType === "km" ? undefined : pkg.price,
        messageText: formattedMessage,
      });
    });
  };

  return (
    <button
      onClick={handleBook}
      disabled={isPending}
      className="w-full sm:w-auto bg-slate-950 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider whitespace-nowrap"
    >
      <FaWhatsapp className="w-4 h-4 flex-shrink-0" />
      <span>{isPending ? "Connecting..." : pkg.pricingType === "km" ? "Get Custom Quote" : "Book Package"}</span>
    </button>
  );
}
