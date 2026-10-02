import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  Target,
  Megaphone,
  AlertCircle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// Status colors (ตรงกับ EmployerApplicants)
// ═══════════════════════════════════════════════════════════════════
const STATUS_COLORS = {
  applied:   '#38bdf8',
  reviewing: '#f472b6',
  interview: '#34d399',
  rejected:  '#94a3b8',
};

// ═══════════════════════════════════════════════════════════════════
// Event meta — 5 types with icons
// ═══════════════════════════════════════════════════════════════════
const EVENT_META = {
  applied:       { label: 'Applied',       icon: Download,    color: '#38bdf8' },
  status_change: { label: 'Status change', icon: RefreshCw,   color: '#f472b6' },  // จะ override ตาม status
  interview:     { label: 'Interview',     icon: Target,      color: '#34d399' },
  job_posted:    { label: 'Job posted',    icon: Megaphone,   color: '#f0d154' },
  job_expiring:  { label: 'Job expiring',  icon: AlertCircle, color: '#fca5a5' },
};

export default function EmployerCalendar({ applications = [], jobs = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ═══════════════════════════════════════════════════════════════════
  // GET EVENTS
  // ═══════════════════════════════════════════════════════════════════
  const getEventsForDate = (date) => {
    const target = date.toDateString();
    const events = [];

    applications.forEach((app) => {
      const appliedStr = app.applied_date
        ? new Date(app.applied_date).toDateString()
        : null;
      const changedStr = (app.status_changed_at || app.updated_at)
        ? new Date(app.status_changed_at || app.updated_at).toDateString()
        : null;
      const interviewStr = app.interview_date
        ? new Date(app.interview_date).toDateString()
        : null;

      // 1. Applied
      if (appliedStr === target) {
        events.push({
          id: `app-${app.id}-applied`,
          eventType: 'applied',
          applicant: app.full_name,
          jobTitle: app.job_title,
          raw: app,
        });
      }

      // 2. Status change (ข้ามถ้า applied_date = วันเดียวกัน)
      if (
        changedStr === target &&
        app.status !== 'applied' &&
        appliedStr !== target
      ) {
        events.push({
          id: `app-${app.id}-status`,
          eventType: 'status_change',
          status: app.status,
          applicant: app.full_name,
          jobTitle: app.job_title,
          raw: app,
        });
      }

      // 3. Interview scheduled
      if (interviewStr === target) {
        events.push({
          id: `app-${app.id}-interview`,
          eventType: 'interview',
          applicant: app.full_name,
          jobTitle: app.job_title,
          raw: app,
        });
      }
    });

    // 4. Job posted + 5. Job expiring
    jobs.forEach((job) => {
      if (job.posted_date && new Date(job.posted_date).toDateString() === target) {
        events.push({
          id: `job-${job.id}-posted`,
          eventType: 'job_posted',
          jobTitle: job.job_title,
        });
      }

      if (job.expires_at && new Date(job.expires_at).toDateString() === target) {
        events.push({
          id: `job-${job.id}-expiring`,
          eventType: 'job_expiring',
          jobTitle: job.job_title,
        });
      }
    });

    return events;
  };

  // ═══════════════════════════════════════════════════════════════════
  // Helper: get color for event (status_change → ตาม status ปลายทาง)
  // ═══════════════════════════════════════════════════════════════════
  const getEventColor = (ev) => {
    if (ev.eventType === 'status_change') {
      return STATUS_COLORS[ev.status] || EVENT_META.status_change.color;
    }
    return EVENT_META[ev.eventType]?.color || '#8c9bae';
  };

  // ═══════════════════════════════════════════════════════════════════
  // Tile — colored dots (dedupe by color)
  // ═══════════════════════════════════════════════════════════════════
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    const colors = [...new Set(events.map(getEventColor).filter(Boolean))];

    return (
      <div className="calendar-dots">
        {colors.slice(0, 3).map((c, i) => (
          <span
            key={i}
            className="calendar-dot"
            style={{ background: c, boxShadow: `0 0 6px ${c}` }}
          />
        ))}
        {colors.length > 3 && (
          <span className="calendar-dot-more">+{colors.length - 3}</span>
        )}
      </div>
    );
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="employer-calendar-column">
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
            {selectedDateEvents.slice(0, 6).map((ev) => {
              const meta = EVENT_META[ev.eventType] || {
                label: ev.eventType,
                icon: CalendarIcon,
                color: '#8c9bae',
              };
              const Icon = meta.icon;
              const color = getEventColor(ev);

              return (
                <div className="event-item" key={ev.id}>
                  <div
                    className="event-icon"
                    style={{
                      color: color,
                      background: `${color}22`,
                      border: `1px solid ${color}55`,
                    }}
                  >
                    <Icon size={12} />
                  </div>
                  <div className="event-info">
                    <p className="event-status">{meta.label}</p>
                    <p className="event-title">
                      {ev.eventType === 'job_posted' || ev.eventType === 'job_expiring'
                        ? ev.jobTitle
                        : `${ev.applicant || 'Applicant'} · ${ev.jobTitle || 'Job'}`}
                    </p>
                  </div>
                </div>
              );
            })}
            {selectedDateEvents.length > 6 && (
              <p className="empty-events">
                +{selectedDateEvents.length - 6} more
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}