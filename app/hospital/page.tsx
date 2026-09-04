'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import StatsCard from '@/components/charts/StatsCard';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { hospitalAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
  Package,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, requestsRes] = await Promise.all([
        hospitalAPI.getProfile().catch(() => null),
        hospitalAPI.getRequests().catch(() => null),
      ]);
      if (profileRes?.data?.data) setProfile(profileRes.data.data);
      if (requestsRes?.data) setRequests(requestsRes.data);
    } catch {
      toast.error('Failed to load hospital operations dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <BloodLoader fullScreen={false} size="lg" text="Connecting Hospital Supply Network..." />
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: requests?.stats?.total || requests?.data?.requests?.length || 0,
      icon: FileText,
      color: 'blue' as const,
      change: 'Lifetime Orders',
      changeType: 'positive' as const,
    },
    {
      title: 'Pending Triage',
      value: requests?.stats?.pending || 0,
      icon: Clock,
      color: 'yellow' as const,
      change: 'In Queue',
      changeType: 'neutral' as const,
    },
    {
      title: 'Units Fulfilled',
      value: requests?.stats?.fulfilled || 0,
      icon: CheckCircle,
      color: 'green' as const,
      change: '100% Cold-Chain',
      changeType: 'positive' as const,
    },
    {
      title: 'Emergency Priority',
      value: requests?.stats?.critical || 0,
      icon: Zap,
      color: 'red' as const,
      change: '< 15 Min SLA',
      changeType: 'positive' as const,
    },
  ];

  const recentRequestsList = requests?.data?.requests || requests?.requests || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Hospital Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={profile?.isVerified ? 'success' : 'warning'} dot pulse={profile?.isVerified}>
                  {profile?.isVerified ? 'Verified Hospital Partner' : 'Verification In Review'}
                </Badge>
                <span className="text-xs text-slate-400">
                  {profile?.city || 'Mumbai'}, {profile?.state || 'Maharashtra'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
                {profile?.hospitalName || user?.name || 'Hospital Trauma Center'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                Direct integration with Srishti regional blood reserves. Priority clinical triage enabled.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/hospital/availability"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all shadow-sm"
              >
                <Package className="w-4 h-4 text-sky-300" />
                <span>Check Stock</span>
              </Link>

              <Link
                href="/hospital/new-request"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Emergency Request</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Animated KPI Stat Cards */}
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
            />
          ))}
        </div>

        {/* Requests Management Table & Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Requests List */}
          <div className="lg:col-span-2">
            <Card
              title="Recent Clinical Blood Requests"
              subtitle="Live dispatch queue and matched donors"
              action={
                <Link
                  href="/hospital/requests"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  All Requests <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
              noPadding
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Patient / Reason</th>
                      <th className="px-5 py-3">Group</th>
                      <th className="px-5 py-3">Units</th>
                      <th className="px-5 py-3">Urgency</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentRequestsList.length > 0 ? (
                      recentRequestsList.map((r: any) => (
                        <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{r.patientName}</p>
                            <p className="text-[11px] text-slate-500">{r.reason}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-heading font-extrabold text-sm px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                              {r.bloodGroup}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {r.units} unit{r.units > 1 ? 's' : ''}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={r.urgency === 'critical' ? 'danger' : r.urgency === 'urgent' ? 'warning' : 'success'} dot pulse={r.urgency === 'critical'}>
                              {r.urgency}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={r.status === 'fulfilled' ? 'success' : r.status === 'approved' ? 'info' : 'warning'}>
                              {r.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No blood requests created by this hospital yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column: Protocols & Hotlines */}
          <div className="space-y-6">
            
            <Card title="Emergency Dispatch Protocol">
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <p className="font-bold text-rose-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-600" />
                    Code Red Emergencies
                  </p>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Trauma surgical cases tagged 'Critical' receive automated top-priority reserve dispatch within 15 minutes.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    Chain of Custody
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    All deliveries are temperature monitored with tamper-evident digital tracking from bank to ICU.
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Hospital Liaison Helpline">
              <div className="space-y-2 text-xs text-slate-700">
                <p className="text-slate-500 text-[11px]">Direct hospital concierge line for emergency bulk units:</p>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 font-mono font-bold text-rose-700 text-sm">
                  📞 +91 98201 55555
                </div>
              </div>
            </Card>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
