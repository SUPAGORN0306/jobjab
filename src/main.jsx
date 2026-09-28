import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';

// ============================================
// EAGER LOAD (above the fold)
// ============================================
import App from './App.jsx';
import EmployerApp from './EmployerApp.jsx';

// ============================================
// LAZY LOAD (route-based code splitting)
// ============================================

// Public
const Splash = lazy(() => import('./pages/Splash.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));

// Candidate
const Home = lazy(() => import('./pages/Home.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Favorite = lazy(() => import('./pages/Favorite.jsx'));
const Apply = lazy(() => import('./pages/Apply.jsx'));
const AppStatus = lazy(() => import('./pages/AppStatus.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Edit = lazy(() => import('./pages/Edit.jsx'));
const JobDetail = lazy(() => import('./pages/JobDetail.jsx'));
const AllJobs = lazy(() => import('./pages/AllJobs.jsx'));

// Employer
const EmployerDashboard = lazy(() => import('./pages/EmployerDashboard.jsx'));
const EmployerJobs = lazy(() => import('./pages/EmployerJobs.jsx'));
const EmployerApplicants = lazy(() => import('./pages/EmployerApplicants.jsx'));
const EmployerAnalytics = lazy(() => import('./pages/EmployerAnalytics.jsx'));
const EmployerProfile = lazy(() => import('./pages/EmployerProfile.jsx'));
const EmployerProfileEdit = lazy(() => import('./pages/EmployerProfileEdit.jsx'));
const EmployerAbout = lazy(() => import('./pages/EmployerAbout.jsx'));

// ============================================
// CONTEXT + COMPONENTS
// ============================================
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// ============================================
// STYLES
// ============================================
import './styles/global.css';
import './styles/tabbar.css';
import './styles/components/ErrorBoundary.css';
import './styles/components/EmptyState.css';
import './styles/components/FormFields.css';
import './styles/components/Animations.css';

// ============================================
// REDIRECT HELPER
// ============================================
function JobApplicantsRedirect() {
  const { jobId } = useParams();
  return <Navigate to={`/employer/applicants?job=${jobId}`} replace />;
}

// ============================================
// PAGE FALLBACK (Suspense)
// ============================================
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f19',
        color: '#8c9bae',
        fontSize: '0.9rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(240, 209, 84, 0.2)',
            borderTopColor: '#f0d154',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>Loading...</span>
      </div>
    </div>
  );
}

// ============================================
// ROUTER
// ============================================
const router = createBrowserRouter([
  { path: '/', element: <Splash /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  {
    path: '/',
    element: (
      <ProtectedRoute requiredRole="candidate">
        <App />
      </ProtectedRoute>
    ),
    children: [
      { path: 'home', element: <Home /> },
      { path: 'all-jobs', element: <AllJobs /> },
      { path: 'favorite', element: <Favorite /> },
      { path: 'status', element: <AppStatus /> },
      { path: 'profile', element: <Profile /> },
      { path: 'profile/edit', element: <Edit /> },
      { path: 'job/:id', element: <JobDetail /> },
      { path: 'job/:id/apply', element: <Apply /> },
      { path: 'about', element: <About /> },
    ],
  },
  {
    path: '/employer',
    element: (
      <ProtectedRoute requiredRole="employer">
        <EmployerApp />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <EmployerDashboard /> },
      { path: 'jobs', element: <EmployerJobs /> },
      { path: 'applicants', element: <EmployerApplicants /> },
      { path: 'analytics', element: <EmployerAnalytics /> },
      { path: 'profile', element: <EmployerProfile /> },
      { path: 'profile/edit', element: <EmployerProfileEdit /> },
      { path: 'about', element: <EmployerAbout /> },
      { path: 'jobs/:jobId/applicants', element: <JobApplicantsRedirect /> },
    ],
  },
]);

// ============================================
// RENDER
// ============================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <FavoritesProvider>
          <Suspense fallback={<PageLoader />}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster
            position="top-center"
            richColors
            closeButton
            duration={3000}
          />
        </FavoritesProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
