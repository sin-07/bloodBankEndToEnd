'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { bloodRequestAPI } from '@/lib/api';
import { formatDate, formatDateTime, getStatusVariant, getUrgencyVariant, BLOOD_GROUPS, COMPONENT_NAMES, getComponentBadgeClass } from '@/lib/utils';
import { Eye, Check, X, Droplets, Filter, RefreshCw, Activity, Building2, Phone, Calendar, UserCheck, FlaskConical, Sparkles } from 'lucide-react';
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
    component: '',
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
      toast.error('Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await bloodRequestAPI.updateStatus(id, { status });
      toast.success(`Request marked as ${status}`);
      fetchRequests();
      setShowModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to update status to ${status}`
      );
    }
  };

  const viewRequest = (req: any) => {
    setSelectedRequest(req);
    setShowModal(true);
  };

  const columns = [
    {
      header: 'Patient / Contact',
      accessor: (req: any) => (
        <div>
          <div className="font-semibold text-slate-900 text-sm">{req.patientName}</div>
          <div className="text-[11px] text-slate-500">{req.contactNumber || 'No phone'}</div>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      accessor: (req: any) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
          <Droplets className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>{req.bloodGroup}</span>
        </div>
      ),
    },
    {
      header: 'Component',
      accessor: (req: any) => {
        const comp = req.component || 'whole_blood';
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${getComponentBadgeClass(comp)}`}>
            {COMPONENT_NAMES[comp] || comp}
          </span>
        );
      },
    },
    {
      header: 'Units',
      accessor: (req: any) => (
        <div className="font-semibold text-slate-900">
          {req.units} <span className="text-xs font-normal text-slate-500">units</span>
        </div>
      ),
    },
    {
      header: 'Urgency',
      accessor: (req: any) => (
        <Badge
          variant={getUrgencyVariant(req.urgency)}
          dot
          pulse={req.urgency === 'critical'}
          className="capitalize font-semibold"
        >
          {req.urgency}
        </Badge>
      ),
    },
    {
      header: 'Requesting Hospital',
      accessor: (req: any) => (
        <div className="text-xs font-medium text-slate-700 max-w-[180px] truncate" title={req.hospitalName}>
          {req.hospitalName || 'Individual / Clinic'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (req: any) => (
        <Badge
          variant={getStatusVariant(req.status)}
          dot
          className="capitalize font-semibold"
        >
          {req.status}
        </Badge>
      ),
    },
    {
      header: 'Dispatched',
      accessor: (req: any) => (
        <span className="text-xs text-slate-500">{formatDate(req.createdAt)}</span>
      ),
    },
    {
      header: 'Triage Actions',
      accessor: (req: any) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewRequest(req)}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-1.5"
            title="Inspect Request"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {req.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => handleUpdateStatus(req._id, 'approved')}
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                title="Approve Requisition"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(req._id, 'rejected')}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Reject Requisition"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}

          {req.status === 'approved' && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(req._id, 'fulfilled')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
            >
              Fulfill
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Emergency Command Central</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Blood Requisitions Management
            </h1>
            <p className="text-xs text-slate-600">
              Triage, verify compatibility, and dispatch clinical blood supplies to registered medical centers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters:</span>
            </div>

            <Select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              options={[
                { label: 'All Lifecycle Statuses', value: '' },
                { label: 'Pending Review', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Fulfilled', value: 'fulfilled' },
                { label: 'Rejected', value: 'rejected' },
              ]}
              className="text-xs py-1.5"
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
              className="text-xs py-1.5"
            />

            <Select
              value={filters.urgency}
              onChange={(e) =>
                setFilters({ ...filters, urgency: e.target.value })
              }
              options={[
                { label: 'All Priority Levels', value: '' },
                { label: 'Normal Priority', value: 'normal' },
                { label: 'Urgent Priority', value: 'urgent' },
                { label: 'Critical Priority', value: 'critical' },
              ]}
              className="text-xs py-1.5"
            />

            <Select
              value={filters.component}
              onChange={(e) =>
                setFilters({ ...filters, component: e.target.value })
              }
              options={[
                { label: 'All Components', value: '' },
                { label: 'Whole Blood', value: 'whole_blood' },
                { label: 'Platelets (SDP)', value: 'platelets' },
                { label: 'Plasma (FFP)', value: 'plasma' },
                { label: 'Packed RBC', value: 'packed_rbc' },
                { label: 'Cryoprecipitate', value: 'cryoprecipitate' },
              ]}
              className="text-xs py-1.5"
            />
          </div>

          <div className="text-xs font-medium text-slate-500 w-full md:w-auto text-right">
            Found <strong className="text-slate-800">{requests.length}</strong> matching request{requests.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Data Table */}
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMessage="No blood requisitions found matching the applied filter criteria."
        />

        {/* Request Details Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Clinical Requisition Details"
          size="lg"
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center font-black text-lg text-rose-600">
                    {selectedRequest.bloodGroup}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedRequest.patientName}</h4>
                    <p className="text-xs text-slate-500">{selectedRequest.hospitalName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getComponentBadgeClass(selectedRequest.component || 'whole_blood')}`}>
                    {COMPONENT_NAMES[selectedRequest.component || 'whole_blood'] || selectedRequest.component}
                  </span>
                  <Badge variant={getUrgencyVariant(selectedRequest.urgency)} dot>
                    {selectedRequest.urgency}
                  </Badge>
                  <Badge variant={getStatusVariant(selectedRequest.status)} dot>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {/* Grid of Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Component</span>
                  <span className="font-bold text-slate-900 text-sm">{COMPONENT_NAMES[selectedRequest.component || 'whole_blood'] || 'Whole Blood'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Units Required</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedRequest.units} units</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Destination City</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.city || 'Regional Center'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-1">Emergency Contact</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.contactNumber || 'N/A'}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 col-span-2 md:col-span-4">
                  <span className="text-slate-500 block mb-1">Clinical Diagnosis & Reason</span>
                  <span className="font-medium text-slate-800">{selectedRequest.reason || 'General emergency transfusion required.'}</span>
                </div>
              </div>

              {/* Matched Donors Section */}
              {selectedRequest.matchedDonors?.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Compatible Matched Donors In Vicinity
                  </h5>
                  <div className="space-y-1.5">
                    {selectedRequest.matchedDonors.map((donor: any) => (
                      <div
                        key={donor._id}
                        className="p-2.5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{donor.userId?.name}</span>
                        <Badge variant="success">{donor.bloodGroup}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Close
                </Button>

                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-300 text-rose-700 hover:bg-rose-50"
                      onClick={() => handleUpdateStatus(selectedRequest._id, 'rejected')}
                    >
                      Reject Request
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleUpdateStatus(selectedRequest._id, 'approved')}
                    >
                      Approve Request
                    </Button>
                  </>
                )}

                {selectedRequest.status === 'approved' && (
                  <Button
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-700"
                    onClick={() => handleUpdateStatus(selectedRequest._id, 'fulfilled')}
                  >
                    Mark as Fulfilled & Dispatched
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
