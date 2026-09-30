import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFullProfile } from '../utils/api';
import apiClient from '../lib/apiClient';
import '../styles/candidate/Profile.css';
import {
  Briefcase,
  Building2,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import PageLoader from '../components/PageLoader';
import { EmployerHero, EmployerStat } from '../components/employer';
import useEmployerData from '../hooks/useEmployerData';
import { formatPhone } from '../utils/phone';

export default function EmployerProfile() {
  usePageTitle("Company Profile", { description: "Your company profile" });

  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();

  const { jobs, loading: jobsLoading, totalApplicants, activeJobs } = useEmployerData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileData, empRes] = await Promise.all([
          fetchFullProfile(),
          apiClient
            .get('/api/employer/profile')
            .then((r) => r.data)
            .catch(() => null),
        ]);

        setProfile(profileData.profile);

        if (empRes) {
          setCompanyLogo(empRes.profile?.company_logo || null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/');
    }
  };

  const handleSwitchRole = async () => {
    const confirmed = window.confirm('Switch to "Job Seeker" mode?');
    if (!confirmed) return;

    // รอ API switch-role เสร็จก่อน → cookie ใหม่ถูก set
    const ok = await switchRole('candidate');
    if (!ok) {
      alert('Failed to switch role. Please try again.');
      return;
    }

    // client-side navigate (SPA) — ไม่ reload หน้า
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="employer-container">
        <EmployerHero
          tag="COMPANY PROFILE"
          tagIcon={Building2}
          title="Loading profile..."
        />

        <PageLoader message="Loading profile..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="employer-container">
        <p className="employer-loading">Error: {error}</p>
      </div>
    );
  }

  const hasMultipleRoles = user?.roles?.length > 1;

  return (
    <div className="employer-container employer-profile-page">
      {/* ============ HERO ============ */}
      <EmployerHero
        tag="COMPANY PROFILE"
        tagIcon={Building2}
        title={user?.company || 'Your Company'}
        subtitle={
          <>
            {profile?.industry || 'Industry N/A'}
            {profile?.location && ` · ${profile.location}`}
          </>
        }
        children={
          <div className="employer-role-badge">
            <span className="role-dot"></span>
            Employer mode
          </div>
        }
        actions={
          <>
            {hasMultipleRoles && (
              <button
                className="edit-profile-btn"
                onClick={handleSwitchRole}
                style={{
                  background: 'rgba(128, 255, 213, 0.15)',
                  borderColor: 'rgba(128, 255, 213, 0.5)',
                  color: '#80ffd5',
                }}
              >
                Switch to Job Seeker
              </button>
            )}

            <button
              className="edit-profile-btn"
              onClick={() => navigate('/employer/profile/edit')}
            >
              Edit Profile
            </button>

            <button
              className="edit-profile-btn"
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                color: '#fca5a5',
              }}
            >
              Logout
            </button>
          </>
        }
      />

      {/* ============ PROFILE CONTENT — 2-Column Flex ============ */}
      <div className="emp-profile-bento">
        {/* LEFT COLUMN */}
        <div className="emp-profile-col">

        {/* Card 1: Company Info */}
        <div className="emp-profile-card emp-profile-card-info">
          <div
            className="employer-avatar-wrapper"
            style={{ overflow: 'hidden', padding: 0 }}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Company Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Building2 size={32} />
            )}
          </div>

          <div className="employer-profile-info">
            <h2>{user?.company || 'Your Company'}</h2>
            <p>{profile?.industry || 'Industry N/A'}</p>
            {profile?.location && (
              <p style={{ fontSize: '0.7rem', color: '#8c9bae', marginTop: 4 }}>
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Company Details */}
        <div className="emp-profile-card emp-profile-card-details">
          <h3 className="employer-section-title">Company details</h3>
          <div className="employer-contact-grid">
            <div className="employer-contact-field">
              <span className="employer-field-label">
                <Mail size={12} />
                Email
              </span>
              <div className={`employer-field-box ${!profile?.email ? 'empty' : ''}`}>
                {profile?.email || 'Not provided'}
              </div>
            </div>

            <div className="employer-contact-field">
              <span className="employer-field-label">
                <Phone size={12} />
                Phone
              </span>
              <div className={`employer-field-box ${!profile?.phone ? 'empty' : ''}`}>
                {profile?.phone ? formatPhone(profile.phone) : 'Not provided'}
              </div>
            </div>

            <div className="employer-contact-field">
              <span className="employer-field-label">
                <MapPin size={12} />
                Location
              </span>
              <div className={`employer-field-box ${!profile?.location ? 'empty' : ''}`}>
                {profile?.location || 'Not provided'}
              </div>
            </div>

            <div className="employer-contact-field">
              <span className="employer-field-label">
                <UserCheck size={12} />
                Contact person
              </span>
              <div className={`employer-field-box ${!profile?.full_name ? 'empty' : ''}`}>
                {profile?.full_name || 'Not provided'}
              </div>
            </div>

            <div className="employer-contact-field full-width">
              <span className="employer-field-label">Bio / About</span>
              <div className={`employer-field-box ${!profile?.bio ? 'empty' : ''}`}>
                {profile?.bio || 'No bio added yet'}
              </div>
            </div>
          </div>
        </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="emp-profile-col">
        {/* Card 3: Overview Stats */}
        <div className="emp-profile-card emp-profile-card-stats">
          <h3 className="employer-section-title">Overview</h3>
          <div className="employer-stats-row">
            <EmployerStat variant="mini" icon={Briefcase} value={jobs.length} label="Posted jobs" />
            <EmployerStat variant="mini" icon={Users} value={totalApplicants} label="Total applicants" />
            <EmployerStat variant="mini" icon={UserCheck} value={activeJobs} label="Active jobs" />
          </div>
        </div>

        {/* Card 4: Recent Jobs */}
        <div className="emp-profile-card emp-profile-card-jobs">
          <h3 className="employer-section-title">Recent job postings</h3>
          <div className="employer-jobs-list">
            {jobs.length > 0 ? (
              jobs.slice(0, 5).map((job) => (
                <div className="employer-job-item" key={job.id}>
                  <span className="employer-job-dot"></span>
                  <div className="employer-job-details">
                    <h4>{job.job_title}</h4>
                    <p className="employer-job-meta">
                      {job.location || 'N/A'} · {job.applicant_count} applicant
                      {job.applicant_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#8c9bae', fontSize: '0.8rem' }}>
                No jobs posted yet
              </p>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
