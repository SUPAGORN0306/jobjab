// React Query hooks for employer data
// - Uses BFF endpoint /api/employer/applications/all
// - Cached across pages (navigating between pages avoids refetching)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllEmployerApplications,
  fetchEmployerAnalytics,
  fetchAnalyticsWidgets,
  updateApplicationStatus,
} from '../utils/api';
import { queryKeys } from '../lib/queryClient';

// Employer Applications (BFF bulk)
export function useEmployerApplications() {
  return useQuery({
    queryKey: queryKeys.employerApplications(),
    queryFn: fetchAllEmployerApplications,
    staleTime: 60_000,   // 60s, matches backend cache
    select: (data) => ({
      jobs: data.jobs || [],
      applications: data.applications || [],
      stats: data.stats || {},
    }),
  });
}

// Analytics (period-based)
export function useEmployerAnalytics(period = '30') {
  return useQuery({
    queryKey: queryKeys.employerAnalytics(period),
    queryFn: () => fetchEmployerAnalytics({ period }),
    staleTime: 180_000,  // 3 min, matches backend cache
    enabled: !!period,
  });
}

export function useAnalyticsWidgets(period = '30') {
  return useQuery({
    queryKey: queryKeys.employerWidgets(period),
    queryFn: () => fetchAnalyticsWidgets({ period }),
    staleTime: 180_000,
    enabled: !!period,
  });
}

// Update status (mutation with automatic invalidation)
export function useUpdateApplicationStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, status }) =>
      updateApplicationStatus(applicationId, status),

    // Optimistic update for smoother UX
    onMutate: async ({ applicationId, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.employerApplications() });

      const prev = qc.getQueryData(queryKeys.employerApplications());

      qc.setQueryData(queryKeys.employerApplications(), (old) => {
        if (!old) return old;
        return {
          ...old,
          applications: old.applications.map((a) =>
            a.id === applicationId ? { ...a, status } : a
          ),
        };
      });

      return { prev };
    },

    // Roll back on error
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.employerApplications(), ctx.prev);
    },

    // Invalidate on completion to refetch and stay in sync
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerApplications() });
      qc.invalidateQueries({ queryKey: ['employer', 'analytics'] });
    },
  });
}