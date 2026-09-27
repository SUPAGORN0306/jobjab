import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Calendar as CalendarIcon, Users, Briefcase } from 'lucide-react';

// ============================================
// STATUS COLORS (ตรงกับ Candidate)
// ============================================
const STATUS_COLORS = {
  applied: '#38bdf8',
  reviewing: '#f472b6',
  interview: '#34d399',
  rejected: '#94a3b8',
  closed: '#94a3b8',
};

export default function EmployerCalendar({ applications = [], jobs = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ============================================
  // GET EVENTS FOR DATE
  // ============================================
  const getEventsForDate = (date) => {
    const dateStr = date.toDateString();
    return applications.filter((app) => {
      const applied = app.applied_date
        ? new Date(app.applied_date).toDateString()
        : null;
      const updated = app.updated_at
        ? new Date(app.updated_at).toDateString()
        : null;
      return applied === dateStr || updated === dateStr;
    });
  };

  // ============================================
  // TILE CONTENT — colored dots
  // ============================================
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    return (
      <div className="calendar-dots">
        {events.slice(0, 3).map((app, i) => {
          const color = STATUS_COLORS[app.status] || '#8c9bae';
          return (
            <span
              key={i}
              className="calendar-dot"
              style={{ background: color }}
            />
          );
        })}
      </div>
    );
  };

  // ============================================
  // FORMAT DATE
  // ============================================
  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="employer-calendar-column">
      <div className="section-header">
        <CalendarIcon size={14} />
        <span>Calendar</span>
        <span className="section-count">{applications.length}</span>
      </div>

      <div className="calendar-card">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          locale="en-US"
        />
      </div>

      {/* Selected Day Card */}
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
            {selectedDateEvents.slice(0, 5).map((app) => {
              const color = STATUS_COLORS[app.status] || '#8c9bae';
              return (
                <div className="event-item" key={app.id}>
                  <span
                    className="event-dot"
                    style={{ background: color }}
                  />
                  <div className="event-info">
                    <p className="event-status">{app.status}</p>
                    <p className="event-title">
                      {app.full_name || 'Applicant'} · {app.job_title || 'Job'}
                    </p>
                  </div>
                </div>
              );
            })}
            {selectedDateEvents.length > 5 && (
              <p className="empty-events">
                +{selectedDateEvents.length - 5} more
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
