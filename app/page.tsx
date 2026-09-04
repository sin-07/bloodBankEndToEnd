'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Droplets,
  Heart,
  Users,
  Building2,
  Shield,
  ArrowRight,
  Activity,
  Clock,
  Award,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Calendar,
  Share2,
  Sliders,
  Zap,
} from 'lucide-react';
import {
  gsap,
  ScrollTrigger,
  splitText,
  createTextReveal,
  createRipple,
} from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import MagneticButton from '@/components/gsap/MagneticButton';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY, BloodGroup } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════════════
   STATIC SHOWCASE DATA
   ════════════════════════════════════════════════════════════ */

const portalRoles = [
  {
    icon: <Users className="w-6 h-6" />,
    role: 'Voluntary Donors',
    title: 'Be Someone’s Hero Today',
    desc: 'Track your donations, monitor real-time eligibility countdowns, and download verified digital certificates in seconds.',
    features: ['Instant health screening check', 'Digital donor pass & history', 'Emergency proximity alerts'],
    badge: 'Save Up to 3 Lives',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    link: '/auth/register',
    btnText: 'Join as a Donor',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    role: 'Hospitals & Trauma Centers',
    title: 'Rapid Emergency Blood Supply',
    desc: 'Issue bulk requests with surgical urgency tagging, track live delivery status, and access verified regional blood reserves.',
    features: ['Priority dispatch under 15 mins', 'Direct inventory reservation', 'Multi-center logistics tracking'],
    badge: '15-Min Response Guarantee',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    link: '/auth/register?role=hospital',
    btnText: 'Register Hospital',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    role: 'Bank Administrators',
    title: 'Mission-Critical Telemetry',
    desc: 'Full cold-chain custody management, inventory expiry tracking, donor matching engine, and automated compliance auditing.',
    features: ['Automated expiry discard alerts', 'City-wide supply balancing', 'Instant one-click XLSX/PDF reports'],
    badge: 'Zero-Waste Protocol',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    link: '/auth/login',
    btnText: 'Admin Terminal',
  },
];

const telemetryStats = [
  { target: 418, suffix: '+', label: 'Units Stocked', desc: 'Tested & ready for immediate dispatch' },
  { target: 99, suffix: '.4%', label: 'Match Accuracy', desc: 'Precise cross-match verification' },
  { target: 14, suffix: ' Min', label: 'Avg Dispatch', desc: 'Rapid trauma response delivery' },
  { target: 12000, suffix: '+', label: 'Lives Impacted', desc: 'Across partner hospitals nationwide' },
];

const workflowSteps = [
  {
    num: '01',
    title: 'One-Click Registration',
    desc: 'Register as a donor or hospital in under 60 seconds with verified mobile authorization.',
    icon: <Users className="w-5 h-5 text-rose-400" />,
  },
  {
    num: '02',
    title: 'Automated Screening',
    desc: 'Smart algorithmic eligibility screening checks donation intervals, vitals, and health indicators.',
    icon: <Activity className="w-5 h-5 text-sky-400" />,
  },
  {
    num: '03',
    title: 'Cold-Chain Donation',
    desc: 'Donate at certified collection hubs with temperature-controlled real-time custody logging.',
    icon: <Droplets className="w-5 h-5 text-rose-500" />,
  },
  {
    num: '04',
    title: 'Emergency Life Delivery',
    desc: 'Units are matched to critical trauma cases, saving lives while you receive impact updates.',
    icon: <Award className="w-5 h-5 text-emerald-400" />,
  },
];

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Compatibility Explorer State
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');

  // Impact Calculator State
  const [annualDonations, setAnnualDonations] = useState<number>(2);

  // Navbar scroll blur effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     GSAP ANIMATION SEQUENCES
     ═══════════════════════════════════════════════════════════ */
  useGSAP(
    () => {
      // 1. Hero text reveal
      const heroTl = gsap.timeline();
      heroTl.from('.hero-badge', { y: -20, opacity: 0, duration: 0.6, ease: 'power3.out' });

      const heroLine1 = document.querySelector('.hero-title-1') as HTMLElement;
      const heroLine2 = document.querySelector('.hero-title-2') as HTMLElement;

      if (heroLine1 && heroLine2) {
        const c1 = splitText(heroLine1);
        const c2 = splitText(heroLine2);
        heroTl.add(createTextReveal(c1, { stagger: 0.02, y: 40, duration: 0.6 }), '-=0.3');
        heroTl.add(createTextReveal(c2, { stagger: 0.02, y: 40, duration: 0.6 }), '-=0.4');
      }

      heroTl.from(
        '.hero-subtext',
        { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.2'
      );
      heroTl.from(
        '.hero-cta-group > *',
        { y: 25, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'back.out(1.5)' },
        '-=0.4'
      );
      heroTl.from(
        '.hero-floating-card',
        { scale: 0.92, opacity: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      );

      // 2. Animated Stats Counters
      const statElements = document.querySelectorAll('.stat-number');
      statElements.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = suffix.includes('.');

        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = isDecimal
                  ? obj.val.toFixed(1) + suffix
                  : Math.floor(obj.val).toLocaleString() + suffix;
              },
            });
          },
        });
      });

      // 3. Workflow Steps Stagger
      gsap.from('.workflow-card', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.workflow-container',
          start: 'top 75%',
          once: true,
        },
      });

      // 4. Role cards parallax reveal
      gsap.from('.portal-card', {
        y: 45,
        opacity: 0,
        stagger: 0.18,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.portal-container',
          start: 'top 75%',
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  // Interactive 3D tilt handler
  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const rotY = ((e.clientX - r.left) / r.width - 0.5) * 12;
    const rotX = ((e.clientY - r.top) / r.height - 0.5) * -12;
    gsap.to(el, {
      rotateY: rotY,
      rotateX: rotX,
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 900,
    });
  }, []);

  const handleTiltLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
      transformPerspective: 900,
    });
  }, []);

  const selectedCompat =
    BLOOD_COMPATIBILITY[selectedGroup as keyof typeof BLOOD_COMPATIBILITY] ||
    BLOOD_COMPATIBILITY['O-'];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-500/20 selection:text-rose-700 overflow-x-hidden">
      
      {/* ░░░░░░ TOP EMERGENCY TICKER RIBBON ░░░░░░ */}
      <div className="bg-slate-900 border-b border-slate-800 py-1.5 px-4 overflow-hidden relative z-50 text-xs text-slate-300">
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            Live Network Dispatch
          </span>
          <span>🚨 Urgent: O- (Universal Donor) stock required at Apollo Hospital Mumbai</span>
          <span className="text-slate-600">•</span>
          <span>🩸 418 units tested and ready across regional cold-chain storage</span>
          <span className="text-slate-600">•</span>
          <span>🏥 Lilavati & Fortis Memorial online — 100% telemetry verified</span>
          <span className="text-slate-600">•</span>
          <span>❤️ Voluntary donation drive active this weekend — Reserve your slot</span>
        </div>
      </div>

      {/* ░░░░░░ FLOATING GLASS NAVBAR ░░░░░░ */}
      <header
        className={`sticky top-0 z-40 px-6 py-4 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-2xl border-b border-slate-200/80 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 flex items-center justify-center shadow-md shadow-rose-600/25 group-hover:scale-105 transition-all">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                Srishti <span className="text-rose-600">Blood Bank</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                End-to-End Life Network
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-slate-600">
            <a href="#compatibility" className="hover:text-rose-600 transition-colors">Compatibility Matrix</a>
            <a href="#telemetry" className="hover:text-rose-600 transition-colors">Live Telemetry</a>
            <a href="#workflow" className="hover:text-rose-600 transition-colors">How It Works</a>
            <a href="#calculator" className="hover:text-rose-600 transition-colors">Impact Calculator</a>
            <a href="#portals" className="hover:text-rose-600 transition-colors">Portals</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <MagneticButton strength={0.25}>
              <Link
                href="/auth/register"
                onClick={(e) => createRipple(e)}
                className="relative inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 rounded-xl shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Donate Blood</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ░░░░░░ HERO SECTION ░░░░░░ */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center pt-8 pb-20 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rose-500/[0.08] rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-red-400/[0.05] rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-7">
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-spin-slow" />
                <span>India’s Next-Gen Autonomous Blood Dispatch Lifeline</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight text-slate-900">
                <span className="hero-title-1 block overflow-hidden">Every Drop Counts.</span>
                <span className="hero-title-2 block overflow-hidden bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 bg-clip-text text-transparent animate-text-shimmer">
                  Every Second Saves.
                </span>
              </h1>

              <p className="hero-subtext text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                Connect voluntary donors, partner hospitals, and emergency trauma centers through instant compatibility matching, real-time cold-chain tracking, and zero-delay automated dispatch.
              </p>

              {/* Action Buttons */}
              <div className="hero-cta-group flex flex-wrap items-center gap-4 pt-2">
                <MagneticButton strength={0.3}>
                  <Link
                    href="/auth/register"
                    onClick={(e) => createRipple(e)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-600/25 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Register as Donor</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagneticButton>

                <MagneticButton strength={0.2}>
                  <Link
                    href="#compatibility"
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-white text-slate-700 border border-slate-200/80 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-sm"
                  >
                    <span>Test Blood Compatibility</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </MagneticButton>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">NABH & CDSCO Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span className="font-medium">100% Verified Centers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span className="font-medium">Cold-Chain Custody</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Card */}
            <div className="lg:col-span-5">
              <div
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="hero-floating-card relative rounded-3xl bg-white border border-slate-200/80 p-7 shadow-2xl overflow-hidden shine-effect"
              >
                {/* Background Accent Pill */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Live Central Reserve</h4>
                      <p className="text-[11px] text-slate-500">Cold-chain units ready</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Operational
                  </span>
                </div>

                {/* Quick Stock Mini-Grid */}
                <div className="grid grid-cols-4 gap-3 py-6">
                  {BLOOD_GROUPS.map((bg) => (
                    <div
                      key={bg}
                      onClick={() => setSelectedGroup(bg)}
                      className={`cursor-pointer rounded-xl p-3 text-center transition-all duration-200 border ${
                        selectedGroup === bg
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/25 scale-105'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50'
                      }`}
                    >
                      <p className="text-xs font-extrabold font-heading">{bg}</p>
                      <span className="text-[10px] opacity-75">Reserve</span>
                    </div>
                  ))}
                </div>

                {/* Selected Group Quick Insight */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-700">Selected Type: {selectedGroup}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      {selectedCompat.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {selectedCompat.description}
                  </p>
                </div>

                {/* Card Footer Call */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>Emergency Hotline: <strong className="text-slate-900">1800-BLOOD-LIFE</strong></span>
                  </div>
                  <Link
                    href="/auth/register?role=hospital"
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    Hospital Login <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ░░░░░░ LIVE TELEMETRY STATS SECTION ░░░░░░ */}
      <section id="telemetry" ref={statsRef} className="py-16 border-y border-slate-200/80 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {telemetryStats.map((stat, i) => (
              <div key={i} className="text-center md:text-left space-y-1">
                <p
                  className="stat-number text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight"
                  data-target={stat.target}
                  data-suffix={stat.suffix}
                >
                  0{stat.suffix}
                </p>
                <p className="text-xs sm:text-sm font-bold text-rose-600 tracking-wide uppercase">
                  {stat.label}
                </p>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░░░░ INTERACTIVE BLOOD COMPATIBILITY EXPLORER ░░░░░░ */}
      <section id="compatibility" className="py-24 relative overflow-hidden bg-slate-50/70">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-rose-500/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              Clinical Transfusion Intelligence
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Interactive Compatibility Matrix
            </h2>
            <p className="text-sm text-slate-600">
              Click on any blood type to explore real-time compatibility for donation and reception.
            </p>
          </div>

          {/* Blood Group Selectors */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {BLOOD_GROUPS.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-5 py-3 rounded-2xl font-heading font-extrabold text-base transition-all duration-300 border ${
                  selectedGroup === group
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-600 shadow-lg shadow-rose-600/30 scale-110'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50 shadow-sm'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Compatibility Display Panel */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selected Blood Type</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-0.5 flex items-center gap-3">
                  <span>Group {selectedGroup}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                    {selectedCompat.title}
                  </span>
                </h3>
              </div>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                Register as {selectedGroup} Donor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Two Column Grid: Can Donate To / Can Receive From */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Can Give Blood To */}
              <div className="p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4>Can Give Blood To ({selectedCompat.give.length} groups)</h4>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {BLOOD_GROUPS.map((bg) => {
                    const isCompatible = selectedCompat.give.includes(bg);
                    return (
                      <div
                        key={bg}
                        className={`p-3 rounded-xl text-center border font-heading font-extrabold text-xs transition-all ${
                          isCompatible
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                            : 'bg-slate-100/70 border-slate-200/60 text-slate-400 opacity-50'
                        }`}
                      >
                        {bg}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Can Receive Blood From */}
              <div className="p-6 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-4">
                <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-sky-600" />
                  <h4>Can Receive Blood From ({selectedCompat.receive.length} groups)</h4>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {BLOOD_GROUPS.map((bg) => {
                    const isCompatible = selectedCompat.receive.includes(bg);
                    return (
                      <div
                        key={bg}
                        className={`p-3 rounded-xl text-center border font-heading font-extrabold text-xs transition-all ${
                          isCompatible
                            ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-sm'
                            : 'bg-slate-100/70 border-slate-200/60 text-slate-400 opacity-50'
                        }`}
                      >
                        {bg}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Medical Context Banner */}
            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {selectedCompat.description} Whole blood can be safely separated into Packed Red Blood Cells (RBCs), Platelets, and Plasma, multiplying the number of patient lives saved from a single donation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ░░░░░░ DONATION IMPACT CALCULATOR ░░░░░░ */}
      <section id="calculator" className="py-24 border-t border-slate-200/80 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-sm">
                Live Impact Engine
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                Calculate Your Life Impact
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Voluntary blood donors can safely donate every 90 days. Slide to discover how many patients, surgeries, and cancer treatments your contribution directly supports over a single year.
              </p>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Annual Donation Frequency</span>
                  <span className="text-rose-600 text-sm font-extrabold">{annualDonations} times / year</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={annualDonations}
                  onChange={(e) => setAnnualDonations(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold px-1">
                  <span>1x (Starter)</span>
                  <span>2x (Regular)</span>
                  <span>3x (Hero)</span>
                  <span>4x (Max Champion)</span>
                </div>
              </div>
            </div>

            {/* Impact Calculation Results Pod */}
            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-3 gap-6">
                
                <div className="p-6 rounded-3xl bg-white border border-rose-200/80 text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                    <Heart className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-4xl font-extrabold text-slate-900 font-heading">
                    {annualDonations * 3}
                  </p>
                  <p className="text-xs font-bold uppercase text-rose-600">Potential Lives Saved</p>
                  <p className="text-[11px] text-slate-500">3 patient components per unit donated</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-sky-200/80 text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-sm">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <p className="text-4xl font-extrabold text-slate-900 font-heading">
                    {annualDonations * 450} <span className="text-lg">ml</span>
                  </p>
                  <p className="text-xs font-bold uppercase text-sky-600">Blood Volume Contributed</p>
                  <p className="text-[11px] text-slate-500">Restored by body within 24–48 hours</p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-emerald-200/80 text-center space-y-2 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                    <Award className="w-6 h-6" />
                  </div>
                  <p className="text-xl font-extrabold text-slate-900 font-heading pt-2 truncate">
                    {annualDonations === 1 && 'Silver Badge'}
                    {annualDonations === 2 && 'Gold Guardian'}
                    {annualDonations === 3 && 'Platinum Hero'}
                    {annualDonations >= 4 && 'Diamond Champion'}
                  </p>
                  <p className="text-xs font-bold uppercase text-emerald-600">Donor Honor Tier</p>
                  <p className="text-[11px] text-slate-500">Digital NFT-ready certificates issued</p>
                </div>

              </div>

              <div className="mt-8 text-center sm:text-right">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
                >
                  <span>Start Your Lifesaving Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ░░░░░░ HOW IT WORKS SECTION ░░░░░░ */}
      <section id="workflow" className="py-24 relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              Seamless 4-Step Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              How Srishti Saves Lives
            </h2>
            <p className="text-sm text-slate-600">
              A transparent, zero-delay loop connecting donors, testing laboratories, and acute care wards.
            </p>
          </div>

          <div className="workflow-container grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div
                key={i}
                className="workflow-card relative p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-rose-300 shadow-sm hover:shadow-card-hover transition-all group"
              >
                <span className="text-4xl font-black text-slate-200 font-heading group-hover:text-rose-200 transition-colors">
                  {step.num}
                </span>
                <div className="mt-4 mb-3">{step.icon}</div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░░░░ PORTAL CARDS (Donors, Hospitals, Admins) ░░░░░░ */}
      <section id="portals" className="py-24 border-t border-slate-200/80 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              Integrated Ecosystem
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Tailored Portals for Every Role
            </h2>
            <p className="text-sm text-slate-600">
              Purpose-built experiences engineered for speed, reliability, and precision healthcare.
            </p>
          </div>

          <div className="portal-container grid lg:grid-cols-3 gap-8">
            {portalRoles.map((p, i) => (
              <div
                key={i}
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="portal-card relative rounded-3xl bg-white border border-slate-200/80 p-8 flex flex-col justify-between hover:border-rose-300 shadow-md hover:shadow-2xl transition-all"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                      {p.icon}
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      {p.role}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100">
                    {p.features.map((feat, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href={p.link}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-sm group"
                  >
                    <span>{p.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░░░░ FINAL CALL TO ACTION ░░░░░░ */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold border border-white/25">
              <Heart className="w-3.5 h-3.5 text-white animate-pulse" />
              <span>Join 5,000+ Voluntary Donors Saving Lives Today</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight max-w-2xl mx-auto">
              Ready to Give the Gift of Life?
            </h2>

            <p className="text-sm sm:text-base text-rose-100 max-w-xl mx-auto leading-relaxed">
              Every voluntary donation can save up to 3 lives. Sign up in seconds, locate certified donation centers near you, and track your ongoing clinical impact.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={0.3}>
                <Link
                  href="/auth/register"
                  onClick={(e) => createRipple(e)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-rose-700 font-extrabold text-sm rounded-2xl shadow-xl hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Register as Donor Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-black/20 border border-white/20 text-white hover:bg-black/30 transition-all font-bold text-sm"
                >
                  <span>Sign In to Portal</span>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ░░░░░░ ELEVATED FOOTER ░░░░░░ */}
      <footer className="bg-slate-950 border-t border-white/[0.08] text-slate-400 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.06]">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-glow-sm">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  Srishti <span className="text-rose-500">Blood Bank</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                A state-of-the-art transfusion management platform dedicated to zero-waste blood distribution, emergency logistics, and donor care.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Central Telemetry Active (65ms latency)</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Quick Access</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/login" className="hover:text-rose-400 transition-colors">Sign In to Dashboard</Link></li>
                <li><Link href="/auth/register" className="hover:text-rose-400 transition-colors">Donor Onboarding</Link></li>
                <li><Link href="/auth/register?role=hospital" className="hover:text-rose-400 transition-colors">Hospital Partner Access</Link></li>
                <li><a href="#compatibility" className="hover:text-rose-400 transition-colors">Blood Group Matrix</a></li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Emergency Contacts</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-rose-400" /> 24/7 Hotline: 1800-BLOOD-LIFE</li>
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-rose-400" /> contact@srishtibloodbank.org</li>
                <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-rose-400" /> Central Bank HQ, Mumbai, India</li>
              </ul>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Compliance & Standards</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Operating in strict compliance with the National Blood Transfusion Council (NBTC) guidelines, ensuring 100% nucleic acid testing (NAT) tested blood units.
              </p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Srishti Blood Bank. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
