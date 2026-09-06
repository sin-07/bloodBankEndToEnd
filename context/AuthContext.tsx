'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import { User } from '@/types';
import LogoutConfirmModal from '@/components/auth/LogoutConfirmModal';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  confirmLogout: () => Promise<void>;
  cancelLogout: () => void;
  isLogoutModalOpen: boolean;
  isLoggingOut: boolean;
  updateUser: (data: Partial<User>) => void;
  isAdmin: boolean;
  isDonor: boolean;
  isHospital: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Load user from cookies on mount
  useEffect(() => {
    const savedToken = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        Cookies.remove('token');
        Cookies.remove('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { user: userData, token: authToken } = response.data.data;

    setUser(userData);
    setToken(authToken);

    Cookies.set('token', authToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });

    return userData;
  };

  const register = async (data: any) => {
    const response = await authAPI.register(data);
    const { user: userData, token: authToken } = response.data.data;

    setUser(userData);
    setToken(authToken);

    Cookies.set('token', authToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
  };

  const logout = () => {
    setIsLogoutModalOpen(true);
  };

  const cancelLogout = () => {
    if (!isLoggingOut) {
      setIsLogoutModalOpen(false);
    }
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Graceful delay to display the circle loader animation
      await new Promise((resolve) => setTimeout(resolve, 850));
      setUser(null);
      setToken(null);
      Cookies.remove('token');
      Cookies.remove('user');
      toast.success('Signed out successfully');
      setIsLogoutModalOpen(false);
      setIsLoggingOut(false);
      window.location.href = '/auth/login';
    } catch {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      window.location.href = '/auth/login';
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      Cookies.set('user', JSON.stringify(updated), { expires: 7 });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        confirmLogout,
        cancelLogout,
        isLogoutModalOpen,
        isLoggingOut,
        updateUser,
        isAdmin: user?.role === 'admin',
        isDonor: user?.role === 'donor',
        isHospital: user?.role === 'hospital',
      }}
    >
      {children}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        isLoggingOut={isLoggingOut}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
