import React from 'react';

/**
 * EmployerHero — Hero block สำหรับ Employer pages
 * คงสไตล์แก้ว (glassmorphism) เดิมไว้
 *
 * @param variant     — 'default' (.emp-hero) | 'analytics' (.analytics-hero)
 * @param tag         — ข้อความ tag บนสุด (uppercase)
 * @param tagIcon     — Lucide icon component
 * @param title       — หัวข้อหลัก (string หรือ node)
 * @param subtitle    — คำอธิบายใต้หัวข้อ
 * @param subtitleIcon— Lucide icon หน้า subtitle
 * @param actions     — ปุ่ม action (JSX)
 * @param children    — content อื่นๆ ก่อน actions
 */
export default function EmployerHero({
  variant = 'default',
  tag,
  tagIcon: TagIcon,
  title,
  subtitle,
  subtitleIcon: SubtitleIcon,
  actions,
  children,
}) {
  // ── CSS prefix ตาม variant ──
  const prefix = variant === 'analytics' ? 'analytics' : 'emp';

  return (
    <section className={`${prefix}-hero`}>
      <div className={`${prefix}-hero-content`}>
        {tag && (
          <span className={`${prefix}-hero-tag`}>
            {TagIcon && <TagIcon size={14} />}
            {tag}
          </span>
        )}

        {title && <h1>{title}</h1>}

        {subtitle && (
          <p className={`${prefix}-hero-subtitle`}>
            {SubtitleIcon && <SubtitleIcon size={14} />}
            {subtitle}
          </p>
        )}

        {children}

        {actions && (
          <div className={`${prefix}-hero-actions`}>{actions}</div>
        )}
      </div>
    </section>
  );
}
