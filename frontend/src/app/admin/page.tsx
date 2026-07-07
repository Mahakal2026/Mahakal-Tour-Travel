"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Loader2, User, Phone, Calendar, Landmark, MessageSquare, BadgeAlert, CheckCircle2, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch inquiries with pagination and status filters
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", page, statusFilter],
    queryFn: async () => {
      const url = `/bookings?page=${page}&limit=10${statusFilter ? `&status=${statusFilter}` : ""}`;
      const res = await apiClient.get(url);
      return res.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/bookings/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
      </div>
    );
  }

  const bookings = data?.data || [];
  const pagination = data?.pagination;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <BadgeAlert className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-cinzel leading-none">Mahakal Inquiries</h1>
          <p className="text-slate-500 mt-2">Manage customer taxi and package inquiries logged from the landing page.</p>
        </div>

        {/* Status Filtering */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset page to 1 on filter change
            }}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900 font-cinzel">Logged Bookings</h2>
          <span className="text-sm text-slate-500 font-bold">
            Total Logs: {pagination?.total || 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Route & Trip Details</th>
                <th className="px-6 py-4 font-bold">Fare Choice</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date Received</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No booking inquiries logged yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking: any) => (
                  <tr
                    key={booking._id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <User className="w-4 h-4 text-slate-400" />
                        {booking.name || "Anonymous Customer"}
                      </div>
                      {booking.phone && (
                        <div className="flex items-center gap-2 text-slate-500 mt-1">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {booking.phone}
                        </div>
                      )}
                    </td>

                    {/* Route & Trip */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 leading-snug">
                        {booking.routeOrPackage || "General Message"}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-800 uppercase tracking-wide">
                          {booking.vehicle}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-saffron-100 text-saffron-800 uppercase tracking-wide">
                          {booking.tripType.replace("-", " ")}
                        </span>
                      </div>
                    </td>

                    {/* Fare */}
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {booking.estimatedFare ? (
                        <span className="text-emerald-700">₹{booking.estimatedFare.toLocaleString("en-IN")}</span>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Not Specified</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Action Status Selection */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Show Message button to preview raw message */}
                        <button
                          onClick={() => {
                            alert(`📝 Raw WhatsApp Message Log:\n\n${booking.rawMessage}`);
                          }}
                          className="text-slate-500 hover:text-saffron-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Raw WhatsApp Message"
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
                          className="px-2 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="pending">Set Pending</option>
                          <option value="confirmed">Set Confirm</option>
                          <option value="cancelled">Set Cancel</option>
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
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 font-bold">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
