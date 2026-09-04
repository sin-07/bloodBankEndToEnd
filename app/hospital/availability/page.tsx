'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { inventoryAPI } from '@/lib/api';
import { BLOOD_GROUPS } from '@/lib/utils';
import { Droplets, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AvailabilityPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await inventoryAPI.getSummary();
      setSummary(res.data.data);
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <BloodLoader fullScreen={false} size="lg" text="Loading availability" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Blood Availability</h1>

        {/* Blood Group Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map((bg) => {
            const stock = summary?.bloodStock?.find((s: any) => s._id === bg);
            const units = stock?.totalUnits || 0;
            const isLow = units < 5;
            const isEmpty = units === 0;

            return (
              <Card key={bg}>
                <CardContent className="p-6 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                      isEmpty
                        ? 'bg-red-100'
                        : isLow
                        ? 'bg-amber-100'
                        : 'bg-green-100'
                    }`}
                  >
                    <Droplets
                      className={`h-8 w-8 ${
                        isEmpty
                          ? 'text-red-600'
                          : isLow
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}
                    />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{bg}</p>
                  <p
                    className={`text-3xl font-bold mt-2 ${
                      isEmpty
                        ? 'text-red-600'
                        : isLow
                        ? 'text-amber-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {units}
                  </p>
                  <p className="text-sm text-gray-500">units available</p>
                  <div className="mt-3">
                    {isEmpty ? (
                      <Badge variant="danger">Unavailable</Badge>
                    ) : isLow ? (
                      <Badge variant="warning">Low Stock</Badge>
                    ) : (
                      <Badge variant="success">Available</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alerts */}
        {summary?.lowStockAlerts?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.lowStockAlerts.map((alert: any) => (
                  <div
                    key={alert.bloodGroup}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-red-600">
                        {alert.bloodGroup}
                      </span>
                    </div>
                    <span className="text-sm text-amber-700">
                      Only {alert.units} units remaining
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expiring Soon */}
        {summary?.expiringSoon?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.expiringSoon.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold text-red-600">
                        {item.bloodGroup}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {item.component}
                      </span>
                    </div>
                    <span className="text-sm text-amber-600">
                      Expires in {item.daysUntilExpiry} days
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
