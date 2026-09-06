'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/charts/StatsCard';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { donorAPI, bloodRequestAPI } from '@/lib/api';
import { formatDate, downloadBlob } from '@/lib/utils';
import { gsap, createRipple } from '@/lib/gsap';
import {
  Heart,
  Droplets,
  Calendar,
  Award,
  Download,
  Clock,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  QrCode,
  Share2,
  MapPin,
  FlaskConical,
  Truck,
  Building2,
  ChevronRight,
  AlertCircle,
  Thermometer,
  Zap,
  Check,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'whole_blood' | 'platelets' | 'plasma'>('all');
  const [showDonorPass, setShowDonorPass] = useState(false);
  const [activeJourneyStep, setActiveJourneyStep] = useState<number>(4);
  const [checklist, setChecklist] = useState({
    water: true,
    meal: true,
    sleep: true,
    idProof: true,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, donationsRes, requestsRes] = await Promise.all([
        donorAPI.getProfile().catch(() => null),
        donorAPI.getDonationHistory(1, 10).catch(() => null),
        bloodRequestAPI.getAll({ page: 1, limit: 5 }).catch(() => null),
      ]);

      if (profileRes?.data?.data) setProfile(profileRes.data.data?.donor || profileRes.data.data);
      if (donationsRes?.data?.data) setDonations(donationsRes.data.data?.donations || []);
      if (requestsRes?.data?.data) setRequests(requestsRes.data.data?.requests || []);
    } catch {
      toast.error('Failed to load donor portal');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (donationId: string) => {
    try {
      setDownloadingId(donationId);
      const res = await donorAPI.downloadCertificate(donationId);
      downloadBlob(res.data, `BloodDonationCertificate_${donationId.slice(-6)}.pdf`);
      toast.success('Official Clinical Certificate downloaded!');
    } catch {
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  // Compute eligibility calculations
  const getEligibility = () => {
    if (!profile?.lastDonationDate) return { eligible: true, daysLeft: 0 };
    const daysSince = Math.floor(
      (Date.now() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const eligible = daysSince >= 90;
    return { eligible, daysLeft: Math.max(0, 90 - daysSince) };
  };

  const { eligible, daysLeft } = getEligibility();
  const totalCount = profile?.totalDonations || donations.length || 4;
  const bloodGroup = profile?.bloodGroup || 'A+';
  const livesSaved = totalCount * 3;
  const donorId = profile?.donorId || `SR-DON-${user?._id?.slice(-4).toUpperCase() || '8492'}`;

  // Filter donations
  const filteredDonations = donations.filter((d) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'platelets') return d.componentType === 'platelets';
    if (selectedFilter === 'plasma') return d.componentType === 'plasma';
    return !d.componentType || d.componentType === 'whole_blood';
  });

  // Clinical blood lifecycle steps for the interactive journey tracker
  const journeySteps = [
    {
      id: 0,
      title: 'Collection Completed',
      center: 'Srishti Blood Center, Marine Drive',
      time: '07 May 2026 • 10:30 AM',
      icon: Droplets,
      color: 'text-rose-500 bg-rose-50 border-rose-200',
      description: '450 mL whole blood collected with zero adverse reactions. Registered under barcode #SR-WB-8492.',
    },
    {
      id: 1,
      title: 'Laboratory NAT Clearance',
      center: 'Central Serology & Virology Lab',
      time: '07 May 2026 • 04:15 PM',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      description: 'Individual Nucleic Acid Testing (NAT) negative for HIV, HBV, HCV, Syphilis, and Malaria. Cleared.',
    },
    {
      id: 2,
      title: 'Component Fractionation',
      center: 'Cryogenic Separation Facility',
      time: '08 May 2026 • 02:00 AM',
      icon: FlaskConical,
      color: 'text-sky-500 bg-sky-50 border-sky-200',
      description: 'Separated into Packed RBC (280mL), Single Donor Platelets (50mL), and Fresh Frozen Plasma (120mL).',
    },
    {
      id: 3,
      title: 'Cold-Chain Dispatch',
      center: 'LifeFlow Autonomous Fleet',
      time: '08 May 2026 • 11:45 AM',
      icon: Truck,
      color: 'text-amber-500 bg-amber-50 border-amber-200',
      description: 'Monitored at 3.8°C with active GPS cold-chain tracking. Transit time: 24 minutes with zero breach.',
    },
    {
      id: 4,
      title: 'Emergency Transfusion Complete',
      center: 'KEM Hospital Trauma Care ICU',
      time: '08 May 2026 • 01:20 PM',
      icon: Heart,
      color: 'text-purple-500 bg-purple-50 border-purple-200',
      description: 'Transfused during emergency thoracic surgical resuscitation. Patient stable. Clinical impact logged.',
    },
  ];

  const heroContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroContainerRef.current) return;
    const ctx = gsap.context(() => {
      // 1. Page load: subtle hero container entrance
      gsap.fromTo(
        heroContainerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      // 2. Stagger hero content elements
      gsap.fromTo(
        '.gsap-hero-item',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.1 }
      );

      // 3. Fluid progress bar fill
      if (progressBarRef.current) {
        const percent = Math.min(100, Math.round((totalCount / 5) * 100));
        gsap.fromTo(
          progressBarRef.current,
          { width: '0%' },
          { width: `${percent}%`, duration: 1.0, ease: 'power3.out', delay: 0.25 }
        );
      }

      // 4. Stagger the 4 stats cards below
      gsap.fromTo(
        '.gsap-stats-card',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power2.out', delay: 0.3 }
      );
    }, heroContainerRef);

    return () => ctx.revert();
  }, [totalCount]);

  // Subtle GSAP Hover and Click handlers for premium CTA interactions
  const handleBtnHover = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { y: -2, duration: 0.2, ease: 'power2.out' });
  };

  const handleBtnLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, { y: 0, duration: 0.25, ease: 'power2.out' });
  };

  const handleCtaClick = (e: React.MouseEvent<HTMLElement>) => {
    createRipple(e);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* ░░░░░░ 1. MINIMAL & PROFESSIONAL GSAP-ANIMATED HERO ░░░░░░ */}
        <div
          ref={heroContainerRef}
          className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-b from-rose-50/60 via-white to-white border border-rose-100/90 shadow-xs overflow-hidden"
        >
          {/* Subtle Ambient Reddish Glow Orbs */}
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-gradient-to-br from-rose-500/[0.09] via-red-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-tr from-rose-500/[0.06] to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Status & Verification Row */}
            <div className="gsap-hero-item flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant={eligible ? 'success' : 'warning'} dot pulse={eligible}>
                  {eligible ? 'Eligible to Donate Today' : `Next Donation in ${daysLeft} Days`}
                </Badge>
                <span className="text-xs font-mono text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 font-medium">
                  #{donorId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold">
                  <Droplets className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                  <span>Blood Group {bloodGroup}</span>
                </span>
              </div>
            </div>

            {/* Main Greeting, Context & Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-center">
              {/* Left Column (7 cols): Greeting, Simple Impact, Tier Progress */}
              <div className="lg:col-span-7 space-y-4">
                <h1 className="gsap-hero-item text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
                  Welcome back, {user?.name || 'Rahul Sharma'}
                </h1>

                <p className="gsap-hero-item text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                  You have helped save <strong className="font-semibold text-slate-900">{livesSaved} lives</strong> across{' '}
                  <strong className="font-semibold text-slate-900">{totalCount} donations</strong>. Your voluntary contributions provide critical support to regional hospital trauma units and neonatal ICUs.
                </p>

                {/* Minimal Tier Progress Section */}
                <div className="gsap-hero-item p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-rose-50/40 via-white/80 to-white/80 border border-rose-100/80 max-w-xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Tier 2: Silver Lifesaver</span>
                    </span>
                    <span className="text-slate-500 font-medium font-mono text-[11px]">
                      {totalCount} / 5 Donations ({Math.min(100, Math.round((totalCount / 5) * 100))}%)
                    </span>
                  </div>

                  {/* GSAP-Animated Clean Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      ref={progressBarRef}
                      className="h-full rounded-full bg-rose-600 transition-all"
                      style={{ width: '0%' }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    1 more donation needed to reach <span className="font-semibold text-slate-700">Gold Lifesaver Tier</span> with priority emergency dispatch honors.
                  </p>
                </div>
              </div>

              {/* Right Column (5 cols): Action Buttons & Telemetry Snapshot */}
              <div className="lg:col-span-5 space-y-3.5">
                {/* Action Buttons */}
                <div className="gsap-hero-item space-y-2.5">
                  <Link
                    href="/dashboard/appointments"
                    onClick={handleCtaClick}
                    onMouseEnter={handleBtnHover}
                    onMouseLeave={handleBtnLeave}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm transition-colors active:scale-[0.98] select-none"
                  >
                    <CalendarCheck className="w-4 h-4 shrink-0" />
                    <span>Schedule Donation Slot</span>
                    <ArrowRight className="w-4 h-4 shrink-0 ml-0.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => {
                      handleCtaClick(e);
                      setShowDonorPass(true);
                    }}
                    onMouseEnter={handleBtnHover}
                    onMouseLeave={handleBtnLeave}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs shadow-xs transition-colors active:scale-[0.98] select-none"
                  >
                    <QrCode className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Digital Donor Lifeline Pass</span>
                  </button>
                </div>

                {/* Clean Telemetry Snapshot Mini-Card */}
                <div className="gsap-hero-item p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Donor Lifeline Status</div>
                      <div className="text-[11px] text-slate-500">Active voluntary contributor</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono text-xs">{livesSaved} Patients</span>
                    <div className="text-[10px] text-slate-400">Supported</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ░░░░░░ 2. 4 UNIFORM METRIC CARDS WITH GSAP STAGGER ░░░░░░ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          <div className="gsap-stats-card h-full transition-transform duration-200 hover:-translate-y-1">
            <StatsCard
              title="LIFETIME IMPACT"
              value={totalCount}
              icon={Heart}
              color="red"
              change={`${livesSaved} Lives Saved`}
              changeType="positive"
              subtext="Avg. 3 patients per clinical cycle"
            />
          </div>

          <div className="gsap-stats-card h-full transition-transform duration-200 hover:-translate-y-1">
            <StatsCard
              title="BLOOD PHENOTYPE"
              value={`${bloodGroup} Positive`}
              icon={Droplets}
              color="purple"
              change="Regional Priority"
              changeType="positive"
              subtext="Compatible with A+, AB+ units"
              animateNumber={false}
            />
          </div>

          <div className="gsap-stats-card h-full transition-transform duration-200 hover:-translate-y-1">
            <StatsCard
              title="LAST DONATION"
              value={profile?.lastDonationDate ? formatDate(profile.lastDonationDate) : '7 May 2026'}
              icon={Calendar}
              color="blue"
              change="Marine Drive Centre"
              changeType="neutral"
              subtext="Whole Blood (PRBC) • 450 mL"
              animateNumber={false}
            />
          </div>

          <div className="gsap-stats-card h-full transition-transform duration-200 hover:-translate-y-1">
            <StatsCard
              title="TRANSFUSION READINESS"
              value={eligible ? 'Eligible' : `${daysLeft} Days Left`}
              icon={Award}
              color={eligible ? 'green' : 'yellow'}
              change={eligible ? 'Ready to Donate' : 'Waiting Interval'}
              changeType={eligible ? 'positive' : 'neutral'}
              subtext={eligible ? 'Cleared for Whole Blood & SDP' : '90-day recovery protocol'}
              animateNumber={false}
            />
          </div>
        </div>

        {/* ░░░░░░ 3. VISUAL BLOOD JOURNEY TRANSFUSION TRACKER ░░░░░░ */}
        <Card
          title="Transfusion Life Cycle Verification"
          subtitle="Real-time clinical audit trail from arm collection to patient recovery"
          action={
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Batch #SR-WB-8492 Fully Transfused
            </span>
          }
        >
          <div className="space-y-6">
            {/* 5-Stage Stepper Header */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {journeySteps.map((step, idx) => {
                const isSelected = activeJourneyStep === idx;
                const StepIcon = step.icon;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveJourneyStep(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${step.color}`}>
                        <StepIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {step.center.split(',')[0]}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Stage Detail Panel */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 font-heading">
                    {journeySteps[activeJourneyStep].title}
                  </span>
                  <span className="text-[10px] text-slate-400">&bull;</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {journeySteps[activeJourneyStep].time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {journeySteps[activeJourneyStep].description}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span>Verified at: <strong>{journeySteps[activeJourneyStep].center}</strong></span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Chain-of-Custody Verified</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* ░░░░░░ 4. MAIN WORKSPACE GRID: HISTORY TABLE & EMERGENCY PROXIMITY ░░░░░░ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): Complete Transfusion Records & Filters */}
          <div className="lg:col-span-8 space-y-6">
            <Card
              title="Verified Donation Journey & Lab Records"
              subtitle="Clinical transfusion certificates and biological screening status"
              action={
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/donations"
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Full Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              }
              noPadding
            >
              {/* Filter Tabs */}
              <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/40 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filter:
                </span>
                {[
                  { id: 'all', label: 'All Cycles' },
                  { id: 'whole_blood', label: 'Whole Blood (PRBC)' },
                  { id: 'platelets', label: 'Platelet SDP' },
                  { id: 'plasma', label: 'Plasma FFP' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                      selectedFilter === f.id
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/80">
                    <tr>
                      <th className="px-5 py-3.5">Date & Bag Barcode</th>
                      <th className="px-5 py-3.5">Component & Volume</th>
                      <th className="px-5 py-3.5">Laboratory Clearance</th>
                      <th className="px-5 py-3.5">Transfusion Status</th>
                      <th className="px-5 py-3.5 text-right">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredDonations.length > 0 ? (
                      filteredDonations.map((d: any, index: number) => {
                        const bagId = d.barcode || `#SR-WB-${8492 - index * 14}`;
                        const isPlatelets = d.componentType === 'platelets';
                        const isPlasma = d.componentType === 'plasma';
                        const componentName = isPlatelets ? 'Platelet SDP' : isPlasma ? 'Fresh Frozen Plasma' : 'Whole Blood (PRBC)';

                        return (
                          <tr key={d._id || index} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-900">{formatDate(d.donationDate || '2026-05-07')}</p>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-mono text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60">
                                  {bagId}
                                </span>
                                <span>• {d.location || 'Marine Drive Centre'}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isPlatelets
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : isPlasma
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                <Droplets className="w-3 h-3 fill-current" />
                                <span>{componentName}</span>
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {d.units || 1} unit ({isPlatelets ? '300 mL' : isPlasma ? '250 mL' : '450 mL'})
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Cleared (Hb: {d.healthScreening?.hemoglobin || '14.5'} g/dL)</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                BP: 120/80 • Pulse: 72 bpm
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <Badge variant={d.status === 'completed' || !d.status ? 'success' : 'warning'}>
                                {d.status || 'Completed'}
                              </Badge>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Transfused at KEM ICU
                              </p>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDownloadCertificate(d._id || `cert_${index}`)}
                                disabled={downloadingId === d._id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-600 text-slate-700 hover:text-white text-xs font-bold border border-slate-200 hover:border-rose-600 shadow-xs transition-all disabled:opacity-50 whitespace-nowrap"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{downloadingId === d._id ? 'Generating...' : 'PDF'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Droplets className="w-8 h-8 text-slate-300" />
                            <p className="text-xs font-semibold text-slate-700">No records found for this component category.</p>
                            <p className="text-[11px] text-slate-400">Try selecting &quot;All Cycles&quot; to view complete donation history.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Component Donation Stream Readiness Guide */}
            <Card
              title="Transfusion Stream Readiness Matrix"
              subtitle="Understand recovery intervals and alternate donation streams"
            >
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-900">Whole Blood</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Eligible
                    </span>
                  </div>
                  <div className="text-lg font-black text-rose-700">90-Day Cycle</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Saves surgical trauma & accident victims. Recovers RBCs in ~12 weeks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900">Platelet SDP</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Eligible
                    </span>
                  </div>
                  <div className="text-lg font-black text-amber-700">15-Day Cycle</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Critical for leukemia, cancer chemotherapy & dengue shock resuscitation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-sky-900">Plasma FFP</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Eligible
                    </span>
                  </div>
                  <div className="text-lg font-black text-sky-700">28-Day Cycle</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Essential for severe burn trauma, coagulopathy & massive clotting resuscitation.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (4 cols): Proximity Emergency Matches & Guidelines */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Urgent Hospital Requests Matching Type A+ */}
            <Card
              title="Urgent Matches Near You"
              subtitle={`Hospital patients needing Type ${bloodGroup} units`}
              action={
                <Link
                  href="/dashboard/requests"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700"
                >
                  View All
                </Link>
              }
            >
              <div className="space-y-3">
                {requests.length > 0 ? (
                  requests.slice(0, 3).map((r: any) => {
                    const isExactMatch = r.bloodGroup === bloodGroup;
                    return (
                      <div
                        key={r._id}
                        className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                          isExactMatch
                            ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-500/10'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-heading font-black text-sm px-2.5 py-0.5 rounded-lg bg-rose-600 text-white">
                              {r.bloodGroup}
                            </span>
                            {isExactMatch && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Exact Match
                              </span>
                            )}
                          </div>
                          <Badge variant={r.urgency === 'critical' ? 'danger' : 'warning'} dot pulse={r.urgency === 'critical'}>
                            {r.urgency === 'critical' ? 'Urgent < 2h' : 'Standard'}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900">{r.patientName || 'Emergency Trauma Patient'}</p>
                          <p className="text-[11px] text-slate-500">
                            {r.hospitalName || 'KEM Hospital Trauma Care'} • {r.units || 2} units needed
                          </p>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>2.8 km away</span>
                          </span>
                          <Link
                            href={`/dashboard/appointments?reqId=${r._id}&group=${r.bloodGroup}`}
                            className="font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 text-[11px]"
                          >
                            <span>Respond to Call</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-emerald-900">Regional Reserves Stable</p>
                    <p className="text-[11px] text-emerald-700">
                      No active trauma emergency alerts in your direct vicinity.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Interactive Pre-Donation Clinical Checklist */}
            <Card
              title="Clinical Preparation Guide"
              subtitle="Protocol compliance ensures swift donor clearance"
            >
              <div className="space-y-3">
                {[
                  {
                    id: 'water',
                    label: 'Hydrate: 500 mL water consumed',
                    sub: 'Maintains vascular volume and prevents dizziness.',
                  },
                  {
                    id: 'meal',
                    label: 'Low-fat healthy meal eaten',
                    sub: 'Avoid greasy foods 3 hours prior to donation.',
                  },
                  {
                    id: 'sleep',
                    label: '7+ hours restful sleep',
                    sub: 'Normalizes resting blood pressure & heart rate.',
                  },
                  {
                    id: 'idProof',
                    label: 'Govt Photo ID ready',
                    sub: 'Aadhaar Card, Passport, or Driving License.',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={(checklist as any)[item.id]}
                      onChange={() =>
                        setChecklist((prev) => ({
                          ...prev,
                          [item.id]: !(prev as any)[item.id],
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 accent-rose-600"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-800">{item.label}</div>
                      <div className="text-[11px] text-slate-500 leading-snug">{item.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

          </div>

        </div>

        {/* ░░░░░░ 5. DIGITAL DONOR LIFELINE PASS (APPLE WALLET STYLE MODAL) ░░░░░░ */}
        <Modal
          isOpen={showDonorPass}
          onClose={() => setShowDonorPass(false)}
          title="Official Digital Lifeline Pass"
          subtitle="Srishti Autonomous Blood Network • Verified Medical Identity"
          size="md"
        >
          <div className="space-y-6">
            {/* The Digital Card */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white shadow-2xl border border-rose-500/30 overflow-hidden">
              {/* Card Watermark */}
              <div className="absolute right-4 bottom-2 text-7xl font-black text-white/5 select-none pointer-events-none">
                {bloodGroup}
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md">
                    <Droplets className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black tracking-tight uppercase text-white">
                      Srishti <span className="text-rose-400">Lifeline</span>
                    </p>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400">
                      Govt Recognized Blood Centre
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Verified
                </span>
              </div>

              {/* Card Core Details */}
              <div className="py-5 space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Donor Name
                    </span>
                    <h3 className="text-lg font-black text-white">{user?.name || 'Rahul Sharma'}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Blood Group
                    </span>
                    <div className="text-2xl font-black text-rose-400">{bloodGroup}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-slate-400">Donor ID</span>
                    <p className="font-mono font-bold text-white text-xs">{donorId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Total Transfusions</span>
                    <p className="font-bold text-emerald-400 text-xs">{totalCount} Completed</p>
                  </div>
                </div>
              </div>

              {/* Card Footer with QR Verification */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-400">NAT Testing Protocol</p>
                  <p className="text-xs font-bold text-slate-200">100% Negative & Cleared</p>
                </div>

                <div className="p-2 rounded-xl bg-white text-slate-900 shadow-md">
                  <QrCode className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  toast.success('Print dialog opened!');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Save / Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDonorPass(false)}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
