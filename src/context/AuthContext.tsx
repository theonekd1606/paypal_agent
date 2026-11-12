import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, name?: string, role?: string) => Promise<void>;
  logout: () => void;
  updateBudget: (newBudget: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agentpay_auth_token') || 'user-founder-01');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getProfile();
      setUser(res.user);
    } catch (err) {
      console.warn('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (email: string, name?: string, role?: string) => {
    const res = await api.verifyAuth({
      email,
      name: name || email.split('@')[0],
      role: role || 'founder'
    });
    localStorage.setItem('agentpay_auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('agentpay_auth_token');
    setToken(null);
    setUser(null);
  };

  const updateBudget = async (newBudget: number) => {
    const res = await api.updatePreferences({ monthlyBudget: newBudget });
    setUser(res.user);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateBudget, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
