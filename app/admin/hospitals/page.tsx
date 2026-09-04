'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { hospitalAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Building2, Check, X, Search, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await hospitalAPI.getAll({ search });
      setHospitals(res.data.data?.hospitals || []);
    } catch (error) {
      toast.error('Failed to load registered hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await hospitalAPI.verify(id, { isVerified });
      toast.success(
        isVerified ? 'Hospital accreditation verified' : 'Hospital verification suspended'
      );
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to update hospital status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  const columns = [
    {
      header: 'Hospital / Institution',
      accessor: (h: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{h.hospitalName}</p>
            <p className="text-[11px] text-slate-500">Reg: {h.registrationNumber || 'Pending Filing'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Classification',
      accessor: (h: any) => (
        <span className="capitalize text-xs font-semibold text-slate-700">
          {h.type || 'General'}
        </span>
      ),
    },
    {
      header: 'City / Region',
      accessor: (h: any) => (
        <span className="text-xs text-slate-600 font-medium">{h.city || 'Regional Center'}</span>
      ),
    },
    {
      header: 'Key Contact Person',
      accessor: (h: any) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">{h.contactPerson?.name || 'Medical Director'}</span>
          <span className="text-slate-500 text-[11px]">{h.contactPerson?.phone || h.contactPerson?.email || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Requisition Volume',
      accessor: (h: any) => (
        <span className="font-bold text-slate-900 text-xs">
          {h.totalRequests || 0} <span className="text-slate-500 font-normal">orders</span>
        </span>
      ),
    },
    {
      header: 'Accreditation Status',
      accessor: (h: any) => (
        <Badge
          variant={h.isVerified ? 'success' : 'warning'}
          dot
          className="font-semibold"
        >
          {h.isVerified ? 'Verified Center' : 'Awaiting Review'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessor: (h: any) => (
        <div>
          {h.isVerified ? (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs py-1 h-8"
              onClick={() => handleVerify(h._id, false)}
            >
              <X className="h-3.5 w-3.5 mr-1 text-rose-600" />
              Revoke
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1 h-8"
              onClick={() => handleVerify(h._id, true)}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Verify
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Directory</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage Partner Hospitals
            </h1>
            <p className="text-xs text-slate-600">
              Verify credentials, track requisition volumes, and authorize medical centers for emergency dispatch
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHospitals}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full sm:max-w-md">
            <div className="flex-1">
              <Input
                placeholder="Search hospital by name, registration or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-1.5" />
              Search
            </Button>
          </form>

          <div className="text-xs font-medium text-slate-500 w-full sm:w-auto text-right">
            Total Partners: <strong className="text-slate-800">{hospitals.length}</strong>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={hospitals}
          loading={loading}
          emptyMessage="No partner hospital facilities match your current query."
        />
      </div>
    </DashboardLayout>
  );
}
