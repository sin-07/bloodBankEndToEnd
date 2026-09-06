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
  Zap,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Flame,
  Layers,
  Thermometer,
  RotateCcw,
  FlaskConical,
  Menu,
  X,
} from 'lucide-react';
import {
  gsap,
  ScrollTrigger,
  createRipple,
} from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import MagneticButton from '@/components/gsap/MagneticButton';
import {
  BLOOD_GROUPS,
  BLOOD_COMPATIBILITY,
  PLASMA_COMPATIBILITY,
  COMPONENT_DETAILS,
  BloodGroup,
} from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════════════
   STATIC SHOWCASE DATA
   ════════════════════════════════════════════════════════════ */

const portalRoles = [
  {
    icon: <Users className="w-6 h-6 text-rose-600" />,
    role: 'Voluntary Donors',
    title: 'Be Someone’s Lifeline',
    desc: 'Track donations, monitor real-time eligibility countdowns, and download verified digital certificates in seconds.',
    features: [
      'Instant health & interval screening',
      'Digital donor ID card & certificate',
      'Emergency nearby trauma alerts',
      'Gamified donor tier recognition',
    ],
    badge: 'Save Up to 3 Lives',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    link: '/auth/register',
    btnText: 'Register as Donor',
    btnClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
  },
  {
    icon: <Building2 className="w-6 h-6 text-sky-600" />,
    role: 'Hospitals & Trauma Centers',
    title: 'Rapid Emergency Supply',
    desc: 'Issue bulk requests with surgical urgency tagging, track live cold-chain transit, and reserve certified blood units.',
    features: [
      'Priority dispatch under 15 minutes',
      'Direct cross-match reservation',
      'Multi-patient batch requisitions',
      'Real-time transit temperature logs',
    ],
    badge: '15-Min Response Guarantee',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    link: '/auth/register?role=hospital',
    btnText: 'Register Hospital',
    btnClass: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20',
  },
  {
    icon: <Shield className="w-6 h-6 text-emerald-600" />,
    role: 'Bank Administrators',
    title: 'Mission-Critical Telemetry',
    desc: 'Full cold-chain custody management, inventory expiry tracking, donor matching engine, and automated compliance auditing.',
    features: [
      'Automated expiry discard alerts',
      'City-wide regional stock balancing',
      'Instant one-click XLSX/PDF reports',
      'Hospital accreditation control',
    ],
    badge: 'Zero-Waste Protocol',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    link: '/auth/login',
    btnText: 'Admin Terminal',
    btnClass: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20',
  },
];

const telemetryStats = [
  {
    target: 418,
    suffix: '+',
    label: 'Units in Cold Storage',
    desc: 'NAT-tested and ready for immediate emergency dispatch',
    trend: '+18% this month',
    icon: <Droplets className="w-5 h-5 text-rose-600" />,
  },
  {
    target: 99.4,
    suffix: '%',
    label: 'Match Precision',
    desc: 'Multi-parameter ABO and Rh compatibility validation',
    trend: 'Certified Accuracy',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  },
  {
    target: 14,
    suffix: ' Min',
    label: 'Avg Response Time',
    desc: 'From triage request submission to dispatch confirmation',
    trend: 'Sub-15m Protocol',
    icon: <Zap className="w-5 h-5 text-amber-600" />,
  },
  {
    target: 12500,
    suffix: '+',
    label: 'Transfusions Enabled',
    desc: 'Direct patient interventions across partner healthcare wards',
    trend: 'Continuous Impact',
    icon: <Heart className="w-5 h-5 text-rose-600" />,
  },
];

const workflowSteps = [
  {
    num: '01',
    title: 'One-Click Onboarding',
    desc: 'Register as a voluntary donor or accredited medical facility with verified credentials in under 60 seconds.',
    tag: '< 60 Seconds',
    icon: <Users className="w-6 h-6 text-rose-600" />,
  },
  {
    num: '02',
    title: 'Algorithmic Screening',
    desc: 'Smart medical interval calculator cross-verifies vitals, hemoglobin levels, and safety recovery periods.',
    tag: 'Instant Clearance',
    icon: <Activity className="w-6 h-6 text-sky-600" />,
  },
  {
    num: '03',
    title: 'Cold-Chain Processing',
    desc: 'Donations are collected in sterile hubs and fractionated into RBCs, Plasma, and Platelets under constant 4°C custody.',
    tag: '2-6°C Monitored',
    icon: <Droplets className="w-6 h-6 text-rose-600" />,
  },
  {
    num: '04',
    title: 'Emergency Life Delivery',
    desc: 'Critical requisitions trigger automated proximity matching, dispatching life-saving units directly to trauma surgery wards.',
    tag: 'Zero-Delay Dispatch',
    icon: <Award className="w-6 h-6 text-emerald-600" />,
  },
];

const faqs = [
  {
    q: 'What is the difference between Whole Blood, Platelet Apheresis, and Plasma donation?',
    a: 'In a traditional whole blood donation, all blood components are collected together and later separated in our laboratory. In apheresis (SDP / Plasma), an automated cell separator collects only platelets or plasma while returning red blood cells back to your body. This allows platelet donors to donate every 15 days and plasma donors every 28 days!',
  },
  {
    q: 'Why are Platelets (SDP) so critically needed during Dengue and Chemotherapy?',
    a: 'Platelets have a very short lifespan of only 5 days at 20–24°C under continuous agitation. A single donor platelet (SDP) apheresis collection provides the equivalent of 6 to 8 random donor platelet units, instantly stabilizing patients with critical bleeding risk.',
  },
  {
    q: 'Why is the AB blood group called the "Universal Plasma Donor"?',
    a: 'While O- is the universal donor for Red Blood Cells, the rule is inverted for plasma! AB plasma contains neither anti-A nor anti-B antibodies, making AB+ and AB- plasma 100% universally safe to transfuse into ANY recipient in burn units, trauma surgery, and pediatric emergency care.',
  },
  {
    q: 'Who is eligible to donate blood and platelets?',
    a: 'Any healthy individual between 18 and 65 years of age weighing at least 45 kg with normal blood pressure and hemoglobin above 12.5 g/dL can donate. For Platelet Apheresis, donors should have a healthy platelet count above 1.5 lakh and have not taken aspirin within 48 hours.',
  },
  {
    q: 'How often can I donate blood?',
    a: 'Men can donate whole blood every 90 days, and women every 120 days. Platelet apheresis can be performed every 15 days (up to 24 times/year) because your body replenishes platelets within 48 to 72 hours.',
  },
  {
    q: 'How fast are emergency blood requisitions fulfilled?',
    a: 'For registered partner hospitals, critical emergency requisitions are prioritized by our algorithmic triage engine and dispatched in under 15 minutes with verified cold-chain tracking.',
  },
];

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [compatType, setCompatType] = useState<'rbc' | 'plasma'>('rbc');
  const [calculatorType, setCalculatorType] = useState<'whole_blood' | 'platelets' | 'plasma'>('whole_blood');
  const [annualDonations, setAnnualDonations] = useState<number>(2);
  const [selectedComponentTab, setSelectedComponentTab] = useState<string>('platelets');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navbar scroll blur effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     RELIABLE GSAP ANIMATION SEQUENCES (NO OPACITY: 0 TRAPS)
     ═══════════════════════════════════════════════════════════ */
  useGSAP(
    () => {
      // 1. Hero entrance with safe opacity defaults
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.hero-badge', { y: -15, opacity: 0, duration: 0.5 })
        .from('.hero-headline', { y: 25, opacity: 0, duration: 0.7 }, '-=0.3')
        .from('.hero-subtext', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-cta-group > *', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')
        .from('.hero-floating-card', { scale: 0.95, opacity: 0, duration: 0.7 }, '-=0.4');

      // 2. Animated Stats Counters
      const statElements = document.querySelectorAll('.stat-number');
      statElements.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = suffix.includes('.');

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: target,
              duration: 1.8,
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

      // Refresh ScrollTrigger after DOM has fully settled
      ScrollTrigger.refresh();
    },
    { scope: containerRef }
  );

  // 3D card tilt effect
  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const rotY = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const rotX = ((e.clientY - r.top) / r.height - 0.5) * -8;
    gsap.to(el, {
      rotateY: rotY,
      rotateX: rotX,
      scale: 1.015,
      duration: 0.25,
      ease: 'power2.out',
      transformPerspective: 800,
    });
  }, []);

  const handleTiltLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 800,
    });
  }, []);

  const selectedCompat =
    BLOOD_COMPATIBILITY[selectedGroup as keyof typeof BLOOD_COMPATIBILITY] ||
    BLOOD_COMPATIBILITY['O-'];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-rose-50/70 via-slate-50/70 to-slate-50 text-slate-900 selection:bg-rose-500/20 selection:text-rose-700 overflow-x-hidden font-sans relative"
    >
      {/* ░░░░░░ AMBIENT REDDISH CORNER & TOP GRADIENTS ░░░░░░ */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-rose-500/[0.16] via-rose-400/[0.08] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-rose-400/[0.14] via-rose-300/[0.06] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 -left-28 w-[600px] h-[600px] bg-gradient-to-br from-rose-500/[0.11] via-red-400/[0.05] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-40 -right-20 w-[600px] h-[600px] bg-gradient-to-tl from-rose-400/[0.07] via-rose-300/[0.03] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ░░░░░░ TOP EMERGENCY TELEMETRY TICKER ░░░░░░ */}
      <div className="bg-slate-900 border-b border-slate-800 py-2 px-4 relative z-50 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold overflow-hidden">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0">
              Lifeline:
            </span>
            <span className="text-slate-200 text-[11px] sm:text-xs truncate">
              Trauma units active across Mumbai, Pune & Western Maharashtra
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-[11px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-rose-400" /> Emergency Hotline:{' '}
              <strong className="text-white">1800-BLOOD-LIFE</strong>
            </span>
            <span className="text-slate-700">&bull;</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% NAT Tested
            </span>
          </div>
        </div>
      </div>

      {/* ░░░░░░ STICKY NAVBAR ░░░░░░ */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-6 py-3 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm'
            : 'bg-white/70 backdrop-blur-md border-b border-slate-200/50'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            <a href="#compatibility" className="hover:text-rose-600 transition-colors">
              Compatibility Matrix
            </a>
            <a href="#workflow" className="hover:text-rose-600 transition-colors">
              How It Works
            </a>
            <a href="#fractionation" className="hover:text-rose-600 transition-colors">
              Component Separation
            </a>
            <a href="#calculator" className="hover:text-rose-600 transition-colors">
              Impact Calculator
            </a>
            <a href="#portals" className="hover:text-rose-600 transition-colors">
              Portals
            </a>
            <a href="#faq" className="hover:text-rose-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action buttons & mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <div className="hidden sm:block">
              <MagneticButton strength={0.2}>
                <Link
                  href="/auth/register"
                  onClick={(e) => createRipple(e)}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl shadow-sm hover:bg-rose-700 transition-all hover:shadow-rose-600/25 whitespace-nowrap flex-nowrap"
                >
                  <span>Donate Blood</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              </MagneticButton>
            </div>

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
                {[
                  { href: '#compatibility', label: 'Compatibility Matrix', icon: <Droplets className="w-4 h-4 text-rose-500 shrink-0" /> },
                  { href: '#workflow', label: 'How It Works (4-Step Flow)', icon: <Clock className="w-4 h-4 text-amber-500 shrink-0" /> },
                  { href: '#fractionation', label: 'Component Separation (Platelets & Plasma)', icon: <FlaskConical className="w-4 h-4 text-sky-500 shrink-0" /> },
                  { href: '#calculator', label: 'Impact Calculator', icon: <Activity className="w-4 h-4 text-emerald-500 shrink-0" /> },
                  { href: '#portals', label: 'Hospital & Donor Portals', icon: <Building2 className="w-4 h-4 text-indigo-500 shrink-0" /> },
                  { href: '#faq', label: 'Frequently Asked Questions', icon: <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" /> },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap flex-nowrap"
                >
                  <span>Donate Blood / Register</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
                <div className="flex items-center justify-center gap-2 py-2 text-[11px] font-semibold text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                  <Phone className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>24/7 Hotline: <strong>1800-BLOOD-LIFE</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ░░░░░░ HERO SECTION ░░░░░░ */}
      <section className="relative pt-10 pb-16 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-rose-100/40 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>India’s Next-Gen Autonomous Blood Dispatch Lifeline</span>
              </div>

              {/* Headline without glitchy split-spans */}
              <div className="hero-headline space-y-1">
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                  Every Drop Counts.
                </h1>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 bg-clip-text text-transparent leading-[1.1]">
                  Every Second Saves.
                </h1>
              </div>

              <p className="hero-subtext text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connecting voluntary donors, accredited hospitals, and trauma centers through instant compatibility matching, cold-chain telemetry, and zero-delay emergency dispatch.
              </p>

              {/* Action Buttons */}
              <div className="hero-cta-group flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <Link
                  href="/auth/register"
                  onClick={(e) => createRipple(e)}
                  className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap flex-nowrap"
                >
                  <span>Register as Donor</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Link>

                <Link
                  href="#compatibility"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all font-semibold text-sm whitespace-nowrap flex-nowrap"
                >
                  <span>Test Blood Compatibility</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>NABH & CDSCO Standard</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span>100% Verified Medical Centers</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Zap className="w-4 h-4 text-rose-600" />
                  <span>Cold-Chain Custody</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Stock Telemetry Card */}
            <div className="lg:col-span-5">
              <div
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                className="hero-floating-card rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-card space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Central Reserve Telemetry</h3>
                      <p className="text-[11px] text-slate-500">Live Cold-Chain Inventory Status</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Active
                  </span>
                </div>

                {/* 8 Blood Group Selector Grid */}
                <div className="grid grid-cols-4 gap-2.5">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setSelectedGroup(bg)}
                      className={`py-3 px-2 rounded-xl text-center border transition-all ${
                        selectedGroup === bg
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-rose-50/60 font-bold'
                      }`}
                    >
                      <div className="text-sm">{bg}</div>
                      <div className="text-[10px] opacity-75 font-normal">Select</div>
                    </button>
                  ))}
                </div>

                {/* Selected Type Compatibility Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-700">Group {selectedGroup} Profile</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      {selectedCompat.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {selectedCompat.description}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>Trauma Line: <strong>1800-BLOOD-LIFE</strong></span>
                  </div>
                  <Link
                    href="/auth/register?role=hospital"
                    className="font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                  >
                    Hospital Portal <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ░░░░░░ LIVE TELEMETRY STATS STRIP ░░░░░░ */}
      <section className="py-12 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {telemetryStats.map((stat, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {stat.trend}
                  </span>
                </div>

                <div>
                  <div
                    className="stat-number text-3xl font-black text-slate-900 tracking-tight"
                    data-target={stat.target}
                    data-suffix={stat.suffix}
                  >
                    {stat.target}{stat.suffix}
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">
                    {stat.label}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {stat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░░░░ BLOOD FRACTIONATION: PLATELETS & PLASMA HUB ░░░░░░ */}
      <section id="fractionation" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
              Component Fractionation Science
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Beyond Whole Blood: Platelets & Plasma Lifelines
            </h2>
            <p className="text-sm text-slate-600">
              Modern transfusion medicine separates blood into targeted cellular components. A single donor can power cancer therapy, trauma resuscitation, or severe burn healing.
            </p>
          </div>

          {/* Component Tabs Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center justify-center gap-2.5 mb-8">
            {[
              { id: 'platelets', label: 'Platelets (SDP / Apheresis)', badge: '5-Day Shelf Life', color: 'bg-amber-50 text-amber-800 border-amber-300' },
              { id: 'plasma', label: 'Fresh Frozen Plasma (FFP)', badge: '1-Year Deep Freeze', color: 'bg-sky-50 text-sky-800 border-sky-300' },
              { id: 'whole_blood', label: 'Whole Blood & PRBC', badge: 'Trauma Lifeline', color: 'bg-rose-50 text-rose-800 border-rose-300' },
              { id: 'cryoprecipitate', label: 'Cryoprecipitate (Cryo)', badge: 'Clotting Factors', color: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedComponentTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all border flex items-center justify-between sm:justify-center gap-2 ${
                  selectedComponentTab === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${selectedComponentTab === tab.id ? 'bg-white/20 text-white border-white/30' : tab.color}`}>
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Active Component Deep Dive Card */}
          {COMPONENT_DETAILS[selectedComponentTab] && (
            <div className="rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-10 shadow-sm transition-all">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                {/* Left Specs */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${COMPONENT_DETAILS[selectedComponentTab].badgeBg} ${COMPONENT_DETAILS[selectedComponentTab].badgeBorder} ${COMPONENT_DETAILS[selectedComponentTab].badgeText}`}>
                      {COMPONENT_DETAILS[selectedComponentTab].shortName} Specialization
                    </span>
                    {COMPONENT_DETAILS[selectedComponentTab].universalDonorType && (
                      <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {COMPONENT_DETAILS[selectedComponentTab].universalDonorType}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {COMPONENT_DETAILS[selectedComponentTab].name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {COMPONENT_DETAILS[selectedComponentTab].subtitle}
                    </p>
                  </div>

                  {/* Clinical Indication Badges */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                      Primary Clinical Indications:
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {COMPONENT_DETAILS[selectedComponentTab].clinicalUses.map((use, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{use}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {COMPONENT_DETAILS[selectedComponentTab].urgentNotice && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{COMPONENT_DETAILS[selectedComponentTab].urgentNotice}</span>
                    </div>
                  )}
                </div>

                {/* Right Metrics Grid */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Thermometer className="w-4 h-4 text-rose-500" />
                        <span>Storage Temp</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {COMPONENT_DETAILS[selectedComponentTab].storageTemp}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span>Shelf Life</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {COMPONENT_DETAILS[selectedComponentTab].shelfLife}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <RotateCcw className="w-4 h-4 text-sky-500" />
                        <span>Donation Interval</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        Every {COMPONENT_DETAILS[selectedComponentTab].donationIntervalDays} Days
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Up to {COMPONENT_DETAILS[selectedComponentTab].maxDonationsPerYear}x / year
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                        <Droplets className="w-4 h-4 text-emerald-500" />
                        <span>Unit Volume</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {COMPONENT_DETAILS[selectedComponentTab].volumePerUnit}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">Ready to donate this component?</div>
                      <div className="text-sm font-bold">Schedule an Apheresis or Whole Blood slot</div>
                    </div>
                    <Link
                      href="/dashboard/appointments"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shrink-0 text-center whitespace-nowrap"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ░░░░░░ WORKFLOW STEPS (HOW SRISHTI SAVES LIVES) ░░░░░░ */}
      <section id="workflow" className="py-16 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
              Seamless 4-Step Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Srishti Saves Lives
            </h2>
            <p className="text-sm text-slate-600">
              A transparent, zero-delay loop connecting donors, testing laboratories, and acute care wards.
            </p>
          </div>

          {/* Connected 4 Steps Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-card hover:border-rose-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-rose-600/30 group-hover:text-rose-600 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {step.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
                  <span>Step {step.num} Protocol</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░░░░ INTERACTIVE DUAL COMPATIBILITY EXPLORER (RBC vs. PLASMA) ░░░░░░ */}
      <section id="compatibility" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
              Clinical Transfusion Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Interactive Compatibility Matrix
            </h2>
            <p className="text-sm text-slate-600">
              Cross-match donor and recipient compatibility for Red Blood Cells vs. Inverted Plasma dynamics.
            </p>
          </div>

          {/* Dual Mode Switcher: RBC vs Plasma */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-8">
            <button
              type="button"
              onClick={() => setCompatType('rbc')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition-all border flex items-center justify-center gap-2 ${
                compatType === 'rbc'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Droplets className="w-4 h-4 fill-current shrink-0" />
              <span>Red Blood Cells (RBC) Matrix</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${compatType === 'rbc' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'}`}>
                O- Universal Donor
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCompatType('plasma')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs transition-all border flex items-center justify-center gap-2 ${
                compatType === 'plasma'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FlaskConical className="w-4 h-4 shrink-0" />
              <span>Fresh Frozen Plasma (FFP) Matrix</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${compatType === 'plasma' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'}`}>
                AB Universal Plasma Donor
              </span>
            </button>
          </div>

          {/* Blood Group Tabs - 4 cols on mobile for clean touch layout */}
          <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center justify-center gap-2 mb-8 max-w-sm sm:max-w-none mx-auto">
            {BLOOD_GROUPS.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className={`py-2.5 px-3 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all border text-center ${
                  selectedGroup === group
                    ? compatType === 'plasma'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-slate-50'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Compatibility Display Box */}
          {(() => {
            const currentCompat =
              compatType === 'plasma'
                ? PLASMA_COMPATIBILITY[selectedGroup as keyof typeof PLASMA_COMPATIBILITY] || PLASMA_COMPATIBILITY['AB+']
                : BLOOD_COMPATIBILITY[selectedGroup as keyof typeof BLOOD_COMPATIBILITY] || BLOOD_COMPATIBILITY['O-'];

            return (
              <div className="max-w-4xl mx-auto rounded-3xl bg-slate-50 border border-slate-200 p-5 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {compatType === 'plasma' ? 'Inspecting Plasma Transfusion Type' : 'Inspecting Red Blood Cell Transfusion Type'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-3">
                      <span>Group {selectedGroup}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${compatType === 'plasma' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'}`}>
                        {currentCompat.title}
                      </span>
                    </h3>
                  </div>
                  <Link
                    href="/auth/register"
                    className={`inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap flex-nowrap ${compatType === 'plasma' ? 'text-sky-600 hover:text-sky-700' : 'text-rose-600 hover:text-rose-700'}`}
                  >
                    <span>Register as {selectedGroup} Donor</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>

                {/* 2 Grid Columns: Can Give / Can Receive */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Can Give */}
                  <div className="p-5 rounded-2xl bg-white border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4>Can Donate {compatType === 'plasma' ? 'Plasma' : 'Red Cells'} To ({currentCompat.give.length} groups)</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.map((bg) => {
                        const isCompatible = currentCompat.give.includes(bg);
                        return (
                          <div
                            key={bg}
                            className={`p-2.5 rounded-xl text-center border font-bold text-xs ${
                              isCompatible
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            {bg}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Can Receive */}
                  <div className="p-5 rounded-2xl bg-white border border-sky-200 space-y-3">
                    <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                      <h4>Can Receive {compatType === 'plasma' ? 'Plasma' : 'Red Cells'} From ({currentCompat.receive.length} groups)</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.map((bg) => {
                        const isCompatible = currentCompat.receive.includes(bg);
                        return (
                          <div
                            key={bg}
                            className={`p-2.5 rounded-xl text-center border font-bold text-xs ${
                              isCompatible
                                ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            {bg}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Context Note */}
                <div className={`p-4 rounded-2xl text-xs flex items-start gap-3 ${compatType === 'plasma' ? 'bg-sky-50/70 border border-sky-200 text-sky-950' : 'bg-rose-50/70 border border-rose-200 text-rose-950'}`}>
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${compatType === 'plasma' ? 'text-sky-600' : 'text-rose-600'}`} />
                  <p className="leading-relaxed">
                    {currentCompat.description}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ░░░░░░ ADAPTIVE IMPACT CALCULATOR (WHOLE BLOOD / PLATELETS / PLASMA) ░░░░░░ */}
      <section id="calculator" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            
            {/* Calculator Controls */}
            <div className="lg:col-span-5 space-y-5">
              <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
                Live Impact Engine
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Calculate Your Life Impact
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose your preferred donation stream to see the clinical magnitude of your regular voluntary contributions.
              </p>

              {/* Stream Switcher */}
              <div className="flex gap-2">
                {[
                  { id: 'whole_blood', label: 'Whole Blood (90d)' },
                  { id: 'platelets', label: 'Platelet SDP (15d)' },
                  { id: 'plasma', label: 'Plasma FFP (28d)' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setCalculatorType(st.id as any);
                      if (st.id === 'platelets') setAnnualDonations(6);
                      else if (st.id === 'plasma') setAnnualDonations(4);
                      else setAnnualDonations(2);
                    }}
                    className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                      calculatorType === st.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Donations Per Year</span>
                  <span className="text-rose-600 text-sm font-extrabold">
                    {annualDonations} {annualDonations === 1 ? 'time' : 'times'} / year
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={calculatorType === 'platelets' ? 24 : calculatorType === 'plasma' ? 12 : 4}
                  step="1"
                  value={annualDonations}
                  onChange={(e) => setAnnualDonations(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold px-1">
                  <span>1x (Starter)</span>
                  <span>{calculatorType === 'platelets' ? '12x (Monthly)' : calculatorType === 'plasma' ? '6x (Hero)' : '2x (Regular)'}</span>
                  <span>{calculatorType === 'platelets' ? '24x (Maximum)' : calculatorType === 'plasma' ? '12x (Max FFP)' : '4x (Max WB)'}</span>
                </div>
              </div>
            </div>

            {/* Impact Calculation Results Cards */}
            <div className="lg:col-span-7">
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-rose-200 text-center space-y-2 shadow-sm">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <Heart className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900">
                    {calculatorType === 'platelets'
                      ? annualDonations * 2
                      : calculatorType === 'plasma'
                      ? annualDonations * 2
                      : annualDonations * 3}
                  </div>
                  <div className="text-xs font-bold uppercase text-rose-600">
                    Patients Directly Saved
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {calculatorType === 'platelets'
                      ? '1 SDP = 1 complete transfusion dose'
                      : calculatorType === 'plasma'
                      ? 'Clotting & burn resuscitation'
                      : '3 fractionated clinical products'}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-sky-200 text-center space-y-2 shadow-sm">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900">
                    {calculatorType === 'platelets'
                      ? annualDonations * 300
                      : calculatorType === 'plasma'
                      ? annualDonations * 250
                      : annualDonations * 450} <span className="text-base font-medium">ml</span>
                  </div>
                  <div className="text-xs font-bold uppercase text-sky-600">
                    {calculatorType === 'platelets' ? 'SDP Apheresis Yield' : calculatorType === 'plasma' ? 'FFP Fluid Volume' : 'Volume Contributed'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {calculatorType === 'platelets'
                      ? 'Platelets regenerate in 48-72h'
                      : calculatorType === 'plasma'
                      ? 'Proteins replenish in 48h'
                      : 'Fluid volume restored in 48h'}
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-emerald-200 text-center space-y-2 shadow-sm">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-lg font-black text-slate-900 pt-1.5 truncate">
                    {calculatorType === 'platelets'
                      ? annualDonations >= 18
                        ? 'Master Apheresis Hero'
                        : annualDonations >= 10
                        ? 'Platelet Guardian'
                        : 'Oncology Supporter'
                      : annualDonations === 1
                      ? 'Silver Badge'
                      : annualDonations === 2
                      ? 'Gold Guardian'
                      : annualDonations === 3
                      ? 'Platinum Hero'
                      : 'Diamond Champion'}
                  </div>
                  <div className="text-xs font-bold uppercase text-emerald-600">
                    Honor Recognition Tier
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Signed clinical impact certificate
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ░░░░░░ PORTALS SECTION (ROLE EXPERIENCES) ░░░░░░ */}
      <section id="portals" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
              Integrated Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored Portals for Every Role
            </h2>
            <p className="text-sm text-slate-600">
              Purpose-built experiences engineered for speed, reliability, and precision healthcare.
            </p>
          </div>

          {/* 3 Portal Cards - 100% visible, no hidden opacity */}
          <div className="grid lg:grid-cols-3 gap-8">
            {portalRoles.map((p, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-slate-200 p-7 sm:p-8 flex flex-col justify-between hover:border-rose-300 hover:shadow-card transition-all"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                      {p.icon}
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      {p.role}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-3 border-t border-slate-100">
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
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${p.btnClass} whitespace-nowrap flex-nowrap`}
                  >
                    <span>{p.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ░░░░░░ FREQUENTLY ASKED QUESTIONS ░░░░░░ */}
      <section id="faq" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-2 mb-10">
            <span className="px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
              Common Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Clear answers to donor eligibility, medical safety, and emergency hospital protocols.
            </p>
          </div>

          {/* FAQ Accordion List with Beautiful Smooth Opening and Closing Animation */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 shadow-xs ${
                    isOpen
                      ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-sm bg-white'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className={`w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 transition-colors duration-200 ${
                      isOpen ? 'bg-rose-50/30' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <span className={`font-bold text-xs sm:text-sm transition-colors duration-200 ${
                      isOpen ? 'text-rose-950' : 'text-slate-900'
                    }`}>
                      {faq.q}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'bg-rose-100 text-rose-600 rotate-180'
                          : 'bg-slate-100 text-slate-400 rotate-0'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {/* Smooth height and opacity animation for BOTH opening AND closing */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/90 pt-3">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ░░░░░░ CALL TO ACTION BANNER ░░░░░░ */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl p-6 sm:p-12 bg-gradient-to-br from-rose-600 via-rose-700 to-red-800 text-white shadow-xl text-center space-y-5 relative overflow-hidden">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>Join 5,000+ Voluntary Donors Saving Lives Today</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight max-w-xl mx-auto">
              Ready to Give the Gift of Life?
            </h2>

            <p className="text-xs sm:text-sm text-rose-100 max-w-lg mx-auto leading-relaxed">
              Every voluntary donation can save up to 3 patients. Sign up in seconds, locate certified centers near you, and track your ongoing clinical impact.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/register"
                onClick={(e) => createRipple(e)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-rose-700 font-bold text-xs rounded-xl shadow-md hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all whitespace-nowrap flex-nowrap"
              >
                <span>Register as Donor Now</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>

              <Link
                href="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black/20 border border-white/20 text-white hover:bg-black/30 transition-all font-semibold text-xs whitespace-nowrap flex-nowrap"
              >
                <span>Sign In to Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ░░░░░░ CLEAN FOOTER ░░░░░░ */}
      <footer className="bg-slate-950 text-slate-400 pt-12 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 pb-10 border-b border-slate-900 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white">
                  <Droplets className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="text-sm font-bold text-white tracking-tight">
                  Srishti <span className="text-rose-500">Blood Bank</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Dedicated to zero-waste cold-chain blood distribution, emergency logistics, and donor care.
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Quick Navigation</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Portal Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Donor Registration</Link></li>
                <li><Link href="/auth/register?role=hospital" className="hover:text-white transition-colors">Hospital Accreditation</Link></li>
                <li><a href="#compatibility" className="hover:text-white transition-colors">Blood Group Matrix</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Emergency Contact</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-rose-400" /> 1800-BLOOD-LIFE</li>
                <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-rose-400" /> contact@srishtibloodbank.org</li>
                <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" /> Mumbai, Maharashtra</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Regulatory Compliance</h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Operating under NBTC and CDSCO certified guidelines with 100% Nucleic Acid Tested (NAT) blood batches.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Srishti Blood Bank. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Clinical Protocols</span>
              <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
