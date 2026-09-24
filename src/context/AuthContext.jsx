// src/context/AuthContext.jsx
//
// Sprint 1.5: ใช้ cookies + /api/auth/me แทน localStorage
//
// Changes:
// - Init: ใช้ fetchMe() แทน localStorage
// - Login: เรียก API + setUser (ไม่ต้อง localStorage)
// - Logout: call API (revoke token) + setUser(null)
// - SwitchRole: set state (backend ส่ง roles มา)
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  setCurrentUser,
} from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // INIT: ดึงข้อมูลจาก backend (cookies)
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((data) => {
        if (cancelled) return;
        const u = data.user;
        setUser(u);

        // เลือก role เริ่มต้น
        const initial = u.role || u.roles?.[0] || 'candidate';
        setActiveRole(initial);
      })
      .catch(() => {
        if (cancelled) return;
        // 401 → ยังไม่ login
        setUser(null);
        setActiveRole(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // SYNC USER → api.js (module-level state)
  // ============================================================
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // ============================================================
  // LOGIN
  // ============================================================
  const login = useCallback(async (email, password, role) => {
    const data = await apiLogin({ email, password, role });
    const u = data.user;

    setUser(u);

    // เลือก role
    const initial = u.role || u.roles?.[0] || 'candidate';
    setActiveRole(initial);

    return u;
  }, []);

  // ============================================================
  // REGISTER
  // ============================================================
  const register = useCallback(async (data) => {
    return apiRegister(data);
  }, []);

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = useCallback(async () => {
    try {
      await apiLogout(); // ← revoke token + clear cookies
    } catch (err) {
      // ถ้า logout fail → ยัง clear state อยู่ดี
      console.warn('Logout API failed:', err);
    } finally {
      setUser(null);
      setActiveRole(null);
    }
  }, []);

  // ============================================================
  // SWITCH ROLE
  // ============================================================
  const switchRole = useCallback(
    (role) => {
      if (!user?.roles?.includes(role)) return false;
      setActiveRole(role);
      return true;
    },
    [user]
  );

  // ============================================================
  // REFRESH USER (optional — สำหรับหลัง updateProfile)
  // ============================================================
  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchMe();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  const value = {
    // State
    user,
    activeRole,
    loading,

    // Derived
    isAuthenticated: !!user,
    userId: user?.id ?? null,

    // Actions
    login,
    register,
    logout,
    switchRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
