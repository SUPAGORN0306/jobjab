import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployerJobs, createEmployerJob, fetchJobApplications } from '../api';
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
import useCountUp from '../hooks/useCountUp';
import { getJobLogoClass } from '../utils/jobLogo';
import { StatsGridSkeleton, JobListSkeleton } from '../components/EmployerSkeleton';
import EmployerCalendar from '../components/EmployerCalendar';
import EmptyState from '../components/EmptyState';

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
// POST JOB MODAL
// ============================================

function PostJobModal({ user, onClose, onPosted }) {
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
  const [submitting, setSubmitting] = useState(false);

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

              <div className="form-field">
                <label className="form-field-label">
                  Company <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Acme Inc."
                  required
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
                <label className="form-field-label">Industry</label>
                <select
                  value={form.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                >
                  <option value="">Select</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
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
// STAT CARD (with count-up animation)
// ============================================

function StatCard({ icon: Icon, label, value, detail, variant = 'default', animate = false }) {
  const animated = useCountUp(animate ? Number(value) || 0 : 0, 800);
  const display = animate ? animated : value;
  const isSuccess = variant === 'success';

  return (
    <div className="emp-stat-card">
      <div className={`emp-stat-icon${isSuccess ? ' emp-stat-icon-success' : ''}`}>
        <Icon size={22} />
      </div>
      <div className="emp-stat-content">
        <span className="emp-stat-label">{label}</span>
        <span className={isSuccess ? 'emp-stat-value-success' : 'emp-stat-value'}>
          {display}
        </span>
        <span className="emp-stat-detail">{detail}</span>
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

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployerJobs();
      const jobsList = data.jobs || [];
      setJobs(jobsList);

      // ⭐ Fetch applications ของทุก job
      const appPromises = jobsList.map(async (job) => {
        try {
          const appData = await fetchJobApplications(job.id);
          return (appData.applications || []).map((a) => ({
            ...a,
            job_title: job.job_title,
            job_id: job.id,
          }));
        } catch {
          return [];
        }
      });

      const appResults = await Promise.all(appPromises);
      setApplications(appResults.flat());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Logout?')) {
      logout();
      navigate('/');
    }
  };

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0);
  const jobsWithApplicants = jobs.filter((j) => (j.applicant_count || 0) > 0).length;
  const activeJobs = jobs.filter((j) => (j.status_key || 'active') === 'active').length;

  if (loading) {
    return (
      <div className="employer-container">
        <section className="emp-hero">
          <div className="emp-hero-content">
            <span className="emp-hero-tag">
              <Sparkles size={14} />
              EMPLOYER DASHBOARD
            </span>
            <h1>Welcome back</h1>
            <p className="emp-hero-subtitle">Loading dashboard...</p>
          </div>
        </section>

        <StatsGridSkeleton count={4} />

        <section className="emp-section">
          <div className="emp-section-header">
            <h2>
              <Briefcase size={18} />
              Your Job Postings
            </h2>
          </div>
          <JobListSkeleton count={3} />
        </section>
      </div>
    );
  }

  return (
    <div className="employer-container">
      <section className="emp-hero">
        <div className="emp-hero-content">
          <span className="emp-hero-tag">
            <Sparkles size={14} />
            EMPLOYER DASHBOARD
          </span>
          <h1>
            Welcome back, <span>{user?.name || user?.full_name || 'Recruiter'}</span>
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

            <button className="emp-btn-glass" onClick={handleLogout}>
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </section>

      <section className="emp-stats-grid">
        <StatCard
          icon={Briefcase}
          label="Active Postings"
          value={jobs.length}
          detail={`${activeJobs} active`}
          animate
        />
        <StatCard
          icon={Users}
          label="Total Applicants"
          value={totalApplicants}
          detail={`across ${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'}`}
          animate
        />
        <StatCard
          icon={TrendingUp}
          label="Jobs with Applicants"
          value={jobsWithApplicants}
          detail={
            jobs.length > 0
              ? `${Math.round((jobsWithApplicants / jobs.length) * 100)}% conversion`
              : 'No jobs yet'
          }
          animate
        />
        <StatCard
          icon={CheckCircle}
          label="Status"
          value="Active"
          detail="Account is active"
          variant="success"
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

      <section className="emp-landing emp-landing-reverse">
        <div className="emp-landing-grid">
          <div className="emp-landing-content">
            <span className="emp-landing-tag">
              <Sparkles size={14} />
              HOW IT WORKS
            </span>
            <h2>Post a job in 3 simple steps</h2>
            <p className="emp-landing-desc">
              From posting to hiring — we make the process effortless.
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

      <section className="emp-cta">
        <div className="emp-cta-content">
          <h2>Ready to hire your next team member?</h2>
          <p>Post a job and reach thousands of qualified candidates on JOBJAB.</p>
          <button
            className="emp-btn-primary"
            onClick={() => setShowPostForm(true)}
          >
            <Plus size={16} />
            Post a New Job
          </button>
        </div>
      </section>

      {showPostForm && (
        <PostJobModal
          user={user}
          onClose={() => setShowPostForm(false)}
          onPosted={loadJobs}
        />
      )}
    </div>
  );
}
