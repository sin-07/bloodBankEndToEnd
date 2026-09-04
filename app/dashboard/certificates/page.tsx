'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { donorAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Download, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedDonations();
  }, []);

  const fetchCompletedDonations = async () => {
    try {
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
      toast.success('Certificate downloaded');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Donation Certificates
        </h1>

        {loading ? (
          <BloodLoader fullScreen={false} size="sm" text="Loading certificates" />
        ) : donations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No certificates available</p>
              <p className="text-gray-400 mt-1">
                Complete a donation to receive your certificate.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donations.map((donation: any) => (
              <Card key={donation._id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <Award className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Donation Certificate</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(donation.donationDate)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>
                      <span className="font-medium">Blood Group:</span>{' '}
                      {donation.bloodGroup}
                    </p>
                    <p>
                      <span className="font-medium">Units:</span>{' '}
                      {donation.units}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{' '}
                      {donation.location || 'N/A'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDownload(donation._id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
