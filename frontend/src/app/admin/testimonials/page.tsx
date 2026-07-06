"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiClient } from "@/lib/api";
import { Loader2, Plus, Edit, Trash2, X, Star } from "lucide-react";

export default function TestimonialsAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      title: "",
      initials: "",
      rating: 5,
      review: "",
      isActive: true,
    },
  });

  const ratingValue = watch("rating");

  // Fetch testimonials
  const { data: testimonialsData, isLoading } = useQuery({
    queryKey: ["admin_testimonials"],
    queryFn: async () => {
      const res = await apiClient.get("/testimonials/all");
      return res.data;
    },
  });

  const testimonials = testimonialsData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.post("/testimonials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_testimonials"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      await apiClient.put(`/testimonials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_testimonials"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await apiClient.delete(`/testimonials/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_testimonials"] }),
  });

  const onSubmit = async (data: any) => {
    // Generate initials if not provided
    if (!data.initials && data.name) {
      data.initials = data.name.substring(0, 2).toUpperCase();
    }
    
    // Ensure rating is a number
    data.rating = parseInt(data.rating.toString(), 10);

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (testi: any) => {
    setEditingId(testi._id);
    reset({
      name: testi.name,
      title: testi.title || "",
      initials: testi.initials || "",
      rating: testi.rating,
      review: testi.review,
      isActive: testi.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    reset({ name: "", title: "", initials: "", rating: 5, review: "", isActive: true });
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
          <h1 className="text-3xl font-bold text-slate-900">Testimonials Management</h1>
          <p className="text-slate-500 mt-1">Manage customer reviews and feedback.</p>
        </div>
        <button
          onClick={() => {
            closeModal();
            setIsModalOpen(true);
          }}
          className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No testimonials found. Add one to get started.</p>
          </div>
        ) : (
          testimonials.map((testi: any) => (
            <div key={testi._id} className={`bg-white rounded-2xl shadow-sm border ${testi.isActive ? 'border-slate-200' : 'border-slate-200 opacity-70'} p-6 flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                    {testi.initials || testi.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{testi.name}</h3>
                    <p className="text-xs text-slate-500">{testi.title || "Customer"}</p>
                  </div>
                </div>
                {!testi.isActive && (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Hidden</span>
                )}
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < testi.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                ))}
              </div>
              
              <p className="text-sm text-slate-600 italic flex-1 mb-4">"{testi.review}"</p>
              
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button onClick={() => handleEdit(testi)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(testi._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Review' : 'Add New Review'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Customer Name</label>
                  <input {...register("name", { required: true })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title / Location (Optional)</label>
                  <input {...register("title")} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="e.g. Tourist from Delhi" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Initials (Optional)</label>
                  <input {...register("initials")} maxLength={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none uppercase" placeholder="e.g. RS" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="1" max="5" step="1" {...register("rating")} className="w-full max-w-[200px]" />
                  <span className="font-bold flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-amber-500" /> {ratingValue}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Review Text</label>
                <textarea {...register("review", { required: true })} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-500 outline-none" placeholder="Write the customer's feedback here..."></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" {...register("isActive")} className="w-4 h-4 text-saffron-600 rounded" />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Visible on website)</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-6 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Save Changes' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
