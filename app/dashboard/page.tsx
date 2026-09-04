'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/charts/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { donorAPI, bloodRequestAPI } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Heart, Droplets, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, donationsRes, requestsRes] = await Promise.all([
        donorAPI.getProfile().catch(() => null),
        donorAPI.getDonationHistory(1, 5).catch(() => null),
        bloodRequestAPI.getAll({ page: 1, limit: 5 }).catch(() => null),
      ]);

      if (profileRes?.data?.data) setProfile(profileRes.data.data?.donor || profileRes.data.data);
      if (donationsRes?.data?.data) setDonations(donationsRes.data.data?.donations || []);
      if (requestsRes?.data?.data) setRequests(requestsRes.data.data?.requests || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Donations',
      value: profile?.totalDonations || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Blood Group',
      value: profile?.bloodGroup || 'N/A',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Last Donation',
      value: profile?.lastDonationDate
        ? formatDate(profile.lastDonationDate)
        : 'Never',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Eligible',
      value: (() => {
        if (!profile?.lastDonationDate) return 'Yes';
        const daysSince = Math.floor((Date.now() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSince >= 90 ? 'Yes' : 'No';
      })(),
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s your donation overview
          </p>
        </div>

        {/* Stats Cards */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No donations yet. Start saving lives today!
                </p>
              ) : (
                <div className="space-y-3">
                  {donations.map((donation: any) => (
                    <div
                      key={donation._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{donation.bloodGroup}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(donation.donationDate)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(donation.status) as any}>
                        {donation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Blood Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Blood Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No blood requests found.
                </p>
              ) : (
                <div className="space-y-3">
                  {requests.map((request: any) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {request.patientName} - {request.bloodGroup}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.hospitalName} · {request.units} units
                        </p>
                      </div>
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Eligibility Info */}
        {profile && profile.lastDonationDate && (() => {
          const daysSince = Math.floor((Date.now() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));
          const daysLeft = Math.max(0, 90 - daysSince);
          return daysLeft > 0;
        })() && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-amber-600">
                <Calendar className="h-5 w-5" />
                <p>
                  You are not yet eligible for donation. You can donate again
                  in {Math.max(0, 90 - Math.floor((Date.now() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)))} days.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
