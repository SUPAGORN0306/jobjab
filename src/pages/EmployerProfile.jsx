import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFullProfile, fetchEmployerJobs } from '../api';
import apiClient from '../apiClient';
import '../styles/candidate/Profile.css';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  UserCheck,
} from 'lucide-react';

export default function EmployerProfile() {
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [companyLogo, setCompanyLogo] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [profileData, jobsData, empRes] = await Promise.all([
          fetchFullProfile(),
          fetchEmployerJobs(),
          apiClient
            .get('/api/employer/profile')
            .then((r) => r.data)
            .catch(() => null),
        ]);

        setProfile(profileData.profile);
        setJobs(jobsData.jobs || []);

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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const handleSwitchRole = () => {
    const confirmed = window.confirm('Switch to "Job Seeker" mode?');
    if (!confirmed) return;
    switchRole('candidate');
    window.location.href = '/home';
  };

  if (loading) {
    return (
      <div className="employer-container">
        <p className="employer-loading">Loading profile...</p>
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

  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (j.applicant_count || 0),
    0
  );

  const activeJobs = jobs.filter((j) => j.status === 'Active').length;

  const hasMultipleRoles = user?.roles?.length > 1;

  return (
    <div className="employer-container">
      {/* ============ HERO ============ */}
      <section className="emp-hero">
        <div className="emp-hero-content">
          <span className="emp-hero-tag">
            <Building2 size={14} />
            COMPANY PROFILE
          </span>
          <h1>{user?.company || 'Your Company'}</h1>
          <p className="emp-hero-subtitle">
            {profile?.industry || 'Industry N/A'}
            {profile?.location && ` · ${profile.location}`}
          </p>

          <div className="employer-role-badge">
            <span className="role-dot"></span>
            Employer mode
          </div>

          <div className="emp-hero-actions">
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
          </div>
        </div>
      </section>

      {/* ============ PROFILE CONTENT ============ */}
      <div className="employer-profile-grid">
        {/* LEFT CARD */}
        <div className="employer-profile-left">
          <div
            className="employer-avatar-wrapper"
            style={{ overflow: 'hidden', padding: 0 }}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Company Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
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

        {/* RIGHT COLUMN */}
        <div className="employer-profile-right">
          {/* Company details */}
          <div className="employer-profile-card">
            <h3 className="employer-section-title">Company details</h3>
            <div className="employer-contact-grid">
              <div className="employer-contact-field">
                <span className="employer-field-label">
                  <Mail size={12} />
                  Email
                </span>
                <div
                  className={`employer-field-box ${!profile?.email ? 'empty' : ''}`}
                >
                  {profile?.email || 'Not provided'}
                </div>
              </div>

              <div className="employer-contact-field">
                <span className="employer-field-label">
                  <Phone size={12} />
                  Phone
                </span>
                <div
                  className={`employer-field-box ${!profile?.phone ? 'empty' : ''}`}
                >
                  {profile?.phone || 'Not provided'}
                </div>
              </div>

              <div className="employer-contact-field">
                <span className="employer-field-label">
                  <MapPin size={12} />
                  Location
                </span>
                <div
                  className={`employer-field-box ${!profile?.location ? 'empty' : ''}`}
                >
                  {profile?.location || 'Not provided'}
                </div>
              </div>

              <div className="employer-contact-field">
                <span className="employer-field-label">
                  <UserCheck size={12} />
                  Contact person
                </span>
                <div
                  className={`employer-field-box ${!profile?.full_name ? 'empty' : ''}`}
                >
                  {profile?.full_name || 'Not provided'}
                </div>
              </div>

              <div className="employer-contact-field full-width">
                <span className="employer-field-label">Bio / About</span>
                <div
                  className={`employer-field-box ${!profile?.bio ? 'empty' : ''}`}
                >
                  {profile?.bio || 'No bio added yet'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="employer-profile-card">
            <h3 className="employer-section-title">Overview</h3>
            <div className="employer-stats-row">
              <div className="employer-mini-stat">
                <Briefcase size={18} />
                <span className="stat-num">{jobs.length}</span>
                <span className="stat-lbl">Posted jobs</span>
              </div>
              <div className="employer-mini-stat">
                <Users size={18} />
                <span className="stat-num">{totalApplicants}</span>
                <span className="stat-lbl">Total applicants</span>
              </div>
              <div className="employer-mini-stat">
                <UserCheck size={18} />
                <span className="stat-num">{activeJobs}</span>
                <span className="stat-lbl">Active jobs</span>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="employer-profile-card">
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