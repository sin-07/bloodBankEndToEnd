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
import { formatDate, BLOOD_GROUPS, getStatusVariant } from '@/lib/utils';
import { CalendarCheck, MapPin, Droplets, Clock, CheckCircle2, XCircle, Plus, Calendar, AlertCircle } from 'lucide-react';
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
      toast.success('Donation appointment scheduled successfully!');
      setShowModal(false);
      setForm({ preferredDate: '', location: '', bloodGroup: '', notes: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // min date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Voluntary Donation Booking</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Schedule Blood Donation
            </h1>
            <p className="text-xs text-slate-600">
              Select a preferred date and certified collection center for your next life-saving donation
            </p>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            disabled={eligibility && !eligibility.isEligible}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Book New Slot
          </Button>
        </div>

        {/* Eligibility Verification Card */}
        {eligibility && (
          <div
            className={`p-5 rounded-3xl border ${
              eligibility.isEligible
                ? 'bg-emerald-50/50 border-emerald-200/80'
                : 'bg-amber-50/50 border-amber-200/80'
            } flex items-center gap-4`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                eligibility.isEligible
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {eligibility.isEligible ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3
                className={`font-bold text-sm ${
                  eligibility.isEligible ? 'text-emerald-950' : 'text-amber-950'
                }`}
              >
                {eligibility.isEligible
                  ? 'Medical Clearance: Verified Eligible to Donate'
                  : 'Interval Recovery Period Active'}
              </h3>
              <p
                className={`text-xs mt-0.5 ${
                  eligibility.isEligible ? 'text-emerald-800' : 'text-amber-800'
                }`}
              >
                {eligibility.message}
              </p>
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">My Scheduled Appointments</h2>
          <p className="text-xs text-slate-500 mb-6">Track your upcoming appointments and verified donation history</p>

          {loading ? (
            <BloodLoader fullScreen={false} size="sm" text="Checking your scheduled slots" />
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-700">No scheduled appointments</p>
              <p className="text-slate-400 text-xs mt-1">Book an appointment to begin your donation journey.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt: any) => (
                <div
                  key={appt._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                      <Droplets className="w-5 h-5 fill-rose-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Group: {appt.bloodGroup}
                        </span>
                        <Badge
                          variant={getStatusVariant(appt.status)}
                          dot
                          className="capitalize font-semibold text-[11px]"
                        >
                          {appt.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(appt.donationDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {appt.location}
                        </span>
                      </div>
                      {appt.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">{appt.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book Appointment Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Schedule Voluntary Blood Donation"
        >
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Donation Date *
              </label>
              <Input
                type="date"
                min={today}
                value={form.preferredDate}
                onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Donation Center / Medical Camp *
              </label>
              <Input
                placeholder="e.g. Srishti Central Blood Bank, Metro Ward"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Blood Group (optional confirmation)
              </label>
              <Select
                value={form.bloodGroup}
                onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                options={[
                  { label: 'Auto-detect from donor profile', value: '' },
                  ...BLOOD_GROUPS.map(bg => ({ label: bg, value: bg })),
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Special Remarks / Health Notes
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-900 resize-none"
                rows={3}
                placeholder="Any dietary preferences, transit needs, or medical questions..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
              <strong>Medical Advice:</strong> Ensure you drink at least 500ml of water and consume a light meal prior to your appointment.
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={submitting}>
                Confirm Slot
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
