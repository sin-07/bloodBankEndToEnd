'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { bloodRequestAPI } from '@/lib/api';
import { formatDate, getStatusColor, getUrgencyColor, BLOOD_GROUPS } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ status: '', bloodGroup: '' });
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    units: '1',
    urgency: 'normal',
    reason: '',
    hospitalName: '',
    city: '',
    contactNumber: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await bloodRequestAPI.getAll(filters);
      setRequests(res.data.data?.requests || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await bloodRequestAPI.create({
        ...formData,
        units: Number(formData.units),
      });
      toast.success('Blood request submitted successfully');
      setShowModal(false);
      setFormData({
        patientName: '',
        bloodGroup: '',
        units: '1',
        urgency: 'normal',
        reason: '',
        hospitalName: '',
        city: '',
        contactNumber: '',
      });
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      await bloodRequestAPI.cancel(id);
      toast.success('Request cancelled');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <Select
                placeholder="All Statuses"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                options={[
                  { label: 'All Statuses', value: '' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Approved', value: 'approved' },
                  { label: 'Fulfilled', value: 'fulfilled' },
                  { label: 'Rejected', value: 'rejected' },
                  { label: 'Cancelled', value: 'cancelled' },
                ]}
              />
              <Select
                placeholder="All Blood Groups"
                value={filters.bloodGroup}
                onChange={(e) =>
                  setFilters({ ...filters, bloodGroup: e.target.value })
                }
                options={[
                  { label: 'All Blood Groups', value: '' },
                  ...BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg })),
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading requests" />
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No blood requests found.</p>
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
                      <th className="pb-3 font-medium text-gray-500">Hospital</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500">Date</th>
                      <th className="pb-3 font-medium text-gray-500">Actions</th>
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
                        <td className="py-3">{req.hospitalName}</td>
                        <td className="py-3">
                          <Badge variant={getStatusColor(req.status) as any}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-3">{formatDate(req.createdAt)}</td>
                        <td className="py-3">
                          {req.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(req._id)}
                              className="text-red-600"
                            >
                              Cancel
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

        {/* New Request Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="New Blood Request"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Patient Name"
                value={formData.patientName}
                onChange={(e) =>
                  setFormData({ ...formData, patientName: e.target.value })
                }
                required
              />
              <Select
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) =>
                  setFormData({ ...formData, bloodGroup: e.target.value })
                }
                options={BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg }))}
                required
              />
              <Input
                label="Units Required"
                type="number"
                min="1"
                value={formData.units}
                onChange={(e) =>
                  setFormData({ ...formData, units: e.target.value })
                }
                required
              />
              <Select
                label="Urgency"
                value={formData.urgency}
                onChange={(e) =>
                  setFormData({ ...formData, urgency: e.target.value })
                }
                options={[
                  { label: 'Normal', value: 'normal' },
                  { label: 'Urgent', value: 'urgent' },
                  { label: 'Critical', value: 'critical' },
                ]}
              />
              <Input
                label="Hospital Name"
                value={formData.hospitalName}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalName: e.target.value })
                }
                required
              />
              <Input
                label="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
              <Input
                label="Contact Number"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                required
              />
            </div>
            <Input
              label="Reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
