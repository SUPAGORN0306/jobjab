import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployerJobs, fetchJobApplications } from '../api';
import {
  Users,
  Mail,
  MapPin,
  Briefcase,
  Eye,
  ArrowRight,
  CheckCircle,
  Clock,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import EmptyState from "../components/EmptyState";
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import { ApplicantListSkeleton } from '../components/EmployerSkeleton';

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG = {
  all:       { icon: Users,        label: 'Total',     color: '#f0d154' },
  applied:   { icon: Clock,        label: 'Applied',   color: '#38bdf8' },
  reviewing: { icon: MessageSquare, label: 'Reviewing', color: '#f0d154' },
  interview: { icon: CheckCircle,  label: 'Interview', color: '#80ffd5' },
  rejected:  { icon: XCircle,      label: 'Rejected',  color: '#fca5a5' },
};

const getStatusColor = (status) => {
  switch (status) {
    case 'applied':
      return { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.5)', color: '#38bdf8' };
    case 'reviewing':
      return { bg: 'rgba(240, 209, 84, 0.12)', border: 'rgba(240, 209, 84, 0.45)', color: '#f0d154' };
    case 'interview':
      return { bg: 'rgba(128, 255, 213, 0.12)', border: 'rgba(128, 255, 213, 0.45)', color: '#80ffd5' };
    case 'rejected':
      return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.45)', color: '#fca5a5' };
    default:
      return { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.15)', color: '#d3dae4' };
  }
};

export default function EmployerApplicants() {
  usePageTitle("Applicants", { description: "Review job applicants" });

  const navigate = useNavigate();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const jobsData = await fetchEmployerJobs();
        const jobs = jobsData.jobs || [];

        const promises = jobs.map(async (job) => {
          try {
            const data = await fetchJobApplications(job.id);
            return (data.applications || []).map((a) => ({
              ...a,
              job_title: job.job_title,
              job_id: job.id,
            }));
          } catch {
            return [];
          }
        });

        const results = await Promise.all(promises);
        setAll(results.flat());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered =
    filter === 'all' ? all : all.filter((a) => a.status === filter);

  const counts = {
    all: all.length,
    applied: all.filter((a) => a.status === 'applied').length,
    reviewing: all.filter((a) => a.status === 'reviewing').length,
    interview: all.filter((a) => a.status === 'interview').length,
    rejected: all.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="employer-container">
      <section className="emp-hero">
        <div className="emp-hero-content">
          <span className="emp-hero-tag">
            <Users size={14} />
            ALL APPLICANTS
          </span>
          <h1>Applicants Overview</h1>
          <p className="emp-hero-subtitle">
            {all.length} total {all.length === 1 ? 'application' : 'applications'}
          </p>
        </div>
      </section>

      <section className="emp-section">
        {/* Stat Cards */}
        <div className="emp-stat-row">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = filter === key;
            return (
              <div
                key={key}
                className={`emp-stat-pill ${key} ${isActive ? 'active' : ''}`}
                onClick={() => setFilter(key)}
                style={isActive ? { borderColor: cfg.color, background: `${cfg.color}15` } : {}}
              >
                <div className="emp-stat-pill-icon">
                  <Icon size={20} />
                </div>
                <div className="emp-stat-pill-content">
                  <span className="emp-stat-pill-value">{counts[key]}</span>
                  <span className="emp-stat-pill-label">{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div className="emp-section-header" style={{ marginTop: 24 }}>
          <h2>
            <Users size={18} />
            {filter === 'all' ? 'All Applicants' : STATUS_CONFIG[filter].label} ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <ApplicantListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={filter === 'all' ? "No applicants yet" : `No ${STATUS_CONFIG[filter].label.toLowerCase()} applicants`}
            description={
              filter === 'all'
                ? "When candidates apply to your jobs, they will appear here"
                : "Try a different status filter"
            }
          />
        ) : (
          <div className="job-list-grid">
            {filtered.map((app) => (
              <div className="emp-job-card" key={app.id}>
                <div className={`emp-job-logo ${getJobLogoClass(app.job_title)}`}>
                  {app.job_title?.charAt(0) || 'J'}
                </div>
                <div className="emp-job-info">
                  <h3>{app.full_name}</h3>
                  <div className="emp-job-meta">
                    <span><Mail size={12} />{app.email}</span>
                    <span><MapPin size={12} />{app.location || 'N/A'}</span>
                    <span><Briefcase size={12} />{app.job_title}</span>
                  </div>
                </div>
                <div className="emp-job-actions">
                  <span className="emp-badge-active">{app.status}</span>
                  <button
                    className="emp-action-btn emp-action-view"
                    onClick={() => navigate(`/employer/jobs/${app.job_id}/applicants`)}
                  >
                    <Eye size={14} />
                    View
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
