"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Loader2, Plus, Edit, Trash2, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import VehicleForm from "@/admin-components/VehicleForm";
import OutstationTiersTable from "@/admin-components/OutstationTiersTable";
import FarePreviewWidget from "@/admin-components/FarePreviewWidget";
import { Vehicle, OutstationTier } from "@/types";

export default function VehiclesAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [expandedVehicleId, setExpandedVehicleId] = useState<string | null>(null);
  const [pendingTiers, setPendingTiers] = useState<Record<string, OutstationTier[]>>({});

  const queryClient = useQueryClient();

  // Fetch admin fleet (active + inactive)
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["admin_vehicles"],
    queryFn: async () => {
      const res = await adminApi.get("/admin/vehicles");
      return res.data?.data || res.data || [];
    },
  });

  // Mutators
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await adminApi.post("/admin/vehicles", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin_vehicles"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      await adminApi.patch(`/admin/vehicles/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin_vehicles"] });
      setIsModalOpen(false);
      setSelectedVehicle(null);
    },
  });

  const updateTiersMutation = useMutation({
    mutationFn: async ({ id, tiers }: { id: string; tiers: OutstationTier[] }) => {
      await adminApi.patch(`/admin/vehicles/${id}`, { outstationTiers: tiers });
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin_vehicles"] });
      // Clear pending state
      setPendingTiers((prev) => {
        const copy = { ...prev };
        delete copy[variables.id];
        return copy;
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/admin/vehicles/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin_vehicles"] });
    },
  });

  const handleFormSubmit = async (data: any, imageFile: File | null) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("capacity", data.capacity);
    formData.append("acType", data.acType);
    formData.append("pricePerKm", data.pricePerKm);
    if (data.localPrice !== undefined && data.localPrice !== null && data.localPrice !== "") {
      formData.append("localPrice", data.localPrice);
    } else {
      formData.append("localPrice", "");
    }
    if (data.subtitle) {
      formData.append("subtitle", data.subtitle);
    } else {
      formData.append("subtitle", "");
    }
    formData.append("isActive", String(data.isActive));
    formData.append("outstationTiers", JSON.stringify(data.outstationTiers || []));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (selectedVehicle) {
      await updateMutation.mutateAsync({ id: selectedVehicle._id, formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to remove this vehicle from fleet?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleExpandTiers = (vehicle: Vehicle) => {
    if (expandedVehicleId === vehicle._id) {
      setExpandedVehicleId(null);
    } else {
      setExpandedVehicleId(vehicle._id);
      setPendingTiers((prev) => ({
        ...prev,
        [vehicle._id]: vehicle.outstationTiers || [],
      }));
    }
  };

  const handleSaveTiers = async (id: string) => {
    const tiers = pendingTiers[id];
    if (tiers) {
      await updateTiersMutation.mutateAsync({ id, tiers });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-cinzel leading-none">Fleet Management</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Add, configure, and manage vehicles and pricing matrix.</p>
        </div>
        <button
          onClick={() => {
            setSelectedVehicle(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer hover:brightness-110"
        >
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[10px] text-slate-500 bg-slate-50 border-b border-slate-200 font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Name & Specifications</th>
              <th className="px-6 py-4">Standard pricing</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold">
                  No vehicles logged in the system.
                </td>
              </tr>
            ) : (
              vehicles.map((v: Vehicle) => {
                const isExpanded = expandedVehicleId === v._id;
                const activeTiers = pendingTiers[v._id] || v.outstationTiers || [];

                return (
                  <React.Fragment key={v._id}>
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        {v.image ? (
                          <img
                            src={v.image}
                            alt={v.name}
                            className="w-16 h-10 object-contain rounded-lg border border-slate-100 bg-slate-50"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                            No Photo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{v.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex gap-2 font-semibold">
                          <span className="uppercase">{v.type}</span> • <span>{v.capacity}</span> • <span>{v.acType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">₹{v.pricePerKm}/km</div>
                        {v.localPrice && (
                          <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Local Flat: ₹{v.localPrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                            v.isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {v.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleExpandTiers(v)}
                            className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors flex items-center gap-1 font-bold tracking-wide"
                            title="Manage Outstation pricing tiers"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-saffron-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <span className="text-[9px] uppercase">Tiers ({v.outstationTiers?.length || 0})</span>
                          </button>
                          <button
                            onClick={() => handleEditClick(v)}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(v._id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Outstation pricing sub-table */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="bg-slate-50/50 p-6 border-b border-slate-100">
                          <div className="max-w-2xl bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                            <OutstationTiersTable
                              value={activeTiers}
                              onChange={(val) =>
                                setPendingTiers((prev) => ({
                                  ...prev,
                                  [v._id]: val,
                                }))
                              }
                            />
                            
                            {/* Live Fare Preview Section */}
                            <FarePreviewWidget
                              tiers={activeTiers}
                              pricePerKm={v.pricePerKm}
                              localPrice={v.localPrice}
                            />

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                              <button
                                type="button"
                                onClick={() => setExpandedVehicleId(null)}
                                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={updateTiersMutation.isPending}
                                onClick={() => handleSaveTiers(v._id)}
                                className="px-3 py-1.5 bg-saffron-600 hover:bg-saffron-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {updateTiersMutation.isPending && (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                )}
                                Save Tiers
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <VehicleForm
          initialData={selectedVehicle}
          onSubmit={handleFormSubmit}
          isSaving={isSaving}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
