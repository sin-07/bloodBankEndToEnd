import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#e11d48',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Srishti Blood Bank — Save Lives, Donate Blood | Next-Gen Life Network',
  description:
    'Srishti Blood Bank is an advanced end-to-end blood bank management and life-saving network connecting voluntary donors, hospitals, and blood centres with real-time stock telemetry.',
  keywords: [
    'Blood Bank',
    'Donate Blood',
    'Srishti Blood Bank',
    'Blood Donation',
    'Hospital Blood Request',
    'Blood Stock Live',
  ],
  authors: [{ name: 'Srishti LifeFlow Network' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-rose-500/20 selection:text-rose-700 min-h-screen relative overflow-x-hidden">
        {/* Ambient Reddish Corner & Top Gradient Backdrop (Global across whole website) */}
        <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden" aria-hidden="true">
          {/* Top-Right Corner Radiance */}
          <div className="absolute -top-32 -right-32 w-[650px] h-[650px] bg-gradient-to-bl from-rose-500/[0.14] via-rose-400/[0.07] to-transparent rounded-full blur-3xl" />

          {/* Top Center Ambient Spread */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-b from-rose-400/[0.13] via-rose-300/[0.05] to-transparent rounded-full blur-3xl" />

          {/* Top-Left Subtle Corner Aura */}
          <div className="absolute top-0 -left-28 w-[550px] h-[550px] bg-gradient-to-br from-rose-500/[0.09] via-red-400/[0.04] to-transparent rounded-full blur-3xl" />

          {/* Soft Bottom-Right Glow */}
          <div className="absolute bottom-0 right-[-80px] w-[500px] h-[500px] bg-gradient-to-tl from-rose-400/[0.05] via-rose-300/[0.02] to-transparent rounded-full blur-3xl" />
        </div>

        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#f8fafc',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
