'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Droplets } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { BLOOD_GROUPS } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'donor';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    phone: '',
    city: '',
    address: '',
    // Donor fields
    bloodGroup: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    // Hospital fields
    hospitalName: '',
    registrationNumber: '',
    hospitalType: 'private',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
      };

      if (formData.role === 'donor') {
        payload.bloodGroup = formData.bloodGroup;
        payload.dateOfBirth = formData.dateOfBirth;
        payload.gender = formData.gender;
        payload.weight = parseInt(formData.weight) || undefined;
      }

      if (formData.role === 'hospital') {
        payload.hospitalName = formData.hospitalName;
        payload.registrationNumber = formData.registrationNumber;
        payload.hospitalType = formData.hospitalType;
        payload.state = formData.state;
      }

      await register(payload);
      toast.success('Registration successful!');

      if (formData.role === 'hospital') {
        router.push('/hospital');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Droplets className="w-7 h-7 text-red-600" />
            <span className="text-xl font-bold text-gray-900">
              Srishti <span className="text-red-600">Blood Bank</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Form Card */}
      <div className="flex items-center justify-center p-4 pt-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Droplets className="w-10 h-10 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">
              A2R <span className="text-red-600">Demo</span>
            </span>
          </Link>
          <p className="mt-2 text-gray-500">Create your account to get started</p>
        </div>

        {/* Role Selection */}
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
          {[
            { value: 'donor', label: 'Donor' },
            { value: 'hospital', label: 'Hospital' },
          ].map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setFormData({ ...formData, role: role.value })}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                formData.role === role.value
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Your city"
            />
          </div>

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full address"
          />

          {/* Donor-specific fields */}
          {formData.role === 'donor' && (
            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Select
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  placeholder="Select blood group"
                  options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
                  required
                />
                <Input
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder="Select gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  required
                />
                <Input
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Min 45 kg"
                  min={45}
                />
              </div>
            </div>
          )}

          {/* Hospital-specific fields */}
          {formData.role === 'hospital' && (
            <div className="border-t pt-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Hospital Name"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="Hospital name"
                  required
                />
                <Input
                  label="Registration Number"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="Hospital reg. number"
                  required
                />
                <Select
                  label="Hospital Type"
                  name="hospitalType"
                  value={formData.hospitalType}
                  onChange={handleChange}
                  options={[
                    { value: 'government', label: 'Government' },
                    { value: 'private', label: 'Private' },
                    { value: 'charitable', label: 'Charitable' },
                  ]}
                />
                <Input
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-red-600 hover:text-red-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
