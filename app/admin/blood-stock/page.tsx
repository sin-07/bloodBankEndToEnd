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
import { inventoryAPI } from '@/lib/api';
import { formatDate, getStatusVariant, BLOOD_GROUPS, COMPONENT_NAMES, getComponentBadgeClass } from '@/lib/utils';
import { Plus, Droplets, AlertTriangle, Trash2, Filter, RefreshCw, Layers, Calendar, MapPin, Sparkles, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBloodStockPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ bloodGroup: '', component: '' });
  const [formData, setFormData] = useState({
    bloodGroup: 'O+',
    component: 'whole_blood',
    units: '1',
    source: 'donation',
    storageLocation: 'Cryo-Vault Rack A1',
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, sumRes] = await Promise.all([
        inventoryAPI.getAll(filters),
        inventoryAPI.getSummary(),
      ]);
      setInventory(invRes.data.data?.inventory || invRes.data.data || []);
      setSummary(sumRes.data.data);
    } catch (error) {
      toast.error('Failed to load blood stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await inventoryAPI.add({
        ...formData,
        units: Number(formData.units),
      });
      toast.success('Blood units logged to central inventory');
      setShowModal(false);
      setFormData({
        bloodGroup: 'O+',
        component: 'whole_blood',
        units: '1',
        source: 'donation',
        storageLocation: 'Cryo-Vault Rack A1',
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add units');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to discard / decommission this inventory unit?')) return;
    try {
      await inventoryAPI.remove(id);
      toast.success('Inventory unit updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove unit');
    }
  };

  const columns = [
    {
      header: 'Blood Group',
      accessor: (item: any) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
          <Droplets className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
          <span>{item.bloodGroup}</span>
        </div>
      ),
    },
    {
      header: 'Component',
      accessor: (item: any) => {
        const comp = item.component || 'whole_blood';
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${getComponentBadgeClass(comp)}`}>
            {comp === 'platelets' && <Sparkles className="w-3 h-3" />}
            {comp === 'plasma' && <FlaskConical className="w-3 h-3" />}
            <span>{COMPONENT_NAMES[comp] || comp}</span>
          </span>
        );
      },
    },
    {
      header: 'Units',
      accessor: (item: any) => (
        <span className="font-bold text-slate-900 text-sm">
          {item.units} <span className="text-xs font-normal text-slate-500">units</span>
        </span>
      ),
    },
    {
      header: 'Collection Date',
      accessor: (item: any) => (
        <span className="text-xs text-slate-600">{formatDate(item.collectionDate)}</span>
      ),
    },
    {
      header: 'Expiration Date',
      accessor: (item: any) => {
        const isExpiringSoon =
          item.expiryDate &&
          new Date(item.expiryDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className={isExpiringSoon ? 'font-bold text-amber-700' : 'text-slate-600'}>
              {item.expiryDate ? formatDate(item.expiryDate) : 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: (item: any) => (
        <Badge variant={getStatusVariant(item.status)} dot className="capitalize font-semibold">
          {item.status}
        </Badge>
      ),
    },
    {
      header: 'Storage Location',
      accessor: (item: any) => (
        <div className="flex items-center gap-1 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{item.storageLocation || 'Central Vault'}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (item: any) => (
        <button
          type="button"
          onClick={() => handleRemove(item._id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Decommission unit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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
              <Layers className="w-3.5 h-3.5" />
              <span>Cryogenic Storage Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Blood Stock & Inventory
            </h1>
            <p className="text-xs text-slate-600">
              Monitor, replenish, and audit blood units and fractionated components across regional vaults
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Inventory Units
            </Button>
          </div>
        </div>

        {/* Stock Matrix Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((bg) => {
              const stock = summary.bloodStock?.find((s: any) => s._id === bg);
              const units = stock?.totalUnits || 0;
              const isLow = units > 0 && units < 5;
              const isEmpty = units === 0;

              return (
                <div
                  key={bg}
                  className={`p-4 rounded-2xl border text-center transition-all hover:shadow-card ${
                    isEmpty
                      ? 'bg-rose-50/20 border-rose-200'
                      : isLow
                      ? 'bg-amber-50/20 border-amber-200'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <span className="text-xs font-black text-rose-600 block">{bg}</span>
                  <div className="text-2xl font-extrabold text-slate-900 my-1">{units}</div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                    units
                  </span>
                  {isLow && (
                    <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low</span>
                    </div>
                  )}
                  {isEmpty && (
                    <span className="mt-1 inline-block text-[10px] font-bold text-rose-700">
                      Empty
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter:</span>
            </div>

            <Select
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

            <Select
              value={filters.component}
              onChange={(e) =>
                setFilters({ ...filters, component: e.target.value })
              }
              options={[
                { label: 'All Fractionated Components', value: '' },
                { label: 'Whole Blood', value: 'whole_blood' },
                { label: 'Packed RBC', value: 'packed_rbc' },
                { label: 'Platelets', value: 'platelets' },
                { label: 'Plasma', value: 'plasma' },
                { label: 'Cryoprecipitate', value: 'cryoprecipitate' },
              ]}
              className="text-xs py-1.5"
            />
          </div>

          <div className="text-xs font-medium text-slate-500 w-full md:w-auto text-right">
            Total Batches: <strong className="text-slate-800">{inventory.length}</strong>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={inventory}
          loading={loading}
          emptyMessage="No blood units found matching your current filter criteria."
        />

        {/* Add Units Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Inward Blood Units"
          size="md"
        >
          <form onSubmit={handleAddUnits} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Blood Group *"
                value={formData.bloodGroup}
                onChange={(e) =>
                  setFormData({ ...formData, bloodGroup: e.target.value })
                }
                options={BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg }))}
                required
              />
              <Select
                label="Component *"
                value={formData.component}
                onChange={(e) =>
                  setFormData({ ...formData, component: e.target.value })
                }
                options={[
                  { label: 'Whole Blood', value: 'whole_blood' },
                  { label: 'Packed RBC', value: 'packed_rbc' },
                  { label: 'Platelets', value: 'platelets' },
                  { label: 'Plasma', value: 'plasma' },
                  { label: 'Cryoprecipitate', value: 'cryoprecipitate' },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Number of Units *"
                type="number"
                min="1"
                max="50"
                value={formData.units}
                onChange={(e) =>
                  setFormData({ ...formData, units: e.target.value })
                }
                required
              />
              <Select
                label="Acquisition Source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                options={[
                  { label: 'Voluntary Donation', value: 'donation' },
                  { label: 'Inter-Bank Transfer', value: 'transfer' },
                  { label: 'Procured Supply', value: 'purchase' },
                ]}
              />
            </div>

            <Input
              label="Storage Location / Rack Code"
              placeholder="e.g. Cryo-Vault Rack A1"
              value={formData.storageLocation}
              onChange={(e) =>
                setFormData({ ...formData, storageLocation: e.target.value })
              }
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Add to Inventory
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
