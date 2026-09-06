'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Droplets, Bell, LogOut, User as UserIcon, Menu, ShieldCheck, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { gsap } from '@/lib/gsap';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        closeUserMenu();
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        closeNotif();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openUserMenu = () => {
    setShowDropdown(true);
    if (chevronRef.current) {
      gsap.to(chevronRef.current, { rotate: 180, duration: 0.25, ease: 'power2.out' });
    }
    requestAnimationFrame(() => {
      if (userMenuRef.current) {
        gsap.fromTo(
          userMenuRef.current,
          { opacity: 0, y: -8, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
        );
        const items = userMenuRef.current.querySelectorAll('.gsap-user-item');
        if (items.length > 0) {
          gsap.fromTo(
            items,
            { opacity: 0, x: -6 },
            { opacity: 1, x: 0, duration: 0.2, stagger: 0.035, ease: 'power2.out', delay: 0.03 }
          );
        }
      }
    });
  };

  const closeUserMenu = () => {
    if (!userMenuRef.current) {
      setShowDropdown(false);
      if (chevronRef.current) gsap.to(chevronRef.current, { rotate: 0, duration: 0.2 });
      return;
    }
    if (chevronRef.current) gsap.to(chevronRef.current, { rotate: 0, duration: 0.2 });
    gsap.to(userMenuRef.current, {
      opacity: 0,
      y: -6,
      scale: 0.98,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => setShowDropdown(false),
    });
  };

  const toggleUserMenu = () => {
    if (showDropdown) {
      closeUserMenu();
    } else {
      if (showNotif) closeNotif();
      openUserMenu();
    }
  };

  const openNotif = () => {
    setShowNotif(true);
    requestAnimationFrame(() => {
      if (notifMenuRef.current) {
        gsap.fromTo(
          notifMenuRef.current,
          { opacity: 0, y: -8, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
        );
        const items = notifMenuRef.current.querySelectorAll('.gsap-notif-item');
        if (items.length > 0) {
          gsap.fromTo(
            items,
            { opacity: 0, x: -6 },
            { opacity: 1, x: 0, duration: 0.2, stagger: 0.035, ease: 'power2.out', delay: 0.03 }
          );
        }
      }
    });
  };

  const closeNotif = () => {
    if (!notifMenuRef.current) {
      setShowNotif(false);
      return;
    }
    gsap.to(notifMenuRef.current, {
      opacity: 0,
      y: -6,
      scale: 0.98,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => setShowNotif(false),
    });
  };

  const toggleNotif = () => {
    if (showNotif) {
      closeNotif();
    } else {
      if (showDropdown) closeUserMenu();
      openNotif();
    }
  };

  const handleItemHover = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { x: 3, duration: 0.2, ease: 'power2.out' });
  };

  const handleItemLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { x: 0, duration: 0.2, ease: 'power2.out' });
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 px-4 lg:px-6 py-3 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors whitespace-nowrap">
                Srishti <span className="text-rose-600 font-extrabold">Blood Bank</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-0.5">
                LifeFlow Network
              </span>
            </div>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* GSAP-Animated Notification Bell & Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className={`relative p-2 sm:p-2.5 rounded-xl transition-all ${
                    showNotif
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </button>

                {showNotif && (
                  <div
                    ref={notifMenuRef}
                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-gradient-to-b from-rose-50/80 via-white/95 to-white/95 backdrop-blur-xl border border-rose-100/90 py-3 z-50 shadow-2xl overflow-hidden"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Ambient Reddish Glow */}
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-500/[0.08] rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                      <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 tracking-tight font-heading">
                            Clinical Alerts & Updates
                          </h4>
                          <p className="text-[10px] text-slate-500">Live Transfusion Telemetry</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          2 New
                        </span>
                      </div>

                      <div className="p-2 space-y-1.5 max-h-64 overflow-y-auto">
                        <div
                          onMouseEnter={handleItemHover}
                          onMouseLeave={handleItemLeave}
                          className="gsap-notif-item p-2.5 rounded-xl bg-white/80 border border-rose-100/80 hover:bg-white hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                              <Droplets className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                Urgent Request: O- Negative
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                Trauma unit dispatch active at Central Blood Centre.
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> 12m ago
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          onMouseEnter={handleItemHover}
                          onMouseLeave={handleItemLeave}
                          className="gsap-notif-item p-2.5 rounded-xl bg-white/80 border border-slate-100 hover:bg-white hover:border-slate-200 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                100% NAT Testing Verified
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                All platelet concentrates certified pathogen-free.
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> 1h ago
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GSAP-Animated User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleUserMenu}
                  className={`flex items-center gap-2 sm:gap-2.5 p-1.5 pr-2 sm:pr-3 rounded-2xl transition-all text-left border ${
                    showDropdown
                      ? 'border-rose-300 ring-2 ring-rose-500/20 bg-white shadow-xs'
                      : 'hover:bg-slate-100/80 border-slate-200 bg-white/50'
                  }`}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown
                    ref={chevronRef}
                    className={`w-3.5 h-3.5 transition-colors ${
                      showDropdown ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                </button>

                {showDropdown && (
                  <div
                    ref={userMenuRef}
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-gradient-to-b from-rose-50/80 via-white/95 to-white/95 backdrop-blur-xl border border-rose-100/90 py-2 z-50 shadow-2xl overflow-hidden"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Ambient Reddish Glow */}
                    <div className="absolute -top-10 -right-10 w-36 h-36 bg-rose-500/[0.08] rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                      <div className="px-4 py-2.5 border-b border-slate-100/80 bg-white/40">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <Link
                          href={`/${user.role === 'admin' ? 'admin' : user.role === 'hospital' ? 'hospital' : 'dashboard'}`}
                          role="menuitem"
                          className="gsap-user-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                          onClick={closeUserMenu}
                          onMouseEnter={handleItemHover}
                          onMouseLeave={handleItemLeave}
                        >
                          <ShieldCheck className="w-4 h-4 text-rose-600" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          href="/dashboard/profile"
                          role="menuitem"
                          className="gsap-user-item flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                          onClick={closeUserMenu}
                          onMouseEnter={handleItemHover}
                          onMouseLeave={handleItemLeave}
                        >
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          <span>Profile Settings</span>
                        </Link>
                      </div>

                      <div className="my-1 border-t border-slate-100" />

                      <div className="p-1">
                        <button
                          role="menuitem"
                          onClick={() => {
                            closeUserMenu();
                            logout();
                          }}
                          onMouseEnter={handleItemHover}
                          onMouseLeave={handleItemLeave}
                          className="gsap-user-item w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-md shadow-rose-600/20 transition-all"
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
