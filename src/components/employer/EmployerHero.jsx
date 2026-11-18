import React from 'react';

/**
 * Hero block for Employer pages, preserving the glassmorphism style.
 *
 * @param variant      'default' (.emp-hero) | 'analytics' (.analytics-hero)
 * @param tag          Top uppercase tag text
 * @param tagIcon      Lucide icon component
 * @param title        Main heading (string or node)
 * @param subtitle     Subtitle text below the heading
 * @param subtitleIcon Lucide icon before the subtitle
 * @param actions      Action buttons (JSX)
 * @param children     Additional content rendered before actions
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
  // CSS prefix by variant
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
