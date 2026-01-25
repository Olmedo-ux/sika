import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/lib/mock-data';
import api from '@/lib/axios';
import axios from 'axios';

interface UpdateProfileData {
  name?: string;
  phone?: string;
  neighborhood?: string;
  companyName?: string;
  responsibleName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
}

interface RegisterData {
  phone: string;
  password: string;
  name: string;
  neighborhood: string;
  role: 'citizen' | 'collector' | 'recycler';
  companyName?: string;
  responsibleName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Set Authorization header from stored token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const response = await api.get('/user');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/login', {
        phone,
        password,
      });

      console.log('Réponse Login:', response.data);

      // Vérifier que le token et user existent
      if (!response.data.token || !response.data.user) {
        console.error('Réponse invalide du serveur:', response.data);
        throw new Error('Réponse invalide du serveur');
      }

      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      
      // Set default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      setUser(response.data.user);
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle rate limiting (429)
      if (error.response?.status === 429) {
        const message = error.response?.data?.message || 'Trop de tentatives. Réessayez plus tard.';
        throw new Error(message);
      }
      
      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors?.phone) {
          throw new Error(errors.phone[0]);
        }
        throw new Error('Erreur de validation. Vérifiez vos informations.');
      }
      
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await api.post('/register', {
        phone: data.phone,
        password: data.password,
        name: data.name,
        role: data.role,
        neighborhood: data.neighborhood,
        company_name: data.companyName,
        responsible_name: data.responsibleName,
      });

      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.token);
      
      // Set default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      setUser(response.data.user);
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle rate limiting (429)
      if (error.response?.status === 429) {
        const message = error.response?.data?.message || 'Trop de tentatives. Réessayez plus tard.';
        throw new Error(message);
      }
      
      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors;
        if (errors?.phone) {
          throw new Error(errors.phone[0]);
        }
        if (errors?.password) {
          throw new Error(errors.password[0]);
        }
        throw new Error('Erreur de validation. Vérifiez vos informations.');
      }
      
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await api.put('/profile', {
        name: data.name,
        neighborhood: data.neighborhood,
        companyName: data.companyName,
        responsibleName: data.responsibleName,
        avatar: data.avatar,
      });

      // Update user state with fresh data from server
      setUser(response.data.user || response.data);
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, register, updateProfile }}>
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
