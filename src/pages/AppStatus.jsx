import React, { useState, useEffect } from 'react';
import { fetchUserApplications, fetchApplicationDetail } from '../api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Briefcase,
  GraduationCap,
  Wrench,
  Mail,
  Phone,
  MapPin,
  FileText,
  X,
  Calendar as CalendarIcon,
} from 'lucide-react';
import '../styles/candidate/AppStatus.css';
import { toast } from 'sonner';

export default function AppStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter
  const [filterStatus, setFilterStatus] = useState('all');

  // Calendar
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  // Resume Viewer
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchUserApplications();
        setApplications(data.applications || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter
  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'applied') return app.status === 'applied';
    if (filterStatus === 'reviewing')
      return app.status === 'reviewing' || app.status === 'in_review';
    if (filterStatus === 'interview') return app.status === 'interview';
    if (filterStatus === 'closed')
      return app.status === 'rejected' || app.status === 'closed';
    return true;
  });

  // Stats
  const totalApplications = applications.length;
  const inReviewCount = applications.filter(
    (a) => a.status === 'reviewing' || a.status === 'in_review'
  ).length;
  const interviewCount = applications.filter((a) => a.status === 'interview').length;
  const respondedCount = applications.filter((a) => a.status !== 'applied').length;
  const responseRate =
    totalApplications > 0 ? Math.round((respondedCount / totalApplications) * 100) : 0;

  // Calendar events
  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    return applications.filter((app) => {
      const applied = app.applied_date ? new Date(app.applied_date).toDateString() : null;
      const updated = app.updated_at ? new Date(app.updated_at).toDateString() : null;
      return applied === dateStr || updated === dateStr;
    });
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    return (
      <div className="calendar-dots">
        {events.slice(0, 3).map((app, i) => {
          const color =
            app.status === 'interview'
              ? '#34d399'
              : app.status === 'reviewing' || app.status === 'in_review'
              ? '#f472b6'
              : app.status === 'rejected' || app.status === 'closed'
              ? '#94a3b8'
              : '#38bdf8';
          return <span key={i} className="calendar-dot" style={{ background: color }} />;
        })}
      </div>
    );
  };

  // Recent Activity
  const recentActivity = applications
    .slice()
    .sort((a, b) => {
      const da = new Date(a.updated_at || a.applied_date);
      const db = new Date(b.updated_at || b.applied_date);
      return db - da;
    })
    .slice(0, 5);

  // Format dates
  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatLongDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Status colors
  const statusColor = (status) => {
    switch (status) {
      case 'applied':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' };
      case 'reviewing':
      case 'in_review':
        return { bg: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', border: 'rgba(244, 114, 182, 0.4)' };
      case 'interview':
        return { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: 'rgba(52, 211, 153, 0.4)' };
      case 'rejected':
      case 'closed':
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' };
    }
  };

  // Progress
  const getProgress = (status) => {
    switch (status) {
      case 'applied':
        return 1;
      case 'reviewing':
      case 'in_review':
        return 2;
      case 'interview':
        return 3;
      case 'rejected':
      case 'closed':
        return 4;
      default:
        return 1;
    }
  };

  // Handlers
  const handleCardClick = async (app) => {
    setSelectedApp(app);
    setSnapshotLoading(true);
    setSnapshot(null);
    try {
      const data = await fetchApplicationDetail(app.id);
      setSnapshot(data);
    } catch (err) {
      toast.error(err.message);
      setSelectedApp(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleViewResume = (url) => {
    if (!url) return;
    setResumeUrl(url);
    setShowResumeModal(true);
  };

  // Loading
  if (loading) {
    return (
      <div className="status-container">
        <p className="status-loading">Loading your applications...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="status-container">
        <p className="status-error">Error: {error}</p>
      </div>
    );
  }

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="status-container">
      {/* Stats Row */}
      <div className="stats-row">
        <div
          className={`stat-block ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          <div className="stat-number total-app">{totalApplications}</div>
          <div className="stat-line" style={{ background: '#38bdf8' }} />
          <div className="stat-label">TOTAL</div>
          <div className="stat-sublabel">Applications</div>
        </div>

        <div
          className={`stat-block ${filterStatus === 'reviewing' ? 'active' : ''}`}
          onClick={() => setFilterStatus('reviewing')}
        >
          <div className="stat-number in-review-val">{inReviewCount}</div>
          <div className="stat-line" style={{ background: '#f472b6' }} />
          <div className="stat-label">IN REVIEW</div>
          <div className="stat-sublabel">Active</div>
        </div>

        <div
          className={`stat-block ${filterStatus === 'interview' ? 'active' : ''}`}
          onClick={() => setFilterStatus('interview')}
        >
          <div className="stat-number interview-val">{interviewCount}</div>
          <div className="stat-line" style={{ background: '#34d399' }} />
          <div className="stat-label">INTERVIEWS</div>
          <div className="stat-sublabel">Scheduled</div>
        </div>

        <div className="stat-block">
          <div className="stat-number response-val">{responseRate}%</div>
          <div className="stat-line" style={{ background: '#c084fc' }} />
          <div className="stat-label">RESPONSE RATE</div>
          <div className="stat-sublabel">Replies received</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* LEFT: Applications */}
        <div className="applications-column">
          <div className="section-header">
            <Briefcase size={14} />
            <span>Active Applications</span>
            <span className="section-count">{filteredApplications.length}</span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications found</p>
            </div>
          ) : (
            <div className="application-list">
              {filteredApplications.map((app) => {
                const progress = getProgress(app.status);
                const colors = statusColor(app.status);
                return (
                  <div
                    key={app.id}
                    className="application-item"
                    onClick={() => handleCardClick(app)}
                  >
                    <div className="app-item-header">
                      <div className="app-item-title-block">
                        <h3 className="app-item-title">
                          {app.job_title || 'Unknown Position'}
                        </h3>
                        <p className="app-item-company">
                          {app.company || 'Unknown Company'} · Applied{' '}
                          {formatShortDate(app.applied_date)}
                        </p>
                      </div>
                      <span
                        className="app-item-badge"
                        style={{
                          background: colors.bg,
                          color: colors.color,
                          borderColor: colors.border,
                        }}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="progress-track">
                      {[1, 2, 3, 4].map((step) => (
                        <React.Fragment key={step}>
                          <div
                            className={`progress-node ${progress >= step ? 'done' : ''}`}
                            style={{
                              background:
                                progress >= step ? colors.color : 'transparent',
                              borderColor:
                                progress >= step
                                  ? colors.color
                                  : 'rgba(255,255,255,0.15)',
                            }}
                          />
                          {step < 4 && (
                            <div
                              className={`progress-line ${progress > step ? 'done' : ''}`}
                              style={{
                                background:
                                  progress > step
                                    ? colors.color
                                    : 'rgba(255,255,255,0.1)',
                              }}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="progress-labels">
                      <span>Applied</span>
                      <span>Reviewing</span>
                      <span>Interview</span>
                      <span>Closed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Calendar */}
        <div className="calendar-column">
          <div className="section-header">
            <CalendarIcon size={14} />
            <span>Calendar</span>
          </div>

          <div className="calendar-card">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              locale="en-US"
            />
          </div>

          {/* Selected Day */}
          <div className="selected-day-card">
            <div className="selected-day-title">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            {selectedDateEvents.length === 0 ? (
              <p className="empty-events">No activity</p>
            ) : (
              <div className="event-list">
                {selectedDateEvents.map((app) => (
                  <div
                    key={app.id}
                    className="event-item"
                    onClick={() => handleCardClick(app)}
                  >
                    <span
                      className="event-dot"
                      style={{ background: statusColor(app.status).color }}
                    />
                    <div className="event-info">
                      <p className="event-status">{app.status}</p>
                      <p className="event-title">{app.job_title || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="section-header">
          <span>Recent Activity</span>
          <span className="section-count">{recentActivity.length}</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((app) => (
              <div
                key={app.id}
                className="activity-item"
                onClick={() => handleCardClick(app)}
              >
                <span
                  className="activity-dot"
                  style={{ background: statusColor(app.status).color }}
                />
                <div className="activity-info">
                  <p className="activity-text">
                    <span className="activity-status">{app.status}</span>
                    {' · '}
                    <span className="activity-title">{app.job_title}</span>
                    {' @ '}
                    <span className="activity-company">{app.company}</span>
                  </p>
                  <p className="activity-date">
                    {formatShortDate(app.updated_at || app.applied_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedApp.job_title || 'Unknown Position'}</h2>
                <p className="modal-subtitle">
                  {selectedApp.company || 'Unknown Company'}
                </p>
              </div>
              <button className="modal-close" onClick={() => setSelectedApp(null)}>
                <X size={18} />
              </button>
            </div>

            {snapshotLoading ? (
              <p className="modal-loading">Loading details...</p>
            ) : snapshot ? (
              <div className="modal-body">
                <section className="modal-section">
                  <div
                    className="status-badge-large"
                    style={{
                      background: statusColor(snapshot.application.status).bg,
                      color: statusColor(snapshot.application.status).color,
                      borderColor: statusColor(snapshot.application.status).border,
                    }}
                  >
                    {snapshot.application.status}
                  </div>
                  <p className="modal-date">
                    Applied on {formatLongDate(snapshot.application.applied_date)}
                  </p>
                </section>

                <section className="modal-section">
                  <h3>Contact</h3>
                  <div className="modal-grid">
                    <div>
                      <span className="modal-label">
                        <Mail size={12} /> Email
                      </span>
                      <span className="modal-value">{snapshot.application.email}</span>
                    </div>
                    <div>
                      <span className="modal-label">
                        <Phone size={12} /> Phone
                      </span>
                      <span className="modal-value">
                        {snapshot.application.phone || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="modal-label">
                        <MapPin size={12} /> Location
                      </span>
                      <span className="modal-value">
                        {snapshot.application.location || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="modal-label">
                        <FileText size={12} /> Resume
                      </span>
                      <span className="modal-value">
                        {snapshot.application.resume_url ||
                        snapshot.application.user_resume_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleViewResume(
                                snapshot.application.resume_url ||
                                  snapshot.application.user_resume_url
                              )
                            }
                            className="resume-link"
                          >
                            <FileText size={12} />
                            {snapshot.application.resume_filename || 'View Resume'}
                          </button>
                        ) : (
                          <span style={{ color: '#8896a9' }}>No resume</span>
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                {snapshot.application.cover_letter && (
                  <section className="modal-section">
                    <h3>Cover Letter</h3>
                    <p className="cover-letter">{snapshot.application.cover_letter}</p>
                  </section>
                )}

                {snapshot.skills?.length > 0 && (
                  <section className="modal-section">
                    <h3>Skills ({snapshot.skills.length})</h3>
                    <div className="skills-list">
                      {snapshot.skills.map((s, i) => (
                        <span className="skill-tag" key={i}>
                          {s.skill_name}
                          {s.skill_level && (
                            <span className="skill-level"> · {s.skill_level}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {snapshot.experiences?.length > 0 && (
                  <section className="modal-section">
                    <h3>Experience ({snapshot.experiences.length})</h3>
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
                    <h3>Education ({snapshot.educations.length})</h3>
                    <div className="timeline">
                      {snapshot.educations.map((edu, i) => (
                        <div className="timeline-item" key={i}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <h4>
                              {edu.degree} — {edu.field_of_study}
                            </h4>
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
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {showResumeModal && resumeUrl && (
        <div
          onClick={() => setShowResumeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              color: '#000',
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
                background: '#fff',
              }}
            >
              <strong style={{ fontSize: '16px', color: '#000' }}>
                Resume Preview
              </strong>
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
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                resumeUrl
              )}&embedded=true`}
              title="Resume Preview"
              style={{ flex: 1, width: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}