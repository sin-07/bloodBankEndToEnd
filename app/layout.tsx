import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Srishti Blood Bank - Save Lives, Donate Blood',
  description:
    'Srishti Blood Bank is an advanced end-to-end blood bank management and life-saving network connecting voluntary donors, hospitals, and blood centres in real time.',
  keywords: ['Blood Bank', 'Donate Blood', 'Srishti Blood Bank', 'Blood Donation', 'Hospital Blood Request'],
  authors: [{ name: 'Srishti LifeFlow' }],
  themeColor: '#dc2626',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1F2937',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
