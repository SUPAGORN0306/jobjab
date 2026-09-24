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
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  FileText,
  Search,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';

// ============================================
// TIME AGO HELPER
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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ============================================
// JOB LOGO CLASS
// ============================================


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

const INDUSTRIES = [
  'Tech',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'E-commerce',
  'Automotive',
];

export default function EmployerDashboard() {
  usePageTitle("Employer Dashboard", { description: "Manage your job postings" });

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
      toast.success(`${result.message || 'Job posted successfully'} (Job ID: ${result.job_id})`);

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
      {/* ============ HERO ============ */}
      <section className="emp-hero">
        <div className="emp-hero-content">
          <span className="emp-hero-tag">
            <Sparkles size={14} />
            EMPLOYER DASHBOARD
          </span>
          <h1>
            Welcome back, <span>{user?.name || 'Recruiter'}</span>
          </h1>
          <p className="emp-hero-subtitle">
            <Building2 size={14} />
            {user?.company || 'Your Company'}
            {user?.industry && ` · ${user.industry}`}
          </p>

          <div className="emp-hero-actions">
            <button
              className="emp-btn-primary"
              onClick={() => setShowPostForm(true)}
            >
              <Plus size={16} />
              Post New Job
            </button>

            <button
              className="emp-btn-glass"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </section>

      {error && <div className="emp-error">{error}</div>}

      {/* ============ STATS ============ */}
      <section className="emp-stats-grid">
        <div className="emp-stat-card">
          <div className="emp-stat-icon">
            <Briefcase size={22} />
          </div>
          <div className="emp-stat-content">
            <span className="emp-stat-label">Active Postings</span>
            <span className="emp-stat-value">{jobs.length}</span>
            <span className="emp-stat-detail">{activeJobs} active</span>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon">
            <Users size={22} />
          </div>
          <div className="emp-stat-content">
            <span className="emp-stat-label">Total Applicants</span>
            <span className="emp-stat-value">{totalApplicants}</span>
            <span className="emp-stat-detail">
              across {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
            </span>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon">
            <TrendingUp size={22} />
          </div>
          <div className="emp-stat-content">
            <span className="emp-stat-label">Jobs with Applicants</span>
            <span className="emp-stat-value">{jobsWithApplicants}</span>
            <span className="emp-stat-detail">
              {jobs.length > 0
                ? `${Math.round((jobsWithApplicants / jobs.length) * 100)}% conversion`
                : 'No jobs yet'}
            </span>
          </div>
        </div>

        <div className="emp-stat-card">
          <div className="emp-stat-icon emp-stat-icon-success">
            <CheckCircle size={22} />
          </div>
          <div className="emp-stat-content">
            <span className="emp-stat-label">Status</span>
            <span className="emp-stat-value-success">Active</span>
            <span className="emp-stat-detail">Account is active</span>
          </div>
        </div>
      </section>

      {/* ============ POST FORM ============ */}
      {showPostForm && (
        <section className="emp-section emp-section-form">
          <div className="emp-section-header">
            <h2>
              <Plus size={18} />
              Post a New Job
            </h2>
            <button
              className="emp-btn-glass"
              onClick={() => setShowPostForm(false)}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="emp-form">
            <div className="emp-form-grid">
              <select
                className="emp-field"
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
                className="emp-field"
              />

              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="emp-field"
              />

              <select
                value={form.employment_type}
                onChange={(e) => handleChange('employment_type', e.target.value)}
                className="emp-field"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>

              <select
                value={form.experience_level}
                onChange={(e) => handleChange('experience_level', e.target.value)}
                className="emp-field"
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>

              <input
                type="number"
                placeholder="Salary Min (USD)"
                value={form.salary_min}
                onChange={(e) => handleChange('salary_min', e.target.value)}
                className="emp-field"
              />

              <input
                type="number"
                placeholder="Salary Max (USD)"
                value={form.salary_max}
                onChange={(e) => handleChange('salary_max', e.target.value)}
                className="emp-field"
              />

              <select
                value={form.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="emp-field"
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Skills Required (comma separated)"
                value={form.skills_required}
                onChange={(e) => handleChange('skills_required', e.target.value)}
                className="emp-field emp-field-full"
              />

              <input
                type="text"
                placeholder="Tools Preferred"
                value={form.tools_preferred}
                onChange={(e) => handleChange('tools_preferred', e.target.value)}
                className="emp-field emp-field-full"
              />

              <textarea
                placeholder="About the role"
                rows={3}
                value={form.about_role}
                onChange={(e) => handleChange('about_role', e.target.value)}
                className="emp-field emp-field-full"
              />

              <textarea
                placeholder="Responsibilities"
                rows={3}
                value={form.responsibilities}
                onChange={(e) => handleChange('responsibilities', e.target.value)}
                className="emp-field emp-field-full"
              />

              <textarea
                placeholder="Requirements"
                rows={3}
                value={form.requirements}
                onChange={(e) => handleChange('requirements', e.target.value)}
                className="emp-field emp-field-full"
              />
            </div>

            <div className="emp-form-actions">
            <button
              className="emp-btn-glass"
              onClick={() => setShowPostForm(false)}
            >
              Cancel
            </button>
              <button
                type="submit"
                className="emp-btn-primary emp-btn-full"
                disabled={submitting}
              >
                {submitting ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ============ JOB LIST ============ */}
      <section className="emp-section">
        <div className="emp-section-header">
          <h2>
            <Briefcase size={18} />
            Your Job Postings ({jobs.length})
          </h2>
          {!showPostForm && (
            <button
              className="emp-btn-glass emp-btn-sm"
              onClick={() => setShowPostForm(true)}
            >
              <Plus size={14} />
              Post New Job
            </button>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="emp-empty">
            <div className="emp-empty-icon">
              <Briefcase size={40} />
            </div>
            <p className="emp-empty-title">No jobs posted yet</p>
            <p className="emp-empty-sub">
              Click "Post New Job" to create your first listing
            </p>
          </div>
        ) : (
          <div className="emp-job-list">
            {jobs.map((job) => (
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
                    className="emp-btn-glass emp-btn-sm"
                    onClick={() =>
                      navigate(`/employer/jobs/${job.id}/applicants`)
                    }
                  >
                    <Users size={14} />
                    View Applicants ({job.applicant_count})
                  </button>
                  <span className="emp-badge-active">{job.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ LANDING 1: WHY JOBJAB ============ */}
      <section className="emp-landing">
        <div className="emp-landing-grid">
          <div className="emp-landing-image">
            <img src="/employer.jpg" alt="Hire talent" />
            <div className="emp-landing-badge">For Employers</div>
          </div>

          <div className="emp-landing-content">
            <span className="emp-landing-tag">
              <Target size={14} />
              WHY JOBJAB
            </span>
            <h2>Find the right talent, faster</h2>
            <p className="emp-landing-desc">
              Our AI-powered match score helps you find candidates who truly fit your
              requirements — no more screening hundreds of unqualified resumes.
            </p>

            <div className="emp-landing-features">
              <div className="emp-landing-feature">
                <div className="emp-landing-icon">
                  <Target size={20} />
                </div>
                <div>
                  <h4>Smart match score</h4>
                  <p>AI ranks candidates by skills, experience, and industry fit.</p>
                </div>
              </div>
              <div className="emp-landing-feature">
                <div className="emp-landing-icon">
                  <Zap size={20} />
                </div>
                <div>
                  <h4>Real-time applications</h4>
                  <p>Get notified instantly when new candidates apply.</p>
                </div>
              </div>
              <div className="emp-landing-feature">
                <div className="emp-landing-icon">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4>Track pipeline</h4>
                  <p>Move candidates from applied to interview to hired.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LANDING 2: HOW IT WORKS ============ */}
      <section className="emp-landing emp-landing-reverse">
        <div className="emp-landing-grid">
          <div className="emp-landing-content">
            <span className="emp-landing-tag">
              <Sparkles size={14} />
              HOW IT WORKS
            </span>
            <h2>Post a job in 3 simple steps</h2>
            <p className="emp-landing-desc">
              From posting to hiring — we make the process effortless. Post jobs,
              review applicants, and build your dream team.
            </p>

            <div className="emp-landing-steps">
              <div className="emp-landing-step">
                <span className="emp-step-number">01</span>
                <div>
                  <h4>Post your job</h4>
                  <p>Fill in the details — title, skills, salary, and requirements.</p>
                </div>
              </div>
              <div className="emp-landing-step">
                <span className="emp-step-number">02</span>
                <div>
                  <h4>Review applicants</h4>
                  <p>See candidates ranked by match score for your job.</p>
                </div>
              </div>
              <div className="emp-landing-step">
                <span className="emp-step-number">03</span>
                <div>
                  <h4>Hire the best fit</h4>
                  <p>Schedule interviews and track candidates through your pipeline.</p>
                </div>
              </div>
            </div>

            <button
              className="emp-btn-primary"
              onClick={() => setShowPostForm(true)}
            >
              <Plus size={16} />
              Post a Job
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="emp-landing-image">
            <img src="/job-seeker.jpg" alt="How it works" />
            <div className="emp-landing-badge">How It Works</div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="emp-cta">
        <div className="emp-cta-content">
          <h2>Ready to hire your next team member?</h2>
          <p>
            Post a job and reach thousands of qualified candidates on JOBJAB.
          </p>
          <button
            className="emp-btn-primary"
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