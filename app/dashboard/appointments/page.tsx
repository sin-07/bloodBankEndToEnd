'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import Modal from '@/components/ui/Modal';
import { donorAPI } from '@/lib/api';
import { formatDate, BLOOD_GROUPS, getStatusVariant, COMPONENT_NAMES, getComponentBadgeClass } from '@/lib/utils';
import { CalendarCheck, MapPin, Droplets, Clock, CheckCircle2, XCircle, Plus, Calendar, AlertCircle, FlaskConical, Sparkles, Activity } from 'lucide-react';
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
    donationType: 'whole_blood',
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
      setForm({ preferredDate: '', location: '', bloodGroup: '', donationType: 'whole_blood', notes: '' });
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
              {appointments.map((appt: any) => {
                const stream = appt.donationType || 'whole_blood';
                return (
                  <div
                    key={appt._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                        {stream === 'platelets' ? (
                          <Sparkles className="w-5 h-5 text-amber-600" />
                        ) : stream === 'plasma' ? (
                          <FlaskConical className="w-5 h-5 text-sky-600" />
                        ) : (
                          <Droplets className="w-5 h-5 fill-rose-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            Group: {appt.bloodGroup}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${getComponentBadgeClass(stream)}`}>
                            {stream === 'platelets'
                              ? 'Platelet Apheresis (SDP)'
                              : stream === 'plasma'
                              ? 'Plasma Donation (FFP)'
                              : 'Whole Blood Donation'}
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
                );
              })}
            </div>
          )}
        </div>

        {/* Book Appointment Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Schedule Voluntary Blood / Apheresis Donation"
        >
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Donation Stream Type *
              </label>
              <Select
                value={form.donationType}
                onChange={e => setForm(f => ({ ...f, donationType: e.target.value as any }))}
                options={[
                  {
                    value: 'whole_blood',
                    label: 'Whole Blood Donation',
                    subtitle: 'Standard cellular transfusion • Red cells, plasma & platelets',
                    badge: '90 Days Recovery',
                    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200/80',
                    icon: <Droplets className="w-4 h-4 text-rose-600 fill-rose-600" />,
                  },
                  {
                    value: 'platelets',
                    label: 'Platelet Apheresis / SDP',
                    subtitle: 'Critical support for dengue shock syndrome & oncology chemo',
                    badge: '15 Days Recovery',
                    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
                    icon: <Sparkles className="w-4 h-4 text-amber-600" />,
                  },
                  {
                    value: 'plasma',
                    label: 'Plasma Donation / FFP',
                    subtitle: 'Emergency trauma clotting factor resuscitation & severe burn therapy',
                    badge: '28 Days Recovery',
                    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
                    icon: <FlaskConical className="w-4 h-4 text-sky-600" />,
                  },
                ]}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Donation Date *
              </label>
              <DatePicker
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
                  ...BLOOD_GROUPS.map(bg => ({
                    label: `Blood Group ${bg}`,
                    value: bg,
                    icon: <Droplets className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />,
                  })),
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

            {/* Dynamic Clinical Recovery Note */}
            <div className={`p-3 rounded-xl text-xs leading-relaxed border ${
              form.donationType === 'platelets'
                ? 'bg-amber-50 text-amber-950 border-amber-200'
                : form.donationType === 'plasma'
                ? 'bg-sky-50 text-sky-950 border-sky-200'
                : 'bg-rose-50 text-rose-950 border-rose-200'
            }`}>
              <strong>Clinical Protocol: </strong>
              {form.donationType === 'platelets' && (
                <span>Platelet apheresis donors can safely donate every 15 days (up to 24x/yr). Avoid aspirin for 48 hours prior.</span>
              )}
              {form.donationType === 'plasma' && (
                <span>Plasma donation interval is 28 days (up to 12x/yr). Hydrate with at least 500ml water beforehand.</span>
              )}
              {form.donationType === 'whole_blood' && (
                <span>Standard Whole Blood donation interval is 90 days. Drink water and have a light meal prior.</span>
              )}
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
