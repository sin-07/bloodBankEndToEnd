'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { inventoryAPI } from '@/lib/api';
import { BLOOD_GROUPS, COMPONENT_NAMES, getComponentBadgeClass } from '@/lib/utils';
import { Droplets, AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw, ShieldAlert, Sparkles, FlaskConical, Layers, Thermometer } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AvailabilityPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await inventoryAPI.getSummary();
      setSummary(res.data.data);
    } catch (error) {
      toast.error('Failed to load blood inventory status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <BloodLoader fullScreen={false} size="lg" text="Syncing Central Inventory" />
      </DashboardLayout>
    );
  }

  const totalAvailable = summary?.bloodStock?.reduce(
    (acc: number, curr: any) => acc + (curr.totalUnits || 0),
    0
  ) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <Droplets className="w-3.5 h-3.5 fill-rose-600" />
              <span>Real-Time Logistics Telemetry</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Central Blood & Component Availability
            </h1>
            <p className="text-xs text-slate-600">
              Live telemetry tracking across all 8 ABO/Rh blood groups, Platelets (SDP), and Fresh Frozen Plasma (FFP)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAvailability}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Telemetry
            </Button>
            <Link href="/hospital/new-request">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Dispatch Requisition
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Inventory Health Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl shadow-sm">
                <Droplets className="w-7 h-7 fill-rose-600" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Cold-Chain Reserves Available
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {totalAvailable} <span className="text-sm font-semibold text-slate-500">Units Ready for Transfusion</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Normal Reserve: &gt; 10 Units</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Low: &lt; 5 Units</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Critical: 0 Units</span>
              </div>
            </div>
          </div>

          {/* Component Fractionation Mini-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-900">Platelets (SDP / RDP)</div>
                  <div className="text-[11px] text-amber-700 font-medium">5-Day Lifespan (20-24°C Agitated)</div>
                </div>
              </div>
              <Badge variant="warning">Continuous Demand</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-900">Fresh Frozen Plasma (FFP)</div>
                  <div className="text-[11px] text-sky-700 font-medium">1-Year Reserve (-18°C Cryo)</div>
                </div>
              </div>
              <Badge variant="info">Deep Frozen</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5 fill-rose-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-900">Whole Blood & PRBC</div>
                  <div className="text-[11px] text-rose-700 font-medium">42-Day Life (2-6°C Cold-Chain)</div>
                </div>
              </div>
              <Badge variant="success">Active Custody</Badge>
            </div>
          </div>
        </div>

        {/* Blood Group Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {BLOOD_GROUPS.map((bg) => {
            const stock = summary?.bloodStock?.find((s: any) => s._id === bg);
            const units = stock?.totalUnits || 0;
            const isLow = units > 0 && units < 5;
            const isEmpty = units === 0;

            const cardBorder = isEmpty
              ? 'border-rose-300 bg-rose-50/20'
              : isLow
              ? 'border-amber-300 bg-amber-50/20'
              : 'border-slate-200/80 bg-white';

            return (
              <div
                key={bg}
                className={`rounded-2xl border ${cardBorder} p-4 text-center transition-all hover:shadow-card group relative`}
              >
                <div className="text-xl font-black tracking-tight text-rose-600 mb-1">
                  {bg}
                </div>

                <div className="text-3xl font-extrabold text-slate-900 tracking-tight my-1">
                  {units}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mb-3">units</div>

                <div>
                  {isEmpty ? (
                    <Badge variant="danger" dot pulse className="text-[10px] px-2 py-0.5">
                      Depleted
                    </Badge>
                  ) : isLow ? (
                    <Badge variant="warning" dot className="text-[10px] px-2 py-0.5">
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="success" dot className="text-[10px] px-2 py-0.5">
                      Optimal
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Alerts & Critical Notices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Low Stock Warnings</h3>
                <p className="text-xs text-slate-500">Groups requiring replenishment drives</p>
              </div>
            </div>

            {summary?.lowStockAlerts && summary.lowStockAlerts.length > 0 ? (
              <div className="space-y-2.5">
                {summary.lowStockAlerts.map((alert: any) => (
                  <div
                    key={alert.bloodGroup}
                    className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-100 font-bold text-amber-900 text-xs">
                        {alert.bloodGroup}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        Immediate shortage risk
                      </span>
                    </div>
                    <Badge variant="warning">
                      Only {alert.units} {alert.units === 1 ? 'unit' : 'units'} left
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-600">
                All blood groups currently exceed the regional minimum threshold.
              </div>
            )}
          </div>

          {/* Expiring Soon */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Expiring Units Watch</h3>
                <p className="text-xs text-slate-500">Component expiration in the next 7 days</p>
              </div>
            </div>

            {summary?.expiringSoon && summary.expiringSoon.length > 0 ? (
              <div className="space-y-2.5">
                {summary.expiringSoon.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-rose-50/40 border border-rose-200/60 rounded-2xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-100 font-bold text-rose-900 text-xs">
                        {item.bloodGroup}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {COMPONENT_NAMES[item.component] || item.component}
                      </span>
                    </div>
                    <Badge variant="danger" dot>
                      Expires in {item.daysUntilExpiry}d
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-600">
                No inventory units expiring within the upcoming 7-day window.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
