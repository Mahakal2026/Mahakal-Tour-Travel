"use client";

import React, { useTransition } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { buildAndSendBooking } from "@/lib/whatsapp";

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
      className="w-full sm:w-auto bg-slate-950 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all text-center flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
    >
      <FaWhatsapp className="w-4 h-4" />
      {isPending ? "Connecting..." : "Book Cab Now"}
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
      await buildAndSendBooking({
        vehicle: pkg,
        tripType: "package-inquiry",
        packageName: pkg.name,
        price: pkg.price,
      });
    });
  };

  return (
    <button
      onClick={handleBook}
      disabled={isPending}
      className="w-full sm:w-auto bg-slate-950 hover:bg-saffron-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-saffron-600/30 transition-all text-center flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
    >
      <FaWhatsapp className="w-4 h-4" />
      {isPending ? "Connecting..." : "Enquire Now"}
    </button>
  );
}
