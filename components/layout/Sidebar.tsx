'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Droplets,
  FileText,
  Package,
  Building2,
  ClipboardList,
  Settings,
  BarChart3,
  Heart,
  X,
  Award,
  UserCheck,
  CalendarCheck,
  Activity,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Overview', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Blood Inventory', href: '/admin/blood-stock', icon: <Droplets className="w-4 h-4" /> },
          { label: 'Emergency Requests', href: '/admin/requests', icon: <FileText className="w-4 h-4" /> },
          { label: 'Registered Donors', href: '/admin/donors', icon: <Users className="w-4 h-4" /> },
          { label: 'Partner Hospitals', href: '/admin/hospitals', icon: <Building2 className="w-4 h-4" /> },
          { label: 'Analytics & Reports', href: '/admin/reports', icon: <BarChart3 className="w-4 h-4" /> },
          { label: 'User Management', href: '/admin/users', icon: <UserCheck className="w-4 h-4" /> },
        ];
      case 'hospital':
        return [
          { label: 'Overview', href: '/hospital', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Request Blood', href: '/hospital/new-request', icon: <ClipboardList className="w-4 h-4" /> },
          { label: 'Our Requests', href: '/hospital/requests', icon: <FileText className="w-4 h-4" /> },
          { label: 'Stock Availability', href: '/hospital/availability', icon: <Package className="w-4 h-4" /> },
        ];
      case 'donor':
      default:
        return [
          { label: 'Donor Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { label: 'Schedule Donation', href: '/dashboard/appointments', icon: <CalendarCheck className="w-4 h-4" /> },
          { label: 'Donation Journey', href: '/dashboard/donations', icon: <Heart className="w-4 h-4" /> },
          { label: 'Active Requests', href: '/dashboard/requests', icon: <FileText className="w-4 h-4" /> },
          { label: 'Certificates', href: '/dashboard/certificates', icon: <Award className="w-4 h-4" /> },
          { label: 'Profile Settings', href: '/dashboard/profile', icon: <Settings className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-slate-900/95 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand & close on mobile */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-glow-sm">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white tracking-tight">
                  Srishti <span className="text-rose-500">Blood Bank</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {user?.role ? `${user.role} workspace` : 'Platform'}
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-5 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-glow-sm border border-rose-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <span
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-400'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info pill */}
        <div className="p-4 border-t border-white/[0.06] bg-slate-950/40">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-white/[0.05]">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Srishti LifeFlow</p>
                <p className="text-[10px] text-slate-400">Telemetry Active</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
