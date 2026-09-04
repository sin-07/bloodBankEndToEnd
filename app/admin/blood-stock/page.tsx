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
import { inventoryAPI } from '@/lib/api';
import { formatDate, BLOOD_GROUPS } from '@/lib/utils';
import { Plus, Droplets, AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBloodStockPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ bloodGroup: '', component: '' });
  const [formData, setFormData] = useState({
    bloodGroup: '',
    component: 'whole_blood',
    units: '1',
    source: 'donation',
    storageLocation: '',
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
      toast.error('Failed to load inventory');
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
      toast.success('Blood units added successfully');
      setShowModal(false);
      setFormData({
        bloodGroup: '',
        component: 'whole_blood',
        units: '1',
        source: 'donation',
        storageLocation: '',
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add units');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this blood unit?')) return;
    try {
      await inventoryAPI.remove(id);
      toast.success('Blood unit removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove unit');
    }
  };

  const getComponentLabel = (comp: string) => {
    const labels: Record<string, string> = {
      whole_blood: 'Whole Blood',
      packed_rbc: 'Packed RBC',
      platelets: 'Platelets',
      plasma: 'Plasma',
      cryoprecipitate: 'Cryoprecipitate',
    };
    return labels[comp] || comp;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Blood Stock</h1>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Units
          </Button>
        </div>

        {/* Stock Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((bg) => {
              const stock = summary.bloodStock?.find(
                (s: any) => s._id === bg
              );
              const units = stock?.totalUnits || 0;
              const isLow = units < 5;
              return (
                <Card key={bg}>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-red-600">{bg}</p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        isLow ? 'text-amber-600' : 'text-gray-900'
                      }`}
                    >
                      {units}
                    </p>
                    <p className="text-xs text-gray-500">units</p>
                    {isLow && (
                      <div className="flex items-center justify-center gap-1 mt-1 text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-xs">Low</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <Select
                value={filters.bloodGroup}
                onChange={(e) =>
                  setFilters({ ...filters, bloodGroup: e.target.value })
                }
                options={[
                  { label: 'All Blood Groups', value: '' },
                  ...BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg })),
                ]}
              />
              <Select
                value={filters.component}
                onChange={(e) =>
                  setFilters({ ...filters, component: e.target.value })
                }
                options={[
                  { label: 'All Components', value: '' },
                  { label: 'Whole Blood', value: 'whole_blood' },
                  { label: 'Packed RBC', value: 'packed_rbc' },
                  { label: 'Platelets', value: 'platelets' },
                  { label: 'Plasma', value: 'plasma' },
                  { label: 'Cryoprecipitate', value: 'cryoprecipitate' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading inventory" />
            ) : inventory.length === 0 ? (
              <div className="text-center py-12">
                <Droplets className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No inventory records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Blood Group</th>
                      <th className="pb-3 font-medium text-gray-500">Component</th>
                      <th className="pb-3 font-medium text-gray-500">Units</th>
                      <th className="pb-3 font-medium text-gray-500">Collection Date</th>
                      <th className="pb-3 font-medium text-gray-500">Expiry Date</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500">Location</th>
                      <th className="pb-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventory.map((item: any) => {
                      const isExpiringSoon =
                        item.expiryDate &&
                        new Date(item.expiryDate).getTime() - Date.now() <
                          7 * 24 * 60 * 60 * 1000;
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="py-3">
                            <span className="font-semibold text-red-600">
                              {item.bloodGroup}
                            </span>
                          </td>
                          <td className="py-3">{getComponentLabel(item.component)}</td>
                          <td className="py-3">{item.units}</td>
                          <td className="py-3">
                            {formatDate(item.collectionDate)}
                          </td>
                          <td className="py-3">
                            <span
                              className={isExpiringSoon ? 'text-amber-600 font-medium' : ''}
                            >
                              {item.expiryDate
                                ? formatDate(item.expiryDate)
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                item.status === 'available'
                                  ? 'success'
                                  : item.status === 'expired'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="py-3">{item.storageLocation || 'N/A'}</td>
                          <td className="py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(item._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Units Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Blood Units"
        >
          <form onSubmit={handleAddUnits} className="space-y-4">
            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) =>
                setFormData({ ...formData, bloodGroup: e.target.value })
              }
              options={BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg }))}
              required
            />
            <Select
              label="Component"
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
            />
            <Input
              label="Units"
              type="number"
              min="1"
              value={formData.units}
              onChange={(e) =>
                setFormData({ ...formData, units: e.target.value })
              }
              required
            />
            <Select
              label="Source"
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              options={[
                { label: 'Donation', value: 'donation' },
                { label: 'Transfer', value: 'transfer' },
                { label: 'Purchase', value: 'purchase' },
              ]}
            />
            <Input
              label="Storage Location"
              value={formData.storageLocation}
              onChange={(e) =>
                setFormData({ ...formData, storageLocation: e.target.value })
              }
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Add Units
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
