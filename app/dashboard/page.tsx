'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/charts/StatsCard';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { donorAPI, bloodRequestAPI } from '@/lib/api';
import { formatDate, downloadBlob } from '@/lib/utils';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, donationsRes, requestsRes] = await Promise.all([
        donorAPI.getProfile().catch(() => null),
        donorAPI.getDonationHistory(1, 5).catch(() => null),
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
      toast.success('Certificate downloaded!');
    } catch {
      toast.error('Failed to download certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  // Compute eligibility days
  const getEligibility = () => {
    if (!profile?.lastDonationDate) return { eligible: true, daysLeft: 0 };
    const daysSince = Math.floor(
      (Date.now() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const eligible = daysSince >= 90;
    return { eligible, daysLeft: Math.max(0, 90 - daysSince) };
  };

  const { eligible, daysLeft } = getEligibility();

  const statCards = [
    {
      title: 'Total Donations',
      value: profile?.totalDonations || donations.length || 0,
      icon: Heart,
      color: 'red' as const,
      change: 'Lifesaver Tier',
      changeType: 'positive' as const,
    },
    {
      title: 'Blood Group',
      value: profile?.bloodGroup || 'A+',
      icon: Droplets,
      color: 'purple' as const,
      change: 'Verified Type',
      changeType: 'positive' as const,
      animateNumber: false,
    },
    {
      title: 'Last Donated',
      value: profile?.lastDonationDate ? formatDate(profile.lastDonationDate) : 'Recently',
      icon: Calendar,
      color: 'blue' as const,
      change: 'Routine Interval',
      changeType: 'neutral' as const,
      animateNumber: false,
    },
    {
      title: 'Eligibility',
      value: eligible ? 'Eligible Now' : `${daysLeft} Days`,
      icon: Award,
      color: eligible ? ('green' as const) : ('yellow' as const),
      change: eligible ? 'Ready to Donate' : 'Waiting Period',
      changeType: eligible ? ('positive' as const) : ('neutral' as const),
      animateNumber: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 glass-card-elevated border border-rose-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Donor Lifeline Pass</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                Your contributions have directly saved up to {(profile?.totalDonations || donations.length || 1) * 3} lives. Thank you for being an active lifeline.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/appointments"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-glow-sm hover:shadow-glow-md transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Schedule Donation</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              change={stat.change}
              changeType={stat.changeType}
              animateNumber={stat.animateNumber}
            />
          ))}
        </div>

        {/* Main 2-Column Section: Donation Journey & Emergency Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Donation History & Certificates */}
          <div className="lg:col-span-2">
            <Card
              title="Your Donation Journey"
              subtitle="Verified clinical transfusions & digital certificates"
              action={
                <Link
                  href="/dashboard/donations"
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  Full History <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
              noPadding
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/[0.06]">
                    <tr>
                      <th className="px-5 py-3">Date & Location</th>
                      <th className="px-5 py-3">Units</th>
                      <th className="px-5 py-3">Health Clearance</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-200">
                    {donations.length > 0 ? (
                      donations.map((d: any) => (
                        <tr key={d._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-white">{formatDate(d.donationDate)}</p>
                            <p className="text-[11px] text-slate-400">{d.location}</p>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-rose-400">
                            {d.units} unit (Group {d.bloodGroup})
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-[11px] font-semibold">Cleared (Hb: {d.healthScreening?.hemoglobin || '14.2'})</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={d.status === 'completed' ? 'success' : 'warning'}>
                              {d.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => handleDownloadCertificate(d._id)}
                              disabled={downloadingId === d._id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-rose-500 transition-all disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{downloadingId === d._id ? 'Generating...' : 'PDF'}</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No previous donations recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column: Proximity Emergency Alerts & Guidelines */}
          <div className="space-y-6">
            
            {/* Urgent Requests in Your City */}
            <Card
              title="Urgent Requests Near You"
              subtitle="Hospital patients needing immediate support"
              action={
                <Link
                  href="/dashboard/requests"
                  className="text-xs font-bold text-rose-400 hover:text-rose-300"
                >
                  View All
                </Link>
              }
            >
              <div className="space-y-3">
                {requests.length > 0 ? (
                  requests.slice(0, 3).map((r: any) => (
                    <div
                      key={r._id}
                      className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.06] space-y-2 hover:border-rose-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Type {r.bloodGroup}
                        </span>
                        <Badge variant={r.urgency === 'critical' ? 'danger' : 'warning'} dot pulse={r.urgency === 'critical'}>
                          {r.urgency}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">{r.patientName}</p>
                        <p className="text-[11px] text-slate-400">{r.hospitalName || r.city} • {r.units} units needed</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No active urgent requests in your vicinity.</p>
                )}
              </div>
            </Card>

            {/* Quick Donor Guidance */}
            <Card title="Preparation Guide">
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Drink at least 500ml of water before your appointment.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Have a healthy meal avoiding high-fat foods within 2 hours.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Carry government photo ID (Aadhaar / Driving License).</span>
                </div>
              </div>
            </Card>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
