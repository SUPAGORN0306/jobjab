import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFullProfile, updateProfile } from '../utils/api';
import apiClient from '../lib/apiClient';
import CompanyLogoUploader from '../components/CompanyLogoUploader';
import {
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';
import '../styles/employer/EmployerEdit.css';
import { formatPhone } from '../utils/phone';

const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Education',
  'Retail', 'E-commerce', 'Automotive', 'Other',
];

export default function EmployerProfileEdit() {
  usePageTitle("Edit Company", { description: "Update company information" });

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

        const empRes = await apiClient
          .get('/api/employer/profile')
          .then((r) => r.data)
          .catch(() => null);

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
      toast.success('Profile updated successfully');
      navigate('/employer/profile');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="employer-edit-container">
        <p style={{ textAlign: 'center', padding: '60px 0', color: '#8c9bae' }}>
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="employer-edit-container">
      <div className="employer-edit-header">
        <div>
          <h1>Edit Company Profile</h1>
          <p>Update your company information and contact details</p>
        </div>

        <div className="employer-edit-header-actions">
          <button
            className="form-btn form-btn-secondary"
            onClick={() => navigate('/employer/profile')}
            disabled={saving}
          >
            <X size={14} />
            Cancel
          </button>
          <button
            className="form-btn form-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="emp-error" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="employer-edit-grid">
        <div className="employer-edit-logo-card">
          <CompanyLogoUploader
            currentImage={companyLogo}
            userId={user?.id}
            onUploadSuccess={handleLogoUploaded}
          />

          <div style={{ textAlign: 'center' }}>
            <h3 className="employer-edit-company-name">
              {user?.company || 'Your Company'}
            </h3>
            <p className="employer-edit-company-meta">
              {user?.industry || 'Industry N/A'}
            </p>
          </div>
        </div>

        <div className="employer-edit-form-card">
          <h2 className="form-section-title">
            <Building2 size={18} />
            Company Information
          </h2>

          <div className="form-grid">
            <div className="form-field form-field-full">
              <label className="form-field-label">
                <User size={12} />
                Contact Person
                <span className="required">*</span>
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
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-full">
              <label className="form-field-label">
                <FileText size={12} />
                Bio / About
              </label>
              <textarea
                rows={5}
                placeholder="Tell candidates about your company culture, mission, and what makes you a great place to work..."
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
