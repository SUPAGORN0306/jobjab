import { resolveFileUrl } from '../utils/apiUrl';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFullProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import '../styles/candidate/Profile.css';
import { ProfileSkeleton } from "../components/Skeleton";

export default function Profile() {
  const navigate = useNavigate();
  const { user, activeRole, logout, switchRole, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  useEffect(() => {
    // ⭐ รอ auth sync
    if (authLoading) return;
    if (!user?.id) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchFullProfile(user.id);
        setProfile(data.profile);
        setSkills(data.skills || []);
        setExperiences(data.experiences || []);
        setEducations(data.educations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading, navigate]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const handleSwitchRole = (role) => {
    if (role === activeRole) return;
    const confirmed = window.confirm(
      `Switch to "${role === 'employer' ? 'Employer' : 'Job Seeker'}" mode?`
    );
    if (!confirmed) return;
    switchRole(role);
    window.location.href = role === 'employer' ? '/employer/dashboard' : '/home';
  };

  if (loading) {
    return (
      <div className="profile-container">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <p style={{ padding: '40px 0', textAlign: 'center', color: '#e74c3c' }}>
          Error: {error}
        </p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const calculateStrength = () => {
    let score = 0;
    if (profile?.full_name) score += 15;
    if (profile?.email) score += 10;
    if (profile?.phone) score += 10;
    if (profile?.location) score += 10;
    if (profile?.bio) score += 10;
    if (profile?.profile_image) score += 5;
    if (profile?.resume_url) score += 15;
    if (skills.length > 0) score += 10;
    if (experiences.length > 0) score += 10;
    if (educations.length > 0) score += 5;
    return Math.min(score, 100);
  };

  const strength = calculateStrength();

  const hasMultipleRoles = user?.roles?.length > 1;

  const resumeFilename = profile?.resume_url
    ? profile.resume_url.split('/').pop()
    : null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h1>User profile</h1>
          <div
            className={`profile-role-badge ${
              activeRole === 'employer' ? 'employer' : 'candidate'
            }`}
          >
            <span className="dot"></span>
            {activeRole === 'employer' ? 'Employer mode' : 'Job Seeker mode'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {hasMultipleRoles && (
            <button
              className="edit-profile-btn"
              onClick={() =>
                handleSwitchRole(
                  activeRole === 'employer' ? 'candidate' : 'employer'
                )
              }
              style={{
                background: 'rgba(128, 255, 213, 0.15)',
                borderColor: 'rgba(128, 255, 213, 0.5)',
                color: '#80ffd5',
              }}
            >
              Switch to {activeRole === 'employer' ? 'Job Seeker' : 'Employer'}
            </button>
          )}

          <button
            className="edit-profile-btn"
            onClick={() => navigate('/profile/edit')}
          >
            Edit profile
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

      <div className="profile-grid">
        <div className="profile-card-left">
          <div className="avatar-wrapper" style={{ overflow: 'hidden', padding: 0 }}>
            {profile?.profile_image ? (
              <img
                src={
                  profile.profile_image.startsWith('http')
                    ? profile.profile_image
                    : resolveFileUrl(profile.profile_image)
                }
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            )}
          </div>

          <div className="profile-info">
            <h2>{profile?.full_name || profile?.username}</h2>
            <p>
              {profile?.role || 'Candidate'} · {profile?.location || 'N/A'}
            </p>
          </div>

          <div className="profile-strength-container">
            <div
              className="strength-circle"
              style={{
                background: `conic-gradient(#80ffd5 ${strength}%, rgba(255, 255, 255, 0.3) 0%)`,
              }}
            >
              <span className="strength-value">{strength}%</span>
            </div>
            <span className="strength-label">Profile strength</span>
          </div>

          <div className="skills-container">
            {skills.length > 0 ? (
              skills.map((s) => (
                <span className="skill-tag" key={s.id || s.skill_name}>
                  {s.skill_name}
                </span>
              ))
            ) : (
              <span style={{ color: '#697382', fontSize: '0.7rem' }}>
                No skills added
              </span>
            )}
          </div>
        </div>

        <div className="profile-right-column">
          <div className="profile-card-right">
            <h3 className="section-title">Contact details</h3>
            <div className="contact-grid">
              <div className="contact-field">
                <span className="field-label">Email</span>
                <div className="field-box">{profile?.email || '-'}</div>
              </div>
              <div className="contact-field">
                <span className="field-label">Phone</span>
                <div className="field-box">{profile?.phone || '-'}</div>
              </div>
              <div className="contact-field">
                <span className="field-label">Location</span>
                <div className="field-box">{profile?.location || '-'}</div>
              </div>
              <div className="contact-field">
                <span className="field-label">Bio</span>
                <div className="field-box">{profile?.bio || '-'}</div>
              </div>
              <div className="contact-field full-width">
                <span className="field-label">Resume</span>
                <div className="field-box">
                  {profile?.resume_url ? (
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resume-view-link"
                    >
                      {resumeFilename}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card-right">
            <h3 className="section-title">Experience</h3>
            <div className="experience-list">
              {experiences.length > 0 ? (
                experiences.map((item) => (
                  <div className="experience-item" key={item.id}>
                    <span className="dot experience"></span>
                    <div className="experience-details">
                      <h3>{item.job_title}</h3>
                      <p className="company-location">
                        {item.company_name} · {item.location || 'N/A'}
                      </p>
                      <p className="duration">
                        {formatDate(item.start_date)} -{' '}
                        {item.is_current ? 'Present' : formatDate(item.end_date)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#8c9bae', fontSize: '0.8rem' }}>
                  No experience added yet
                </p>
              )}
            </div>
          </div>

          <div className="profile-card-right">
            <h3 className="section-title">Education</h3>
            <div className="experience-list">
              {educations.length > 0 ? (
                educations.map((item) => (
                  <div className="experience-item" key={item.id}>
                    <span className="dot experience"></span>
                    <div className="experience-details">
                      <h3>
                        {item.degree} - {item.field_of_study}
                      </h3>
                      <p className="company-location">{item.institution}</p>
                      <p className="duration">
                        {formatDate(item.start_date)} -{' '}
                        {item.is_current ? 'Present' : formatDate(item.end_date)}
                        {item.gpa ? ` · GPA ${item.gpa}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#8c9bae', fontSize: '0.8rem' }}>
                  No education added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}