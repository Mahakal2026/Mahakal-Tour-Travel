"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Car,
  Map,
  MessageSquareQuote,
  CalendarCheck,
  LogOut,
} from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/packages", label: "Packages", icon: Map },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
];

export default function AdminSidebar() {
  const { logout, user } = useAdminAuth();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 z-50">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold font-cinzel text-white leading-none">
          {BUSINESS.shortName}
        </h2>
        <p className="text-xs text-saffron-500 uppercase tracking-widest mt-2 font-bold">
          Management Portal
        </p>
        {user?.email && (
          <p className="text-[10px] text-slate-500 truncate mt-1">
            Logged: {user.email}
          </p>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                isActive
                  ? "bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-red-400 hover:text-white hover:bg-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
