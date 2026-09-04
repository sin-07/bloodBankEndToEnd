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
      <body className="font-sans antialiased bg-slate-950 text-slate-100 selection:bg-rose-500/20 selection:text-rose-200">
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
