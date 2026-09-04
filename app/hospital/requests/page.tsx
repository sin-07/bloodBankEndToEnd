'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import { hospitalAPI } from '@/lib/api';
import { formatDate, getStatusVariant, getUrgencyVariant } from '@/lib/utils';
import { Droplets, Plus, Filter, RefreshCw, User, Calendar, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HospitalRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await hospitalAPI.getRequests();
      let data = res.data.data?.requests || [];
      if (statusFilter) {
        data = data.filter((r: any) => r.status === statusFilter);
      }
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load clinical requests');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Patient Details',
      accessor: (req: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-200">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{req.patientName}</div>
            <div className="text-[11px] text-slate-500">{req.contactNumber || 'No contact provided'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      accessor: (req: any) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
          <Droplets className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>{req.bloodGroup}</span>
        </div>
      ),
    },
    {
      header: 'Units',
      accessor: (req: any) => (
        <div className="font-semibold text-slate-900">
          {req.units} <span className="text-xs font-normal text-slate-500">units</span>
        </div>
      ),
    },
    {
      header: 'Triage Priority',
      accessor: (req: any) => (
        <Badge
          variant={getUrgencyVariant(req.urgency)}
          dot
          pulse={req.urgency === 'critical'}
          className="capitalize font-semibold"
        >
          {req.urgency}
        </Badge>
      ),
    },
    {
      header: 'Clinical Indication',
      accessor: (req: any) => (
        <span className="text-slate-600 max-w-[220px] truncate block text-xs" title={req.reason}>
          {req.reason || 'General emergency'}
        </span>
      ),
    },
    {
      header: 'Lifecycle Status',
      accessor: (req: any) => (
        <Badge
          variant={getStatusVariant(req.status)}
          dot
          className="capitalize font-semibold"
        >
          {req.status}
        </Badge>
      ),
    },
    {
      header: 'Requested At',
      accessor: (req: any) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(req.createdAt)}</span>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Hospital Requisition Desk</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Blood Requisitions
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Track emergency and scheduled transfusion requests dispatched to the blood bank
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href="/hospital/new-request">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Requisition
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 ml-1" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Status:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'All', value: '' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Fulfilled', value: 'fulfilled' },
                { label: 'Rejected', value: 'rejected' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === tab.value
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-medium text-slate-500 w-full sm:w-auto text-right">
            Showing <strong className="text-slate-800">{requests.length}</strong> requisition{requests.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Clinical Requests Table */}
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMessage="No clinical requisitions found matching the current status filter."
        />
      </div>
    </DashboardLayout>
  );
}
