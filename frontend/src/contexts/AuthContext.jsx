import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fit_health_token') || null);
  const [loading, setLoading] = useState(true);

  // Check existing session on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('fit_health_token');
        if (storedToken && storedToken !== 'null' && storedToken !== 'undefined' && storedToken.trim().length > 10) {
          try {
            const res = await api.getProfile();
            if (res.success && res.user) {
              setUser(res.user);
            } else {
              localStorage.removeItem('fit_health_token');
              setToken(null);
              setUser(null);
            }
          } catch (err) {
            console.warn('Session expired or invalid:', err.message);
            localStorage.removeItem('fit_health_token');
            setToken(null);
            setUser(null);
          }
        } else {
          localStorage.removeItem('fit_health_token');
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.warn('Auth init failed:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password, role = 'member') => {
    const res = await api.login(email, password, role);
    if (res.success && res.token) {
      localStorage.setItem('fit_health_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const loginWithOTP = async (email, otp, role = 'member') => {
    const res = await api.loginWithOTP(email, otp, role);
    if (res.success && res.token) {
      localStorage.setItem('fit_health_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'OTP Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('fit_health_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) await api.logout();
    } catch (e) {
      // Ignore network error on logout
    }
    localStorage.removeItem('fit_health_token');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (updates) => {
    const res = await api.updateProfile(updates);
    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Profile update failed');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      loginWithOTP,
      register,
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
