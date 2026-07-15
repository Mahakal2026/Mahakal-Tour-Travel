"use client";

import React, { useState, useEffect } from "react";
import StarRating from "../ui/StarRating";
import { Review } from "@/types";

interface TestimonialsProps {
  testimonials: Review[];
}

export default function Testimonials({ testimonials: testimonialsProp = [] }: TestimonialsProps) {
  const [reviews, setReviews] = useState<Review[]>(testimonialsProp);

  useEffect(() => {
    setReviews(testimonialsProp);
  }, [testimonialsProp]);

  useEffect(() => {
    if (testimonialsProp.length === 0) {
      const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
      fetch(`${url}/reviews`)
        .then((res) => res.json())
        .then((json) => {
          const data: Review[] = json?.data || (Array.isArray(json) ? json : []);
          setReviews(data);
        })
        .catch((err) => console.warn("Could not load fresh client reviews:", err));
    }
  }, [testimonialsProp]);

  const activeReviews = reviews.filter((r) => r.isActive);

  if (activeReviews.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="block text-xs font-bold uppercase tracking-widest text-saffron-600 mb-2">Customer Feedback</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-cinzel tracking-tight">What Our Clients Say</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">Read real experiences shared by families, pilgrim groups, and corporate customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeReviews.map((item) => {
            const avatarInitials = item.initials || item.customerName.substring(0, 2).toUpperCase();
            return (
              <div
                key={item._id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between"
              >
                <div>
                  <StarRating rating={item.rating} className="mb-4" />
                  <p className="text-slate-700 italic text-sm leading-relaxed mb-6 font-medium">
                    "{item.reviewText}"
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-200/60 pt-4">
                  {/* Colored Circle Initials Avatar */}
                  <div className="w-10 h-10 bg-saffron-100 rounded-full flex items-center justify-center font-bold text-saffron-700 text-sm flex-shrink-0">
                    {avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.customerName}</h4>
                    {item.titleLocation && (
                      <p className="text-slate-500 text-[11px] font-semibold">{item.titleLocation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
