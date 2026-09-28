import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFullProfile, updateProfile } from '../api';
import apiClient from '../apiClient';
import '../styles/candidate/Profile.css';
import {
  Briefcase,
  Building2,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  Users,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { toast } from 'sonner';
import { StatsGridSkeleton } from '../components/EmployerSkeleton';
import { EmployerHero, EmployerStat } from '../components/employer';
import useEmployerData from '../hooks/useEmployerData';

export default function EmployerProfile() {
  usePageTitle("Company Profile", { description: "Your company profile" });

  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();

  const { jobs, loading: jobsLoading, totalApplicants, activeJobs } = useEmployerData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);

  // ⭐ EDIT MODE
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    industry: '',
    bio: '',
  });

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

  // ⭐ Start editing — copy profile → form
  const handleStartEdit = () => {
    setForm({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      industry: profile?.industry || '',
      bio: profile?.bio || '',
    });
    setIsEditing(true);
  };

  // ⭐ Cancel — reset form
  const handleCancelEdit = () => {
    setIsEditing(false);
    setForm({ full_name: '', phone: '', location: '', industry: '', bio: '' });
  };

  // ⭐ Field change
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ⭐ Save — update profile
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setProfile((prev) => ({ ...prev, ...form }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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
        <EmployerHero
          tag="COMPANY PROFILE"
          tagIcon={Building2}
          title="Loading profile..."
        />

        <StatsGridSkeleton count={3} />
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
    <div className="employer-container">
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
          {/* Company details — View/Edit toggle */}
          <div className="employer-profile-card">
            <div className="employer-section-header-row">
              <h3 className="employer-section-title">Company details</h3>

              {!isEditing ? (
                <button
                  className="employer-edit-toggle-btn"
                  onClick={handleStartEdit}
                >
                  <Pencil size={12} />
                  Edit
                </button>
              ) : (
                <div className="employer-edit-actions">
                  <button
                    className="employer-edit-toggle-btn"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X size={12} />
                    Cancel
                  </button>
                  <button
                    className="employer-edit-toggle-btn primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={12} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              /* ═══════ VIEW MODE ═══════ */
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
                    {profile?.phone || 'Not provided'}
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
            ) : (
              /* ═══════ EDIT MODE ═══════ */
              <div className="form-grid">
                <div className="form-field form-field-full">
                  <label className="form-field-label">
                    <UserCheck size={12} />
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    value={form.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-field-label">
                    <Phone size={12} />
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +66 91 234 5678"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-field-label">
                    <MapPin size={12} />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bangkok, Thailand"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                  />
                </div>

                <div className="form-field form-field-full">
                  <label className="form-field-label">
                    <Building2 size={12} />
                    Industry
                  </label>
                  <select
                    value={form.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                  >
                    <option value="">-- Select Industry --</option>
                    <option value="Tech">Tech</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field form-field-full">
                  <label className="form-field-label">Bio / About</label>
                  <textarea
                    rows={4}
                    placeholder="Tell candidates about your company culture, mission, and what makes you a great place to work..."
                    value={form.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="employer-profile-card">
            <h3 className="employer-section-title">Overview</h3>
            <div className="employer-stats-row">
              <EmployerStat variant="mini" icon={Briefcase} value={jobs.length} label="Posted jobs" />
              <EmployerStat variant="mini" icon={Users} value={totalApplicants} label="Total applicants" />
              <EmployerStat variant="mini" icon={UserCheck} value={activeJobs} label="Active jobs" />
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