'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Droplets, Bell, LogOut, User as UserIcon, Menu, ShieldCheck, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-glow-sm group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors">
                Srishti <span className="text-rose-500 font-extrabold">Blood Bank</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-0.5">
                LifeFlow Network
              </span>
            </div>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live Network Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Network Live</span>
          </div>

          {user ? (
            <>
              {/* Notification Bell */}
              <button
                className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-800/80 transition-colors text-left border border-white/[0.06]"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-card-elevated border border-slate-700/60 py-1.5 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-700/50">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={`/${user.role === 'admin' ? 'admin' : user.role === 'hospital' ? 'hospital' : 'dashboard'}`}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      Dashboard
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile Settings
                    </Link>

                    <div className="my-1 border-t border-slate-700/50" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-glow-sm transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
