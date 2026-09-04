'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { hospitalAPI } from '@/lib/api';
import { formatDate, getStatusColor, getUrgencyColor, BLOOD_GROUPS } from '@/lib/utils';
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
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Fulfilled', value: 'fulfilled' },
                { label: 'Rejected', value: 'rejected' },
              ]}
            />
          </CardContent>
        </Card>

        {/* Requests */}
        <Card>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading requests" />
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Patient</th>
                      <th className="pb-3 font-medium text-gray-500">Blood Group</th>
                      <th className="pb-3 font-medium text-gray-500">Units</th>
                      <th className="pb-3 font-medium text-gray-500">Urgency</th>
                      <th className="pb-3 font-medium text-gray-500">Reason</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {requests.map((req: any) => (
                      <tr key={req._id} className="hover:bg-gray-50">
                        <td className="py-3">{req.patientName}</td>
                        <td className="py-3">
                          <span className="font-semibold text-red-600">
                            {req.bloodGroup}
                          </span>
                        </td>
                        <td className="py-3">{req.units}</td>
                        <td className="py-3">
                          <Badge variant={getUrgencyColor(req.urgency) as any}>
                            {req.urgency}
                          </Badge>
                        </td>
                        <td className="py-3 max-w-[200px] truncate">
                          {req.reason}
                        </td>
                        <td className="py-3">
                          <Badge variant={getStatusColor(req.status) as any}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-3">{formatDate(req.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
