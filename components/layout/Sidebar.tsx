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
  Download,
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
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: 'Donors', href: '/admin/donors', icon: <Users className="w-5 h-5" /> },
          { label: 'Blood Stock', href: '/admin/blood-stock', icon: <Droplets className="w-5 h-5" /> },
          { label: 'Requests', href: '/admin/requests', icon: <FileText className="w-5 h-5" /> },
          { label: 'Hospitals', href: '/admin/hospitals', icon: <Building2 className="w-5 h-5" /> },
          { label: 'Reports', href: '/admin/reports', icon: <BarChart3 className="w-5 h-5" /> },
          { label: 'Users', href: '/admin/users', icon: <UserCheck className="w-5 h-5" /> },
        ];
      case 'hospital':
        return [
          { label: 'Dashboard', href: '/hospital', icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: 'New Request', href: '/hospital/new-request', icon: <ClipboardList className="w-5 h-5" /> },
          { label: 'My Requests', href: '/hospital/requests', icon: <FileText className="w-5 h-5" /> },
          { label: 'Blood Availability', href: '/hospital/availability', icon: <Package className="w-5 h-5" /> },
        ];
      case 'donor':
      default:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { label: 'Book Donation', href: '/dashboard/appointments', icon: <CalendarCheck className="w-5 h-5" /> },
          { label: 'My Donations', href: '/dashboard/donations', icon: <Heart className="w-5 h-5" /> },
          { label: 'Blood Requests', href: '/dashboard/requests', icon: <FileText className="w-5 h-5" /> },
          { label: 'Certificates', href: '/dashboard/certificates', icon: <Award className="w-5 h-5" /> },
          { label: 'Profile', href: '/dashboard/profile', icon: <Settings className="w-5 h-5" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 pt-16 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button (mobile) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={isActive ? 'text-red-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Droplets className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">Srishti Blood Bank</p>
              <p className="text-xs text-gray-500">v2.0.0 Enterprise</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
