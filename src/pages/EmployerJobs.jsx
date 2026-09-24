import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployerJobs } from '../api';
import { Briefcase, MapPin, Users, ArrowRight } from 'lucide-react';
import EmptyState from "../components/EmptyState";
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
// ============================================
// JOB LOGO CLASS
// ============================================


export default function EmployerJobs() {
  usePageTitle("My Jobs", { description: "Your posted jobs" });

  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEmployerJobs()
      .then((data) => setJobs(data.jobs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="employer-container">
        <p className="employer-loading">Loading jobs...</p>
      </div>
    );
  }

  const filtered =
    filter === 'all'
      ? jobs
      : jobs.filter((j) => j.status?.toLowerCase() === filter);

  return (
    <div className="employer-container">
      <section className="emp-hero">
        <div className="emp-hero-content">
          <span className="emp-hero-tag">
            <Briefcase size={14} />
            MY JOBS
          </span>
          <h1>All Job Postings</h1>
          <p className="emp-hero-subtitle">
            {jobs.length} total {jobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>
      </section>

      <section className="emp-section">
        <div className="emp-section-header">
          <h2>
            <Briefcase size={18} />
            Job List ({filtered.length})
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'active'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="emp-btn-glass emp-btn-sm"
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
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="ยังไม่มีงานที่ประกาศ"
            description="เริ่มประกาศงานแรกของคุณ เพื่อหาผู้สมัครที่ใช่"
          />
        ) : (
          <div className="job-list-grid">
            {filtered.map((job) => (
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
                    View ({job.applicant_count})
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