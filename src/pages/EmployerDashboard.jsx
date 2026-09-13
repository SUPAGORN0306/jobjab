import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployerJobs, createEmployerJob } from '../api';
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
} from 'lucide-react';

// ============================================
// JOB LOGO CLASS (ตาม Home)
// ============================================

const getJobLogoClass = (title) => {
  switch (title) {
    case "AI Product Manager": return "logo-ai-product-manager";
    case "AI Researcher": return "logo-ai-researcher";
    case "Computer Vision Engineer": return "logo-computer-vision";
    case "Data Analyst": return "logo-data-analyst";
    case "Data Scientist": return "logo-data-scientist";
    case "ML Engineer": return "logo-ml-engineer";
    case "NLP Engineer": return "logo-nlp-engineer";
    case "Quant Researcher": return "logo-quant-researcher";
    default: return "bg-blue-500";
  }
};

const JOB_TITLES = [
  'AI Product Manager',
  'AI Researcher',
  'Computer Vision Engineer',
  'Data Analyst',
  'Data Scientist',
  'ML Engineer',
  'NLP Engineer',
  'Quant Researcher',
];

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    job_title: '',
    company_name: user?.company || '',
    location: '',
    employment_type: 'Full-time',
    experience_level: 'Mid',
    salary_min: '',
    salary_max: '',
    skills_required: '',
    tools_preferred: '',
    industry: user?.industry || '',
    company_size: '',
    about_role: '',
    responsibilities: '',
    requirements: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEmployerJobs();
        setJobs(data.jobs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await createEmployerJob(form);
      alert(`${result.message}\nJob ID: ${result.job_id}`);

      setForm({
        job_title: '',
        company_name: user?.company || '',
        location: '',
        employment_type: 'Full-time',
        experience_level: 'Mid',
        salary_min: '',
        salary_max: '',
        skills_required: '',
        tools_preferred: '',
        industry: user?.industry || '',
        company_size: '',
        about_role: '',
        responsibilities: '',
        requirements: '',
      });
      setShowPostForm(false);

      const data = await fetchEmployerJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      logout();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="employer-container">
        <p className="employer-loading">Loading dashboard...</p>
      </div>
    );
  }

  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (j.applicant_count || 0),
    0
  );

  const jobsWithApplicants = jobs.filter(
    (j) => (j.applicant_count || 0) > 0
  ).length;

  const activeJobs = jobs.filter((j) => j.status === 'Active').length;

  return (
    <div className="employer-container">
      <section className="employer-hero">
        <div className="employer-hero-content">
          <span className="employer-hero-tag">
            <Sparkles size={14} />
            EMPLOYER DASHBOARD
          </span>
          <h1>
            Welcome back, <span>{user?.name || 'Recruiter'}</span>
          </h1>
          <p className="employer-hero-subtitle">
            <Building2 size={14} />
            {user?.company || 'Your Company'}
            {user?.industry && ` · ${user.industry}`}
          </p>

          <div className="employer-hero-actions">
            <button
              className="employer-hero-btn primary"
              onClick={() => setShowPostForm(true)}
            >
              <Plus size={16} />
              Post New Job
            </button>

            <button
              className="employer-hero-btn secondary"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </section>

      {error && <div className="employer-error">{error}</div>}

      <section className="employer-stats-grid">
        <div className="employer-stat-card">
          <div className="stat-icon">
            <Briefcase size={20} />
          </div>
          <div className="stat-content">
            <h3>Active Postings</h3>
            <p>{jobs.length}</p>
            <span className="stat-detail">{activeJobs} active</span>
          </div>
        </div>

        <div className="employer-stat-card">
          <div className="stat-icon">
            <Users size={20} />
          </div>
          <div className="stat-content">
            <h3>Total Applicants</h3>
            <p>{totalApplicants}</p>
            <span className="stat-detail">
              across {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
            </span>
          </div>
        </div>

        <div className="employer-stat-card">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <h3>Jobs with Applicants</h3>
            <p>{jobsWithApplicants}</p>
            <span className="stat-detail">
              {jobs.length > 0
                ? `${Math.round((jobsWithApplicants / jobs.length) * 100)}% conversion`
                : 'No jobs yet'}
            </span>
          </div>
        </div>

        <div className="employer-stat-card">
          <div className="stat-icon">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <h3>Status</h3>
            <p>Active</p>
            <span className="stat-detail">Account is active</span>
          </div>
        </div>
      </section>

      {showPostForm && (
        <section className="employer-section">
          <div className="section-header-row">
            <h2>
              <Plus size={18} />
              Post a New Job
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="job-post-form">
            <div className="job-form-grid">
              <select
                className="field-input"
                required
                value={form.job_title}
                onChange={(e) => handleChange('job_title', e.target.value)}
              >
                <option value="">-- Select Position --</option>
                {JOB_TITLES.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Company Name *"
                required
                value={form.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className="field-input"
              />

              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="field-input"
              />

              <select
                value={form.employment_type}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                className="field-input"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>

              <select
                value={form.experience_level}
                onChange={(e) => handleChange('experience_level', e.target.value)}
                className="field-input"
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>

              <input
                type="number"
                placeholder="Salary Min (USD)"
                value={form.salary_min}
                onChange={(e) => handleChange('salary_min', e.target.value)}
                className="field-input"
              />

              <input
                type="number"
                placeholder="Salary Max (USD)"
                value={form.salary_max}
                onChange={(e) => handleChange('salary_max', e.target.value)}
                className="field-input"
              />

              <input
                type="text"
                placeholder="Industry"
                value={form.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="field-input"
              />

              <input
                type="text"
                placeholder="Skills Required (comma separated)"
                value={form.skills_required}
                onChange={(e) => handleChange('skills_required', e.target.value)}
                className="field-input field-full-width"
              />

              <input
                type="text"
                placeholder="Tools Preferred"
                value={form.tools_preferred}
                onChange={(e) => handleChange('tools_preferred', e.target.value)}
                className="field-input field-full-width"
              />

              <textarea
                placeholder="About the role"
                rows={3}
                value={form.about_role}
                onChange={(e) => handleChange('about_role', e.target.value)}
                className="field-input field-full-width"
              />

              <textarea
                placeholder="Responsibilities"
                rows={3}
                value={form.responsibilities}
                onChange={(e) => handleChange('responsibilities', e.target.value)}
                className="field-input field-full-width"
              />

              <textarea
                placeholder="Requirements"
                rows={3}
                value={form.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                className="field-input field-full-width"
              />
            </div>

            <div className="job-form-actions">
              <button
                type="button"
                className="cancel-job-btn"
                onClick={() => setShowPostForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="publish-job-btn"
                disabled={submitting}
              >
                {submitting ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="employer-section">
        <div className="section-header-row">
          <h2>
            <Briefcase size={18} />
            Your Job Postings ({jobs.length})
          </h2>
          {!showPostForm && (
            <button
              className="post-job-btn"
              onClick={() => setShowPostForm(true)}
            >
              <Plus size={14} />
              Post a New Job
            </button>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="empty-jobs">
            <div className="empty-jobs-icon">
              <Briefcase size={40} />
            </div>
            <p className="empty-jobs-title">No jobs posted yet</p>
            <p className="empty-jobs-sub">
              Click "Post a New Job" to create your first listing
            </p>
          </div>
        ) : (
          <div className="job-list-grid">
            {jobs.map((job) => (
              <div className="job-post-card" key={job.id}>
                <div className={`job-post-logo ${getJobLogoClass(job.job_title)}`}>
                  {job.job_title?.charAt(0) || 'J'}
                </div>
                <div className="job-info">
                  <h3>{job.job_title}</h3>
                  <div className="job-meta">
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
                      {job.posted_date
                        ? new Date(job.posted_date).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="job-post-actions">
                  <button
                    className="view-applicants-btn"
                    onClick={() =>
                      navigate(`/employer/jobs/${job.id}/applicants`)
                    }
                  >
                    <Users size={14} />
                    View Applicants ({job.applicant_count})
                  </button>
                  <span className="job-status-badge">{job.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="employer-cta">
        <div className="employer-cta-content">
          <h2>Ready to hire your next team member?</h2>
          <p>
            Post a job and reach thousands of qualified candidates on JOBJAB.
          </p>
          <button
            className="employer-cta-btn"
            onClick={() => setShowPostForm(true)}
          >
            <Plus size={16} />
            Post a New Job
          </button>
        </div>
      </section>
    </div>
  );
}