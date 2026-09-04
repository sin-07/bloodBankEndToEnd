'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<void>;
  logout: () => void;
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
    setUser(null);
    setToken(null);
    Cookies.remove('token');
    Cookies.remove('user');
    window.location.href = '/auth/login';
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
        updateUser,
        isAdmin: user?.role === 'admin',
        isDonor: user?.role === 'donor',
        isHospital: user?.role === 'hospital',
      }}
    >
      {children}
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
