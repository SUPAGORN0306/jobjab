import React, { useState, useEffect } from 'react';
import { fetchUserApplications} from '../api';
import '../styles/candidate/AppStatus.css';

export default function AppStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchUserApplications();
        setApplications(data.applications || []);
      } catch (err) {
        console.error('❌ Error fetching applications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ คำนวณสถิติ
  const totalApplications = applications.length;
  const inReviewCount = applications.filter(
    (a) => a.status === 'reviewing' || a.status === 'in_review'
  ).length;
  const interviewCount = applications.filter((a) => a.status === 'interview').length;
  const closedCount = applications.filter(
    (a) => a.status === 'rejected' || a.status === 'closed'
  ).length;

  // Response rate = เปอร์เซ็นต์ที่ได้ตอบกลับ (status ไม่ใช่ applied)
  const respondedCount = applications.filter((a) => a.status !== 'applied').length;
  const responseRate =
    totalApplications > 0 ? Math.round((respondedCount / totalApplications) * 100) : 0;

  // ✅ จัดกลุ่มตาม status (รองรับทั้ง 4 คอลัมน์)
  const groupedApplications = {
    applied: applications.filter((a) => a.status === 'applied'),
    reviewing: applications.filter(
      (a) => a.status === 'reviewing' || a.status === 'in_review'
    ),
    interview: applications.filter((a) => a.status === 'interview'),
    closed: applications.filter(
      (a) => a.status === 'rejected' || a.status === 'closed'
    ),
  };

  // Format วันที่
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // === Loading ===
  if (loading) {
    return (
      <div className="status-container">
        <div className="status-header">
          <h1>Application status</h1>
        </div>
        <p style={{ color: '#8c9bae', textAlign: 'center', padding: '40px 0' }}>
          Loading your applications...
        </p>
      </div>
    );
  }

  // === Error ===
  if (error) {
    return (
      <div className="status-container">
        <div className="status-header">
          <h1>Application status</h1>
        </div>
        <p style={{ color: '#e74c3c', textAlign: 'center', padding: '40px 0' }}>
          ❌ Error loading applications: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="status-container">
      <div className="status-header">
        <h1>Application status</h1>
        <span
          style={{
            fontSize: '0.85rem',
            color: '#8c9bae',
            display: 'block',
            textAlign: 'center',
            marginTop: '4px',
          }}
        >
          {totalApplications} total application{totalApplications !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total applications</span>
          <span className="stat-value total-app">{totalApplications}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In review</span>
          <span className="stat-value in-review-val">{inReviewCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Interviews</span>
          <span className="stat-value interview-val">{interviewCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Response rate</span>
          <span className="stat-value response-val">{responseRate}%</span>
        </div>
      </div>

      {/* ===== Kanban Board ===== */}
      <div className="kanban-board">
        {/* --- Applied --- */}
        <div className="kanban-column applied">
          <div className="column-header">
            <span className="dot applied"></span>
            <span className="column-title">Applied</span>
            <span className="column-count">{groupedApplications.applied.length}</span>
          </div>
          <div className="card-list">
            {groupedApplications.applied.length === 0 ? (
              <div className="empty-state">No applications</div>
            ) : (
              groupedApplications.applied.map((app) => (
                <div className="job-card" key={app.id}>
                  <h3>{app.job_title || 'Unknown Position'}</h3>
                  <p className="company">{app.company || 'Unknown Company'}</p>
                  <p className="date">Applied {formatDate(app.applied_date)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- In Review --- */}
        <div className="kanban-column in-review">
          <div className="column-header">
            <span className="dot in-review"></span>
            <span className="column-title">In review</span>
            <span className="column-count">{groupedApplications.reviewing.length}</span>
          </div>
          <div className="card-list">
            {groupedApplications.reviewing.length === 0 ? (
              <div className="empty-state">No applications in review</div>
            ) : (
              groupedApplications.reviewing.map((app) => (
                <div className="job-card" key={app.id}>
                  <h3>{app.job_title || 'Unknown Position'}</h3>
                  <p className="company">{app.company || 'Unknown Company'}</p>
                  <p className="date">
                    Updated {formatDate(app.updated_at || app.applied_date)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Interview --- */}
        <div className="kanban-column interview">
          <div className="column-header">
            <span className="dot interview"></span>
            <span className="column-title">Interview</span>
            <span className="column-count">{groupedApplications.interview.length}</span>
          </div>
          <div className="card-list">
            {groupedApplications.interview.length === 0 ? (
              <div className="empty-state">No interviews scheduled</div>
            ) : (
              groupedApplications.interview.map((app) => (
                <div className="job-card" key={app.id}>
                  <h3>{app.job_title || 'Unknown Position'}</h3>
                  <p className="company">{app.company || 'Unknown Company'}</p>
                  <p className="date">
                    Interview {formatDate(app.updated_at || app.applied_date)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- Closed --- */}
        <div className="kanban-column closed">
          <div className="column-header">
            <span className="dot closed"></span>
            <span className="column-title">Closed</span>
            <span className="column-count">{closedCount}</span>
          </div>
          <div className="card-list">
            {groupedApplications.closed.length === 0 ? (
              <div className="empty-state">No closed applications</div>
            ) : (
              groupedApplications.closed.map((app) => (
                <div className="job-card" key={app.id}>
                  <h3>{app.job_title || 'Unknown Position'}</h3>
                  <p className="company">{app.company || 'Unknown Company'}</p>
                  <p className="date">
                    {app.status === 'rejected' ? 'Not selected' : 'Closed'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}