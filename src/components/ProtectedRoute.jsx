import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, activeRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        color: '#8c9bae',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isGuest = user.id === 1;
  const path = location.pathname;

  if (isGuest) {
    // ⭐ Guest ห้ามเข้า — แต่ **อนุญาต** /apply
    const isBlocked =
      path === '/favorite' ||
      path === '/status' ||
      path === '/profile' ||
      path.startsWith('/profile/');
      // ⭐ ไม่บล็อค /apply และ /employer แยกต่างหาก

    if (isBlocked) {
      alert('Please login to access this page');
      return <Navigate to="/home" replace />;
    }
  }

  const storedRole = localStorage.getItem('active_role');
  const effectiveRole = activeRole || storedRole;

  if (isGuest) {
    return children;
  }

  if (requiredRole && effectiveRole !== requiredRole) {
    return (
      <Navigate
        to={effectiveRole === 'employer' ? '/employer/dashboard' : '/home'}
        replace
      />
    );
  }

  return children;
}