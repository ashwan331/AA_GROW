// src/context/AuthContext.tsx
// ─────────────────────────────────────────────────────────
//  Replaces Firebase token flow with plain JWT + MySQL backend.
//  Drop this file into:  frontend/src/context/AuthContext.tsx
// ─────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  farm_name?: string;
  farm_location?: string;
  farm_size?: string;
  otp_verified?: number;
} | null;

interface AuthContextType {
  user: User;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<NonNullable<User>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user,  setUser]  = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('aa_grow_token');
    const storedUser  = localStorage.getItem('aa_grow_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('aa_grow_token');
        localStorage.removeItem('aa_grow_user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('aa_grow_token', newToken);
    localStorage.setItem('aa_grow_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aa_grow_token');
    localStorage.removeItem('aa_grow_user');
  };

  const updateUser = (updatedFields: Partial<NonNullable<User>>) => {
    const merged = { ...user, ...updatedFields } as User;
    setUser(merged);
    localStorage.setItem('aa_grow_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─────────────────────────────────────────────────────────
//  Centralised API helper – attaches JWT automatically.
//  Usage:
//    import { apiFetch } from '../context/AuthContext';
//    const data = await apiFetch('/api/dashboard/summary');
// ─────────────────────────────────────────────────────────
export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = localStorage.getItem('aa_grow_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
};
