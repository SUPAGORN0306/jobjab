/**
 * EmptyState.jsx — Beautiful empty state component
 * ใช้เมื่อไม่มีข้อมูล + optional action button
 * ใช้ Lucide icons เท่านั้น (ไม่ใช้ emoji)
 */
import { Briefcase } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Briefcase,
  title = 'No data',
  description = '',
  actionLabel,
  onAction,
  variant = 'default', // 'default' | 'compact'
}) {
  return (
    <div className={`empty-state-component empty-state-${variant}`}>
      <div className="empty-state-icon-wrap">
        <Icon size={variant === 'compact' ? 48 : 64} strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {actionLabel && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
