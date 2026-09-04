'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { adminAPI } from '@/lib/api';
import { FileSpreadsheet, Download, FileText, Database, Activity, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('donors');
  const [loading, setLoading] = useState(false);

  const handleExport = async (typeToExport = reportType) => {
    try {
      setLoading(true);
      const res = await adminAPI.exportReport(typeToExport);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${typeToExport}-clinical-audit-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Clinical report exported and downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate export file');
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      type: 'donors',
      title: 'Donor Master Registry',
      icon: FileText,
      badge: 'Donation Audits',
      description:
        'Complete ledger of all verified donors, contact details, blood groups, cumulative units donated, and clinical eligibility status.',
    },
    {
      type: 'requests',
      title: 'Transfusion Requisitions',
      icon: Activity,
      badge: 'Emergency Triage',
      description:
        'Detailed audit trail of hospital requisitions, patient clinical indications, urgency classification, and cross-matching fulfillment.',
    },
    {
      type: 'inventory',
      title: 'Cryogenic Inventory Log',
      icon: Database,
      badge: 'Batch Tracking',
      description:
        'Current batch stock levels, component fractionation details, storage rack locations, and real-time expiration forecasting.',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Data Governance & Compliance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Audit & Analytical Reports
            </h1>
            <p className="text-xs text-slate-600">
              Generate certified institutional reports in Excel/CSV for health ministry reporting and inventory audits
            </p>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.type}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {report.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {report.description}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-xs font-bold border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                  loading={loading && reportType === report.type}
                  onClick={() => {
                    setReportType(report.type);
                    handleExport(report.type);
                  }}
                >
                  <Download className="w-4 h-4 mr-2 text-rose-600" />
                  Download Excel Sheet
                </Button>
              </div>
            );
          })}
        </div>

        {/* Custom Single Export Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Custom Export Query</h2>
          <p className="text-xs text-slate-500 mb-4">Select any dataset to compile and initiate immediate download</p>

          <div className="flex flex-col sm:flex-row items-end gap-4 max-w-xl">
            <div className="flex-1 w-full">
              <Select
                label="Target Clinical Dataset"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={[
                  { label: 'Donor Master Registry (Full History)', value: 'donors' },
                  { label: 'Blood Requisitions (All Lifecycles)', value: 'requests' },
                  { label: 'Cryogenic Inventory & Expirations', value: 'inventory' },
                ]}
              />
            </div>
            <Button
              onClick={() => handleExport(reportType)}
              loading={loading}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Dataset
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
