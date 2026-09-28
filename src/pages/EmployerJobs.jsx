import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchEmployerJobs,
  deleteEmployerJob,
  updateJobStatus,
  updateEmployerJob,
} from '../api';
import {
  Briefcase,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Pause,
  Play,
  Eye,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import EmptyState from "../components/EmptyState";
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import { JobListSkeleton } from '../components/EmployerSkeleton';
import { EmployerHero } from '../components/employer';

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
// EDIT MODAL
// ============================================

function EditJobModal({ job, onClose, onSaved }) {
  const [form, setForm] = useState({
    job_title: job.job_title || '',
    company_name: job.company_name || '',
    location: job.location || '',
    employment_type: job.employment_type || 'Full-time',
    experience_level: job.experience_level || 'Mid',
    salary_min: job.salary_min || '',
    salary_max: job.salary_max || '',
    skills_required: job.skills_required || '',
    tools_preferred: job.tools_preferred || '',
    industry: job.industry || '',
    company_size: job.company_size || '',
    about_role: job.about_role || '',
    responsibilities: job.responsibilities || '',
    requirements: job.requirements || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEmployerJob(job.id, form);
      toast.success('Job updated successfully');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="job-edit-modal-overlay" onClick={onClose}>
      <div className="job-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="job-edit-modal-header">
          <h2>
            <Pencil size={18} />
            Edit Job
          </h2>
          <button className="job-edit-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="job-edit-modal-body">
          <div className="form-grid">
            <div className="form-field form-field-full">
              <label className="form-field-label">Position *</label>
              <select value={form.job_title} onChange={(e) => handleChange('job_title', e.target.value)}>
                <option value="">Select Position</option>
                {JOB_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label className="form-field-label">Company Name *</label>
              <input type="text" value={form.company_name} onChange={(e) => handleChange('company_name', e.target.value)} placeholder="Acme Inc." />
            </div>

            <div className="form-field">
              <label className="form-field-label">Location</label>
              <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Bangkok" />
            </div>

            <div className="form-field">
              <label className="form-field-label">Employment Type</label>
              <select value={form.employment_type} onChange={(e) => handleChange('employment_type', e.target.value)}>
                {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label className="form-field-label">Experience Level</label>
              <select value={form.experience_level} onChange={(e) => handleChange('experience_level', e.target.value)}>
                {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label className="form-field-label">Salary Min (USD)</label>
              <input type="number" value={form.salary_min} onChange={(e) => handleChange('salary_min', e.target.value)} placeholder="50000" />
            </div>

            <div className="form-field">
              <label className="form-field-label">Salary Max (USD)</label>
              <input type="number" value={form.salary_max} onChange={(e) => handleChange('salary_max', e.target.value)} placeholder="100000" />
            </div>

            <div className="form-field">
              <label className="form-field-label">Industry</label>
              <select value={form.industry} onChange={(e) => handleChange('industry', e.target.value)}>
                <option value="">-- Select --</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label className="form-field-label">Company Size</label>
              <input type="text" value={form.company_size} onChange={(e) => handleChange('company_size', e.target.value)} placeholder="50-100" />
            </div>

            <div className="form-field form-field-full">
              <label className="form-field-label">Skills Required (comma separated)</label>
              <input type="text" value={form.skills_required} onChange={(e) => handleChange('skills_required', e.target.value)} placeholder="Python, SQL" />
            </div>

            <div className="form-field form-field-full">
              <label className="form-field-label">Tools Preferred</label>
              <input type="text" value={form.tools_preferred} onChange={(e) => handleChange('tools_preferred', e.target.value)} placeholder="Docker, Git" />
            </div>

            <div className="form-field form-field-full">
              <label className="form-field-label">About the Role</label>
              <textarea rows={3} value={form.about_role} onChange={(e) => handleChange('about_role', e.target.value)} />
            </div>

            <div className="form-field form-field-full">
              <label className="form-field-label">Responsibilities</label>
              <textarea rows={3} value={form.responsibilities} onChange={(e) => handleChange('responsibilities', e.target.value)} />
            </div>

            <div className="form-field form-field-full">
              <label className="form-field-label">Requirements</label>
              <textarea rows={3} value={form.requirements} onChange={(e) => handleChange('requirements', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="job-edit-modal-footer">
          <button className="job-edit-btn job-edit-btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="job-edit-btn job-edit-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EmployerJobs() {
  usePageTitle("My Jobs", { description: "Your posted jobs" });

  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingJob, setEditingJob] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const loadJobs = () => {
    setLoading(true);
    fetchEmployerJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    const currentStatus = job.status_key || 'active';
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';

    setActionLoading(job.id);
    try {
      await updateJobStatus(job.id, newStatus);
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadJobs();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.job_title}"?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoading(job.id);
    try {
      await deleteEmployerJob(job.id);
      toast.success('Job deleted');
      loadJobs();
    } catch (err) {
      toast.error(err.message || 'Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered =
    filter === 'all'
      ? jobs
      : jobs.filter((j) => {
          const status = j.status_key || 'active';
          if (filter === 'active') return status === 'active';
          if (filter === 'paused') return status === 'paused';
          return true;
        });

  const counts = {
    all: jobs.length,
    active: jobs.filter((j) => (j.status_key || 'active') === 'active').length,
    paused: jobs.filter((j) => j.status_key === 'paused').length,
  };

  if (loading) {
    return (
      <div className="employer-container">
        <EmployerHero
          tag="MY JOBS"
          tagIcon={Briefcase}
          title="All Job Postings"
          subtitle="Loading jobs..."
        />

        <section className="emp-section">
          <div className="emp-section-header">
            <h2>
              <Briefcase size={18} />
              Job List
            </h2>
          </div>
          <JobListSkeleton count={4} />
        </section>
      </div>
    );
  }

  return (
    <div className="employer-container">
      <EmployerHero
        tag="MY JOBS"
        tagIcon={Briefcase}
        title="All Job Postings"
        subtitle={`${jobs.length} total ${jobs.length === 1 ? 'job' : 'jobs'}`}
        actions={
          <button className="emp-btn-primary" onClick={() => navigate('/employer/dashboard')}>
            <Plus size={16} />
            Post New Job
          </button>
        }
      />

      <section className="emp-section">
        <div className="emp-section-header">
          <h2>
            <Briefcase size={18} />
            Job List ({filtered.length})
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'all', label: `All (${counts.all})` },
              { key: 'active', label: `Active (${counts.active})` },
              { key: 'paused', label: `Paused (${counts.paused})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`emp-filter-btn ${filter === f.key ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Post your first job to find the right candidates"
            actionLabel="Post a Job"
            onAction={() => navigate('/employer/dashboard')}
          />
        ) : (
          <div className="emp-job-list">
            {filtered.map((job) => {
              const statusKey = job.status_key || 'active';
              const isPaused = statusKey === 'paused';
              const isProcessing = actionLoading === job.id;

              return (
                <div className="emp-job-card" key={job.id}>
                  <div className={`emp-job-logo ${getJobLogoClass(job.job_title)}`}>
                    {job.job_title?.charAt(0) || 'J'}
                  </div>

                  <div className="emp-job-info">
                    <div className="emp-job-title-row">
                      <h3>{job.job_title}</h3>
                      <span className={`emp-job-status-badge ${isPaused ? 'paused' : 'active'}`}>
                        {isPaused ? 'Paused' : 'Active'}
                      </span>
                    </div>
                    <div className="emp-job-meta">
                      <span><MapPin size={12} />{job.location || 'N/A'}</span>
                      <span><Briefcase size={12} />{job.employment_type}</span>
                      <span><Users size={12} />{job.applicant_count} applicant{job.applicant_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="emp-job-actions">
                    <button
                      className="emp-action-btn emp-action-view"
                      onClick={() => navigate(`/employer/jobs/${job.id}/applicants`)}
                      disabled={isProcessing}
                    >
                      <Eye size={14} />
                      View
                    </button>

                    <button
                      className="emp-action-btn emp-action-edit"
                      onClick={() => setEditingJob(job)}
                      disabled={isProcessing}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      className="emp-action-btn emp-action-status"
                      onClick={() => handleToggleStatus(job)}
                      disabled={isProcessing}
                    >
                      {isPaused ? <Play size={14} /> : <Pause size={14} />}
                      {isPaused ? 'Activate' : 'Pause'}
                    </button>

                    <button
                      className="emp-action-btn emp-action-delete"
                      onClick={() => handleDelete(job)}
                      disabled={isProcessing}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSaved={loadJobs}
        />
      )}
    </div>
  );
}
