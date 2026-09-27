import React from 'react';
import { Skeleton } from './Skeleton';

// ============================================
// JOB CARD SKELETON
// ============================================
export function JobCardSkeleton() {
  return (
    <div className="emp-job-card" style={{ pointerEvents: 'none' }}>
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton className="h-4 w-2/3" />
        <div style={{ display: 'flex', gap: 12 }}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
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

// ============================================
// STAT CARD SKELETON
// ============================================
export function StatCardSkeleton() {
  return (
    <div className="emp-stat-card" style={{ pointerEvents: 'none' }}>
      <Skeleton className="w-11 h-11 rounded-xl" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-20" />
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

// ============================================
// APPLICANT CARD SKELETON
// ============================================
export function ApplicantCardSkeleton() {
  return (
    <div className="applicant-card" style={{ pointerEvents: 'none' }}>
      <div className="applicant-header">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
      <div className="applicant-actions">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-lg" />
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

// ============================================
// ANALYTICS STAT SKELETON
// ============================================
export function AnalyticsStatSkeleton() {
  return (
    <div className="analytics-stat-card" style={{ pointerEvents: 'none' }}>
      <Skeleton className="w-11 h-11 rounded-2xl" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function AnalyticsGridSkeleton({ count = 4 }) {
  return (
    <div className="analytics-stats-grid">
      {Array.from({ length: count }).map((_, i) => (
        <AnalyticsStatSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================
// CHART SKELETON
// ============================================
export function ChartSkeleton({ height = 280 }) {
  return (
    <div className="analytics-chart-section" style={{ pointerEvents: 'none' }}>
      <div className="analytics-chart-header">
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className={`rounded-2xl`} style={{ height }} />
    </div>
  );
}
