'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Droplets, User, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import { BLOOD_GROUPS } from '@/lib/utils';
import toast from 'react-hot-toast';

function RegisterFormContent() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name?: string; value: string } }
  ) => {
    if (e.target.name) {
      setFormData((prev) => ({ ...prev, [e.target.name!]: e.target.value }));
    }
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/80 via-slate-50/80 to-slate-50 text-slate-900 flex flex-col selection:bg-rose-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting - corner & top reddish gradient orbs */}
      <div className="absolute -top-28 right-[-50px] w-[600px] h-[600px] bg-gradient-to-bl from-rose-500/[0.15] via-rose-400/[0.08] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-rose-400/[0.14] via-rose-300/[0.06] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-500/[0.10] via-rose-400/[0.05] to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Modern Clean Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Srishti <span className="text-rose-600">Blood Bank</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Clinical Logistics Hub
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg hover:bg-slate-100/80 transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Registration Container */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-b from-rose-50/70 via-white to-white rounded-3xl border border-rose-100/90 shadow-2xl p-5 sm:p-10 relative overflow-hidden">
            {/* Ambient Reddish Glow */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-br from-rose-500/[0.10] via-red-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Your Account
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Join our regional network as a life-saving donor or verified medical center
              </p>
            </div>

            {/* Role Switcher Pill */}
            <div className="flex gap-2 mb-8 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'donor' })}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.role === 'donor'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className={`w-4 h-4 ${formData.role === 'donor' ? 'text-rose-600' : 'text-slate-500'}`} />
                <span>Blood Donor</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'hospital' })}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  formData.role === 'hospital'
                    ? 'bg-white text-rose-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className={`w-4 h-4 ${formData.role === 'hospital' ? 'text-rose-600' : 'text-slate-500'}`} />
                <span>Hospital / Clinic</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Account Credentials
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name / Primary Contact"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Dr. Rajesh Sharma"
                    required
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rajesh@example.com"
                    required
                  />
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
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
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Contact & Location
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai / Delhi"
                    required
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, Landmark, Ward Number"
                  />
                </div>
              </div>

              {/* Donor Specific Information */}
              {formData.role === 'donor' && (
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-3">
                    Donor Health & Blood Profile
                  </h3>
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
                    <DatePicker
                      label="Date of Birth"
                      name="dateOfBirth"
                      max={new Date().toISOString().split('T')[0]}
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
                      placeholder="Min. 45 kg"
                      min={45}
                    />
                  </div>
                </div>
              )}

              {/* Hospital Specific Information */}
              {formData.role === 'hospital' && (
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-3">
                    Hospital Registration Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Hospital / Center Name"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      placeholder="City General Hospital"
                      required
                    />
                    <Input
                      label="License / Reg. Number"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="HOSP-REG-2024-998"
                      required
                    />
                    <Select
                      label="Hospital Classification"
                      name="hospitalType"
                      value={formData.hospitalType}
                      onChange={handleChange}
                      options={[
                        { value: 'government', label: 'Government Hospital' },
                        { value: 'private', label: 'Private Multi-Specialty' },
                        { value: 'charitable', label: 'Charitable Trust' },
                      ]}
                    />
                    <Input
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                size="lg"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
              >
                Complete Registration
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-rose-600 hover:text-rose-700">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
