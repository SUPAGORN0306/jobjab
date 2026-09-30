// src/lib/queryClient.js
//
// QueryClient config — Session 5 Phase 3
// - staleTime ตรงกับ backend cache TTL
// - refetchOnWindowFocus: false (ปิดเพื่อไม่ refetch ตอนสลับ tab)
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,           // 60s (ตรงกับ backend jobs cache)
      gcTime: 5 * 60_000,          // 5 min (เก็บใน memory — v5 ใช้ gcTime)
      refetchOnWindowFocus: false, // ไม่ refetch ตอนสลับ tab
      refetchOnReconnect: true,    // refetch ตอน internet กลับมา
      retry: 1,                    // retry 1 ครั้ง
      retryDelay: 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Query Keys (centralized) ───
// ใช้ pattern นี้เพื่อ invalidate ได้ตรง
export const queryKeys = {
  // filtered jobs
  jobsFiltered: (params) => [
    'jobs',
    'filtered',
    params.q,
    params.level,
    params.type,
    params.industry,
    params.salary_min,
    params.salary_max,
    params.sort,
    params.page,
    params.limit,
    params.userId,
  ],
  employerApplications: () => ['employer', 'applications', 'all'],
  employerJobs:         () => ['employer', 'jobs'],
  employerAnalytics:    (period) => ['employer', 'analytics', period],
  employerWidgets:      (period) => ['employer', 'analytics', 'widgets', period],
  jobs:                 (userId) => ['jobs', userId || 'anon'],
  jobDetail:            (jobId, userId) => ['jobs', jobId, userId || 'anon'],
  favorites:            () => ['favorites'],
  applicationSnapshot:  (appId) => ['application', 'snapshot', appId],
  skills:               () => ['skills'],
};

