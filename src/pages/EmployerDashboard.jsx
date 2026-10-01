import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';  
import { useNavigate } from 'react-router-dom';
import { fetchEmployerJobs, createEmployerJob, fetchJobApplications } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle,
  Plus,
  MapPin,
  Calendar,
  Sparkles,
  Building2,
  LogOut,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import EmployerCalendar from '../components/EmployerCalendar';
import EmptyState from '../components/EmptyState';
import useEmployerData from '../hooks/useEmployerData';
import { EmployerHero, EmployerStat } from '../components/employer';
import PageLoader from '../components/PageLoader';

// ============================================
// CONSTANTS
// ============================================

const JOB_TITLES = [
  'AI Product Manager', 'AI Researcher', 'Computer Vision Engineer',
  'Data Analyst', 'Data Scientist', 'ML Engineer',
  'NLP Engineer', 'Quant Researcher',
];

const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Education',
  'Retail', 'E-commerce', 'Automotive',
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const EXPERIENCE_LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];

// ============================================
// TIME AGO
// ============================================

const timeAgo = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};


// ============================================
// ACTION ITEMS — "Today's Tasks"
// ============================================

function ActionItems({ applications, jobs, onNavigate }) {
  //  applications  (status = applied)  2 
  const pendingApps = applications.filter((a) => {
    if (a.status !== 'applied') return false;
    if (!a.applied_date) return false;
    const days = Math.floor(
      (new Date() - new Date(a.applied_date)) / (1000 * 60 * 60 * 24)
    );
    return days >= 2;
  });

  //  jobs no applicants yet
  const emptyJobs = jobs.filter(
    (j) => (j.applicant_count || 0) === 0 && (j.status_key || 'active') === 'active'
  );

  const items = [];

  if (pendingApps.length > 0) {
    items.push({
      icon: 'bell',
      color: '#f0d154',
      title: `Reply to ${pendingApps.length} applicant${pendingApps.length > 1 ? 's' : ''}`,
      subtitle: `Pending more than 2 days`,
      action: 'Review now',
      onClick: () => onNavigate('/employer/applicants'),
    });
  }

  if (emptyJobs.length > 0) {
    items.push({
      icon: 'briefcase',
      color: '#38bdf8',
      title: `${emptyJobs.length} job${emptyJobs.length > 1 ? 's' : ''} have no applicants yet`,
      subtitle: `Try promoting or reviewing the description`,
      action: 'View jobs',
      onClick: () => onNavigate('/employer/jobs'),
    });
  }

  if (items.length === 0) {
    return (
      <section className="emp-action-items emp-action-items-empty">
        <div className="emp-action-header">
          <span className="emp-action-emoji">✨</span>
          <h3>All caught up</h3>
        </div>
        <p className="emp-action-empty-text">
          Nothing needs your attention — take a break!
        </p>
      </section>
    );
  }

  return (
    <section className="emp-action-items">
      <div className="emp-action-header">
        <span className="emp-action-emoji">🔔</span>
        <h3>Today's Tasks ({items.length})</h3>
      </div>

      <div className="emp-action-list">
        {items.map((item, i) => (
          <div className="emp-action-card" key={i}>
            <div
              className="emp-action-dot"
              style={{ background: item.color, boxShadow: `0 0 12px ${item.color}` }}
            />
            <div className="emp-action-content">
              <h4>{item.title}</h4>
              <p>{item.subtitle}</p>
            </div>
            <button className="emp-action-cta" onClick={item.onClick}>
              {item.action} →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// POST JOB MODAL
// ============================================

function PostJobModal({ user, onClose, onPosted }) {
  const [form, setForm] = useState({
    job_title: '',
    location: '',
    employment_type: 'Full-time',
    experience_level: 'Mid',
    salary_min: '',
    salary_max: '',
    skills_required: '',
    tools_preferred: '',
    company_size: '',
    about_role: '',
    responsibilities: '',
    requirements: '',
    // ⭐ ไม่มี company_name / industry — backend ดึงจาก profile
  });
  const [submitting, setSubmitting] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);

  // ⭐ โหลด company profile มาแสดง readonly
  useEffect(() => {
    apiClient.get('/api/employer/profile')
      .then((r) => setCompanyProfile(r.data?.profile || null))
      .catch(() => setCompanyProfile(null));
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await createEmployerJob(form);
      toast.success(`${result.message || 'Job posted successfully'} (ID: ${result.job_id})`);
      onPosted();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="job-edit-modal-overlay" onClick={onClose}>
      <div className="job-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="job-edit-modal-header">
          <h2>
            <Plus size={18} />
            Post a New Job
          </h2>
          <button className="job-edit-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="job-edit-modal-body">
            <div className="form-grid">
              <div className="form-field form-field-full">
                <label className="form-field-label">
                  Position <span className="required">*</span>
                </label>
                <select
                  value={form.job_title}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  required
                >
                  <option value="">Select Position</option>
                  {JOB_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* ⭐ Company — readonly จาก profile */}
              <div className="form-field">
                <label className="form-field-label">
                  Company <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={companyProfile?.company_name || '(loading...)'}
                  readOnly
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              {/* ⭐ Industry — readonly จาก profile */}
              <div className="form-field">
                <label className="form-field-label">Industry</label>
                <input
                  type="text"
                  value={companyProfile?.industry || '—'}
                  readOnly
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-field">
                <label className="form-field-label">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Bangkok"
                />
              </div>

              <div className="form-field">
                <label className="form-field-label">Employment Type</label>
                <select
                  value={form.employment_type}
                  onChange={(e) => handleChange('employment_type', e.target.value)}
                >
                  {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label className="form-field-label">Experience Level</label>
                <select
                  value={form.experience_level}
                  onChange={(e) => handleChange('experience_level', e.target.value)}
                >
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label className="form-field-label">Salary Min (USD)</label>
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => handleChange('salary_min', e.target.value)}
                  placeholder="50000"
                />
              </div>

              <div className="form-field">
                <label className="form-field-label">Salary Max (USD)</label>
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => handleChange('salary_max', e.target.value)}
                  placeholder="100000"
                />
              </div>

              <div className="form-field">
                <label className="form-field-label">Company Size</label>
                <input
                  type="text"
                  value={form.company_size}
                  onChange={(e) => handleChange('company_size', e.target.value)}
                  placeholder="50-100"
                />
              </div>

              <div className="form-field form-field-full">
                <label className="form-field-label">Skills Required</label>
                <input
                  type="text"
                  value={form.skills_required}
                  onChange={(e) => handleChange('skills_required', e.target.value)}
                  placeholder="Python, SQL, React"
                />
              </div>

              <div className="form-field form-field-full">
                <label className="form-field-label">Tools Preferred</label>
                <input
                  type="text"
                  value={form.tools_preferred}
                  onChange={(e) => handleChange('tools_preferred', e.target.value)}
                  placeholder="Docker, Git"
                />
              </div>

              <div className="form-field form-field-full">
                <label className="form-field-label">About the Role</label>
                <textarea
                  rows={3}
                  value={form.about_role}
                  onChange={(e) => handleChange('about_role', e.target.value)}
                  placeholder="Describe the role..."
                />
              </div>

              <div className="form-field form-field-full">
                <label className="form-field-label">Responsibilities</label>
                <textarea
                  rows={3}
                  value={form.responsibilities}
                  onChange={(e) => handleChange('responsibilities', e.target.value)}
                  placeholder="What will they do?"
                />
              </div>

              <div className="form-field form-field-full">
                <label className="form-field-label">Requirements</label>
                <textarea
                  rows={3}
                  value={form.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="What do they need?"
                />
              </div>
            </div>
          </div>

          <div className="job-edit-modal-footer">
            <button
              type="button"
              className="job-edit-btn job-edit-btn-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="job-edit-btn job-edit-btn-save"
              disabled={submitting}
            >
              {submitting ? 'Publishing...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EmployerDashboard() {
  usePageTitle("Employer Dashboard", { description: "Manage your job postings" });

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    jobs,
    applications,
    loading,
    reload,
    totalApplicants,
    activeJobs,
    jobsWithApplicants,
    respondedCount,
    responseRate,
  } = useEmployerData();

  const [showPostForm, setShowPostForm] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      logout();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="employer-container">
        <EmployerHero
          tag="EMPLOYER DASHBOARD"
          tagIcon={Sparkles}
          title="Welcome back"
          subtitle="Manage your job postings and applicants"
        />
        <PageLoader message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="employer-container">
      <EmployerHero
        tag="EMPLOYER DASHBOARD"
        tagIcon={Sparkles}
        title={<>Welcome back, <span>{user?.name || user?.full_name || 'Recruiter'}</span></>}
        subtitle={
          <>
            {user?.company || 'Your Company'}
            {user?.industry && ` · ${user.industry}`}
          </>
        }
        subtitleIcon={Building2}
        actions={
          <>
            <button
              className="emp-btn-primary"
              onClick={() => setShowPostForm(true)}
            >
              <Plus size={16} />
              Post New Job
            </button>

            <button className="emp-btn-glass" onClick={handleLogout}>
              <LogOut size={16} />
              Log out
            </button>
          </>
        }
      />

      <ActionItems
        applications={applications}
        jobs={jobs}
        onNavigate={navigate}
      />

      <section className="emp-stats-grid">
        <EmployerStat
          icon={Briefcase}
          label="Active Postings"
          value={activeJobs}
          detail={`${jobs.length} total`}
        />
        <EmployerStat
          icon={Users}
          label="Total Applicants"
          value={totalApplicants}
          detail={`across ${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}`}
        />
        <EmployerStat
          icon={TrendingUp}
          label="Jobs with Applicants"
          value={jobsWithApplicants}
          detail={
            jobs.length > 0
              ? `${Math.round((jobsWithApplicants / jobs.length) * 100)}% conversion`
              : 'No jobs yet'
          }
        />
        <EmployerStat
          icon={CheckCircle}
          label="Response Rate"
          value={`${responseRate}%`}
          detail={`${respondedCount} of ${totalApplicants} replied`}
          color="success"
        />
      </section>

      {/* ⭐ Grid: Jobs + Calendar */}
      <div className="employer-dashboard-grid">
        <section className="emp-section">
          <div className="emp-section-header">
            <h2>
              <Briefcase size={18} />
              Your Job Postings ({jobs.length})
            </h2>
            {jobs.length > 5 && (
              <button
                className="emp-btn-glass emp-btn-sm"
                onClick={() => navigate('/employer/jobs')}
              >
                View All ({jobs.length})
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs posted yet"
              description='Click "Post New Job" to create your first listing'
              actionLabel="Post a Job"
              onAction={() => setShowPostForm(true)}
            />
          ) : (
            <div className="emp-job-list">
              {jobs.slice(0, 5).map((job) => (
                <div className="emp-job-card" key={job.id}>
                  <div className={`emp-job-logo ${getJobLogoClass(job.job_title)}`}>
                    {job.job_title?.charAt(0) || 'J'}
                  </div>

                  <div className="emp-job-info">
                    <h3>{job.job_title}</h3>
                    <div className="emp-job-meta">
                      <span>
                        <MapPin size={12} />
                        {job.location || 'N/A'}
                      </span>
                      <span>
                        <Briefcase size={12} />
                        {job.employment_type}
                      </span>
                      <span>
                        <Users size={12} />
                        {job.applicant_count} applicant
                        {job.applicant_count !== 1 ? 's' : ''}
                      </span>
                      <span>
                        <Calendar size={12} />
                        {timeAgo(job.posted_date)}
                      </span>
                    </div>
                  </div>

                  <div className="emp-job-actions">
                    <button
                      className="emp-action-btn emp-action-view"
                      onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                    >
                      <Users size={14} />
                      View ({job.applicant_count})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ⭐ Calendar */}
        <EmployerCalendar applications={applications} jobs={jobs} />
      </div>

      {showPostForm && (
        <PostJobModal
          user={user}
          onClose={() => setShowPostForm(false)}
          onPosted={reload}
        />
      )}
    </div>
  );
}
