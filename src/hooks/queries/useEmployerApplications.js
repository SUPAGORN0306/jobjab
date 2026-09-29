// src/hooks/queries/useEmployerApplications.js
//
// React Query hooks สำหรับ Employer data
// - ใช้ BFF endpoint /api/employer/applications/all
// - cache ข้ามหน้า (navigate ไปมาไม่ refetch)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllEmployerApplications,
  fetchEmployerAnalytics,
  fetchAnalyticsWidgets,
  updateApplicationStatus,
} from '../../utils/api';
import { queryKeys } from '../../lib/queryClient';

// ─────────────────────────────────────────────
// 1. Employer Applications (BFF bulk)
// ─────────────────────────────────────────────
export function useEmployerApplications() {
  return useQuery({
    queryKey: queryKeys.employerApplications(),
    queryFn: fetchAllEmployerApplications,
    staleTime: 60_000,   // 60s — ตรงกับ backend cache
    select: (data) => ({
      jobs: data.jobs || [],
      applications: data.applications || [],
      stats: data.stats || {},
    }),
  });
}

// ─────────────────────────────────────────────
// 2. Analytics (period-based)
// ─────────────────────────────────────────────
export function useEmployerAnalytics(period = '30') {
  return useQuery({
    queryKey: queryKeys.employerAnalytics(period),
    queryFn: () => fetchEmployerAnalytics({ period }),
    staleTime: 180_000,  // 3 min — ตรงกับ backend cache
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

// ─────────────────────────────────────────────
// 3. Update status (mutation + auto invalidate)
// ─────────────────────────────────────────────
export function useUpdateApplicationStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, status }) =>
      updateApplicationStatus(applicationId, status),

    // Optimistic update (UX ลื่น)
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

    // ถ้า fail → rollback
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.employerApplications(), ctx.prev);
    },

    // สำเร็จ/ล้มเหลว → invalidate เพื่อ refetch ให้ sync
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.employerApplications() });
      qc.invalidateQueries({ queryKey: ['employer', 'analytics'] });
    },
  });
}