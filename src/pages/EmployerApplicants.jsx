import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Wrench,
  XCircle,
  Zap,
  ArrowRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import EmptyState from "../components/EmptyState";
import { toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import PageLoader from '../components/PageLoader';
import { EmployerHero } from '../components/employer';
import useEmployerData from '../hooks/useEmployerData';
import { fetchApplicationSnapshot, updateApplicationStatus } from '../utils/api';
import { formatPhone } from '../utils/phone';

// ============================================
// CONFIG
// ============================================

const STATUS_CONFIG = {
  all:       { icon: Users,         label: 'Total',     color: '#f0d154' },
  applied:   { icon: Clock,         label: 'Applied',   color: '#38bdf8' },
  reviewing: { icon: MessageSquare, label: 'Reviewing', color: '#f472b6' },
  interview: { icon: CheckCircle,   label: 'Interview', color: '#34d399' },
  rejected:  { icon: XCircle,       label: 'Rejected',  color: '#94a3b8' },
};

const getStatusColor = (status) => {
  switch (status) {
    case 'applied':   return { bg: 'rgba(56, 189, 248, 0.15)',   border: 'rgba(56, 189, 248, 0.5)',   color: '#38bdf8' };
    case 'reviewing': return { bg: 'rgba(244, 114, 182, 0.15)',  border: 'rgba(244, 114, 182, 0.5)',  color: '#f472b6' };
    case 'interview': return { bg: 'rgba(52, 211, 153, 0.15)',   border: 'rgba(52, 211, 153, 0.5)',   color: '#34d399' };
    case 'rejected':  return { bg: 'rgba(148, 163, 184, 0.15)',  border: 'rgba(148, 163, 184, 0.5)',  color: '#94a3b8' };
    default:          return { bg: 'rgba(255, 255, 255, 0.05)',  border: 'rgba(255, 255, 255, 0.15)', color: '#d3dae4' };
  }
};

// ============================================
// MINI BAR CHART (SVG-based, lightweight)
// ============================================

function MiniBarChart({ data = [], height = 48 }) {
  if (!data.length) {
    return (
      <div className="mini-chart-empty" style={{ height }}>
        <span>No data</span>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="mini-chart-wrap" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="mini-chart-svg"
      >
        {data.map((d, i) => {
          const h = (d.count / max) * (height - 8);
          const x = i * barWidth + barWidth * 0.15;
          const w = barWidth * 0.7;
          const y = height - h - 4;
          const isToday = i === data.length - 1;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={Math.max(h, 2)}
              rx={1}
              fill={isToday ? '#f0d154' : 'rgba(240, 209, 84, 0.4)'}
              className="mini-chart-bar"
            />
          );
        })}
      </svg>
    </div>
  );
}

// ============================================
// MAIN
// ============================================

export default function EmployerApplicants() {
  usePageTitle("Applicants", { description: "Review job applicants" });

  const navigate = useNavigate();
  const { applications: all, jobs = [], loading } = useEmployerData();

  const [searchParams, setSearchParams] = useSearchParams();
  const jobFilter = searchParams.get('job');
  const statusFilterFromUrl = searchParams.get('status');   // ⭐ NEW

  const [filter, setFilter] = useState(
    statusFilterFromUrl && STATUS_CONFIG[statusFilterFromUrl]
      ? statusFilterFromUrl
      : 'all'
  );

  const [selectedApp, setSelectedApp] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeApplicantName, setResumeApplicantName] = useState('');

  // Interview picker state
  const [interviewDraft, setInterviewDraft] = useState('');

  // Sync filter with URL
  useEffect(() => {
    if (statusFilterFromUrl && STATUS_CONFIG[statusFilterFromUrl]) {
      setFilter(statusFilterFromUrl);
    }
  }, [statusFilterFromUrl]);

  // Reset interview draft when opening new applicant
  useEffect(() => {
    if (snapshot?.application) {
      setInterviewDraft(
        snapshot.application.interview_date
          ? snapshot.application.interview_date.slice(0, 16)
          : ''
      );
    } else {
      setInterviewDraft('');
    }
  }, [snapshot?.application?.id]);

  // Filter change → sync URL
  const handleFilterChange = (key) => {
    setFilter(key);
    const params = new URLSearchParams(searchParams);
    if (key === 'all') params.delete('status');
    else params.set('status', key);
    setSearchParams(params);
  };

  const handleViewDetail = async (app) => {
    console.log('🔍 [1] View clicked, app:', app);
    setSelectedApp(app);
    console.log('🔍 [2] selectedApp set');
    setSnapshotLoading(true);
    setSnapshot(null);
    try {
      console.log('🔍 [3] Fetching snapshot for app id:', app.id);
      const data = await fetchApplicationSnapshot(app.id);
      console.log('🔍 [4] Snapshot received:', data);
      console.log('🔍 [5] Match object:', data?.match);
      setSnapshot(data);
    } catch (err) {
      console.error('🔍 [ERROR]', err);
      console.error('🔍 [ERROR] message:', err?.message);
      console.error('🔍 [ERROR] response:', err?.response?.data);
      toast.error(err.message || 'Failed to load applicant details');
      // ⭐ Don't close modal — keep it open to show error
      // setSelectedApp(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus, interviewDate = null) => {
    setUpdating(true);
    try {
      await updateApplicationStatus(applicationId, newStatus, interviewDate);

      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      if (snapshot?.application?.id === applicationId) {
        setSnapshot((prev) => ({
          ...prev,
          application: {
            ...prev.application,
            status: newStatus,
            interview_date:
              interviewDate ||
              (newStatus === 'interview' ? prev.application.interview_date : null),
          },
        }));
      }
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Save interview date
  const handleSaveInterview = async () => {
    if (!snapshot?.application?.id) return;
    if (!interviewDraft) {
      toast.error('Please pick a date & time');
      return;
    }
    await handleStatusChange(snapshot.application.id, 'interview', interviewDraft);
  };

  const handleViewResume = (url, applicantName = '') => {
    if (!url) {
      toast.error('No resume available for this applicant');
      return;
    }
    setResumeUrl(url);
    setResumeApplicantName(applicantName);
    setShowResumeModal(true);
  };

  // ═══════ FILTER ═══════
  const filtered =
    filter === 'all'
      ? (jobFilter ? all.filter((a) => String(a.job_id) === String(jobFilter)) : all)
      : (jobFilter
          ? all.filter((a) => String(a.job_id) === String(jobFilter) && a.status === filter)
          : all.filter((a) => a.status === filter));

  const activeJob = jobFilter ? jobs.find((j) => String(j.id) === String(jobFilter)) : null;
  const baseSet = jobFilter ? all.filter((a) => String(a.job_id) === String(jobFilter)) : all;

  const counts = {
    all: baseSet.length,
    applied: baseSet.filter((a) => a.status === 'applied').length,
    reviewing: baseSet.filter((a) => a.status === 'reviewing').length,
    interview: baseSet.filter((a) => a.status === 'interview').length,
    rejected: baseSet.filter((a) => a.status === 'rejected').length,
  };

  // ═══════ ANALYTICS — Last 7 days ═══════
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map((date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const count = baseSet.filter((a) => {
      if (!a.applied_date) return false;
      const d = new Date(a.applied_date);
      return d >= date && d < nextDay;
    }).length;
    return {
      date,
      count,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
    };
  });

  const thisWeekTotal = chartData.reduce((sum, d) => sum + d.count, 0);

  // Last week for comparison
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 13);
  const lastWeekEnd = new Date(today);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 6);

  const lastWeekTotal = baseSet.filter((a) => {
    if (!a.applied_date) return false;
    const d = new Date(a.applied_date);
    return d >= lastWeekStart && d < lastWeekEnd;
  }).length;

  const trendPct =
    lastWeekTotal > 0
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : thisWeekTotal > 0
        ? 100
        : 0;

  const trendUp = trendPct >= 0;

  // ═══════ RESPONSE RATE ═══════
  const responded = baseSet.filter(
    (a) => a.status === 'reviewing' || a.status === 'interview'
  ).length;
  const responseRate = baseSet.length > 0 ? Math.round((responded / baseSet.length) * 100) : 0;

  // Avg response time (days between applied and updated for responded)
  const respondedApps = baseSet.filter(
    (a) => a.applied_date && a.updated_at && a.status !== 'applied'
  );
  const avgDays =
    respondedApps.length > 0
      ? (
          respondedApps.reduce((sum, a) => {
            const applied = new Date(a.applied_date);
            const updated = new Date(a.updated_at);
            return sum + Math.max(0, (updated - applied) / (1000 * 60 * 60 * 24));
          }, 0) / respondedApps.length
        ).toFixed(1)
      : null;

  return (
    <div className="employer-container employer-applicants-page">
      <EmployerHero
        tag={activeJob ? 'FILTERED VIEW' : 'APPLICANTS'}
        tagIcon={Users}
        title={activeJob ? activeJob.job_title : 'Applicants'}
        subtitle={
          activeJob
            ? `${baseSet.length} applicant${baseSet.length !== 1 ? 's' : ''} for this job`
            : `${all.length} total ${all.length === 1 ? 'application' : 'applications'}`
        }
        actions={
          activeJob && (
            <button className="emp-btn-glass" onClick={() => setSearchParams({})}>
              ← Back to all
            </button>
          )
        }
      />

      {/* ═══════ TWO-COLUMN LAYOUT ═══════ */}
      <div className="applicants-layout">
        {/* ═══ MAIN (Left) ═══ */}
        <div className="applicants-main">
          <div className="applicants-toolbar">
            <h2 className="applicants-toolbar-title">
              {filter === 'all' ? 'All Applicants' : STATUS_CONFIG[filter].label}
              <span className="applicants-toolbar-count">{filtered.length}</span>
            </h2>

            {jobs.length > 0 && (
              <select
                className="applicants-job-select"
                value={jobFilter || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) setSearchParams({ job: val });
                  else setSearchParams({});
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
            <PageLoader message="Loading applicants..." />
          ) : filtered.length === 0 ? (
            <div className="applicants-empty-card">
              <EmptyState
                icon={Users}
                title={
                  activeJob
                    ? `No applicants for ${activeJob.job_title}`
                    : filter === 'all'
                      ? 'No applicants yet'
                      : `No ${STATUS_CONFIG[filter].label.toLowerCase()} applicants`
                }
                description={
                  activeJob
                    ? 'Try a different status filter or view all applicants'
                    : filter === 'all'
                      ? "When candidates apply, they'll appear here"
                      : 'Try a different status filter'
                }
                actionLabel={activeJob ? 'View all' : 'Post a Job'}
                onAction={
                  activeJob
                    ? () => setSearchParams({})
                    : () => navigate('/employer/dashboard')
                }
              />
            </div>
          ) : (
            <div className="emp-job-list">
              {filtered.map((app) => (
                <div className="emp-job-card" key={app.id}>
                  <div className={`emp-job-logo ${getJobLogoClass(app.job_title)}`}>
                    {app.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="emp-job-info">
                    <h3>{app.full_name}</h3>
                    <div className="emp-job-meta">
                      <span><Mail size={12} />{app.email}</span>
                      <span><MapPin size={12} />{app.location || 'N/A'}</span>
                      <span><Briefcase size={12} />{app.job_title}</span>
                    </div>
                    {(() => {
                      const stages = ['applied', 'reviewing', 'interview'];
                      const currIdx = stages.indexOf(app.status);
                      const isRejected = app.status === 'rejected';
                      return (
                        <>
                          <div className="app-progress-track">
                            {stages.map((stage, idx) => {
                              const done = currIdx >= 0 && idx <= currIdx;
                              return (
                                <div
                                  key={stage}
                                  className={`app-progress-node ${done ? 'done' : ''}`}
                                  style={{
                                    background: done ? '#34d399' : 'transparent',
                                    borderColor: done ? '#34d399' : 'rgba(255,255,255,0.15)',
                                  }}
                                />
                              );
                            })}
                            <div
                              className={`app-progress-node ${isRejected ? 'rejected' : ''}`}
                              style={{
                                background: isRejected ? '#ef4444' : 'transparent',
                                borderColor: isRejected ? '#ef4444' : 'rgba(255,255,255,0.15)',
                              }}
                            />
                          </div>
                          <div className="app-progress-labels">
                            <span>Applied</span>
                            <span>Review</span>
                            <span>Interview</span>
                            <span>{isRejected ? 'Rejected' : 'Done'}</span>
                          </div>
                        </>
                      );
                    })()}
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
                      View
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
        </div>

        {/* ═══ SIDEBAR (Right) ═══ */}
        <aside className="applicants-sidebar">
          {/* Filter by Status */}
          <div className="applicants-sidebar-card">
            <h3 className="applicants-sidebar-title">
              <BarChart3 size={14} />
              Filter by Status
            </h3>
            <div className="applicants-status-list">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isActive = filter === key;
                return (
                  <button
                    key={key}
                    className={`applicants-status-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleFilterChange(key)}
                    style={{ '--status-color': cfg.color }}
                  >
                    <span className="applicants-status-icon">
                      <Icon size={14} />
                    </span>
                    <span className="applicants-status-label">{cfg.label}</span>
                    <span className="applicants-status-count">{counts[key]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analytics */}
          <div className="applicants-sidebar-card">
            <h3 className="applicants-sidebar-title">
              <TrendingUp size={14} />
              This Week
            </h3>

            <div className="applicants-trend">
              <div className="applicants-trend-value">
                +{thisWeekTotal}
                <span className="applicants-trend-unit">application{thisWeekTotal !== 1 ? 's' : ''}</span>
              </div>

              <div className={`applicants-trend-badge ${trendUp ? 'up' : 'down'}`}>
                {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(trendPct)}% from last week
              </div>
            </div>

            <MiniBarChart data={chartData} height={48} />

            <div className="applicants-chart-labels">
              {chartData.map((d, i) => (
                <span key={i} className={i === chartData.length - 1 ? 'today' : ''}>
                  {d.label}
                </span>
              ))}
            </div>

            <div className="applicants-sidebar-divider" />

            <div className="applicants-stat-row">
              <div className="applicants-stat">
                <Zap size={12} className="applicants-stat-icon" />
                <span className="applicants-stat-label">Response</span>
                <span className="applicants-stat-value">{responseRate}%</span>
              </div>
              {avgDays !== null && (
                <div className="applicants-stat">
                  <Clock size={12} className="applicants-stat-icon" />
                  <span className="applicants-stat-label">Avg reply</span>
                  <span className="applicants-stat-value">{avgDays}d</span>
                </div>
              )}
            </div>

            <button
              className="applicants-sidebar-cta"
              onClick={() => navigate('/employer/analytics')}
            >
              View full analytics
              <ArrowRight size={12} />
            </button>
          </div>
        </aside>
      </div>

      {/* ═══════ DETAIL MODAL ═══════ */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedApp.full_name}</h2>
                <p className="modal-subtitle">{selectedApp.email}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>×</button>
            </div>

            {snapshotLoading ? (
              <p className="modal-loading">Loading snapshot...</p>
            ) : !snapshot ? (
              <div className="modal-loading" style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: '#fca5a5', marginBottom: 12 }}>Failed to load applicant details</p>
                <p style={{ fontSize: 12, color: '#8c9bae' }}>Check browser console (F12) for details</p>
              </div>
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
                      <span className="modal-value">{snapshot.application.phone ? formatPhone(snapshot.application.phone) : '-'}</span>
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

                {/* ⭐ MATCH SCORE */}
                {snapshot.match && (
                  <section className="modal-section">
                    <h3><Target size={16} /> Match Score</h3>

                    <div
                      className="match-score-card"
                      style={{
                        '--match-glow-color':
                          snapshot.match.overall >= 75 ? 'rgba(128, 255, 213, 0.5)' :
                          snapshot.match.overall >= 50 ? 'rgba(240, 209, 84, 0.5)' :
                          'rgba(252, 165, 165, 0.5)',
                      }}
                    >
                      {/* Overall */}
                      <div className="match-score-overall">
                        <div className="match-score-circle">
                          <svg viewBox="0 0 100 100" className="match-score-ring">
                            <circle
                              cx="50" cy="50" r="42"
                              fill="none"
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50" cy="50" r="42"
                              fill="none"
                              stroke={
                                snapshot.match.overall >= 75 ? '#80ffd5' :
                                snapshot.match.overall >= 50 ? '#f0d154' :
                                '#fca5a5'
                              }
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={`${snapshot.match.overall * 2.64} ${264 - snapshot.match.overall * 2.64}`}
                              transform="rotate(-90 50 50)"
                              style={{
                                filter: `drop-shadow(0 0 6px ${
                                  snapshot.match.overall >= 75 ? 'rgba(128, 255, 213, 0.5)' :
                                  snapshot.match.overall >= 50 ? 'rgba(240, 209, 84, 0.5)' :
                                  'rgba(252, 165, 165, 0.5)'
                                })`,
                              }}
                            />
                          </svg>
                          <div className="match-score-circle-text">
                            <span className="match-score-number">{snapshot.match.overall}%</span>
                            <span className="match-score-sublabel">Match</span>
                          </div>
                        </div>

                        <div className="match-score-summary">
                          <h4>
                            {snapshot.match.overall >= 75 ? 'Excellent fit' :
                             snapshot.match.overall >= 50 ? 'Good fit' :
                             'Low fit'}
                          </h4>
                          <p>
                            {snapshot.match.matched_skills?.length || 0} of {
                              (snapshot.match.matched_skills?.length || 0) + (snapshot.match.missing_skills?.length || 0)
                            } required skills matched
                          </p>
                        </div>
                      </div>

                      {/* Breakdown bars */}
                      <p className="match-breakdown-title">Breakdown</p>
                      <div className="match-breakdown">
                        <div className="match-bar-row">
                          <span className="match-bar-label">Skills</span>
                          <div className="match-bar-track">
                            <div
                              className="match-bar-fill skills"
                              style={{ width: `${snapshot.match.skills_match}%` }}
                            />
                          </div>
                          <span className="match-bar-value">{snapshot.match.skills_match}%</span>
                        </div>

                        <div className="match-bar-row">
                          <span className="match-bar-label">Experience</span>
                          <div className="match-bar-track">
                            <div
                              className="match-bar-fill experience"
                              style={{ width: `${snapshot.match.experience_match}%` }}
                            />
                          </div>
                          <span className="match-bar-value">{snapshot.match.experience_match}%</span>
                        </div>

                        <div className="match-bar-row">
                          <span className="match-bar-label">Industry</span>
                          <div className="match-bar-track">
                            <div
                              className="match-bar-fill industry"
                              style={{ width: `${snapshot.match.industry_match}%` }}
                            />
                          </div>
                          <span className="match-bar-value">{snapshot.match.industry_match}%</span>
                        </div>
                      </div>

                      {/* Matched skills */}
                      {snapshot.match.matched_skills?.length > 0 && (
                        <div className="match-skills-section">
                          <span className="match-skills-label matched">
                            ✓ Matched Skills ({snapshot.match.matched_skills.length})
                          </span>
                          <div className="match-skills-tags">
                            {snapshot.match.matched_skills.map((s, i) => (
                              <span key={i} className="match-skill-tag matched">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing skills */}
                      {snapshot.match.missing_skills?.length > 0 && (
                        <div className="match-skills-section">
                          <span className="match-skills-label missing">
                            ✗ Missing Skills ({snapshot.match.missing_skills.length})
                          </span>
                          <div className="match-skills-tags">
                            {snapshot.match.missing_skills.map((s, i) => (
                              <span key={i} className="match-skill-tag missing">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weights info */}
                      <div className="match-weights-info">
                        {snapshot.application.experience_level && (
                          <span>
                            Weighted for <strong>{snapshot.application.experience_level}</strong> level
                          </span>
                        )}
                      </div>
                    </div>
                  </section>
                )}

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
                              {exp.start_date || '?'} — {exp.is_current ? 'Present' : exp.end_date || '?'}
                            </p>
                            {exp.description && <p className="timeline-desc">{exp.description}</p>}
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
                              {edu.start_date || '?'} — {edu.is_current ? 'Present' : edu.end_date || '?'}
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

                  {/* ⭐ Interview Date Picker */}
                  {snapshot.application.status === 'interview' && (
                    <div style={{ marginTop: 16 }}>
                      <label className="modal-label">
                        <CalendarIcon size={12} /> Interview Date & Time
                      </label>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input
                          type="datetime-local"
                          value={interviewDraft}
                          onChange={(e) => setInterviewDraft(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff',
                            fontSize: '0.82rem',
                          }}
                        />
                        <button
                          onClick={handleSaveInterview}
                          disabled={updating}
                          style={{
                            padding: '10px 18px',
                            borderRadius: 10,
                            background: 'rgba(52,211,153,0.15)',
                            border: '1px solid rgba(52,211,153,0.5)',
                            color: '#34d399',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ═══════ RESUME MODAL ═══════ */}
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
