'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Droplets,
  ArrowRight,
  Menu,
  X,
  Clock,
  FlaskConical,
  Activity,
  Building2,
  HelpCircle,
  Phone,
  LayoutDashboard,
  LogIn,
} from 'lucide-react';
import MagneticButton from '@/components/gsap/MagneticButton';
import { createRipple } from '@/lib/gsap';

export default function PublicNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll effect for dynamic blur/border
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    {
      href: '/#compatibility',
      anchor: 'compatibility',
      label: 'Compatibility Matrix',
      icon: Droplets,
      colorClass: 'text-rose-500',
    },
    {
      href: '/#workflow',
      anchor: 'workflow',
      label: 'How It Works',
      icon: Clock,
      colorClass: 'text-amber-500',
    },
    {
      href: '/#fractionation',
      anchor: 'fractionation',
      label: 'Component Separation',
      icon: FlaskConical,
      colorClass: 'text-sky-500',
    },
    {
      href: '/#calculator',
      anchor: 'calculator',
      label: 'Impact Calculator',
      icon: Activity,
      colorClass: 'text-emerald-500',
    },
    {
      href: '/#portals',
      anchor: 'portals',
      label: 'Portals',
      icon: Building2,
      colorClass: 'text-indigo-500',
    },
    {
      href: '/#faq',
      anchor: 'faq',
      label: 'FAQ',
      icon: HelpCircle,
      colorClass: 'text-slate-500',
    },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    setMobileMenuOpen(false);
    if (pathname === '/') {
      e.preventDefault();
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${anchor}`);
      }
    }
  };

  const portalHref =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'hospital'
      ? '/hospital'
      : '/dashboard';

  const portalLabel =
    user?.role === 'admin'
      ? 'Admin Portal'
      : user?.role === 'hospital'
      ? 'Hospital Portal'
      : 'My Dashboard';

  return (
    <header
      className={`sticky top-0 z-40 px-4 sm:px-6 py-3 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm'
          : 'bg-white/70 backdrop-blur-md border-b border-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
              Srishti <span className="text-rose-600">Blood Bank</span>
            </span>
            <p className="hidden sm:block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Clinical Logistics Hub
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-semibold text-slate-600">
          {navItems.map((item) => (
            <Link
              key={item.anchor}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.anchor)}
              className="hover:text-rose-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action buttons & mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            /* Authenticated User Button */
            <Link
              href={portalHref}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl shadow-sm hover:bg-rose-700 transition-all hover:shadow-rose-600/25 whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              <span>{portalLabel}</span>
            </Link>
          ) : (
            /* Guest / Unauthenticated Buttons */
            <>
              <Link
                href="/auth/login"
                className={`text-xs font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-colors whitespace-nowrap ${
                  pathname === '/auth/login'
                    ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200/80 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sign In
              </Link>
              <div className="hidden sm:block">
                <MagneticButton strength={0.2}>
                  <Link
                    href="/auth/register"
                    onClick={(e) => createRipple(e)}
                    className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap flex-nowrap ${
                      pathname === '/auth/register'
                        ? 'bg-rose-700 text-white ring-2 ring-rose-400/40 shadow-rose-600/30'
                        : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-rose-600/25'
                    }`}
                  >
                    <span>Donate Blood</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </MagneticButton>
              </div>
            </>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-600 transition-all duration-300 rotate-90 scale-100" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 transition-all duration-300 rotate-0 scale-100" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer with smooth opening AND closing animation */}
      <div
        className={`lg:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          mobileMenuOpen
            ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-slate-100 pointer-events-auto'
            : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 pb-3">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.anchor}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.anchor)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${item.colorClass}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <Link
                  href={portalHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap"
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>{portalLabel}</span>
                </Link>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-colors ${
                        pathname === '/auth/login'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200/80 font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5 shrink-0" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  </div>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap flex-nowrap"
                  >
                    <span>Donate Blood / Voluntary Register</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </>
              )}

              <div className="flex items-center justify-center gap-2 py-2 text-[11px] font-semibold text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="w-3 h-3 text-rose-600 shrink-0" />
                <span>
                  24/7 Hotline: <strong>1800-BLOOD-LIFE</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
