"use client";

import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2 } from "lucide-react";
import AdminSidebar from "@/admin-components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, isLoading } = useAdminAuth();
  const pathname = usePathname();

  const isLoginPath = pathname === "/admin/login";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
      </div>
    );
  }

  // If on login path, render without sidebar shell
  if (isLoginPath) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  // If not authenticated, do not render dashboard content (wait for router redirect)
  if (!accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
