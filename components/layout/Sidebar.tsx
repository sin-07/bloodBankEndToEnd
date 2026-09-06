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
  const { user } = useAuth();
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand & close on mobile */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-600/20">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-tight">
                Srishti <span className="text-rose-600">Blood Bank</span>
              </p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {user?.role ? `${user.role} workspace` : 'Platform'}
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/80 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-rose-600'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
