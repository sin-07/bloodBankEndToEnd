'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Droplets, Heart, Users, Building2, Shield, ArrowRight,
  Activity, Clock, Award, Phone, Mail, MapPin, ChevronDown,
  CheckCircle2, Globe,
} from 'lucide-react';
import {
  gsap, ScrollTrigger,
  splitText, createTextReveal, createRipple,
} from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import MagneticButton from '@/components/gsap/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════════════════ */

const features = [
  {
    icon: <Users className="w-7 h-7" />, title: 'For Donors',
    desc: 'Register, track donations, check eligibility, and download certificates. Every drop saves a life.',
    gradient: 'from-red-500 to-rose-600', iconBg: 'bg-red-500/10 text-red-600',
  },
  {
    icon: <Building2 className="w-7 h-7" />, title: 'For Hospitals',
    desc: 'Request blood in bulk, track status in real-time, and get matched with donors in your city.',
    gradient: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    icon: <Shield className="w-7 h-7" />, title: 'For Admins',
    desc: 'Manage inventory, approve requests, monitor analytics, and ensure supply across the network.',
    gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-500/10 text-emerald-600',
  },
];

const steps = [
  { icon: <CheckCircle2 className="w-8 h-8" />, title: 'Register', desc: 'Create your account in seconds', num: '01' },
  { icon: <Activity className="w-8 h-8" />, title: 'Health Check', desc: 'Quick eligibility screening', num: '02' },
  { icon: <Droplets className="w-8 h-8" />, title: 'Donate', desc: 'Visit a center and donate', num: '03' },
  { icon: <Award className="w-8 h-8" />, title: 'Save Lives', desc: 'Get your certificate & track impact', num: '04' },
];

const bloodGroups = [
  { name: 'A+', stock: 78 }, { name: 'A-', stock: 62 },
  { name: 'B+', stock: 85 }, { name: 'B-', stock: 57 },
  { name: 'AB+', stock: 71 }, { name: 'AB-', stock: 64 },
  { name: 'O+', stock: 90 }, { name: 'O-', stock: 68 },
];

/* ════════════════════════════════════════════════════════════
   SVG PATHS
   ════════════════════════════════════════════════════════════ */

const DROP_PATH = 'M60 8 C60 8, 10 80, 10 108 C10 136, 32 156, 60 156 C88 156, 110 136, 110 108 C110 80, 60 8, 60 8Z';

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const processTrackRef = useRef<HTMLDivElement>(null);
  const bloodRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const [scrolled, setScrolled] = useState(false);

  /* ─── Scroll listener for navbar ─── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ═══════════════════════════════════════════════════════════
     GSAP CONTEXT — all animations, single context for cleanup
     ═══════════════════════════════════════════════════════════ */
  useGSAP(() => {

    /* ─── 1. HERO ENTRANCE ─── */
    const heroTl = gsap.timeline();

    // Navbar is always visible — no opacity animation on it
    heroTl.from('.hero-badge', { x: -30, opacity: 0, duration: 0.5 });

    // Title split reveal
    const titleLine1 = document.querySelector('.hero-title-1') as HTMLElement;
    const titleLine2 = document.querySelector('.hero-title-2') as HTMLElement;
    if (titleLine1 && titleLine2) {
      const c1 = splitText(titleLine1);
      const c2 = splitText(titleLine2);
      heroTl.add(createTextReveal(c1, { stagger: 0.03, y: 60, duration: 0.6 }), '-=0.1');
      heroTl.add(createTextReveal(c2, { stagger: 0.03, y: 60, duration: 0.6 }), '-=0.3');
    }

    heroTl.from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.5 }, '-=0.2');
    heroTl.from('.hero-cta-1', { y: 20, opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.1');
    heroTl.from('.hero-cta-2', { y: 20, opacity: 0, scale: 0.9, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3');
    heroTl.from('.hero-illustration', { scale: 0.8, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
    heroTl.from('.hero-float-icon', {
      scale: 0, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(2)',
    }, '-=0.4');
    heroTl.from('.scroll-indicator', { y: -10, opacity: 0, duration: 0.4 }, '-=0.2');

    // SVG blood drop breathing
    gsap.to('.hero-drop', {
      scale: 1.05, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1,
      transformOrigin: '50% 50%',
    });

    // Orbital ring rotation
    gsap.to('.orbital-ring-1', { rotation: 360, duration: 30, ease: 'none', repeat: -1 });
    gsap.to('.orbital-ring-2', { rotation: -360, duration: 22, ease: 'none', repeat: -1 });

    /* ─── 3. HERO MOUSE PARALLAX ─── */
    const hero = heroRef.current;
    if (hero) {
      const layers = hero.querySelectorAll<HTMLElement>('[data-speed]');
      const onMove = (e: MouseEvent) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left - r.width / 2) / r.width;
        const ny = (e.clientY - r.top - r.height / 2) / r.height;
        layers.forEach(l => {
          const s = parseFloat(l.dataset.speed || '0');
          gsap.to(l, { x: nx * s, y: ny * s, duration: 1, ease: 'power2.out' });
        });
      };
      hero.addEventListener('mousemove', onMove);
    }

    /* ─── 4. FEATURES — masked reveal + stagger ─── */
    const featTitle = document.querySelector('.feat-title') as HTMLElement;
    if (featTitle) {
      ScrollTrigger.create({
        trigger: featTitle,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          const chars = splitText(featTitle);
          createTextReveal(chars, { y: 40, duration: 0.5, stagger: 0.02 });
        },
      });
    }

    gsap.from('.feature-card', {
      y: 60, opacity: 0, scale: 0.92,
      stagger: 0.12, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: featuresRef.current, start: 'top 75%', once: true },
    });

    /* ─── 6. HORIZONTAL SCROLL — How It Works ─── */
    if (processTrackRef.current && processRef.current) {
      const track = processTrackRef.current;
      const section = processRef.current;

      const getScrollAmount = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    }

    const processTitle = document.querySelector('.process-title') as HTMLElement;
    if (processTitle) {
      ScrollTrigger.create({
        trigger: processTitle,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          const chars = splitText(processTitle);
          createTextReveal(chars, { y: 40, stagger: 0.02 });
        },
      });
    }

    /* ─── 7. BLOOD GROUPS ─── */
    gsap.from('.blood-card', {
      y: 40, opacity: 0, scale: 0.9,
      stagger: { each: 0.06, from: 'random' },
      duration: 0.6, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: bloodRef.current, start: 'top 78%', once: true },
    });

    gsap.from('.blood-progress', {
      scaleX: 0, transformOrigin: 'left',
      stagger: 0.08, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: bloodRef.current, start: 'top 70%', once: true },
    });

    const bloodTitle = document.querySelector('.blood-title') as HTMLElement;
    if (bloodTitle) {
      ScrollTrigger.create({
        trigger: bloodTitle,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          const chars = splitText(bloodTitle);
          createTextReveal(chars, { y: 40, stagger: 0.02 });
        },
      });
    }

    /* ─── 8. CTA ─── */
    gsap.to('.cta-dots', {
      y: -60,
      scrollTrigger: {
        trigger: ctaRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });

    const ctaTitle = document.querySelector('.cta-title') as HTMLElement;
    if (ctaTitle) {
      ScrollTrigger.create({
        trigger: ctaTitle,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          const chars = splitText(ctaTitle);
          createTextReveal(chars, { y: 40, stagger: 0.02, duration: 0.5 });
        },
      });
    }

    gsap.from('.cta-content > *', {
      y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: ctaRef.current, start: 'top 75%', once: true },
    });

    /* ─── 9. FOOTER ─── */
    gsap.from('.footer-col', {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.site-footer', start: 'top 85%', once: true },
    });

  }, { scope: containerRef });

  /* ─── 3D tilt handler ─── */
  const tiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const rotY = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const rotX = ((e.clientY - r.top) / r.height - 0.5) * -10;
    gsap.to(el, { rotateY: rotY, rotateX: rotX, scale: 1.03, duration: 0.3, ease: 'power2.out', transformPerspective: 800 });
  }, []);

  const tiltLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)', transformPerspective: 800 });
  }, []);

  /* ═══════════════════════════════════════════════════════════
     JSX
     ═══════════════════════════════════════════════════════════ */

  return (
    <div ref={containerRef}>

      {/* ░░░░░░ MAIN CONTENT ░░░░░░ */}
      <div className="min-h-screen bg-white">

        {/* ═══ NAVBAR ═══ */}
        <nav className={`hero-nav sticky top-0 z-50 px-6 py-3.5 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] border-b border-gray-200/60'
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Droplets className="w-8 h-8 text-red-600 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xl font-bold tracking-tight">
                Srishti <span className="text-red-600">Blood Bank</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="nav-link relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Login
                <span className="nav-underline" />
              </Link>
              <MagneticButton strength={0.25}>
                <Link href="/auth/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-full
                             shadow-lg shadow-red-200/50 hover:shadow-red-300/60 hover:bg-red-700
                             hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 inline-block">
                  Get Started
                </Link>
              </MagneticButton>
            </div>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
          {/* Animated gradient bg */}
          <div className="absolute inset-0 animate-gradient-shift bg-[length:400%_400%]" data-speed="-5"
            style={{ backgroundImage: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 25%, #fff1f2 50%, #ffffff 75%, #ffe4e6 100%)' }} />
          <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full bg-red-100/30 blur-[100px]" data-speed="-15" />
          <div className="absolute bottom-[-150px] left-[-80px] w-[450px] h-[450px] rounded-full bg-rose-100/20 blur-[100px]" data-speed="-10" />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {[...Array(8)].map((_, i) => (
              <span key={i} className={`particle particle-${i}`} />
            ))}
          </div>

          {/* Wave at bottom */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none select-none">
            <svg className="relative block w-full h-[120px]" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path className="animate-wave-1 fill-red-600/[0.07]"
                d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,120 L0,120Z" />
              <path className="animate-wave-2 fill-red-500/[0.05]"
                d="M0,80 C320,30 640,110 960,60 C1120,35 1320,90 1440,70 L1440,120 L0,120Z" />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 w-full" data-speed="8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">

              {/* Left — text */}
              <div>
                <span className="hero-badge glass-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-red-700 mb-6">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Save Lives Today
                </span>

                <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
                  <span className="hero-title-1 block overflow-hidden">Every Drop</span>
                  <span className="hero-title-2 block overflow-hidden bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-text-shimmer">
                    Counts.
                  </span>
                </h1>

                <p className="hero-subtitle mt-6 text-lg lg:text-xl text-gray-500 leading-relaxed max-w-lg">
                  The modern platform for blood donation, hospital requests &amp; inventory management — all in one place.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <MagneticButton strength={0.3} className="hero-cta-1">
                    <Link href="/auth/register"
                      className="group inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 text-white font-semibold rounded-full
                                 hover:bg-red-700 transition-all shadow-xl shadow-red-300/30 hover:shadow-red-400/40
                                 hover:-translate-y-0.5 active:translate-y-0"
                      onClick={(e) => createRipple(e)}>
                      Become a Donor
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </MagneticButton>
                  <MagneticButton strength={0.3} className="hero-cta-2">
                    <Link href="/auth/register?role=hospital"
                      className="glass-card inline-flex items-center gap-2 px-8 py-3.5 font-semibold rounded-full text-gray-700
                                 border border-white/60 hover:border-gray-200 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                      Hospital Registration
                    </Link>
                  </MagneticButton>
                </div>
              </div>

              {/* Right — SVG illustration */}
              <div className="hero-illustration hidden lg:flex justify-center items-center" data-speed="20">
                <div className="relative w-[400px] h-[400px]">
                  <div className="orbital-ring-1 absolute inset-0 rounded-full border-2 border-dashed border-red-200/60" style={{ willChange: 'transform' }} />
                  <div className="orbital-ring-2 absolute inset-10 rounded-full border border-dashed border-red-100/50" style={{ willChange: 'transform' }} />

                  <div className="absolute inset-[60px] flex items-center justify-center">
                    <svg viewBox="0 0 120 160" className="hero-drop w-48 h-48 drop-shadow-2xl" style={{ willChange: 'transform' }}>
                      <defs>
                        <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#e11d48" />
                        </linearGradient>
                        <filter id="glow"><feGaussianBlur stdDeviation="6" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <path d={DROP_PATH} fill="url(#dropGrad)" filter="url(#glow)" />
                      <ellipse cx="42" cy="90" rx="12" ry="18" fill="white" opacity="0.18" transform="rotate(-20 42 90)" />
                    </svg>
                  </div>

                  {[
                    { Icon: Heart, pos: 'top-2 left-1/2 -translate-x-1/2', color: 'bg-rose-100 text-rose-600' },
                    { Icon: Activity, pos: 'bottom-2 left-1/2 -translate-x-1/2', color: 'bg-blue-100 text-blue-600' },
                    { Icon: Globe, pos: 'top-1/2 -translate-y-1/2 left-0', color: 'bg-amber-100 text-amber-600' },
                    { Icon: Award, pos: 'top-1/2 -translate-y-1/2 right-0', color: 'bg-emerald-100 text-emerald-600' },
                  ].map(({ Icon, pos, color }, i) => (
                    <div key={i}
                      className={`hero-float-icon absolute ${pos} w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm animate-float-${i + 1}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="scroll-indicator absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">Scroll</span>
              <div className="w-5 h-8 rounded-full border-2 border-gray-300 flex justify-center pt-1.5">
                <div className="w-1 h-2 bg-gray-400 rounded-full animate-scroll-dot" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section ref={featuresRef} className="py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">Features</span>
              <h2 className="feat-title mt-3 text-4xl lg:text-5xl font-extrabold text-gray-900">
                Built for Everyone
              </h2>
              <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
                Whether you&apos;re a donor, hospital, or admin — we&apos;ve got the tools you need.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <div key={i}
                  className="feature-card"
                  onMouseMove={tiltMove}
                  onMouseLeave={tiltLeave}
                  style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
                >
                  <div className={`glass-card rounded-2xl p-8 border border-white/60 group h-full cursor-default
                                  hover:shadow-xl transition-shadow duration-300`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${f.iconBg}
                                    group-hover:scale-110 transition-transform duration-300`}>
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                    <div className={`mt-5 h-1 w-12 rounded-full bg-gradient-to-r ${f.gradient} group-hover:w-24 transition-all duration-500`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — HORIZONTAL SCROLL ═══ */}
        <section ref={processRef} className="process-section relative overflow-hidden">
          <div className="min-h-screen flex flex-col justify-center">
            <div className="px-6 mb-12 max-w-7xl mx-auto w-full">
              <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">How it Works</span>
              <h2 className="process-title mt-3 text-4xl lg:text-5xl font-extrabold text-gray-900">
                4 Simple Steps
              </h2>
            </div>

            <div ref={processTrackRef} className="process-track flex gap-8 pl-6 pr-[40vw]" style={{ willChange: 'transform' }}>
              {steps.map((s, i) => (
                <div key={i} className="process-card flex-shrink-0 w-[340px] lg:w-[400px]">
                  <div className="glass-card rounded-3xl p-10 border border-white/60 h-full relative overflow-hidden group
                                  hover:shadow-xl transition-shadow duration-300"
                    onMouseMove={tiltMove}
                    onMouseLeave={tiltLeave}
                    style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
                  >
                    <span className="absolute top-6 right-8 text-7xl font-black text-red-50 select-none group-hover:text-red-100 transition-colors">
                      {s.num}
                    </span>
                    <div className="relative">
                      <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-red-200/40">
                        {s.icon}
                      </div>
                      <h4 className="font-bold text-gray-900 text-2xl mb-2">{s.title}</h4>
                      <p className="text-gray-500 text-lg">{s.desc}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-red-200/60" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BLOOD GROUPS ═══ */}
        <section ref={bloodRef} className="py-28">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-red-600 uppercase tracking-wider">Blood Groups</span>
              <h2 className="blood-title mt-3 text-4xl lg:text-5xl font-extrabold text-gray-900">
                All Types Available
              </h2>
              <p className="mt-4 text-gray-500 text-lg">Check current stock levels at a glance</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {bloodGroups.map((bg, i) => (
                <div key={bg.name}
                  className="blood-card"
                  onMouseMove={tiltMove}
                  onMouseLeave={tiltLeave}
                  style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
                >
                  <div className="glass-card rounded-2xl p-7 text-center border border-white/60 hover:shadow-lg hover:shadow-red-100/40
                                  transition-all duration-300 cursor-default relative overflow-hidden group">
                    <div className="absolute inset-0 bg-red-50 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500 origin-center opacity-50" />
                    <div className="relative">
                      <div className="w-[72px] h-[72px] mx-auto bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">{bg.name}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden mb-2">
                        <div className="blood-progress h-full rounded-full bg-gradient-to-r from-red-500 to-rose-500"
                          style={{ width: `${bg.stock}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">Available</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section ref={ctaRef} className="py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-600 to-rose-700" />
          <div className="cta-dots absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[60px]" viewBox="0 0 1440 60" preserveAspectRatio="none">
              <path d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,40 1440,30 L1440,60 L0,60Z" fill="white" />
            </svg>
          </div>

          <div className="cta-content relative max-w-4xl mx-auto px-6 text-center">
            <h2 className="cta-title text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Ready to Make a Difference?
            </h2>
            <p className="mt-6 text-red-100 text-lg max-w-xl mx-auto">
              Every drop counts. Register today and become part of our life-saving community.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <MagneticButton strength={0.25}>
                <Link href="/auth/register"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-full
                             shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-lg"
                  onClick={(e) => createRipple(e)}>
                  Register Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.25}>
                <Link href="/auth/login"
                  className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full
                             hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-lg">
                  Sign In
                </Link>
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="site-footer bg-gray-950 text-gray-400 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-10 pb-12 border-b border-gray-800/60">
              <div className="footer-col">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="w-7 h-7 text-red-500" />
                  <span className="text-lg font-bold text-white">Srishti Blood Bank</span>
                </div>
                <p className="text-sm leading-relaxed">
                  A modern blood bank management system dedicated to saving lives through efficient donation and distribution.
                </p>
              </div>
              <div className="footer-col">
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                  <li><Link href="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
                  <li><Link href="/auth/register?role=hospital" className="hover:text-white transition-colors">Hospital Registration</Link></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-red-400" /> contact@srishtibloodbank.org</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-red-400" /> +91 98765 43210</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-red-400" /> Mumbai, India</li>
                </ul>
              </div>
              <div className="footer-col">
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Working Hours</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-red-400" /> Mon–Sat: 9 AM – 6 PM</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-red-400" /> Emergency: 24/7</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} Srishti Blood Bank. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
