"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Loader2, Plus, Edit, Trash2, Star } from "lucide-react";
import ReviewForm from "@/admin-components/ReviewForm";
import { Review } from "@/types";

export default function ReviewsAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const queryClient = useQueryClient();

  // Fetch admin reviews (active + inactive)
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const res = await adminApi.get("/admin/reviews");
      return res.data?.data || res.data || [];
    },
  });

  // Mutators
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await adminApi.post("/admin/reviews", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await adminApi.patch(`/admin/reviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
      setIsModalOpen(false);
      setSelectedReview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/admin/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
    },
  });

  const handleFormSubmit = async (data: any) => {
    if (selectedReview) {
      await updateMutation.mutateAsync({ id: selectedReview._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEditClick = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to remove this review?")) {
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
          <h1 className="text-3xl font-extrabold text-slate-900 font-cinzel leading-none">Reviews Management</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Manage user testimonials and feedback displayed on the landing page.</p>
        </div>
        <button
          onClick={() => {
            setSelectedReview(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-brand-orange-start to-brand-orange-end text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer hover:brightness-110"
        >
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-bold">No customer reviews saved. Click Add Review to begin.</p>
          </div>
        ) : (
          reviews.map((r: Review) => {
            const initials = r.initials || r.customerName.substring(0, 2).toUpperCase();
            return (
              <div
                key={r._id}
                className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${
                  r.isActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50/50"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-orange-start to-brand-orange-end text-white flex items-center justify-center font-bold text-xs tracking-wider">
                        {initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-none text-sm">{r.customerName}</h4>
                        {r.titleLocation && (
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">{r.titleLocation}</span>
                        )}
                      </div>
                    </div>
                    {!r.isActive && (
                      <span className="bg-slate-800 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Stars display */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 font-semibold italic leading-relaxed">
                    "{r.reviewText}"
                  </p>
                </div>

                <div className="flex justify-end gap-1 border-t border-slate-100/60 pt-4 mt-6">
                  <button
                    onClick={() => handleEditClick(r)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(r._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <ReviewForm
          initialData={selectedReview}
          onSubmit={handleFormSubmit}
          isSaving={isSaving}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
