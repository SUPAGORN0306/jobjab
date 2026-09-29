// src/hooks/useEmployerData.js
//
// Backward-compatible hook — ใช้ React Query ภายใน
// (API เหมือนเดิม → Component ไม่ต้องแก้)
import { useEmployerApplications } from './queries/useEmployerApplications';

export default function useEmployerData() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useEmployerApplications();

  const jobs = data?.jobs || [];
  const applications = data?.applications || [];

  // ── Computed stats (เหมือนเดิม) ──
  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (j.applicant_count || 0),
    0
  );
  const activeJobs = jobs.filter(
    (j) => (j.status_key || 'active') === 'active'
  ).length;
  const jobsWithApplicants = jobs.filter(
    (j) => (j.applicant_count || 0) > 0
  ).length;
  const respondedCount = applications.filter(
    (a) => a.status === 'reviewing' || a.status === 'interview'
  ).length;
  const responseRate =
    applications.length > 0
      ? Math.round((respondedCount / applications.length) * 100)
      : 0;

  return {
    jobs,
    applications,
    loading: isLoading,      // ← map API เดิม
    refreshing: isFetching && !isLoading,
    error: error?.message || null,
    reload: refetch,
    totalApplicants,
    activeJobs,
    jobsWithApplicants,
    respondedCount,
    responseRate,
  };
}