"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas";
import { buildContactMessage, openWhatsApp } from "@/lib/whatsapp";
import { apiClient } from "@/lib/api";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/leads", {
        name: data.name,
        phone: data.phone,
        message: data.message,
        source: "contact-form",
      });
    } catch (error) {
      console.error("Failed to save lead:", error);
    } finally {
      setIsSubmitting(false);
      openWhatsApp(
        buildContactMessage({
          name: data.name,
          phone: data.phone,
          message: data.message,
        })
      );
      reset();
    }
  };

  return (
    <section
      id="contact"
      className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-300"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Info Column */}
          <AnimatedSection className="lg:col-span-5">
            <div className="space-y-4">
              <div>
                <span className="text-saffron-500 font-bold uppercase tracking-widest text-xs">
                  Stay Connected
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-cinzel">
                  Contact Office
                </h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Have a question or custom tour package requirement? Give us a
                call or drop by our main booking office in Lashkar, Gwalior.
              </p>

              <div className="space-y-3 pt-2">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-saffron-500 flex items-center justify-center text-base flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                      Main Office Address
                    </span>
                    <span className="block text-slate-200 text-xs mt-0.5 font-medium leading-tight">
                      {BUSINESS.name}, {BUSINESS.address.street}, {BUSINESS.address.city} - {BUSINESS.address.pincode}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-saffron-500 flex items-center justify-center text-base flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                      Call Directly
                    </span>
                    <a
                      href={`tel:${BUSINESS.phone}`}
                      className="block text-saffron-400 hover:text-saffron-300 text-sm font-bold mt-0.5 transition-colors"
                    >
                      {BUSINESS.phoneFormatted}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-saffron-500 flex items-center justify-center text-base flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                      Email Inquiry
                    </span>
                    <span className="block text-slate-200 text-xs mt-0.5">
                      {BUSINESS.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Form Column */}
          <AnimatedSection className="lg:col-span-7" delay={0.15}>
            <div className="bg-slate-800 p-5 sm:p-6 rounded-xl border border-slate-700 space-y-3">
              <h3 className="text-lg font-bold text-white">
                Send Us a Direct Message
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      {...register("name")}
                      placeholder="Your Name"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:outline-none focus:border-saffron-500 transition-colors text-sm"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      {...register("phone")}
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:outline-none focus:border-saffron-500 transition-colors text-sm"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <textarea
                    {...register("message")}
                    rows={4}
                    placeholder="Describe your travel itinerary / date / passenger details..."
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl focus:outline-none focus:border-saffron-500 transition-colors text-sm"
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-saffron-600 hover:bg-saffron-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-saffron-600/15 transition-all flex items-center justify-center gap-2 touch-target"
                >
                  <Send className="w-4 h-4" />
                  Send via WhatsApp
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
