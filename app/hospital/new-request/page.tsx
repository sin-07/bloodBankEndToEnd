'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { hospitalAPI } from '@/lib/api';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY, PLASMA_COMPATIBILITY, COMPONENT_NAMES } from '@/lib/utils';
import { Plus, Trash2, Send, ArrowLeft, AlertCircle, Droplets, HeartPulse, FlaskConical, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface RequestItem {
  patientName: string;
  bloodGroup: string;
  component: string;
  units: string;
  urgency: 'normal' | 'urgent' | 'critical';
  reason: string;
  contactNumber: string;
}

const emptyRequest: RequestItem = {
  patientName: '',
  bloodGroup: 'O+',
  component: 'whole_blood',
  units: '1',
  urgency: 'normal',
  reason: '',
  contactNumber: '',
};

export default function NewRequestPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([{ ...emptyRequest }]);
  const [submitting, setSubmitting] = useState(false);

  const addRequest = () => {
    setRequests([...requests, { ...emptyRequest }]);
  };

  const removeRequest = (index: number) => {
    if (requests.length === 1) return;
    setRequests(requests.filter((_, i) => i !== index));
  };

  const updateRequest = (index: number, field: keyof RequestItem, value: any) => {
    const updated = [...requests];
    updated[index] = { ...updated[index], [field]: value };
    setRequests(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < requests.length; i++) {
      const req = requests[i];
      if (!req.patientName.trim() || !req.bloodGroup || !req.contactNumber.trim()) {
        toast.error(`Please complete all required fields for Request #${i + 1}`);
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = requests.map((r) => ({
        ...r,
        units: Math.max(1, Number(r.units) || 1),
      }));

      await hospitalAPI.createBulkRequest(payload);

      toast.success(
        `${payload.length} requisition${payload.length > 1 ? 's' : ''} dispatched successfully`
      );
      router.push('/hospital/requests');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to submit clinical requisitions'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalUnits = requests.reduce((acc, r) => acc + (Number(r.units) || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/hospital/requests"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Clinical Requisition Form</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                New Blood Requisition
              </h1>
              <p className="text-xs text-slate-600">
                Dispatch single or batch blood supply requests to central bank triage
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={addRequest}
            className="border-dashed border-slate-300 text-slate-700 hover:border-rose-500 hover:text-rose-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Patient
          </Button>
        </div>

        {/* Priority Notice Alert */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-950">Triage Protocol Reminder:</strong> Mark requests as{' '}
            <strong className="underline">Critical</strong> only for acute trauma, hemorrhagic shock, or emergency intraoperative needs. Critical requests bypass standard queue for priority cross-matching.
          </div>
        </div>

        {/* Request Items Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {requests.map((req, index) => {
            const urgencyBorder =
              req.urgency === 'critical'
                ? 'border-rose-300 bg-rose-50/10'
                : req.urgency === 'urgent'
                ? 'border-amber-300 bg-amber-50/10'
                : 'border-slate-200/80 bg-white';

            const compInfo = BLOOD_COMPATIBILITY[req.bloodGroup as keyof typeof BLOOD_COMPATIBILITY];

            return (
              <div
                key={index}
                className={`rounded-3xl border ${urgencyBorder} shadow-sm p-6 sm:p-8 transition-all relative`}
              >
                {/* Requisition Card Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Patient Transfusion Requirement
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Specify receiver metrics and required blood units
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {req.urgency === 'critical' && (
                      <Badge variant="danger" dot pulse>
                        CRITICAL TRIAGE
                      </Badge>
                    )}
                    {req.urgency === 'urgent' && (
                      <Badge variant="warning" dot>
                        URGENT
                      </Badge>
                    )}

                    {requests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequest(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove patient requisition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <Input
                    label="Patient Full Name *"
                    placeholder="e.g. Ramesh Kulkarni"
                    value={req.patientName}
                    onChange={(e) =>
                      updateRequest(index, 'patientName', e.target.value)
                    }
                    required
                  />

                  <Select
                    label="Blood Group *"
                    value={req.bloodGroup}
                    onChange={(e) =>
                      updateRequest(index, 'bloodGroup', e.target.value)
                    }
                    options={BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg }))}
                    required
                  />

                  <Select
                    label="Blood Component Requisition *"
                    value={req.component}
                    onChange={(e) =>
                      updateRequest(index, 'component', e.target.value)
                    }
                    options={[
                      { label: 'Whole Blood (Standard Transfusion)', value: 'whole_blood' },
                      { label: 'Platelets / SDP (Dengue / Oncology / Chemo)', value: 'platelets' },
                      { label: 'Fresh Frozen Plasma / FFP (Coagulation / Burns)', value: 'plasma' },
                      { label: 'Packed Red Blood Cells / PRBC (Anemia / Surgery)', value: 'packed_rbc' },
                      { label: 'Cryoprecipitate (Hemophilia / Fibrinogen)', value: 'cryoprecipitate' },
                    ]}
                    required
                  />

                  <Input
                    label="Units Required *"
                    type="number"
                    min="1"
                    max="20"
                    value={req.units}
                    onChange={(e) =>
                      updateRequest(index, 'units', e.target.value)
                    }
                    required
                  />

                  <Select
                    label="Triage Urgency Level *"
                    value={req.urgency}
                    onChange={(e) =>
                      updateRequest(index, 'urgency', e.target.value as any)
                    }
                    options={[
                      { label: 'Normal (Standard Transfusion / Surgery)', value: 'normal' },
                      { label: 'Urgent (Required within 6 hours)', value: 'urgent' },
                      { label: 'Critical (Immediate Trauma / Life-Threatening)', value: 'critical' },
                    ]}
                    required
                  />

                  <Input
                    label="Attending Doctor / Ward Contact *"
                    placeholder="+91 98765 43210 (Ward 4B)"
                    value={req.contactNumber}
                    onChange={(e) =>
                      updateRequest(index, 'contactNumber', e.target.value)
                    }
                    required
                  />

                  <div className="md:col-span-2 lg:col-span-3">
                    <Input
                      label="Clinical Indication / Diagnosis *"
                      placeholder="e.g. Acute Dengue thrombocytopenia (Platelet count < 20,000/mcL) or Burn coagulopathy"
                      value={req.reason}
                      onChange={(e) =>
                        updateRequest(index, 'reason', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Compatibility Quick Hint */}
                {(() => {
                  const isPlasma = req.component === 'plasma';
                  const activeCompat = isPlasma
                    ? PLASMA_COMPATIBILITY[req.bloodGroup as keyof typeof PLASMA_COMPATIBILITY]
                    : compInfo;

                  if (!activeCompat) return null;

                  return (
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700">
                        {isPlasma ? 'Compatible Plasma Donors:' : 'Compatible RBC Donors:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {activeCompat.receive.map((bg) => (
                          <span
                            key={bg}
                            className={`px-2 py-0.5 rounded font-bold border text-[11px] ${
                              isPlasma
                                ? 'bg-sky-50 text-sky-900 border-sky-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {bg}
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-500 ml-auto font-medium">
                        {activeCompat.title} {isPlasma && '(Inverted AB Universal Plasma rule applies)'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            );
          })}

          {/* Submission Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Summary:</div>
              <div className="text-sm font-bold text-slate-900">
                {requests.length} Patient{requests.length > 1 ? 's' : ''} &bull; {totalUnits} Total Unit{totalUnits === 1 ? '' : 's'}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="w-full sm:w-auto"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Dispatch Requisition ({totalUnits} Units)
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
