import React, { useState, useEffect } from 'react';
import { fetchEmployerJobs } from '../api';
import { Users, Mail, MapPin, Inbox, Briefcase } from 'lucide-react';
import { API_BASE } from '../utils/apiUrl';

// ============================================
// JOB LOGO CLASS
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

export default function EmployerApplicants() {
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
      <section className="employer-hero">
        <div className="employer-hero-content">
          <span className="employer-hero-tag">
            <Users size={14} />
            ALL APPLICANTS
          </span>
          <h1>Applicants Overview</h1>
          <p className="employer-hero-subtitle">
            {all.length} total {all.length === 1 ? 'application' : 'applications'}
          </p>
        </div>
      </section>

      <section className="employer-section">
        <div className="section-header-row">
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
          {['all', 'applied', 'reviewing', 'interview', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="post-job-btn"
              style={{
                background:
                  filter === f ? 'rgba(240, 209, 84, 0.25)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#f0d154' : '#d8d8d8',
                border:
                  filter === f
                    ? '1px solid #f0d154'
                    : '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-jobs">
            <div className="empty-jobs-icon">
              <Inbox size={40} />
            </div>
            <p className="empty-jobs-title">No applicants</p>
          </div>
        ) : (
          <div className="job-list-grid">
            {filtered.map((app) => (
              <div className="job-post-card" key={app.id}>
                <div className={`job-post-logo ${getJobLogoClass(app.job_title)}`}>
                {app.job_title?.charAt(0) || 'J'}
                </div>
                    <div className="job-info">
                  <h3>{app.full_name}</h3>
                  <div className="job-meta">
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
                <div className="job-post-actions">
                  <span className="job-status-badge">{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}