'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { hospitalAPI } from '@/lib/api';
import { BLOOD_GROUPS } from '@/lib/utils';
import { Plus, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface RequestItem {
  patientName: string;
  bloodGroup: string;
  units: string;
  urgency: string;
  reason: string;
  contactNumber: string;
}

const emptyRequest: RequestItem = {
  patientName: '',
  bloodGroup: '',
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

  const updateRequest = (index: number, field: keyof RequestItem, value: string) => {
    const updated = [...requests];
    updated[index] = { ...updated[index], [field]: value };
    setRequests(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    for (const req of requests) {
      if (!req.patientName || !req.bloodGroup || !req.contactNumber) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    try {
      setSubmitting(true);
      const data = requests.map((r) => ({
        ...r,
        units: Number(r.units),
      }));

      if (data.length === 1) {
        // Single request
        await hospitalAPI.createBulkRequest(data);
      } else {
        // Bulk request
        await hospitalAPI.createBulkRequest(data);
      }

      toast.success(
        `${data.length} blood request${data.length > 1 ? 's' : ''} submitted`
      );
      router.push('/hospital/requests');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to submit requests'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">New Blood Request</h1>
          <Button variant="outline" onClick={addRequest}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requests.map((req, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Request #{index + 1}
                  </CardTitle>
                  {requests.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => removeRequest(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Patient Name *"
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
                  <Input
                    label="Units Required"
                    type="number"
                    min="1"
                    value={req.units}
                    onChange={(e) =>
                      updateRequest(index, 'units', e.target.value)
                    }
                    required
                  />
                  <Select
                    label="Urgency"
                    value={req.urgency}
                    onChange={(e) =>
                      updateRequest(index, 'urgency', e.target.value)
                    }
                    options={[
                      { label: 'Normal', value: 'normal' },
                      { label: 'Urgent', value: 'urgent' },
                      { label: 'Critical', value: 'critical' },
                    ]}
                  />
                  <Input
                    label="Contact Number *"
                    value={req.contactNumber}
                    onChange={(e) =>
                      updateRequest(index, 'contactNumber', e.target.value)
                    }
                    required
                  />
                  <Input
                    label="Reason"
                    value={req.reason}
                    onChange={(e) =>
                      updateRequest(index, 'reason', e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              <Send className="h-4 w-4 mr-2" />
              Submit {requests.length > 1 ? `${requests.length} Requests` : 'Request'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
