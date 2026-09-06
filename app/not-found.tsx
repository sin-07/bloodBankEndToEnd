import Link from 'next/link';
import { Droplets, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50/80 via-slate-50/80 to-slate-50 text-slate-900 p-4 relative selection:bg-rose-500 selection:text-white overflow-hidden">
      {/* Background ambient lighting - corner & top reddish gradient orbs */}
      <div className="absolute -top-28 right-[-50px] w-[600px] h-[600px] bg-gradient-to-bl from-rose-500/[0.15] via-rose-400/[0.08] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-rose-400/[0.14] via-rose-300/[0.06] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-500/[0.10] via-rose-400/[0.05] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="text-center max-w-md bg-gradient-to-b from-rose-50/70 via-white to-white rounded-3xl border border-rose-100/90 shadow-2xl p-8 sm:p-10 relative z-10 overflow-hidden">
        {/* Ambient Reddish Glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-rose-500/[0.10] via-red-500/[0.04] to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-5 shadow-sm">
          <Droplets className="w-8 h-8 fill-rose-600" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-rose-600">
          Error 404 &bull; Clinical Route Undefined
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-2">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-600 mb-8 leading-relaxed">
          The requested portal resource or transfusion pathway does not exist or has been relocated within the network.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-rose-600 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-sm hover:bg-rose-700 transition-all hover:shadow-rose-600/20"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
