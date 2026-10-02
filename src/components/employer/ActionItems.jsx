import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  Target,
  Calendar,
  MessageSquare,
  Clock,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const DAY_MS = 1000 * 60 * 60 * 24;

const daysSince = (d) => {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / DAY_MS);
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isTomorrow = (d) => {
  if (!d) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(d, tomorrow);
};

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export default function ActionItems({ applications = [], jobs = [], onNavigate }) {
  const navigate = useNavigate();
  const go = onNavigate || navigate;
  const items = [];

  // P1: สัมภาษณ์วันนี้
  const todayInterviews = applications.filter(
    (a) => a.status === 'interview' && isSameDay(a.interview_date, new Date())
  );
  if (todayInterviews.length > 0) {
    items.push({
      priority: 100,
      icon: Target,
      color: '#34d399',
      title: `${todayInterviews.length} interview${todayInterviews.length > 1 ? 's' : ''} today`,
      subtitle: 'Check your calendar for details',
      action: 'View',
      onClick: () => go('/employer/applicants?status=interview'),
    });
  }

  // P2: สัมภาษณ์พรุ่งนี้
  const tomorrowInterviews = applications.filter(
    (a) => a.status === 'interview' && isTomorrow(a.interview_date)
  );
  if (tomorrowInterviews.length > 0) {
    items.push({
      priority: 95,
      icon: Calendar,
      color: '#38bdf8',
      title: `${tomorrowInterviews.length} interview${tomorrowInterviews.length > 1 ? 's' : ''} tomorrow`,
      subtitle: 'Prepare your questions and notes',
      action: 'View',
      onClick: () => go('/employer/applicants?status=interview'),
    });
  }

  // P3: Interview ค้าง
  const staleInterview = applications.filter(
    (a) =>
      a.status === 'interview' &&
      !a.interview_date &&
      daysSince(a.status_changed_at || a.updated_at) >= 5
  );
  if (staleInterview.length > 0) {
    items.push({
      priority: 85,
      icon: Clock,
      color: '#34d399',
      title: `${staleInterview.length} interview${staleInterview.length > 1 ? 's' : ''} need scheduling`,
      subtitle: 'In interview stage — pick a date',
      action: 'Schedule',
      onClick: () => go('/employer/applicants?status=interview'),
    });
  }

  // P4: Reviewing ค้าง
  const staleReviewing = applications.filter(
    (a) =>
      a.status === 'reviewing' &&
      daysSince(a.status_changed_at || a.updated_at) >= 7
  );
  if (staleReviewing.length > 0) {
    items.push({
      priority: 70,
      icon: MessageSquare,
      color: '#f472b6',
      title: `${staleReviewing.length} applicant${staleReviewing.length > 1 ? 's' : ''} stuck in review`,
      subtitle: 'In review for 7+ days — decide or move forward',
      action: 'Review',
      onClick: () => go('/employer/applicants?status=reviewing'),
    });
  }

  // P5: Applied ค้าง
  const staleApplied = applications.filter(
    (a) => a.status === 'applied' && daysSince(a.applied_date) >= 2
  );
  if (staleApplied.length > 0) {
    items.push({
      priority: 55,
      icon: Bell,
      color: '#f0d154',
      title: `${staleApplied.length} new applicant${staleApplied.length > 1 ? 's' : ''} waiting`,
      subtitle: 'Applied more than 2 days ago',
      action: 'Reply now',
      onClick: () => go('/employer/applicants?status=applied'),
    });
  }

  // P6: Job ใกล้หมดอายุ
  const expiringJobs = jobs.filter((j) => {
    if ((j.status_key || 'active') !== 'active') return false;
    if (!j.expires_at) return false;
    const daysLeft = -daysSince(j.expires_at);
    return daysLeft >= 0 && daysLeft <= 7;
  });
  if (expiringJobs.length > 0) {
    items.push({
      priority: 45,
      icon: AlertTriangle,
      color: '#fca5a5',
      title: `${expiringJobs.length} job${expiringJobs.length > 1 ? 's' : ''} expiring soon`,
      subtitle: 'Expires in less than 7 days — extend or close',
      action: 'Manage',
      onClick: () => go('/employer/jobs'),
    });
  }

  // P7: Job ไม่มีคนสมัคร
  const staleJobs = jobs.filter(
    (j) =>
      (j.status_key || 'active') === 'active' &&
      (j.applicant_count || 0) === 0 &&
      daysSince(j.posted_date) >= 14
  );
  if (staleJobs.length > 0) {
    items.push({
      priority: 30,
      icon: Briefcase,
      color: '#38bdf8',
      title: `${staleJobs.length} job${staleJobs.length > 1 ? 's' : ''} with no applicants`,
      subtitle: 'Posted 14+ days — try updating or promoting',
      action: 'View jobs',
      onClick: () => go('/employer/jobs'),
    });
  }

  items.sort((a, b) => b.priority - a.priority);

  const MAX_VISIBLE = 4;
  const visible = items.slice(0, MAX_VISIBLE);
  const hiddenCount = items.length - visible.length;

  if (items.length === 0) {
    return (
      <section className="emp-action-items emp-action-items-empty">
        <div className="emp-action-header">
          <Sparkles size={16} className="emp-action-header-icon" />
          <h3>All caught up</h3>
        </div>
        <p className="emp-action-empty-text">
          Nothing needs your attention — take a break!
        </p>
      </section>
    );
  }

  return (
    <section className="emp-action-items">
      <div className="emp-action-header">
        <Bell size={16} className="emp-action-header-icon" />
        <h3>Today's Tasks ({items.length})</h3>
      </div>

      <div className="emp-action-list">
        {visible.map((item, i) => {
          const Icon = item.icon;
          return (
            <div className="emp-action-card" key={i}>
              <div
                className="emp-action-icon"
                style={{
                  color: item.color,
                  background: `${item.color}22`,
                  border: `1px solid ${item.color}55`,
                }}
              >
                <Icon size={14} />
              </div>

              <div className="emp-action-content">
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>

              <button className="emp-action-cta" onClick={item.onClick}>
                {item.action} →
              </button>
            </div>
          );
        })}

        {hiddenCount > 0 && (
          <button
            className="emp-action-more"
            onClick={() => go('/employer/applicants')}
          >
            +{hiddenCount} more task{hiddenCount > 1 ? 's' : ''} — View all
          </button>
        )}
      </div>
    </section>
  );
}