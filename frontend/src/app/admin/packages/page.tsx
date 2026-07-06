"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { apiClient } from "@/lib/api";
import { Loader2, Plus, Edit, Trash2, X, Image as ImageIcon, Map } from "lucide-react";

export default function PackagesAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { register, control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      price: "",
      priceLabel: "",
      isActive: true,
      features: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  // Fetch packages
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["admin_packages"],
    queryFn: async () => {
      const res = await apiClient.get("/packages/all");
      return res.data;
    },
  });

  const packages = packagesData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/packages", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_packages"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      await apiClient.put(`/packages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_packages"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await apiClient.delete(`/packages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_packages"] }),
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
    let imageUrl = data.imageUrl; 

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    // Convert features array of objects to array of strings
    const featuresList = data.features.map((f: any) => f.value).filter((f: string) => f.trim() !== "");

    const payload = { 
      ...data, 
      features: featuresList,
      imageUrl 
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg._id);
    setImagePreview(pkg.imageUrl || null);
    setImageFile(null);
    
    // Map string features to object array for react-hook-form
    const formFeatures = pkg.features?.length > 0 
      ? pkg.features.map((f: string) => ({ value: f })) 
      : [{ value: "" }];

    reset({
      title: pkg.title,
      description: pkg.description,
      duration: pkg.duration,
      price: pkg.price,
      priceLabel: pkg.priceLabel || "",
      isActive: pkg.isActive,
      features: formFeatures,
    });
    
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    reset({
      title: "", description: "", duration: "", price: "", priceLabel: "", isActive: true, features: [{ value: "" }]
    });
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
          <h1 className="text-3xl font-bold text-slate-900">Packages Management</h1>
          <p className="text-slate-500 mt-1">Manage your tour itineraries and sightseeing packages.</p>
        </div>
        <button
          onClick={() => {
            closeModal();
            setIsModalOpen(true);
          }}
          className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <Map className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No packages found. Add one to get started.</p>
          </div>
        ) : (
          packages.map((pkg: any) => (
            <div key={pkg._id} className={`bg-white rounded-2xl shadow-sm border ${pkg.isActive ? 'border-slate-200' : 'border-slate-200 opacity-70'} overflow-hidden flex flex-col`}>
              <div className="h-48 relative bg-slate-100">
                {pkg.imageUrl ? (
                  <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                {!pkg.isActive && (
                  <div className="absolute top-2 right-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">Hidden</div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{pkg.title}</h3>
                  <div className="text-saffron-600 font-bold whitespace-nowrap ml-2">₹{pkg.price}</div>
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">{pkg.duration}</div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{pkg.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500">{pkg.features?.length || 0} inclusions</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(pkg)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pkg._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Package' : 'Add New Package'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input {...register("title", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. Mahakal VIP Darshan" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea {...register("description", { required: true })} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="Brief overview of the tour..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <input {...register("duration", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. 1 Day / 12 Hours" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹)</label>
                  <input type="number" {...register("price", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. 2500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Price Label / Condition (Optional)</label>
                  <input {...register("priceLabel")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. For Sedan / Up to 4 people" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Package Inclusions (Features)</label>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...register(`features.${index}.value` as const)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none text-sm"
                        placeholder="e.g. Toll & Parking included"
                      />
                      <button type="button" onClick={() => remove(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => append({ value: "" })} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1 mt-2">
                    <Plus className="w-4 h-4" /> Add Feature
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Package Image</label>
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
                <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 text-saffron-600 rounded" />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Visible on website)</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
