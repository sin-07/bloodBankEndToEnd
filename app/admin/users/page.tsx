'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BloodLoader from '@/components/gsap/BloodLoader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, UserCheck, UserX, Trash2 } from 'lucide-react';
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
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(id, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all associated data.')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by name or email..."
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
                  { label: 'All Roles', value: '' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'Donor', value: 'donor' },
                  { label: 'Hospital', value: 'hospital' },
                ]}
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent>
            {loading ? (
              <BloodLoader fullScreen={false} size="sm" text="Loading users" />
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Name</th>
                      <th className="pb-3 font-medium text-gray-500">Email</th>
                      <th className="pb-3 font-medium text-gray-500">Role</th>
                      <th className="pb-3 font-medium text-gray-500">City</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500">Joined</th>
                      <th className="pb-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u: any) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium">{u.name}</td>
                        <td className="py-3 text-gray-500">{u.email}</td>
                        <td className="py-3">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'info'
                                : u.role === 'hospital'
                                ? 'warning'
                                : 'default'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3">{u.city || 'N/A'}</td>
                        <td className="py-3">
                          <Badge variant={u.isActive ? 'success' : 'danger'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3">{formatDate(u.createdAt)}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleStatus(u._id, u.isActive)
                              }
                              className={
                                u.isActive ? 'text-amber-600' : 'text-green-600'
                              }
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {u.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(u._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
