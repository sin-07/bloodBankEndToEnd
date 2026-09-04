import Link from 'next/link';
import { Droplets, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-4 relative selection:bg-rose-500 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-rose-100/40 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="text-center max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-10 relative z-10">
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
  );
}
