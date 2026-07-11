"use client";

import React from "react";
import StarRating from "../ui/StarRating";
import { Review } from "@/types";

interface TestimonialsProps {
  testimonials: Review[];
}

const FALLBACK_TESTIMONIALS = [
  {
    _id: "fb-1",
    customerName: "Rahul K.",
    initials: "RK",
    titleLocation: "Regular Customer, Gwalior",
    rating: 5,
    reviewText: "Booked Mahakal Travels for a family trip from Gwalior to Ujjain. The driver was exceptionally disciplined, car was very hygienic, and they took care of all toll routes and stops perfectly. Highly recommended!",
    isActive: true,
  },
  {
    _id: "fb-2",
    customerName: "Sanjay Sharma",
    initials: "SS",
    titleLocation: "Business Manager, Lashkar",
    rating: 5,
    reviewText: "I have used their local cab package (8h/80km) for corporate delegates visiting Gwalior. Transparent pricing and beautiful condition of the Innova Crysta left a great impression.",
    isActive: true,
  },
  {
    _id: "fb-3",
    customerName: "Megha Singh",
    initials: "MS",
    titleLocation: "Traveller, Indore",
    rating: 5,
    reviewText: "Very supportive customer helpdesk. Had to modify the ride date last minute for an Orchha trip and they resolved it instantly with zero cancellation fee. Honest values!",
    isActive: true,
  },
];

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
  const activeReviews = testimonials.filter((r) => r.isActive);
  const displayReviews = activeReviews.length > 0 ? activeReviews : FALLBACK_TESTIMONIALS;

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="block text-xs font-bold uppercase tracking-widest text-saffron-600 mb-2">Customer Feedback</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-cinzel tracking-tight">What Our Clients Say</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto mt-2">Read real experiences shared by families, pilgrim groups, and corporate customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayReviews.map((item) => {
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
