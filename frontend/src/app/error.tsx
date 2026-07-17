"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, PhoneCall } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Check if it's a transient ChunkLoadError from Next.js / Turbopack HMR cache out of sync
    const errorMsg = error?.message || error?.name || "";
    if (errorMsg.includes("ChunkLoadError") || errorMsg.includes("Failed to load chunk")) {
      const hasReloaded = typeof window !== "undefined" && sessionStorage.getItem("chunk_reload_attempt");
      if (!hasReloaded && typeof window !== "undefined") {
        sessionStorage.setItem("chunk_reload_attempt", "true");
        window.location.reload();
        return;
      }
    } else if (typeof window !== "undefined") {
      sessionStorage.removeItem("chunk_reload_attempt");
    }

    // Log the error to an error reporting service / console
    console.error("Client Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-helvetica">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center z-10 space-y-8 bg-slate-900/60 border border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            System Alert
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-cinzel text-white">
            Something Went Wrong
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            An unexpected error occurred while loading this page. Our engineering team has been notified.
          </p>
          {error.message && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-w-md mx-auto text-left overflow-x-auto">
              <p className="text-xs font-mono text-red-300 break-words">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-saffron-600 hover:bg-saffron-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-saffron-600/20 hover:shadow-saffron-500/30 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>

        <div className="border-t border-slate-800/80 pt-6 mt-4">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-saffron-500" />
            Urgent travel inquiry? Call us directly at{" "}
            <a href="tel:+916269643919" className="text-saffron-400 hover:underline font-bold">
              +91 62696 43919
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
