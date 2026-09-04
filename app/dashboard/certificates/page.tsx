'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { donorAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Download, Award, Droplets, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedDonations();
  }, []);

  const fetchCompletedDonations = async () => {
    try {
      setLoading(true);
      const res = await donorAPI.getDonationHistory(1, 50);
      const completed = (res.data.data?.donations || []).filter(
        (d: any) => d.status === 'completed'
      );
      setDonations(completed);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (donationId: string) => {
    try {
      const res = await donorAPI.downloadCertificate(donationId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donation-certificate-${donationId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Accredited Recognition Certificates</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Donor Certificates of Honor
            </h1>
            <p className="text-xs text-slate-600">
              Download and verify your digitally signed certificates for each completed blood donation
            </p>
          </div>
        </div>

        {loading ? (
          <BloodLoader fullScreen={false} size="sm" text="Retrieving verified certificates" />
        ) : donations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Certificates Issued Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your certified donor certificate is issued automatically after completing and verifying each donation appointment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation: any) => (
              <div
                key={donation._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-card transition-all relative overflow-hidden"
              >
                {/* Decorative corner seal */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-50 to-transparent pointer-events-none rounded-bl-full -z-0" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
                      <Award className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Donor
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    Certificate of Appreciation
                  </h3>
                  <p className="text-xs text-slate-500 mb-5">
                    Authorized by Srishti Blood Bank Registry
                  </p>

                  <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Date of Donation:</span>
                      <span className="font-semibold text-slate-800">{formatDate(donation.donationDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Blood Group:</span>
                      <span className="font-bold text-rose-600">{donation.bloodGroup}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Units Donated:</span>
                      <span className="font-semibold text-slate-800">{donation.units} Unit(s)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">{donation.location || 'Central Vault'}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 relative z-10"
                  onClick={() => handleDownload(donation._id)}
                >
                  <Download className="h-4 w-4 mr-2 text-rose-600" />
                  Download PDF Certificate
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
