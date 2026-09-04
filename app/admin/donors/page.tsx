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
import { donorAPI } from '@/lib/api';
import { formatDate, BLOOD_GROUPS } from '@/lib/utils';
import { Search, Droplets, CalendarCheck, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
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

  // Record donation modal (admin direct record)
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
      toast.error('Failed to load donors');
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
    setRecordForm({ bloodGroup: donor.bloodGroup || '', units: '1', location: '', notes: '' });
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
    setApproveForm({ units: '1', location: appt.location || '', notes: '' });
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Donors</h1>
        </div>

        {/* ── Pending Appointments ── */}
        {(apptLoading || pendingAppts.length > 0) && (
          <Card className="border-amber-200 bg-amber-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                <CalendarCheck className="w-5 h-5" />
                Pending Donation Appointments
                {pendingAppts.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingAppts.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apptLoading ? (
                <p className="text-sm text-amber-700 py-2">Loading appointments...</p>
              ) : (
                <div className="space-y-3">
                  {pendingAppts.map((appt: any) => (
                    <div key={appt._id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-amber-100 shadow-sm flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{appt.userId?.name || 'Unknown Donor'}</p>
                        <p className="text-xs text-gray-500">{appt.userId?.email} · {appt.userId?.phone}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="font-semibold text-red-600">{appt.bloodGroup}</span>
                          <span>📅 {formatDate(appt.donationDate)}</span>
                          <span>📍 {appt.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" onClick={() => openApproveModal(appt)}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(appt._id)}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by name or email..."
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
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Donors Table */}
        <Card>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading donors" />
            ) : donors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No donors found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Name</th>
                      <th className="pb-3 font-medium text-gray-500">Blood Group</th>
                      <th className="pb-3 font-medium text-gray-500">Gender</th>
                      <th className="pb-3 font-medium text-gray-500">Total Donations</th>
                      <th className="pb-3 font-medium text-gray-500">Last Donation</th>
                      <th className="pb-3 font-medium text-gray-500">Eligible</th>
                      <th className="pb-3 font-medium text-gray-500">City</th>
                      <th className="pb-3 font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {donors.map((donor: any) => (
                      <tr key={donor._id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{donor.userId?.name || 'N/A'}</p>
                            <p className="text-gray-500 text-xs">{donor.userId?.email}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-red-600">{donor.bloodGroup}</span>
                        </td>
                        <td className="py-3 capitalize">{donor.gender || 'N/A'}</td>
                        <td className="py-3 text-center">{donor.totalDonations}</td>
                        <td className="py-3">
                          {donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'Never'}
                        </td>
                        <td className="py-3">
                          <Badge variant={donor.isEligible ? 'success' : 'warning'}>
                            {donor.isEligible ? 'Eligible' : 'Not Eligible'}
                          </Badge>
                        </td>
                        <td className="py-3">{donor.userId?.city || 'N/A'}</td>
                        <td className="py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!donor.isEligible}
                            onClick={() => openRecordModal(donor)}
                            title={donor.isEligible ? 'Record a donation for this donor' : 'Donor is not eligible yet'}
                          >
                            <Droplets className="w-3.5 h-3.5 mr-1 text-red-500" />
                            Record
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record Donation Modal */}
      <Modal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} title="Record Donation">
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
          <p className="font-semibold text-gray-900">{selectedDonor?.userId?.name}</p>
          <p className="text-xs text-gray-500">{selectedDonor?.userId?.email}</p>
        </div>
        <form onSubmit={handleRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <Select
              value={recordForm.bloodGroup}
              onChange={e => setRecordForm(f => ({ ...f, bloodGroup: e.target.value }))}
              options={BLOOD_GROUPS.map(bg => ({ label: bg, value: bg }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
            <Select
              value={recordForm.units}
              onChange={e => setRecordForm(f => ({ ...f, units: e.target.value }))}
              options={[{ label: '1 Unit', value: '1' }, { label: '2 Units', value: '2' }, { label: '3 Units', value: '3' }]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <Input
              placeholder="e.g. City Blood Bank"
              value={recordForm.location}
              onChange={e => setRecordForm(f => ({ ...f, location: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <Input
              placeholder="Any notes..."
              value={recordForm.notes}
              onChange={e => setRecordForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRecordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={recording}>
              Record Donation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approve Appointment Modal */}
      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Appointment">
        {selectedAppt && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm">
            <p className="font-semibold">{selectedAppt.userId?.name} — {selectedAppt.bloodGroup}</p>
            <p className="text-gray-500">Requested: {formatDate(selectedAppt.donationDate)} · {selectedAppt.location}</p>
          </div>
        )}
        <form onSubmit={handleApprove} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units Donated</label>
            <Select
              value={approveForm.units}
              onChange={e => setApproveForm(f => ({ ...f, units: e.target.value }))}
              options={[{ label: '1 Unit', value: '1' }, { label: '2 Units', value: '2' }, { label: '3 Units', value: '3' }]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmed Location *</label>
            <Input
              value={approveForm.location}
              onChange={e => setApproveForm(f => ({ ...f, location: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <Input
              placeholder="Health screening notes etc."
              value={approveForm.notes}
              onChange={e => setApproveForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={approving}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Donation
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
