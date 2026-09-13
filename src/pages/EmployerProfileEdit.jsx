import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFullProfile, updateProfile, getCurrentUserId } from '../api';
import { API_ORIGIN } from '../utils/apiUrl';
import { Building2 } from 'lucide-react';
import CompanyLogoUploader from '../components/CompanyLogoUploader';
import '../Edit.css';

export default function EmployerProfileEdit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    industry: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await fetchFullProfile();
        setForm({
          full_name: userData.profile?.full_name || '',
          phone: userData.profile?.phone || '',
          location: userData.profile?.location || '',
          bio: userData.profile?.bio || '',
          industry: userData.profile?.industry || '',
        });

        const userId = getCurrentUserId();
        const empRes = await fetch(
          `${API_ORIGIN}/api/employer/profile?user_id=${userId}`
        );
        if (empRes.ok) {
          const empData = await empRes.json();
          setCompanyLogo(empData.profile?.company_logo || null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUploaded = (newLogoUrl) => {
    setCompanyLogo(newLogoUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      alert('Profile updated successfully');
      navigate('/employer/profile');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-container">
        <p className="edit-loading">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="edit-container">
      {/* ============ HEADER ============ */}
      <div className="edit-header">
        <div>
          <h1>Edit Company Profile</h1>
          <p className="edit-sub-title">
            Update your company information
          </p>
        </div>
        <div className="edit-header-actions">
          <button
            className="cancel-btn"
            onClick={() => navigate('/employer/profile')}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className="edit-error">{error}</div>}

      <div className="edit-grid">
        {/* ============ LEFT CARD ============ */}
        <div className="edit-card-left">
          {/* Company Logo */}
          <CompanyLogoUploader
            currentImage={companyLogo}
            userId={getCurrentUserId()}
            onUploadSuccess={handleLogoUploaded}
          />

          <div style={{ textAlign: 'center', width: '100%' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff', margin: '0 0 4px 0' }}>
              {user?.company || 'Your Company'}
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#697382', margin: 0 }}>
              {user?.industry || 'Industry N/A'}
            </p>
          </div>

          {/* Full Name */}
          <div className="edit-field">
            <span className="field-label">
              Contact Person <span className="required">*</span>
            </span>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. John Smith"
              value={form.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="edit-field">
            <span className="field-label">Phone</span>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. +66 91 234 5678"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="edit-field">
            <span className="field-label">Location</span>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Bangkok, Thailand"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          {/* Industry */}
          <div className="edit-field">
            <span className="field-label">Industry</span>
            <select
              className="field-input"
              value={form.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              <option value="">-- Select Industry --</option>
              <option value="Tech">Tech</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Education">Education</option>
              <option value="Automotive">Automotive</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Bio */}
          <div className="edit-field">
            <span className="field-label">Bio / About</span>
            <textarea
              className="field-input"
              rows={4}
              placeholder="Tell candidates about your company..."
              value={form.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </div>
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="edit-right-column">
          <div className="edit-card-right">
            <h3 className="section-title">
              <Building2 size={16} />
              Company Information
            </h3>

            <div className="empty-state-card" style={{ marginTop: 12 }}>
              <div className="empty-icon-wrapper">
                <Building2 size={28} />
              </div>
              <p className="empty-text">
                Edit your company details on the left
              </p>
              <p className="empty-subtext">
                Your changes will be visible to all job seekers on your job postings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}