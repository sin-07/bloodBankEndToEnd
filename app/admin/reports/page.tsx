'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { adminAPI } from '@/lib/api';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('donors');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.exportReport(reportType);
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      type: 'donors',
      title: 'Donors Report',
      description: 'Export all donor records including blood group, donation history, and eligibility status.',
    },
    {
      type: 'requests',
      title: 'Blood Requests Report',
      description: 'Export all blood request records with patient details, status, and fulfillment data.',
    },
    {
      type: 'inventory',
      title: 'Inventory Report',
      description: 'Export current blood inventory with stock levels, expiry dates, and storage locations.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.type}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">{report.title}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  {report.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  loading={loading && reportType === report.type}
                  onClick={() => {
                    setReportType(report.type);
                    handleExport();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Export */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end flex-wrap">
              <Select
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { label: 'Donors Report', value: 'donors' },
                  { label: 'Blood Requests Report', value: 'requests' },
                  { label: 'Inventory Report', value: 'inventory' },
                ]}
              />
              <Button onClick={handleExport} loading={loading}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
