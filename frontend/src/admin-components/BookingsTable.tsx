"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import {
  Loader2,
  User,
  Phone,
  Calendar,
  MessageSquare,
  BadgeAlert,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function BookingsTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch bookings inquiries with JWT credentials
  const { data, isLoading } = useQuery({
    queryKey: ["admin_bookings", page, statusFilter],
    queryFn: async () => {
      const url = `/bookings?page=${page}&limit=10${
        statusFilter ? `&status=${statusFilter}` : ""
      }`;
      const res = await adminApi.get(url);
      return res.data;
    },
  });

  // Patch booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await adminApi.patch(`/bookings/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <BadgeAlert className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
      </div>
    );
  }

  const bookings = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-cinzel leading-none">Logged Cabs & Tour Inquiries</h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">Manage and audit lead status logs from the live website.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-saffron-500 cursor-pointer"
          >
            <option value="">All Logs</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Service Required</th>
                <th className="px-6 py-4">Est. Price Choice</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Received</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">
                    No booking inquiries found matching the status filter.
                  </td>
                </tr>
              ) : (
                bookings.map((booking: any) => (
                  <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {booking.name || "Anonymous Customer"}
                      </div>
                      {booking.phone && (
                        <div className="flex items-center gap-2 text-slate-500 mt-1 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {booking.phone}
                        </div>
                      )}
                    </td>

                    {/* Route Details */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 leading-snug">
                        {booking.routeOrPackage || "General Message"}
                      </div>
                      <div className="flex gap-2 mt-1.5">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 text-slate-800 uppercase tracking-wider border border-slate-200">
                          {booking.vehicle || "N/A"}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-saffron-50 text-saffron-800 uppercase tracking-wider border border-saffron-100">
                          {booking.tripType ? booking.tripType.replace("-", " ") : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Estimated Price */}
                    <td className="px-6 py-4 font-bold text-slate-950">
                      {booking.estimatedFare ? (
                        <span className="text-emerald-700 font-extrabold text-sm">
                          ₹{booking.estimatedFare.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>

                    {/* Received Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px]">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Action controls */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveMessage(booking.rawMessage)}
                          className="text-slate-500 hover:text-saffron-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Raw WhatsApp Message Log"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <select
                          value={booking.status}
                          onChange={(e) => {
                            updateStatusMutation.mutate({
                              id: booking._id,
                              status: e.target.value,
                            });
                          }}
                          className="px-2 py-1.5 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600 font-bold">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Message Modal Preview */}
      {activeMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">WhatsApp Raw Message Text</h3>
              <button
                onClick={() => setActiveMessage(null)}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              <pre className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[400px]">
                {activeMessage}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveMessage(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
