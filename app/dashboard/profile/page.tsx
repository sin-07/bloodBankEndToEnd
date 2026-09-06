'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import { donorAPI, authAPI } from '@/lib/api';
import { BLOOD_GROUPS } from '@/lib/utils';
import { User, Save, Lock, HeartPulse, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [donorLoading, setDonorLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  });
  const [donorData, setDonorData] = useState({
    bloodGroup: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        address: user.address || '',
      });
    }
    fetchDonorProfile();
  }, [user]);

  const fetchDonorProfile = async () => {
    try {
      const res = await donorAPI.getProfile();
      if (res.data.data) {
        const d = res.data.data;
        setDonorData({
          bloodGroup: d.bloodGroup || '',
          dateOfBirth: d.dateOfBirth?.split('T')[0] || '',
          gender: d.gender || '',
          weight: d.weight?.toString() || '',
        });
      }
    } catch {
      // Profile may not exist yet
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authAPI.updateProfile(profileData);
      updateUser(res.data.data);
      toast.success('Personal profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDonorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setDonorLoading(true);
      await donorAPI.updateProfile({
        ...donorData,
        weight: Number(donorData.weight),
      });
      toast.success('Clinical donor metrics saved');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update donor profile'
      );
    } finally {
      setDonorLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setPwdLoading(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Identity & Medical Dossier</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Account Profile & Vitals
            </h1>
            <p className="text-xs text-slate-600">
              Manage your verified personal contact details, health metrics, and login credentials
            </p>
          </div>
        </div>

        {/* Basic Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Contact Information</h2>
              <p className="text-xs text-slate-500">Essential contact details used for urgent transfusion notifications</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name *"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                required
              />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address (Primary Login)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs cursor-not-allowed">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{profileData.email}</span>
                </div>
              </div>
              <Input
                label="Mobile Phone *"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
              />
              <Input
                label="City *"
                value={profileData.city}
                onChange={(e) =>
                  setProfileData({ ...profileData, city: e.target.value })
                }
                placeholder="Mumbai"
              />
            </div>
            <Input
              label="Street Address / Location"
              value={profileData.address}
              onChange={(e) =>
                setProfileData({ ...profileData, address: e.target.value })
              }
              placeholder="Flat / Building, Area, Ward"
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Personal Info
              </Button>
            </div>
          </form>
        </div>

        {/* Clinical Donor Metrics */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical & Donor Metrics</h2>
              <p className="text-xs text-slate-500">Biometric parameters verified during blood bank intake</p>
            </div>
          </div>

          <form onSubmit={handleUpdateDonorProfile} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Blood Group"
                value={donorData.bloodGroup}
                onChange={(e) =>
                  setDonorData({ ...donorData, bloodGroup: e.target.value })
                }
                options={BLOOD_GROUPS.map((bg) => ({
                  label: bg,
                  value: bg,
                }))}
              />
              <DatePicker
                label="Date of Birth"
                max={new Date().toISOString().split('T')[0]}
                value={donorData.dateOfBirth ? donorData.dateOfBirth.split('T')[0] : ''}
                onChange={(e) =>
                  setDonorData({ ...donorData, dateOfBirth: e.target.value })
                }
              />
              <Select
                label="Gender"
                value={donorData.gender}
                onChange={(e) =>
                  setDonorData({ ...donorData, gender: e.target.value })
                }
                options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                  { label: 'Other', value: 'other' },
                ]}
              />
              <Input
                label="Weight (kg)"
                type="number"
                min="45"
                placeholder="Min. 45 kg required"
                value={donorData.weight}
                onChange={(e) =>
                  setDonorData({ ...donorData, weight: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={donorLoading}>
                <Save className="h-4 w-4 mr-2" />
                Save Health Metrics
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Security Credentials</h2>
              <p className="text-xs text-slate-500">Update your access password regularly to protect your medical identity</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              label="Current Password *"
              type="password"
              placeholder="Enter existing password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
            />
            <Input
              label="New Password *"
              type="password"
              placeholder="Min. 6 characters"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
            />
            <Input
              label="Confirm New Password *"
              type="password"
              placeholder="Re-type new password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
            />
            <div className="pt-2">
              <Button type="submit" loading={pwdLoading}>
                Update Security Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
