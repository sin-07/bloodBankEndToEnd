'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { hospitalAPI } from '@/lib/api';
import { formatDate, getStatusColor, getUrgencyColor } from '@/lib/utils';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
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
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Requests',
      value: requests?.stats?.total || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending',
      value: requests?.stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Fulfilled',
      value: requests?.stats?.fulfilled || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Rejected',
      value: requests?.stats?.rejected || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <BloodLoader fullScreen={false} size="lg" text="Loading dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.hospitalName || 'Hospital Dashboard'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={profile?.isVerified ? 'success' : 'warning'}>
              {profile?.isVerified ? 'Verified' : 'Verification Pending'}
            </Badge>
            <span className="text-gray-500">
              {profile?.city}, {profile?.state}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {!requests?.data?.length ? (
              <p className="text-gray-500 text-center py-8">
                No requests yet. Create your first blood request.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Patient</th>
                      <th className="pb-3 font-medium text-gray-500">Blood Group</th>
                      <th className="pb-3 font-medium text-gray-500">Units</th>
                      <th className="pb-3 font-medium text-gray-500">Urgency</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {requests.data.slice(0, 10).map((req: any) => (
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
