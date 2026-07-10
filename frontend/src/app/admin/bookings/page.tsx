"use client";

import React from "react";
import BookingsTable from "@/admin-components/BookingsTable";

export default function BookingsAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-cinzel leading-none">Booking Inquiries</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">Manage and audit customer bookings and inquiries logged from the landing page.</p>
      </div>

      {/* Bookings table component */}
      <BookingsTable />
    </div>
  );
}
