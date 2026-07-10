"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Loader2, Car, Map, CalendarClock } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  // 1. Fetch vehicles count
  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
    queryKey: ["admin_dashboard_vehicles"],
    queryFn: async () => {
      const res = await adminApi.get("/admin/vehicles");
      return res.data?.data || res.data || [];
    },
  });

  // 2. Fetch packages count
  const { data: packagesData, isLoading: loadingPackages } = useQuery({
    queryKey: ["admin_dashboard_packages"],
    queryFn: async () => {
      const res = await adminApi.get("/admin/packages");
      return res.data?.data || res.data || [];
    },
  });

  // 3. Fetch pending bookings count
  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ["admin_dashboard_bookings"],
    queryFn: async () => {
      const res = await adminApi.get("/bookings?status=pending&limit=100");
      return res.data;
    },
  });

  const isLoading = loadingVehicles || loadingPackages || loadingBookings;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
      </div>
    );
  }

  const totalVehicles = vehiclesData?.length || 0;
  const activeVehicles = vehiclesData?.filter((v: any) => v.isActive).length || 0;

  const totalPackages = packagesData?.length || 0;
  const activePackages = packagesData?.filter((p: any) => p.isActive).length || 0;

  const pendingBookings = bookingsData?.pagination?.total || bookingsData?.data?.length || 0;

  return (
    <div className="space-y-8 mt-4">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-cinzel leading-none">Administration Overview</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">Quick indicators representing system records and lead logs.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Vehicles */}
        <Link
          href="/admin/vehicles"
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-5 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Car className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Fleet Cabs</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{totalVehicles} Total</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">{activeVehicles} Active Fleet Cabs</span>
          </div>
        </Link>

        {/* Packages */}
        <Link
          href="/admin/packages"
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-5 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Map className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Sightseeing Packages</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{totalPackages} Total</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">{activePackages} Active Tour Packages</span>
          </div>
        </Link>

        {/* Pending Inquiries */}
        <Link
          href="/admin/bookings"
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-5 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <CalendarClock className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Pending Bookings</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{pendingBookings} Leads</span>
            <span className="text-[10px] text-orange-600 font-bold block mt-0.5">Awaiting Agent Actions</span>
          </div>
        </Link>
      </div>

      {/* Admin Panel Quick Guidance */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h3 className="text-lg font-bold font-cinzel tracking-wide text-saffron-500">Need to update pricing parameters?</h3>
          <p className="text-slate-400 text-xs font-semibold">Choose 'Vehicles' to manage base rates and specify Outstation tiered models.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link
            href="/admin/bookings"
            className="w-full md:w-auto text-center bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors block"
          >
            Review Lead Inquiries
          </Link>
        </div>
      </div>

    </div>
  );
}
