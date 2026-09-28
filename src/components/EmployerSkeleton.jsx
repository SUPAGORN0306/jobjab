import React from 'react';
import { Skeleton } from './Skeleton';

// ─── Job Card Skeleton ───
export function JobCardSkeleton() {
  return (
    <div className="emp-job-card" style={{ pointerEvents: 'none' }}>
      <Skeleton className="ax-skel w-12 h-12 rounded-xl" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton className="ax-skel h-4 w-2/3" />
        <div style={{ display: 'flex', gap: 12 }}>
          <Skeleton className="ax-skel h-3 w-24" />
          <Skeleton className="ax-skel h-3 w-20" />
          <Skeleton className="ax-skel h-3 w-16" />
        </div>
      </div>
      <Skeleton className="ax-skel h-9 w-24 rounded-lg" />
    </div>
  );
}

export function JobListSkeleton({ count = 4 }) {
  return (
    <div className="emp-job-list">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Stat Card Skeleton (ใช้ .ax-stat) ───
export function StatCardSkeleton() {
  return (
    <div className="ax-stat ax-skel-card" style={{ pointerEvents: 'none' }}>
      <div className="ax-stat-icon ax-skel" style={{ width: 36, height: 36 }} />
      <div className="ax-stat-body">
        <Skeleton className="ax-skel h-2.5 w-16" />
        <Skeleton className="ax-skel h-6 w-12" />
        <Skeleton className="ax-skel h-2 w-20" />
      </div>
    </div>
  );
}

export function StatsGridSkeleton({ count = 4 }) {
  return (
    <div className="emp-stats-grid">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Applicant Card Skeleton ───
export function ApplicantCardSkeleton() {
  return (
    <div className="applicant-card" style={{ pointerEvents: 'none' }}>
      <div className="applicant-header">
        <Skeleton className="ax-skel w-11 h-11 rounded-full" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton className="ax-skel h-4 w-1/3" />
          <Skeleton className="ax-skel h-3 w-1/2" />
          <Skeleton className="ax-skel h-3 w-2/5" />
        </div>
      </div>
      <div className="applicant-actions">
        <Skeleton className="ax-skel h-6 w-20 rounded-full" />
        <Skeleton className="ax-skel h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function ApplicantListSkeleton({ count = 3 }) {
  return (
    <div className="applicants-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ApplicantCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Analytics Stat Skeleton (ใช้ .ax-stat + .ax-stats grid) ───
export function AnalyticsStatSkeleton() {
  return (
    <div className="ax-stat ax-skel-card" style={{ pointerEvents: 'none' }}>
      <div className="ax-stat-icon ax-skel-icon" />
      <div className="ax-stat-body">
        <Skeleton className="ax-skel" style={{ height: 10, width: 60 }} />
        <Skeleton className="ax-skel" style={{ height: 22, width: 50, marginTop: 2 }} />
        <Skeleton className="ax-skel" style={{ height: 9, width: 80, marginTop: 2 }} />
      </div>
    </div>
  );
}

export function AnalyticsGridSkeleton({ count = 4 }) {
  return (
    <div className="ax-stats">
      {Array.from({ length: count }).map((_, i) => (
        <AnalyticsStatSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Chart Skeleton (ใช้ .ax-card) ───
export function ChartSkeleton({ height = 240 }) {
  return (
    <div className="ax-card ax-skel-card" style={{ pointerEvents: 'none' }}>
      <div className="ax-card-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton className="ax-skel" style={{ height: 14, width: 160 }} />
          <Skeleton className="ax-skel" style={{ height: 10, width: 120 }} />
        </div>
      </div>
      <Skeleton className="ax-skel" style={{ height, width: '100%', borderRadius: 12 }} />
    </div>
  );
}
