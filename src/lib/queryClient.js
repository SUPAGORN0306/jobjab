// QueryClient configuration
// - staleTime matches the backend cache TTL
// - refetchOnWindowFocus is disabled to avoid refetching when switching tabs
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,           // 60s (matches backend jobs cache)
      gcTime: 5 * 60_000,          // 5 min (in-memory cache; v5 uses gcTime)
      refetchOnWindowFocus: false, // Do not refetch when switching tabs
      refetchOnReconnect: true,    // Refetch when network reconnects
      retry: 1,                    // Retry once
      retryDelay: 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Centralized query keys
// Use this pattern for accurate cache invalidation
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

