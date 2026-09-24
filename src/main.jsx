import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import Splash from './pages/Splash.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx'; 
import App from './App.jsx';
import EmployerApp from './EmployerApp.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Favorite from './pages/Favorite.jsx';
import Apply from './pages/Apply.jsx';
import AppStatus from './pages/AppStatus.jsx';
import Profile from './pages/Profile.jsx';
import Edit from './pages/Edit.jsx';
import JobDetail from './pages/JobDetail.jsx';
import EmployerDashboard from './pages/EmployerDashboard.jsx';
import AllJobs from './pages/AllJobs.jsx';
import ViewApplicants from './pages/ViewApplicants.jsx';

import EmployerJobs from './pages/EmployerJobs.jsx';
import EmployerApplicants from './pages/EmployerApplicants.jsx';
import EmployerProfile from './pages/EmployerProfile.jsx';
import EmployerProfileEdit from './pages/EmployerProfileEdit.jsx';

import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './styles/global.css';
import './styles/tabbar.css';

const router = createBrowserRouter([
  { path: "/", element: <Splash /> }, 
  { path: "/login", element: <Login /> },        
  { path: "/signup", element: <Signup /> },       
  {
    path: "/",
    element: (
      <ProtectedRoute requiredRole="candidate">
        <App />
      </ProtectedRoute>
    ),
    children: [
      { path: "home", element: <Home /> },
      { path: "all-jobs", element: <AllJobs /> },
      { path: "favorite", element: <Favorite /> },
      { path: "status", element: <AppStatus /> },
      { path: "profile", element: <Profile /> },
      { path: "profile/edit", element: <Edit /> },
      { path: "job/:id", element: <JobDetail /> },
      { path: "job/:id/apply", element: <Apply /> },
      { path: "about", element: <About /> }, 
    ],
  },
  {
    path: "/employer",
    element: (
      <ProtectedRoute requiredRole="employer">
        <EmployerApp />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <EmployerDashboard /> },
      { path: "jobs", element: <EmployerJobs /> },
      { path: "applicants", element: <EmployerApplicants /> },
      { path: "profile", element: <EmployerProfile /> },
      { path: "profile/edit", element: <EmployerProfileEdit /> },
      { path: "jobs/:jobId/applicants", element: <ViewApplicants /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={3000}
        />
      </FavoritesProvider>
    </AuthProvider>
  </React.StrictMode>,
);