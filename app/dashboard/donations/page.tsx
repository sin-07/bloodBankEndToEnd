'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { donorAPI } from '@/lib/api';
import { formatDate, getStatusVariant, COMPONENT_NAMES, getComponentBadgeClass } from '@/lib/utils';
import { Download, Droplets, Calendar, MapPin, Award, Plus, FlaskConical, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDonations();
  }, [page]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await donorAPI.getDonationHistory(page, 10);
      setDonations(res.data.data?.donations || []);
      setTotalPages(res.data.data?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load donation log');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (donationId: string) => {
    try {
      const res = await donorAPI.downloadCertificate(donationId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donation-certificate-${donationId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const columns = [
    {
      header: 'Donation Date',
      accessor: (d: any) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(d.donationDate)}</span>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      accessor: (d: any) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
          <Droplets className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>{d.bloodGroup}</span>
        </div>
      ),
    },
    {
      header: 'Donation Stream',
      accessor: (d: any) => {
        const stream = d.donationType || d.component || 'whole_blood';
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${getComponentBadgeClass(stream)}`}>
            {stream === 'platelets' ? (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Platelets (SDP)</span>
              </>
            ) : stream === 'plasma' ? (
              <>
                <FlaskConical className="w-3 h-3" />
                <span>Plasma (FFP)</span>
              </>
            ) : (
              <span>Whole Blood</span>
            )}
          </span>
        );
      },
    },
    {
      header: 'Volume',
      accessor: (d: any) => {
        const stream = d.donationType || d.component || 'whole_blood';
        const vol = stream === 'platelets' ? '300ml SDP' : stream === 'plasma' ? '250ml FFP' : `${d.units * 350}ml`;
        return (
          <span className="font-bold text-slate-900 text-xs">
            {d.units} {d.units === 1 ? 'Unit' : 'Units'} <span className="text-slate-500 font-normal">({vol})</span>
          </span>
        );
      },
    },
    {
      header: 'Center / Medical Facility',
      accessor: (d: any) => (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{d.location || 'Central Regional Vault'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (d: any) => (
        <Badge
          variant={getStatusVariant(d.status)}
          dot
          className="capitalize font-semibold"
        >
          {d.status}
        </Badge>
      ),
    },
    {
      header: 'Official Certificate',
      accessor: (d: any) => (
        <div>
          {d.status === 'completed' ? (
            <button
              type="button"
              onClick={() => handleDownloadCertificate(d._id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Certificate</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">Processing</span>
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
              <Award className="w-3.5 h-3.5" />
              <span>Personal Transfusion Impact Log</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Donation History & Contributions
            </h1>
            <p className="text-xs text-slate-600">
              Every unit donated contributes to saving up to 3 patients in regional emergency care
            </p>
          </div>

          <Link href="/dashboard/appointments">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Book Next Donation
            </Button>
          </Link>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={donations}
          loading={loading}
          emptyMessage="No donation records found. Schedule your first appointment today!"
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-xs font-semibold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
