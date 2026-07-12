"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Loader2, Plus, Edit, Trash2, Map } from "lucide-react";
import PackageForm from "@/admin-components/PackageForm";
import { Package } from "@/types";

export default function PackagesAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const queryClient = useQueryClient();

  // Fetch admin tour packages (active + inactive)
  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin_packages"],
    queryFn: async () => {
      const res = await adminApi.get("/admin/packages");
      return res.data?.data || res.data || [];
    },
  });

  // Mutators
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      await adminApi.post("/admin/packages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_packages"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      await adminApi.patch(`/admin/packages/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_packages"] });
      setIsModalOpen(false);
      setSelectedPackage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/admin/packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_packages"] });
    },
  });

  const handleFormSubmit = async (data: any, imageFile: File | null) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("duration", data.duration);
    formData.append("price", data.price);
    if (data.priceLabel) {
      formData.append("priceLabel", data.priceLabel);
    }
    if (data.vehicleName) {
      formData.append("vehicleName", data.vehicleName);
    }
    if (data.pricingType) {
      formData.append("pricingType", data.pricingType);
    }
    formData.append("isActive", String(data.isActive));
    // Preprocess parseInclusions in backend splits by comma if string, or parses JSON.
    // We send as JSON string
    formData.append("inclusions", JSON.stringify(data.inclusions || []));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (selectedPackage) {
      await updateMutation.mutateAsync({ id: selectedPackage._id, formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEditClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to remove this package?")) {
      await deleteMutation.mutateAsync(id);
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
          <h1 className="text-3xl font-extrabold text-slate-900 font-cinzel leading-none">Packages Management</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Create and adjust sightseeing/pilgrimage itineraries and conditions.</p>
        </div>
        <button
          onClick={() => {
            setSelectedPackage(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer hover:brightness-110"
        >
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-bold">No packages configured. Click Add Package to begin.</p>
          </div>
        ) : (
          packages.map((pkg: Package) => (
            <div
              key={pkg._id}
              className={`bg-white rounded-3xl overflow-hidden border shadow-sm flex flex-col justify-between ${
                pkg.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div>
                <div className="h-44 relative bg-slate-100 flex items-center justify-center overflow-hidden">
                  {pkg.image ? (
                    <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  ) : (
                    <Map className="w-10 h-10 text-slate-300" />
                  )}
                  {!pkg.isActive && (
                    <div className="absolute top-3 right-3 bg-slate-800 text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                      Hidden
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{pkg.name}</h3>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                    {pkg.duration}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100/60 bg-slate-50/20">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
                    {pkg.pricingType === "km" ? "Fare Starts" : "Estimated fare"}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-saffron-600">
                      {pkg.pricingType === "km"
                        ? pkg.price > 0 ? `₹${pkg.price}/Km` : "Based on Km"
                        : `₹${pkg.price.toLocaleString("en-IN")}`}
                    </span>
                    <span className="block text-[8px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                      {pkg.pricingType === "flat"
                        ? `${pkg.vehicleName || "Sedan"} Car Price`
                        : pkg.pricingType === "oneway"
                        ? `${pkg.vehicleName || "Sedan"} One-Way`
                        : "Km Based Calculations"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleEditClick(pkg)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(pkg._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <PackageForm
          initialData={selectedPackage}
          onSubmit={handleFormSubmit}
          isSaving={isSaving}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
