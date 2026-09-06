'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useRouter } from 'next/navigation';
import BloodLoader from '@/components/gsap/BloodLoader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <BloodLoader fullScreen text="Authenticating Workspace..." />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-slate-50/70 to-slate-50 text-slate-900 relative overflow-x-hidden">
      {/* Background ambient lighting - subtle reddish gradient orbs */}
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-rose-400/[0.12] via-rose-300/[0.06] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-20 right-[-100px] w-[500px] h-[500px] bg-rose-500/[0.06] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-[-100px] w-[450px] h-[450px] bg-rose-500/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />

      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pb-16 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
