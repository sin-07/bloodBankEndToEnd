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
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none ambient-glow-rose -z-10 opacity-60" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-rose-600/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />

      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-64 p-4 md:p-6 lg:p-8 pb-16 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
