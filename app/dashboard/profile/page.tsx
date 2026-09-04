'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { donorAPI, authAPI } from '@/lib/api';
import { BLOOD_GROUPS } from '@/lib/utils';
import { User, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
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
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDonorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await donorAPI.updateProfile({
        ...donorData,
        weight: Number(donorData.weight),
      });
      toast.success('Donor profile updated');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update donor profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

        {/* Basic Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  disabled
                />
                <Input
                  label="Phone"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
                <Input
                  label="City"
                  value={profileData.city}
                  onChange={(e) =>
                    setProfileData({ ...profileData, city: e.target.value })
                  }
                />
              </div>
              <Input
                label="Address"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
              />
              <Button type="submit" loading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Donor Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Donor Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateDonorProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input
                  label="Date of Birth"
                  type="date"
                  value={donorData.dateOfBirth}
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
                  value={donorData.weight}
                  onChange={(e) =>
                    setDonorData({ ...donorData, weight: e.target.value })
                  }
                />
              </div>
              <Button type="submit" loading={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Donor Details
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
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
                label="New Password"
                type="password"
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
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
              <Button type="submit" loading={loading}>
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
