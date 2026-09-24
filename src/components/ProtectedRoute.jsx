import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, activeRole, loading } = useAuth();
  const location = useLocation();

  // ─── 1. กำลังโหลด auth state ───
  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: '#8c9bae',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </div>
    );
  }

  // ─── 2. ยังไม่ login → redirect ไป /login (จำ path เดิม) ───
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ─── 3. ตรวจ role ───
  const effectiveRole =
    activeRole || user.role || user.roles?.[0] || 'candidate';

  if (requiredRole && effectiveRole !== requiredRole) {
    return (
      <Navigate
        to={effectiveRole === 'employer' ? '/employer/dashboard' : '/home'}
        replace
      />
    );
  }

  // ─── 4. ผ่านทุกเงื่อนไข → แสดง children ───
  return children;
}