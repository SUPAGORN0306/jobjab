// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('user_id');
    const roles = JSON.parse(localStorage.getItem('user_roles') || '[]');
    const storedActiveRole = localStorage.getItem('active_role');
    const name = localStorage.getItem('user_name');
    const company = localStorage.getItem('company_name');

    if (id) {
      const validActiveRole = storedActiveRole || (roles.length > 0 ? roles[0] : 'candidate');

      setUser({
        id: parseInt(id, 10),
        roles,
        role: validActiveRole,
        name,
        company,
      });
      setActiveRole(validActiveRole);

      if (!storedActiveRole && validActiveRole) {
        localStorage.setItem('active_role', validActiveRole);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const roles = userData.roles || [userData.role || 'candidate'];

    // ⭐ ใช้ role ที่ backend ส่งมา (จาก userData.role) แทนการบังคับ roles[0]
    let initialRole = userData.role;

    // ถ้า role ไม่ถูกต้อง → fallback เป็น roles[0]
    if (!initialRole || !roles.includes(initialRole)) {
      initialRole = roles[0] || 'candidate';
    }

    localStorage.setItem('user_id', userData.id);
    localStorage.setItem('user_roles', JSON.stringify(roles));
    localStorage.setItem('active_role', initialRole);
    localStorage.setItem('user_name', userData.full_name || '');
    if (userData.company_name) {
      localStorage.setItem('company_name', userData.company_name);
    }

    setUser({
      id: userData.id,
      roles,
      role: initialRole,
      name: userData.full_name,
      company: userData.company_name,
    });
    setActiveRole(initialRole);

    return roles;
  };

  const switchRole = (role) => {
    if (!user?.roles?.includes(role)) return false;
    localStorage.setItem('active_role', role);
    setActiveRole(role);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_roles');
    localStorage.removeItem('active_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('company_name');
    setUser(null);
    setActiveRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        login,
        logout,
        switchRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};