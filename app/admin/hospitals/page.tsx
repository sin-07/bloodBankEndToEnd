'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { hospitalAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Building2, Check, X, Search } from 'lucide-react';
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
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, isVerified: boolean) => {
    try {
      await hospitalAPI.verify(id, { isVerified });
      toast.success(
        isVerified ? 'Hospital verified' : 'Hospital verification revoked'
      );
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to update hospital');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Hospitals</h1>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search hospitals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Hospitals Table */}
        <Card>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading hospitals" />
            ) : hospitals.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hospitals found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Hospital Name</th>
                      <th className="pb-3 font-medium text-gray-500">Registration No.</th>
                      <th className="pb-3 font-medium text-gray-500">Type</th>
                      <th className="pb-3 font-medium text-gray-500">City</th>
                      <th className="pb-3 font-medium text-gray-500">Contact Person</th>
                      <th className="pb-3 font-medium text-gray-500">Total Requests</th>
                      <th className="pb-3 font-medium text-gray-500">Verified</th>
                      <th className="pb-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {hospitals.map((hospital: any) => (
                      <tr key={hospital._id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium">
                          {hospital.hospitalName}
                        </td>
                        <td className="py-3">
                          {hospital.registrationNumber || 'N/A'}
                        </td>
                        <td className="py-3 capitalize">{hospital.type}</td>
                        <td className="py-3">{hospital.city}</td>
                        <td className="py-3">
                          {hospital.contactPerson?.name || 'N/A'}
                        </td>
                        <td className="py-3 text-center">
                          {hospital.totalRequests}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={hospital.isVerified ? 'success' : 'warning'}
                          >
                            {hospital.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {hospital.isVerified ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleVerify(hospital._id, false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => handleVerify(hospital._id, true)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
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
