"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/api";
import { Loader2, Plus, Edit, Trash2, X, Image as ImageIcon } from "lucide-react";

export default function VehiclesAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  // Fetch vehicles
  const { data: vehiclesData, isLoading } = useQuery({
    queryKey: ["admin_vehicles"],
    queryFn: async () => {
      const res = await apiClient.get("/vehicles/all");
      return res.data;
    },
  });

  const vehicles = vehiclesData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_vehicles"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      await apiClient.put(`/vehicles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_vehicles"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await apiClient.delete(`/vehicles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_vehicles"] }),
  });

  // Handle Image Upload
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data.url;
  };

  const onSubmit = async (data: any) => {
    let imageUrl = data.imageUrl; // Keep existing if editing

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const payload = { ...data, imageUrl };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (vehicle: any) => {
    setEditingId(vehicle._id);
    setImagePreview(vehicle.imageUrl || null);
    setImageFile(null);
    Object.keys(vehicle).forEach((key) => setValue(key, vehicle[key]));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    reset();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vehicles Management</h1>
          <p className="text-slate-500 mt-1">Manage your fleet, pricing, and availability.</p>
        </div>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setImagePreview(null);
            setIsModalOpen(true);
          }}
          className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold">Image</th>
              <th className="px-6 py-4 font-bold">Vehicle Details</th>
              <th className="px-6 py-4 font-bold">Pricing</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No vehicles found. Add one to get started.
                </td>
              </tr>
            ) : (
              vehicles.map((v: any) => (
                <tr key={v._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.name} className="w-16 h-12 object-cover rounded-lg" />
                    ) : (
                      <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{v.type}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{v.capacity} • {v.acType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">₹{v.pricePerKm}/km</div>
                    {v.localPrice && <div className="text-xs text-slate-500">₹{v.localPrice} (Local 8hr)</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {v.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(v)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg mr-2">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input {...register("name", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. Swift Dzire" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select {...register("type", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none">
                    <option value="sedan">Sedan</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="suv">SUV</option>
                    <option value="premium-suv">Premium SUV</option>
                    <option value="tempo">Tempo Traveller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacity</label>
                  <input {...register("capacity", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. 4+1 Seats" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">AC Type</label>
                  <input {...register("acType")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. AC / Non-AC" defaultValue="AC" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price Per Km (₹)</label>
                  <input type="number" {...register("pricePerKm", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. 11" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Local Price (Optional)</label>
                  <input type="number" {...register("localPrice")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. 2500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Subtitle (Optional)</label>
                  <input {...register("subtitle")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. Perfect for small families" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vehicle Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg border border-slate-200" />
                  ) : (
                    <div className="w-32 h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-saffron-50 file:text-saffron-700 hover:file:bg-saffron-100" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" {...register("isActive")} defaultChecked className="w-4 h-4 text-saffron-600 rounded" />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Visible on website)</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
