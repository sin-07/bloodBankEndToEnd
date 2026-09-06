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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/80 via-slate-50/80 to-slate-50 text-slate-900 relative overflow-x-hidden">
      {/* Background ambient lighting - corner & top reddish gradient orbs */}
      <div className="fixed -top-28 right-[-50px] w-[650px] h-[650px] bg-gradient-to-bl from-rose-500/[0.15] via-rose-400/[0.08] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-rose-400/[0.14] via-rose-300/[0.06] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -top-20 left-[-80px] w-[550px] h-[550px] bg-gradient-to-br from-rose-500/[0.10] via-red-400/[0.05] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-[-100px] w-[500px] h-[500px] bg-rose-500/[0.05] rounded-full blur-[120px] pointer-events-none -z-10" />

      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pb-16 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
