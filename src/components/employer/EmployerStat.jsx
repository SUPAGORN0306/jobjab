import React from 'react';
import useCountUp from '../../hooks/useCountUp';

/**
 * Stat component with 3 variants, preserving the glass card style.
 *
 * @param variant  'card' (default) | 'pill' | 'mini'
 * @param icon     Lucide icon component
 * @param label    Label above or below the value
 * @param value    Value to display (number or string)
 * @param detail   Additional description (card variant only)
 * @param color    'yellow' | 'mint' | 'blue' | 'purple' | 'success' | 'red'
 *                 or status: 'total' | 'applied' | 'reviewing' | 'interview' | 'rejected'
 * @param active   Active state for pill variant
 * @param onClick  Click handler for pill variant
 * @param animate  Enable count-up animation (default true)
 */
export default function EmployerStat({
  variant = 'card',
  icon: Icon,
  label,
  value,
  detail,
  color = 'yellow',
  active = false,
  onClick,
  animate = true,
}) {
  // Count-up animation
  const numericValue = typeof value === 'number'
    ? value
    : parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = typeof value === 'string' && value.includes('%') ? '%' : '';
  const animated = useCountUp(animate ? numericValue : 0, 800);
  const display = animate ? `${animated}${suffix}` : value;

  // ── Variant: CARD ── (Dashboard / Analytics)
  if (variant === 'card') {
    const isSuccess = color === 'success';
    return (
      <div className="emp-stat-card">
        <div className={`emp-stat-icon${isSuccess ? ' emp-stat-icon-success' : ''}`}>
          <Icon size={22} />
        </div>
        <div className="emp-stat-content">
          <span className="emp-stat-label">{label}</span>
          <span className={isSuccess ? 'emp-stat-value-success' : 'emp-stat-value'}>
            {display}
          </span>
          {detail && <span className="emp-stat-detail">{detail}</span>}
        </div>
      </div>
    );
  }

  // ── Variant: PILL ── (Applicants filter)
  if (variant === 'pill') {
    return (
      <div
        className={`emp-stat-pill ${color} ${active ? 'active' : ''}`}
        onClick={onClick}
      >
        <div className="emp-stat-pill-icon">
          <Icon size={20} />
        </div>
        <div className="emp-stat-pill-content">
          <span className="emp-stat-pill-value">{display}</span>
          <span className="emp-stat-pill-label">{label}</span>
        </div>
      </div>
    );
  }

  // ── Variant: MINI ── (Profile)
  if (variant === 'mini') {
    return (
      <div className="employer-mini-stat">
        <Icon size={18} />
        <span className="stat-num">{display}</span>
        <span className="stat-lbl">{label}</span>
      </div>
    );
  }

  return null;
}
