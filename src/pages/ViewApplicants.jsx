import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchJobApplications,
  fetchApplicationSnapshot,
  updateApplicationStatus,
} from '../api';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Wrench,
  Briefcase,
  GraduationCap,
  BarChart3,
  Inbox,
} from 'lucide-react';
import '../styles/employer/ViewApplicants.css';

export default function ViewApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedApp, setSelectedApp] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // ⭐ Resume viewer
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeApplicantName, setResumeApplicantName] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJobApplications(jobId);
        setApplications(data.applications || []);
        setJobTitle(data.job_title || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const handleViewDetail = async (app) => {
    setSelectedApp(app);
    setSnapshotLoading(true);
    setSnapshot(null);
    try {
      const data = await fetchApplicationSnapshot(app.id);
      setSnapshot(data);
    } catch (err) {
      alert('Error: ' + err.message);
      setSelectedApp(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdating(true);
    try {
      await updateApplicationStatus(applicationId, newStatus);

      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
      );

      if (selectedApp?.id === applicationId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
      if (snapshot?.application?.id === applicationId) {
        setSnapshot((prev) => ({
          ...prev,
          application: { ...prev.application, status: newStatus },
        }));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'applied':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' };
      case 'reviewing':
        return { bg: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', border: 'rgba(244, 114, 182, 0.4)' };
      case 'interview':
        return { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: 'rgba(52, 211, 153, 0.4)' };
      case 'rejected':
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' };
    }
  };

  // ⭐ เปิด resume preview — ใช้ URL ตรง
  const handleViewResume = (url, applicantName = '') => {
    if (!url) {
      alert('No resume available for this applicant');
      return;
    }
    setResumeUrl(url);
    setResumeApplicantName(applicantName);
    setShowResumeModal(true);
  };

  if (loading) {
    return (
      <div className="applicants-container">
        <p className="loading-text">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="applicants-container">
      <div className="applicants-nav">
        <Link to="/employer/dashboard" className="back-link">
          <span className="back-arrow">‹</span> Back to Dashboard
        </Link>
      </div>

      <div className="applicants-header">
        <h1>Applicants</h1>
        <p className="applicants-subtitle">
          {jobTitle} · <strong>{applications.length}</strong> applicant
          {applications.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && <div className="applicants-error">{error}</div>}

      {applications.length === 0 ? (
        <div className="empty-applicants">
          <Inbox size={40} style={{ color: '#8c9bae', marginBottom: '12px' }} />
          <p className="empty-title">No Applicant</p>
          <p className="empty-sub">Wait for application</p>
        </div>
      ) : (
        <div className="applicants-grid">
          {applications.map((app) => {
            const colors = statusColor(app.status);
            return (
              <div className="applicant-card" key={app.id}>
                <div className="applicant-header">
                  <div className="applicant-avatar">
                    {app.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="applicant-info">
                    <h3>{app.full_name}</h3>
                    <p>{app.email}</p>
                    <p className="applicant-location">
                      {app.location || 'N/A'} ·{' '}
                      {app.applied_date
                        ? new Date(app.applied_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="applicant-actions">
                  <span
                    className="status-badge"
                    style={{
                      background: colors.bg,
                      color: colors.color,
                      borderColor: colors.border,
                    }}
                  >
                    {app.status}
                  </span>

                  <button
                    className="view-btn"
                    onClick={() => handleViewDetail(app)}
                  >
                    View Details
                  </button>

                  <select
                    className="status-select"
                    value={app.status}
                    disabled={updating}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    <option value="applied">Applied</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interview">Interview</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedApp.full_name}</h2>
                <p className="modal-subtitle">{selectedApp.email}</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
            </div>

            {snapshotLoading ? (
              <p className="modal-loading">Loading snapshot...</p>
            ) : snapshot ? (
              <div className="modal-body">
                <section className="modal-section">
                  <h3>
                    <Mail size={16} /> Contact
                  </h3>
                  <div className="modal-grid">
                    <div>
                      <span className="modal-label">
                        <Mail size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Email
                      </span>
                      <span className="modal-value">{snapshot.application.email}</span>
                    </div>
                    <div>
                      <span className="modal-label">
                        <Phone size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Phone
                      </span>
                      <span className="modal-value">{snapshot.application.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="modal-label">
                        <MapPin size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Location
                      </span>
                      <span className="modal-value">{snapshot.application.location || '-'}</span>
                    </div>
                    <div>
                      <span className="modal-label">
                        <FileText size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Resume
                      </span>
                      <span className="modal-value">
                        {(snapshot.application.resume_url || snapshot.application.user_resume_url) ? (
                          <button
                            type="button"
                            onClick={() => {
                              const url = snapshot.application.resume_url || snapshot.application.user_resume_url;
                              handleViewResume(url, snapshot.application.full_name);
                            }}
                            className="resume-link"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#60a5fa',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              padding: 0,
                              font: 'inherit',
                            }}
                          >
                            <FileText size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
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
                    <h3>
                      <FileText size={16} /> Cover Letter
                    </h3>
                    <p className="cover-letter">
                      {snapshot.application.cover_letter}
                    </p>
                  </section>
                )}

                {snapshot.skills?.length > 0 && (
                  <section className="modal-section">
                    <h3>
                      <Wrench size={16} /> Skills ({snapshot.skills.length})
                    </h3>
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
                    <h3>
                      <Briefcase size={16} /> Experience ({snapshot.experiences.length})
                    </h3>
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
                    <h3>
                      <GraduationCap size={16} /> Education ({snapshot.educations.length})
                    </h3>
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

                <section className="modal-section">
                  <h3>
                    <BarChart3 size={16} /> Update Status
                  </h3>
                  <div className="modal-status-row">
                    {['applied', 'reviewing', 'interview', 'rejected'].map((s) => (
                      <button
                        key={s}
                        className="status-btn"
                        onClick={() =>
                          handleStatusChange(snapshot.application.id, s)
                        }
                        disabled={updating}
                        style={{
                          background:
                            snapshot.application.status === s
                              ? statusColor(s).bg
                              : 'rgba(255,255,255,0.05)',
                          color:
                            snapshot.application.status === s
                              ? statusColor(s).color
                              : '#d8d8d8',
                          borderColor:
                            snapshot.application.status === s
                              ? statusColor(s).border
                              : 'rgba(255,255,255,0.15)',
                        }}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ⭐ RESUME PREVIEW MODAL — Google Docs Viewer */}
      {showResumeModal && resumeUrl && (
        <div
          onClick={() => setShowResumeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 2000,
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
                <strong style={{ fontSize: '16px' ,color: '#000'}}>Resume Preview</strong>
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

            {/* ⭐ Google Docs Viewer */}
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
              title="Resume Preview"
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}