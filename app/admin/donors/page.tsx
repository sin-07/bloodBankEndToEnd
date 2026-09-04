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
import { donorAPI } from '@/lib/api';
import { formatDate, BLOOD_GROUPS } from '@/lib/utils';
import { Search, Droplets, CalendarCheck, CheckCircle, XCircle, User, Calendar, MapPin, Users, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<any[]>([]);
  const [pendingAppts, setPendingAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apptLoading, setApptLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Record donation modal
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [recordForm, setRecordForm] = useState({ bloodGroup: '', units: '1', location: '', notes: '' });
  const [recording, setRecording] = useState(false);

  // Approve appointment modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [approveForm, setApproveForm] = useState({ units: '1', location: '', notes: '' });
  const [approving, setApproving] = useState(false);

  useEffect(() => { fetchDonors(); }, [page, bloodGroup]);
  useEffect(() => { fetchPendingAppts(); }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await donorAPI.getAll({ page, bloodGroup, search });
      setDonors(res.data.data?.donors || []);
      setTotalPages(res.data.data?.pagination?.totalPages || 1);
    } catch {
      toast.error('Failed to load donors directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAppts = async () => {
    try {
      setApptLoading(true);
      const res = await donorAPI.getAppointments({ status: 'pending' });
      setPendingAppts(res.data.data?.appointments || []);
    } catch {
      // silently fail if no appointments
    } finally {
      setApptLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonors();
  };

  const openRecordModal = (donor: any) => {
    setSelectedDonor(donor);
    setRecordForm({ bloodGroup: donor.bloodGroup || '', units: '1', location: 'Main Blood Bank Center', notes: '' });
    setShowRecordModal(true);
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecording(true);
      await donorAPI.recordDonation({
        donorId: selectedDonor._id,
        bloodGroup: recordForm.bloodGroup,
        units: Number(recordForm.units),
        location: recordForm.location,
        notes: recordForm.notes,
      });
      toast.success('Donation recorded successfully!');
      setShowRecordModal(false);
      fetchDonors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record donation');
    } finally {
      setRecording(false);
    }
  };

  const openApproveModal = (appt: any) => {
    setSelectedAppt(appt);
    setApproveForm({ units: '1', location: appt.location || 'Central Clinic', notes: '' });
    setShowApproveModal(true);
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApproving(true);
      await donorAPI.approveDonation(selectedAppt._id, {
        units: Number(approveForm.units),
        location: approveForm.location,
        notes: approveForm.notes,
      });
      toast.success('Appointment approved and donation recorded!');
      setShowApproveModal(false);
      fetchPendingAppts();
      fetchDonors();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to approve appointment');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (apptId: string) => {
    if (!confirm('Reject this appointment?')) return;
    try {
      await donorAPI.rejectDonation(apptId);
      toast.success('Appointment rejected');
      fetchPendingAppts();
    } catch {
      toast.error('Failed to reject appointment');
    }
  };

  const columns = [
    {
      header: 'Donor Identity',
      accessor: (donor: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
            {donor.userId?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{donor.userId?.name || 'Anonymous'}</p>
            <p className="text-slate-500 text-[11px]">{donor.userId?.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Blood Group',
      accessor: (donor: any) => (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
          <Droplets className="w-3.5 h-3.5 fill-rose-600" />
          <span>{donor.bloodGroup}</span>
        </div>
      ),
    },
    {
      header: 'Gender',
      accessor: (donor: any) => (
        <span className="capitalize text-xs text-slate-700 font-medium">{donor.gender || 'Unspecified'}</span>
      ),
    },
    {
      header: 'Total Contributions',
      accessor: (donor: any) => (
        <span className="font-bold text-slate-900 text-xs">
          {donor.totalDonations} {donor.totalDonations === 1 ? 'time' : 'times'}
        </span>
      ),
    },
    {
      header: 'Last Donation',
      accessor: (donor: any) => (
        <span className="text-xs text-slate-600">
          {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'First Time'}
        </span>
      ),
    },
    {
      header: 'Eligibility Status',
      accessor: (donor: any) => (
        <Badge
          variant={donor.isEligible ? 'success' : 'warning'}
          dot
          className="font-semibold"
        >
          {donor.isEligible ? 'Eligible' : 'Wait Period'}
        </Badge>
      ),
    },
    {
      header: 'City',
      accessor: (donor: any) => (
        <span className="text-xs text-slate-600">{donor.userId?.city || 'Regional'}</span>
      ),
    },
    {
      header: 'Action',
      accessor: (donor: any) => (
        <Button
          size="sm"
          variant="outline"
          disabled={!donor.isEligible}
          onClick={() => openRecordModal(donor)}
          className="text-xs py-1 h-8"
          title={donor.isEligible ? 'Record donation' : 'Donor is currently within recovery interval'}
        >
          <Droplets className="w-3.5 h-3.5 mr-1 text-rose-600" />
          Record
        </Button>
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
              <Users className="w-3.5 h-3.5" />
              <span>Registered Donor Registry</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage Donors & Schedules
            </h1>
            <p className="text-xs text-slate-600">
              Review volunteer donor records, verify medical eligibility, and approve upcoming donation slots
            </p>
          </div>
        </div>

        {/* Pending Appointments Alert Card */}
        {pendingAppts.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-700" />
                <h2 className="text-sm font-bold text-amber-950">
                  Pending Donation Appointments
                </h2>
              </div>
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {pendingAppts.length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingAppts.map((appt: any) => (
                <div
                  key={appt._id}
                  className="p-4 bg-white rounded-2xl border border-amber-200/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{appt.userId?.name || 'Unknown Donor'}</p>
                    <p className="text-xs text-slate-500">{appt.userId?.email} &bull; {appt.userId?.phone || 'No phone'}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-rose-50 font-bold text-rose-700 border border-rose-200">
                        {appt.bloodGroup}
                      </span>
                      <span className="text-slate-600">&bull; {formatDate(appt.donationDate)}</span>
                      <span className="text-slate-500">&bull; {appt.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <Button size="sm" onClick={() => openApproveModal(appt)} className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1 h-8">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(appt._id)} className="text-xs py-1 h-8">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-2xl">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search donors by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={bloodGroup}
              onChange={(e) => { setBloodGroup(e.target.value); setPage(1); }}
              options={[
                { label: 'All Blood Groups', value: '' },
                ...BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg })),
              ]}
              className="w-48 text-xs py-1.5"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-1.5" />
              Search
            </Button>
          </form>

          <div className="text-xs font-medium text-slate-500 w-full md:w-auto text-right">
            Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
          </div>
        </div>

        {/* Donors Table */}
        <Table
          columns={columns}
          data={donors}
          loading={loading}
          emptyMessage="No registered donors found matching your search criteria."
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous Page
            </Button>
            <span className="text-xs font-semibold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page
            </Button>
          </div>
        )}

        {/* Record Donation Modal */}
        <Modal
          isOpen={showRecordModal}
          onClose={() => setShowRecordModal(false)}
          title="Direct Donation Record"
        >
          <div className="mb-4 p-3 bg-rose-50/60 rounded-xl border border-rose-200/80">
            <p className="font-bold text-slate-900 text-sm">{selectedDonor?.userId?.name}</p>
            <p className="text-xs text-slate-500">{selectedDonor?.userId?.email}</p>
          </div>
          <form onSubmit={handleRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Confirmed Blood Group"
                value={recordForm.bloodGroup}
                onChange={e => setRecordForm(f => ({ ...f, bloodGroup: e.target.value }))}
                options={BLOOD_GROUPS.map(bg => ({ label: bg, value: bg }))}
                required
              />
              <Select
                label="Units Collected"
                value={recordForm.units}
                onChange={e => setRecordForm(f => ({ ...f, units: e.target.value }))}
                options={[
                  { label: '1 Unit (350ml - Standard)', value: '1' },
                  { label: '2 Units (Double Red Cell)', value: '2' },
                ]}
              />
            </div>
            <Input
              label="Collection Center / Camp Location *"
              placeholder="e.g. Srishti Blood Bank Main Center"
              value={recordForm.location}
              onChange={e => setRecordForm(f => ({ ...f, location: e.target.value }))}
              required
            />
            <Input
              label="Staff Notes & Health Verification"
              placeholder="Hemoglobin 13.5 g/dL, BP 120/80 mmHg"
              value={recordForm.notes}
              onChange={e => setRecordForm(f => ({ ...f, notes: e.target.value }))}
            />
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRecordModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={recording}>
                Save Inward Donation
              </Button>
            </div>
          </form>
        </Modal>

        {/* Approve Appointment Modal */}
        <Modal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          title="Approve Donor Appointment"
        >
          {selectedAppt && (
            <div className="mb-4 p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs">
              <p className="font-bold text-slate-900 text-sm mb-0.5">
                {selectedAppt.userId?.name} &bull; <span className="text-rose-600 font-bold">{selectedAppt.bloodGroup}</span>
              </p>
              <p className="text-slate-600">
                Slot: {formatDate(selectedAppt.donationDate)} &bull; {selectedAppt.location}
              </p>
            </div>
          )}
          <form onSubmit={handleApprove} className="space-y-4">
            <Select
              label="Units Completed"
              value={approveForm.units}
              onChange={e => setApproveForm(f => ({ ...f, units: e.target.value }))}
              options={[{ label: '1 Unit', value: '1' }, { label: '2 Units', value: '2' }]}
            />
            <Input
              label="Confirmed Center Location *"
              value={approveForm.location}
              onChange={e => setApproveForm(f => ({ ...f, location: e.target.value }))}
              required
            />
            <Input
              label="Screening Observations (optional)"
              placeholder="Good donor health, vitals stable"
              value={approveForm.notes}
              onChange={e => setApproveForm(f => ({ ...f, notes: e.target.value }))}
            />
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowApproveModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" loading={approving}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm & Record Units
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
