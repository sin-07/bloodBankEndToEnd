'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, UserCheck, UserX, Trash2, Shield, User, Building2, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({ page, role, search });
      setUsers(res.data.data?.users || []);
      setTotalPages(res.data.data?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load portal accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(id, { isActive: !isActive });
      toast.success(`Account ${!isActive ? 'activated' : 'suspended'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update account status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove this user profile and linked privileges.')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('Account permanently deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Shield className="w-3 h-3 text-rose-600" />
            <span>Admin</span>
          </span>
        );
      case 'hospital':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Building2 className="w-3 h-3 text-sky-600" />
            <span>Hospital</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <User className="w-3 h-3 text-emerald-600" />
            <span>Donor</span>
          </span>
        );
    }
  };

  const columns = [
    {
      header: 'Account User',
      accessor: (u: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 border border-slate-200">
            {u.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{u.name}</p>
            <p className="text-[11px] text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Access Role',
      accessor: (u: any) => getRoleBadge(u.role),
    },
    {
      header: 'City / Region',
      accessor: (u: any) => (
        <span className="text-xs text-slate-600">{u.city || 'Regional Center'}</span>
      ),
    },
    {
      header: 'Account Status',
      accessor: (u: any) => (
        <Badge
          variant={u.isActive ? 'success' : 'danger'}
          dot
          className="font-semibold"
        >
          {u.isActive ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      header: 'Member Since',
      accessor: (u: any) => (
        <span className="text-xs text-slate-500">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      header: 'Management Actions',
      accessor: (u: any) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleToggleStatus(u._id, u.isActive)}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              u.isActive
                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
            title={u.isActive ? 'Suspend access' : 'Activate access'}
          >
            {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(u._id)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
            title="Delete user profile"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
              <Users className="w-3.5 h-3.5" />
              <span>Access Control & Auth Registry</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              User Accounts & Credentials
            </h1>
            <p className="text-xs text-slate-600">
              Audit portal accounts, update authorization roles, and toggle platform access
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl">
            <div className="flex-1">
              <Input
                placeholder="Search user accounts by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              options={[
                { label: 'All Platform Roles', value: '' },
                { label: 'System Admin', value: 'admin' },
                { label: 'Volunteer Donor', value: 'donor' },
                { label: 'Registered Hospital', value: 'hospital' },
              ]}
              className="w-48 text-xs py-1.5"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4 mr-1.5" />
              Search
            </Button>
          </form>

          <div className="text-xs font-medium text-slate-500 w-full md:w-auto text-right">
            Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
          </div>
        </div>

        {/* Users Table */}
        <Table
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No platform accounts match your query."
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-xs font-semibold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
