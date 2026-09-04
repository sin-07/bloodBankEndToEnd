'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { bloodRequestAPI } from '@/lib/api';
import { formatDate, getStatusColor, getUrgencyColor, BLOOD_GROUPS } from '@/lib/utils';
import { Eye, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    bloodGroup: '',
    urgency: '',
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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await bloodRequestAPI.updateStatus(id, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
      setShowModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to ${status} request`
      );
    }
  };

  const viewRequest = (req: any) => {
    setSelectedRequest(req);
    setShowModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <Select
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
                ]}
              />
              <Select
                value={filters.bloodGroup}
                onChange={(e) =>
                  setFilters({ ...filters, bloodGroup: e.target.value })
                }
                options={[
                  { label: 'All Blood Groups', value: '' },
                  ...BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg })),
                ]}
              />
              <Select
                value={filters.urgency}
                onChange={(e) =>
                  setFilters({ ...filters, urgency: e.target.value })
                }
                options={[
                  { label: 'All Urgency', value: '' },
                  { label: 'Normal', value: 'normal' },
                  { label: 'Urgent', value: 'urgent' },
                  { label: 'Critical', value: 'critical' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
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
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewRequest(req)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {req.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600"
                                  onClick={() =>
                                    handleUpdateStatus(req._id, 'approved')
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() =>
                                    handleUpdateStatus(req._id, 'rejected')
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {req.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600"
                                onClick={() =>
                                  handleUpdateStatus(req._id, 'fulfilled')
                                }
                              >
                                Fulfill
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Request Details"
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-medium">{selectedRequest.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-semibold text-red-600">
                    {selectedRequest.bloodGroup}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Units Required</p>
                  <p className="font-medium">{selectedRequest.units}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgency</p>
                  <Badge
                    variant={getUrgencyColor(selectedRequest.urgency) as any}
                  >
                    {selectedRequest.urgency}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium">{selectedRequest.hospitalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{selectedRequest.city}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{selectedRequest.contactNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge
                    variant={getStatusColor(selectedRequest.status) as any}
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedRequest.reason}</p>
              </div>
              {selectedRequest.prescriptionUrl && (
                <div>
                  <p className="text-sm text-gray-500">Prescription</p>
                  <a
                    href={selectedRequest.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Prescription
                  </a>
                </div>
              )}
              {selectedRequest.matchedDonors?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Matched Donors</p>
                  <div className="space-y-2">
                    {selectedRequest.matchedDonors.map((donor: any) => (
                      <div
                        key={donor._id}
                        className="p-2 bg-gray-50 rounded text-sm"
                      >
                        {donor.userId?.name} - {donor.bloodGroup}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(selectedRequest._id, 'rejected')
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus(selectedRequest._id, 'approved')
                      }
                    >
                      Approve
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'approved' && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedRequest._id, 'fulfilled')
                    }
                  >
                    Mark as Fulfilled
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
