'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Droplets, Shield, Building2, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleDemoFill = (role: string, demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSelectedDemo(role);
    toast.success(`Demo credentials filled for ${role}!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);
      toast.success('Login successful!');

      switch (userData.role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'hospital':
          router.push('/hospital');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-rose-500 selection:text-white relative">
      {/* Background subtle ambiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-100/40 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />

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
              href="/auth/register"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-colors whitespace-nowrap"
            >
              Need an account?
            </Link>
            <Link
              href="/auth/register"
              className="text-xs sm:text-sm font-semibold bg-rose-600 text-white px-3.5 sm:px-4 py-2 rounded-xl shadow-sm hover:bg-rose-700 transition-all hover:shadow-rose-600/20 whitespace-nowrap"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Authentication Card */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 sm:p-10 relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 mb-4">
                <Droplets className="w-6 h-6 fill-rose-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">
                Sign in to your clinical portal to manage requests & inventory
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="doctor@hospital.com or donor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                loading={loading}
                rightIcon={<ArrowRight className="w-4 h-4 shrink-0" />}
              >
                Sign In to Portal
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Create one now
              </Link>
            </div>

            {/* Interactive Demo Credentials with 1-click Fill */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Quick Demo Accounts
                </p>
                <span className="text-[11px] text-slate-500 font-medium">Click to auto-fill</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoFill('Admin', 'admin@bloodbank.com', 'admin123')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedDemo === 'Admin'
                      ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4 mb-1 text-rose-600" />
                  <span>Admin</span>
                  {selectedDemo === 'Admin' && <CheckCircle2 className="w-3 h-3 text-rose-600 mt-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('Donor', 'rahul@example.com', 'donor123')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedDemo === 'Donor'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <User className="w-4 h-4 mb-1 text-emerald-600" />
                  <span>Donor</span>
                  {selectedDemo === 'Donor' && <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-1" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoFill('Hospital', 'city@hospital.com', 'hospital123')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    selectedDemo === 'Hospital'
                      ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1 text-sky-600" />
                  <span>Hospital</span>
                  {selectedDemo === 'Hospital' && <CheckCircle2 className="w-3 h-3 text-sky-600 mt-1" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
