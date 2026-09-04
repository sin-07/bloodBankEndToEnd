'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import StatsCard from '@/components/charts/StatsCard';
import BloodStockChart from '@/components/charts/BloodStockChart';
import DonationTrendChart from '@/components/charts/DonationTrendChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { adminAPI } from '@/lib/api';
import { formatDate, getStatusColor, getUrgencyColor } from '@/lib/utils';
import { Users, Droplets, Heart, FileText, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await adminAPI.getDashboardStats();
      setStats(res.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <BloodLoader fullScreen={false} size="lg" text="Loading dashboard" />
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Donors',
      value: stats?.totalDonors || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Donations',
      value: stats?.totalDonations || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Blood Requests',
      value: stats?.totalRequests || 0,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Units',
      value: stats?.totalUnits || 0,
      icon: Droplets,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Blood Stock Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <BloodStockChart data={stats?.bloodStock || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Donation Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <DonationTrendChart data={stats?.donationTrends || []} />
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.lowStockAlerts?.length > 0 ? (
                <div className="space-y-2">
                  {stats.lowStockAlerts.map((alert: any) => (
                    <div
                      key={alert.bloodGroup}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <span className="font-semibold text-red-600">
                        {alert.bloodGroup}
                      </span>
                      <span className="text-sm text-amber-700">
                        {alert.units} units remaining
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  All blood groups are well stocked.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Requests by Urgency */}
          <Card>
            <CardHeader>
              <CardTitle>Requests by Urgency</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.requestsByUrgency?.length > 0 ? (
                <div className="space-y-2">
                  {stats.requestsByUrgency.map((item: any) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <Badge variant={getUrgencyColor(item._id) as any}>
                        {item._id}
                      </Badge>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No pending requests.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
