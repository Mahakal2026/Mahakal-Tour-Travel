import Link from "next/link";
import { Compass, Home, PhoneCall, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-helvetica">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-saffron-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full text-center z-10 space-y-8 bg-slate-900/60 border border-slate-800 p-8 sm:p-12 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="w-20 h-20 bg-saffron-500/10 border border-saffron-500/20 rounded-2xl flex items-center justify-center mx-auto text-saffron-500 shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-saffron-500 bg-saffron-500/10 px-3 py-1 rounded-full border border-saffron-500/20">
            Error 404
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-cinzel text-white">
            Page Not Found
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            The road you are looking for does not exist or has been moved. Let us guide you back to safety and divine travel.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto bg-saffron-600 hover:bg-saffron-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-saffron-600/20 hover:shadow-saffron-500/30 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold px-6 py-3.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Contact Support
          </Link>
        </div>

        <div className="border-t border-slate-800/80 pt-6 mt-4">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-saffron-500" />
            Need urgent cab assistance? Call us 24/7 at{" "}
            <a href="tel:+916269643919" className="text-saffron-400 hover:underline font-bold">
              +91 62696 43919
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
