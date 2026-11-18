import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  setCurrentUser,
  switchRoleApi,
} from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Init: fetch user data from backend (cookies)
  useEffect(() => {
    let cancelled = false;

    fetchMe()
      .then((data) => {
        if (cancelled) return;
        const u = data.user;
        setUser(u);

        // Select initial role
        const initial = u.role || u.roles?.[0] || 'candidate';
        setActiveRole(initial);
      })
      .catch(() => {
        if (cancelled) return;
        // 401 indicates user is not logged in
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

  // Sync user to api.js (module-level state)
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Login
  const login = useCallback(async (email, password, role) => {
    const data = await apiLogin({ email, password, role });
    const u = data.user;

    setUser(u);

    // Select role
    const initial = u.role || u.roles?.[0] || 'candidate';
    setActiveRole(initial);

    return u;
  }, []);

  // Register
  const register = useCallback(async (data) => {
    return apiRegister(data);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiLogout(); // Revoke token and clear cookies
    } catch (err) {
      // Clear state even if logout fails
      console.warn('Logout API failed:', err);
    } finally {
      setUser(null);
      setActiveRole(null);
    }
  }, []);

  // Switch role
  const switchRole = useCallback(
    async (role) => {
      if (!user?.roles?.includes(role)) return false;

      // Request a new JWT with this role so me() returns the right role after refresh
      try {
        await switchRoleApi({ role });
      } catch (err) {
        console.warn('switchRole: API failed', err);
        return false;   // Do not update activeRole if API fails to keep state in sync with JWT
      }

      setActiveRole(role);
      return true;
    },
    [user]
  );

  // Refresh user (optional, for after updateProfile)
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

  // Context value
  const value = useMemo(
    () => ({
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
    }),
    [user, activeRole, loading, login, register, logout, switchRole, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
