'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { donorAPI } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Download, Search } from 'lucide-react';
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
      toast.error('Failed to load donations');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
        </div>

        <Card>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading donations" />
            ) : donations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No donation records yet.</p>
                <p className="text-gray-400 mt-1">
                  Your donation history will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Date</th>
                      <th className="pb-3 font-medium text-gray-500">Blood Group</th>
                      <th className="pb-3 font-medium text-gray-500">Units</th>
                      <th className="pb-3 font-medium text-gray-500">Location</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {donations.map((donation: any) => (
                      <tr key={donation._id} className="hover:bg-gray-50">
                        <td className="py-3">
                          {formatDate(donation.donationDate)}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-red-600">
                            {donation.bloodGroup}
                          </span>
                        </td>
                        <td className="py-3">{donation.units}</td>
                        <td className="py-3">{donation.location || 'N/A'}</td>
                        <td className="py-3">
                          <Badge
                            variant={getStatusColor(donation.status) as any}
                          >
                            {donation.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {donation.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDownloadCertificate(donation._id)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
