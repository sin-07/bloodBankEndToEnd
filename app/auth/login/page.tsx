'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Droplets } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
            <Link href="/auth/login" className="text-sm font-medium text-red-600">
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Droplets className="w-10 h-10 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">
              A2R <span className="text-red-600">Demo</span>
            </span>
          </Link>
          <p className="mt-2 text-gray-500">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-red-600 hover:text-red-700">
              Register here
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Admin:</strong> admin@bloodbank.com / admin123</p>
            <p><strong>Donor:</strong> rahul@example.com / donor123</p>
            <p><strong>Hospital:</strong> city@hospital.com / hospital123</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
