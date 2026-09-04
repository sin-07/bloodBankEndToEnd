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
import { formatDate, BLOOD_GROUPS, getStatusColor } from '@/lib/utils';
import { CalendarCheck, MapPin, Droplets, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    preferredDate: '',
    location: '',
    bloodGroup: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptRes, eligRes] = await Promise.all([
        donorAPI.getAppointments(),
        donorAPI.checkEligibility().catch(() => null),
      ]);
      setAppointments(apptRes.data.data?.appointments || []);
      if (eligRes) setEligibility(eligRes.data.data);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await donorAPI.bookAppointment(form);
      toast.success('Appointment booked! Admin will confirm your slot.');
      setShowModal(false);
      setForm({ preferredDate: '', location: '', bloodGroup: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === 'pending') return <Clock className="w-4 h-4 text-amber-500" />;
    return null;
  };

  // min date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book a Donation</h1>
            <p className="text-gray-500 text-sm mt-1">Schedule an appointment at a blood bank or donation centre.</p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            disabled={eligibility && !eligibility.isEligible}
          >
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </div>

        {/* Eligibility card */}
        {eligibility && (
          <Card className={`border ${eligibility.isEligible ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
            <CardContent className="p-4 flex items-center gap-3">
              {eligibility.isEligible
                ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                : <Clock className="w-6 h-6 text-amber-600 shrink-0" />
              }
              <div>
                <p className={`font-semibold ${eligibility.isEligible ? 'text-green-800' : 'text-amber-800'}`}>
                  {eligibility.isEligible ? 'You are eligible to donate!' : 'Not yet eligible'}
                </p>
                <p className={`text-sm ${eligibility.isEligible ? 'text-green-700' : 'text-amber-700'}`}>
                  {eligibility.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Appointments list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading appointments" />
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments yet.</p>
                <p className="text-gray-400 text-sm mt-1">Click "Book Appointment" to schedule your donation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt: any) => (
                  <div key={appt._id} className="flex items-start gap-4 p-4 rounded-xl border bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-red-100 rounded-lg shrink-0">
                      <Droplets className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          Blood Group: {appt.bloodGroup}
                        </span>
                        <Badge variant={getStatusColor(appt.status) as any}>
                          <span className="flex items-center gap-1">
                            {statusIcon(appt.status)} {appt.status}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5" />
                          {formatDate(appt.donationDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {appt.location}
                        </span>
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-gray-400 mt-1">{appt.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Book Appointment Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book a Donation Appointment">
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
            <Input
              type="date"
              min={today}
              value={form.preferredDate}
              onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donation Centre / Location *</label>
            <Input
              placeholder="e.g. City Blood Bank, Main Street"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <Select
              value={form.bloodGroup}
              onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
              options={[
                { label: 'Use profile blood group', value: '' },
                ...BLOOD_GROUPS.map(bg => ({ label: bg, value: bg })),
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Any special notes or requests..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>Note:</strong> Appointments are subject to admin confirmation. You will receive an email once confirmed.
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              Book Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
