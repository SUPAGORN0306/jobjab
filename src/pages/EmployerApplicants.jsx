import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployerJobs } from '../api';
import {
  Users,
  Mail,
  MapPin,
  Inbox,
  Briefcase,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { API_BASE } from '../utils/apiUrl';

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

// ============================================
// STATUS COLOR MAP
// ============================================

const getStatusColor = (status) => {
  switch (status) {
    case 'applied':
      return {
        bg: 'rgba(56, 189, 248, 0.15)',
        border: 'rgba(56, 189, 248, 0.5)',
        color: '#38bdf8',
        bgActive: 'rgba(56, 189, 248, 0.25)',
      };
    case 'reviewing':
      return {
        bg: 'rgba(240, 209, 84, 0.12)',
        border: 'rgba(240, 209, 84, 0.45)',
        color: '#f0d154',
        bgActive: 'rgba(240, 209, 84, 0.25)',
      };
    case 'interview':
      return {
        bg: 'rgba(128, 255, 213, 0.12)',
        border: 'rgba(128, 255, 213, 0.45)',
        color: '#80ffd5',
        bgActive: 'rgba(128, 255, 213, 0.25)',
      };
    case 'rejected':
      return {
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.45)',
        color: '#fca5a5',
        bgActive: 'rgba(239, 68, 68, 0.22)',
      };
    default:
      return {
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.15)',
        color: '#d3dae4',
        bgActive: 'rgba(255, 255, 255, 0.12)',
      };
  }
};

export default function EmployerApplicants() {
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
            const res = await fetch(
              `${API_BASE}/employer/jobs/${job.id}/applications`
            );
            const data = await res.json();
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

  if (loading) {
    return (
      <div className="employer-container">
        <p className="employer-loading">Loading applicants...</p>
      </div>
    );
  }

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
        <div className="emp-section-header">
          <h2>
            <Users size={18} />
            Filter by Status
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          {['all', 'applied', 'reviewing', 'interview', 'rejected'].map((f) => {
            const colors = getStatusColor(f);
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="emp-filter-chip"
                style={{
                  background: isActive ? colors.bgActive : colors.bg,
                  borderColor: isActive ? colors.color : colors.border,
                  color: colors.color,
                  boxShadow: isActive ? `0 4px 12px ${colors.bgActive}` : 'none',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="emp-empty">
            <div className="emp-empty-icon">
              <Inbox size={40} />
            </div>
            <p className="emp-empty-title">No applicants</p>
          </div>
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
                    <span>
                      <Mail size={12} />
                      {app.email}
                    </span>
                    <span>
                      <MapPin size={12} />
                      {app.location || 'N/A'}
                    </span>
                    <span>
                      <Briefcase size={12} />
                      {app.job_title}
                    </span>
                  </div>
                </div>
                <div className="emp-job-actions">
                  <span className="emp-badge-active">{app.status}</span>

                  <button
                    className="emp-btn-glass emp-btn-sm"
                    onClick={() =>
                      navigate(`/employer/jobs/${app.job_id}/applicants`)
                    }
                    title="View full profile"
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