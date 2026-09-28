import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Inbox,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';
import EmptyState from "../components/EmptyState";
import { toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import { ApplicantListSkeleton } from '../components/EmployerSkeleton';
import { EmployerHero, EmployerStat } from '../components/employer';
import useEmployerData from '../hooks/useEmployerData';

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG = {
  all:       { icon: Users,        label: 'Total',     color: '#f0d154' },
  applied:   { icon: Clock,        label: 'Applied',   color: '#38bdf8' },
  reviewing: { icon: MessageSquare, label: 'Reviewing', color: '#f472b6' },
  interview: { icon: CheckCircle,  label: 'Interview', color: '#34d399' },
  rejected:  { icon: XCircle,      label: 'Rejected',  color: '#94a3b8' },
};

const getStatusColor = (status) => {
  switch (status) {
    case 'applied':
      return { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.5)', color: '#38bdf8' };
    case 'reviewing':
      return { bg: 'rgba(244, 114, 182, 0.15)', border: 'rgba(244, 114, 182, 0.5)', color: '#f472b6' };
    case 'interview':
      return { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.5)', color: '#34d399' };
    case 'rejected':
      return { bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.5)', color: '#94a3b8' };
    default:
      return { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.15)', color: '#d3dae4' };
  }
};

export default function EmployerApplicants() {
  usePageTitle("Applicants", { description: "Review job applicants" });

  const navigate = useNavigate();
  const { applications: all, jobs = [], loading } = useEmployerData();
  const [filter, setFilter] = useState('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const jobFilter = searchParams.get('job'); // ?job=5

  // ⭐ Detail modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ⭐ Resume viewer state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeApplicantName, setResumeApplicantName] = useState('');

  // ⭐ Handle View Details
  const handleViewDetail = async (app) => {
    setSelectedApp(app);
    setSnapshotLoading(true);
    setSnapshot(null);
    try {
      const data = await fetchApplicationSnapshot(app.id);
      setSnapshot(data);
    } catch (err) {
      toast.error(err.message);
      setSelectedApp(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  // ⭐ Handle Status Change
  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdating(true);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      if (snapshot?.application?.id === applicationId) {
        setSnapshot((prev) => ({
          ...prev,
          application: { ...prev.application, status: newStatus },
        }));
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // ⭐ Handle Resume View
  const handleViewResume = (url, applicantName = '') => {
    if (!url) {
      toast.error('No resume available for this applicant');
      return;
    }
    setResumeUrl(url);
    setResumeApplicantName(applicantName);
    setShowResumeModal(true);
  };

  // ⭐ Filter by ?job= param first, then by status
  const filtered =
    filter === 'all'
      ? (jobFilter
          ? all.filter((a) => String(a.job_id) === String(jobFilter))
          : all)
      : (jobFilter
          ? all.filter((a) => String(a.job_id) === String(jobFilter) && a.status === filter)
          : all.filter((a) => a.status === filter));

  // ⭐ Job title for context
  const activeJob = jobFilter ? jobs.find((j) => String(j.id) === String(jobFilter)) : null;

  // ⭐ Base set — respect ?job= filter for counts too
  const baseSet = jobFilter
    ? all.filter((a) => String(a.job_id) === String(jobFilter))
    : all;

  const counts = {
    all: baseSet.length,
    applied: baseSet.filter((a) => a.status === 'applied').length,
    reviewing: baseSet.filter((a) => a.status === 'reviewing').length,
    interview: baseSet.filter((a) => a.status === 'interview').length,
    rejected: baseSet.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="employer-container">
      <EmployerHero
        tag={activeJob ? 'FILTERED VIEW' : 'ALL APPLICANTS'}
        tagIcon={Users}
        title={activeJob ? activeJob.job_title : 'Applicants Overview'}
        subtitle={
          activeJob
            ? `${baseSet.length} applicant${baseSet.length !== 1 ? 's' : ''} for this job`
            : `${all.length} total ${all.length === 1 ? 'application' : 'applications'}`
        }
        actions={
          activeJob && (
            <button
              className="emp-btn-glass"
              onClick={() => setSearchParams({})}
            >
              ← Back to all applicants
            </button>
          )
        }
      />

      <section className="emp-section">
        {/* Stat Cards */}
        <div className="emp-stat-row">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <EmployerStat
              key={key}
              variant="pill"
              icon={cfg.icon}
              label={cfg.label}
              value={counts[key]}
              color={key}
              active={filter === key}
              onClick={() => setFilter(key)}
            />
          ))}
        </div>

        {/* Job selector + List header */}
        <div className="emp-section-header" style={{ marginTop: 24 }}>
          <h2>
            <Users size={18} />
            {filter === 'all' ? 'All Applicants' : STATUS_CONFIG[filter].label} ({filtered.length})
          </h2>

          {jobs.length > 0 && (
            <select
              className="analytics-period-select"
              value={jobFilter || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setSearchParams({ job: val });
                } else {
                  setSearchParams({});
                }
              }}
            >
              <option value="">All Jobs ({all.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.job_title} ({j.applicant_count || 0})
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <ApplicantListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              activeJob
                ? `No applicants for ${activeJob.job_title}`
                : filter === 'all'
                  ? "No applicants yet"
                  : `No ${STATUS_CONFIG[filter].label.toLowerCase()} applicants`
            }
            description={
              activeJob
                ? "Try a different status filter or view all applicants"
                : filter === 'all'
                  ? "When candidates apply to your jobs, they will appear here"
                  : "Try a different status filter"
            }
            actionLabel={activeJob ? "View all applicants" : undefined}
            onAction={activeJob ? () => setSearchParams({}) : undefined}
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

                  {/* ⭐ Timeline Progress */}
                  <div className="app-progress-track">
                    {['applied', 'reviewing', 'interview', 'rejected'].map((step, i) => {
                      const statusOrder = ['applied', 'reviewing', 'interview', 'rejected'];
                      const currentIdx = statusOrder.indexOf(app.status);
                      const stepIdx = statusOrder.indexOf(step);
                      const isDone = currentIdx >= 0 && stepIdx <= currentIdx;
                      const isRejected = app.status === 'rejected';

                      return (
                        <div
                          key={step}
                          className={`app-progress-node ${isDone ? 'done' : ''} ${isRejected && isDone ? 'rejected' : ''}`}
                          style={{
                            background: isDone
                              ? isRejected
                                ? '#94a3b8'
                                : '#34d399'
                              : 'transparent',
                            borderColor: isDone
                              ? isRejected
                                ? '#94a3b8'
                                : '#34d399'
                              : 'rgba(255,255,255,0.15)',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="app-progress-labels">
                    <span>Applied</span>
                    <span>Review</span>
                    <span>Interview</span>
                    <span>Closed</span>
                  </div>
                </div>
                <div className="emp-job-actions">
                  <span
                    className="status-badge"
                    style={{
                      background: getStatusColor(app.status).bg,
                      color: getStatusColor(app.status).color,
                      borderColor: getStatusColor(app.status).border,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.68rem',
                      fontWeight: '600',
                      border: '1px solid',
                      textTransform: 'capitalize',
                    }}
                  >
                    {app.status}
                  </span>
                  <button
                    className="emp-action-btn emp-action-view"
                    onClick={() => handleViewDetail(app)}
                  >
                    <Eye size={14} />
                    View Details
                  </button>

                  <select
                    className="status-select"
                    value={app.status}
                    disabled={updating}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="applied">Applied</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interview">Interview</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══════ DETAIL MODAL ═══════ */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedApp.full_name}</h2>
                <p className="modal-subtitle">{selectedApp.email}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>
                ×
              </button>
            </div>

            {snapshotLoading ? (
              <p className="modal-loading">Loading snapshot...</p>
            ) : snapshot ? (
              <div className="modal-body">
                <section className="modal-section">
                  <h3><Mail size={16} /> Contact</h3>
                  <div className="modal-grid">
                    <div>
                      <span className="modal-label"><Mail size={12} /> Email</span>
                      <span className="modal-value">{snapshot.application.email}</span>
                    </div>
                    <div>
                      <span className="modal-label"><Phone size={12} /> Phone</span>
                      <span className="modal-value">{snapshot.application.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="modal-label"><MapPin size={12} /> Location</span>
                      <span className="modal-value">{snapshot.application.location || '-'}</span>
                    </div>
                    <div>
                      <span className="modal-label"><Briefcase size={12} /> Job</span>
                      <span className="modal-value">{selectedApp.job_title}</span>
                    </div>
                    <div className="modal-grid-full">
                      <span className="modal-label"><FileText size={12} /> Resume</span>
                      <span className="modal-value">
                        {(snapshot.application.resume_url || snapshot.application.user_resume_url) ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleViewResume(
                                snapshot.application.resume_url || snapshot.application.user_resume_url,
                                snapshot.application.full_name
                              )
                            }
                            className="resume-link"
                          >
                            <FileText size={14} />
                            {snapshot.application.resume_filename || 'View Resume'}
                          </button>
                        ) : (
                          <span style={{ color: '#8896a9' }}>No resume uploaded</span>
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                {snapshot.application.cover_letter && (
                  <section className="modal-section">
                    <h3><FileText size={16} /> Cover Letter</h3>
                    <p className="cover-letter">{snapshot.application.cover_letter}</p>
                  </section>
                )}

                {snapshot.skills?.length > 0 && (
                  <section className="modal-section">
                    <h3><Wrench size={16} /> Skills ({snapshot.skills.length})</h3>
                    <div className="skills-list">
                      {snapshot.skills.map((s, i) => (
                        <span className="skill-tag" key={i}>
                          {s.skill_name}
                          {s.skill_level && <span className="skill-level"> · {s.skill_level}</span>}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {snapshot.experiences?.length > 0 && (
                  <section className="modal-section">
                    <h3><Briefcase size={16} /> Experience ({snapshot.experiences.length})</h3>
                    <div className="timeline">
                      {snapshot.experiences.map((exp, i) => (
                        <div className="timeline-item" key={i}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <h4>{exp.job_title}</h4>
                            <p className="timeline-company">
                              {exp.company_name} · {exp.location || 'N/A'}
                            </p>
                            <p className="timeline-date">
                              {exp.start_date || '?'} —{' '}
                              {exp.is_current ? 'Present' : exp.end_date || '?'}
                            </p>
                            {exp.description && (
                              <p className="timeline-desc">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {snapshot.educations?.length > 0 && (
                  <section className="modal-section">
                    <h3><GraduationCap size={16} /> Education ({snapshot.educations.length})</h3>
                    <div className="timeline">
                      {snapshot.educations.map((edu, i) => (
                        <div className="timeline-item" key={i}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <h4>{edu.degree} — {edu.field_of_study}</h4>
                            <p className="timeline-company">{edu.institution}</p>
                            <p className="timeline-date">
                              {edu.start_date || '?'} —{' '}
                              {edu.is_current ? 'Present' : edu.end_date || '?'}
                              {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="modal-section">
                  <h3><BarChart3 size={16} /> Update Status</h3>
                  <div className="modal-status-row">
                    {['applied', 'reviewing', 'interview', 'rejected'].map((s) => {
                      const c = getStatusColor(s);
                      const isActive = snapshot.application.status === s;
                      return (
                        <button
                          key={s}
                          className="status-btn"
                          onClick={() => handleStatusChange(snapshot.application.id, s)}
                          disabled={updating}
                          style={{
                            background: isActive ? c.bg : 'rgba(255,255,255,0.05)',
                            color: isActive ? c.color : '#d8d8d8',
                            borderColor: isActive ? c.border : 'rgba(255,255,255,0.15)',
                          }}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ═══════ RESUME PREVIEW MODAL ═══════ */}
      {showResumeModal && resumeUrl && (
        <div
          className="modal-overlay"
          style={{ zIndex: 2000, background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setShowResumeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '900px',
              height: '90vh',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #eee',
              }}
            >
              <div>
                <strong style={{ fontSize: '16px', color: '#000' }}>Resume Preview</strong>
                {resumeApplicantName && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                    {resumeApplicantName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowResumeModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
              title="Resume Preview"
              style={{ flex: 1, width: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
