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
import Table from '@/components/ui/Table';
import { bloodRequestAPI } from '@/lib/api';
import { formatDate, getStatusVariant, getUrgencyVariant, BLOOD_GROUPS } from '@/lib/utils';
import { Plus, Search, Droplets, Filter, RefreshCw, Activity, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ status: '', bloodGroup: '' });
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
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
      toast.error('Failed to load blood requests');
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
      toast.success('Emergency blood request dispatched successfully');
      setShowModal(false);
      setFormData({
        patientName: '',
        bloodGroup: 'O+',
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
    if (!confirm('Are you sure you want to cancel this emergency request?')) return;
    try {
      await bloodRequestAPI.cancel(id);
      toast.success('Request cancelled');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const columns = [
    {
      header: 'Patient Name',
      accessor: (req: any) => (
        <div>
          <span className="font-bold text-slate-900 text-sm block">{req.patientName}</span>
          <span className="text-[11px] text-slate-500">{req.contactNumber || 'No phone'}</span>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      accessor: (req: any) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
          <Droplets className="w-3.5 h-3.5 fill-rose-600" />
          <span>{req.bloodGroup}</span>
        </div>
      ),
    },
    {
      header: 'Units',
      accessor: (req: any) => (
        <span className="font-bold text-slate-900 text-xs">{req.units} units</span>
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
      header: 'Target Hospital',
      accessor: (req: any) => (
        <span className="text-xs text-slate-700 truncate max-w-[160px] block" title={req.hospitalName}>
          {req.hospitalName || 'Regional Center'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (req: any) => (
        <Badge variant={getStatusVariant(req.status)} dot className="capitalize font-semibold">
          {req.status}
        </Badge>
      ),
    },
    {
      header: 'Requested Date',
      accessor: (req: any) => (
        <span className="text-xs text-slate-500">{formatDate(req.createdAt)}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: (req: any) => (
        <div>
          {req.status === 'pending' && (
            <button
              type="button"
              onClick={() => handleCancel(req._id)}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Personal Requisitions Log</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Emergency Blood Requests
            </h1>
            <p className="text-xs text-slate-600">
              Submit and monitor individual requests for yourself or family members across regional banks
            </p>
          </div>

          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Request
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
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
              className="text-xs py-1.5"
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
              className="text-xs py-1.5"
            />
          </div>

          <div className="text-xs font-medium text-slate-500 w-full sm:w-auto text-right">
            Total Requests: <strong className="text-slate-800">{requests.length}</strong>
          </div>
        </div>

        {/* Requests Table */}
        <Table
          columns={columns}
          data={requests}
          loading={loading}
          emptyMessage="No blood requests found matching your query."
        />

        {/* New Request Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Dispatch Emergency Blood Request"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Patient Name *"
                placeholder="Full name of recipient"
                value={formData.patientName}
                onChange={(e) =>
                  setFormData({ ...formData, patientName: e.target.value })
                }
                required
              />
              <Select
                label="Blood Group *"
                value={formData.bloodGroup}
                onChange={(e) =>
                  setFormData({ ...formData, bloodGroup: e.target.value })
                }
                options={BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg }))}
                required
              />
              <Input
                label="Units Required *"
                type="number"
                min="1"
                max="10"
                value={formData.units}
                onChange={(e) =>
                  setFormData({ ...formData, units: e.target.value })
                }
                required
              />
              <Select
                label="Triage Urgency *"
                value={formData.urgency}
                onChange={(e) =>
                  setFormData({ ...formData, urgency: e.target.value })
                }
                options={[
                  { label: 'Normal (Routine)', value: 'normal' },
                  { label: 'Urgent (Required < 6 hrs)', value: 'urgent' },
                  { label: 'Critical (Life-Threatening)', value: 'critical' },
                ]}
              />
              <Input
                label="Hospital / Ward Location *"
                placeholder="e.g. Lilavati Hospital, Ward 3"
                value={formData.hospitalName}
                onChange={(e) =>
                  setFormData({ ...formData, hospitalName: e.target.value })
                }
                required
              />
              <Input
                label="City *"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                required
              />
              <Input
                label="Attending Contact Number *"
                placeholder="+91 98765 43210"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
                required
              />
              <Input
                label="Clinical Reason / Diagnosis *"
                placeholder="e.g. Scheduled knee replacement surgery"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
