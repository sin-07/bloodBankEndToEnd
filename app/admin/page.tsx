'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import StatsCard from '@/components/charts/StatsCard';
import BloodStockChart from '@/components/charts/BloodStockChart';
import DonationTrendChart from '@/components/charts/DonationTrendChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { adminAPI } from '@/lib/api';
import { formatDate, getStatusColor, getUrgencyColor } from '@/lib/utils';
import {
  Users,
  Droplets,
  Heart,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await adminAPI.getDashboardStats();
      setData(res.data.data);
      if (isRefresh) toast.success('Telemetry synchronized');
    } catch {
      toast.error('Failed to synchronize dashboard stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <BloodLoader fullScreen={false} size="lg" text="Synchronizing Central Telemetry..." />
      </DashboardLayout>
    );
  }

  const stats = data?.stats || data;

  const statCards = [
    {
      title: 'Total Donors',
      value: stats?.totalDonors || 0,
      icon: Users,
      color: 'blue' as const,
      change: '+14%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Donations',
      value: stats?.totalDonations || 0,
      icon: Heart,
      color: 'red' as const,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Requests',
      value: stats?.totalRequests || 0,
      icon: FileText,
      color: 'green' as const,
      change: `${stats?.pendingRequests || 0} Pending`,
      changeType: 'neutral' as const,
    },
    {
      title: 'Blood Stock (Units)',
      value: stats?.totalUnits || 0,
      icon: Droplets,
      color: 'purple' as const,
      change: 'Cold-Chain Ready',
      changeType: 'positive' as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">
                Central Telemetry Command
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Autonomous cold-chain monitoring, supply balancing, and emergency hospital dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/admin/blood-stock"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Manage Stock</span>
            </Link>
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Blood Reserves by Type" subtitle="Current tested units across cold storage">
            <div className="pt-2">
              <BloodStockChart data={data?.bloodStock || []} />
            </div>
          </Card>

          <Card title="Transfusion Trends" subtitle="Monthly historical donation cadence">
            <div className="pt-2">
              <DonationTrendChart data={data?.donationTrends || []} />
            </div>
          </Card>
        </div>

        {/* Recent Blood Requests & Emergency Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Requests Table */}
          <div className="lg:col-span-2">
            <Card
              title="Recent Hospital & Patient Requests"
              subtitle="Real-time triage queue requiring fulfillment"
              action={
                <Link
                  href="/admin/requests"
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                >
                  View All Requests <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
              noPadding
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Patient / Hospital</th>
                      <th className="px-5 py-3">Blood Group</th>
                      <th className="px-5 py-3">Units</th>
                      <th className="px-5 py-3">Urgency</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data?.recentRequests?.length > 0 ? (
                      data.recentRequests.map((req: any) => (
                        <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900">{req.patientName}</p>
                            <p className="text-[11px] text-slate-500">{req.hospitalName || req.city}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-heading font-extrabold text-sm px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                              {req.bloodGroup}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {req.units} unit{req.units > 1 ? 's' : ''}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={req.urgency === 'critical' ? 'danger' : req.urgency === 'urgent' ? 'warning' : 'success'} dot pulse={req.urgency === 'critical'}>
                              {req.urgency}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge variant={req.status === 'fulfilled' ? 'success' : req.status === 'approved' ? 'info' : 'warning'}>
                              {req.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No pending blood requests in queue.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column: Low Stock Alerts & Urgency Breakdown */}
          <div className="space-y-6">
            
            {/* Low Stock Alerts */}
            <Card title="Stock Threshold Watch" subtitle="Groups approaching critical reserve levels">
              {data?.lowStockAlerts?.length > 0 ? (
                <div className="space-y-2.5">
                  {data.lowStockAlerts.map((alert: any) => (
                    <div
                      key={alert.bloodGroup}
                      className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="font-heading font-extrabold text-rose-700">
                          Type {alert.bloodGroup}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-rose-700">
                        {alert.units} units left
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-800">All Groups Well-Stocked</p>
                  <p className="text-[11px] text-emerald-700">Every blood type satisfies minimum safety reserves.</p>
                </div>
              )}
            </Card>

            {/* Quick Portal Navigation */}
            <Card title="Direct Management">
              <div className="space-y-2 text-xs">
                <Link
                  href="/admin/donors"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Users className="w-4 h-4 text-sky-600" />
                    <span className="font-semibold">Registered Donors Directory</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/admin/hospitals"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Building2 className="w-4 h-4 text-rose-600" />
                    <span className="font-semibold">Partner Hospital Verification</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href="/admin/reports"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold">Audit & Regulatory Reports</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </Card>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
