import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, User } from 'lucide-react';
import './EmployerApp.css';

export default function EmployerApp() {
  const location = useLocation();

  const tabs = [
    { path: '/employer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employer/jobs', icon: Briefcase, label: 'My Jobs' },
    { path: '/employer/applicants', icon: Users, label: 'Applicants' },
    { path: '/employer/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="app-layout">
      <div className="page-background"></div>

      <div className="employer-tabbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              title={tab.label}
              className={`employer-tab ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </div>

      <div className="main-content-area">
        <Outlet />
      </div>
    </div>
  );
}