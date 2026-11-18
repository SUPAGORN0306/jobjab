// Backward-compatible hook powered by React Query internally
// (keeps the existing API so components do not need changes)
import { useEmployerApplications } from './useEmployerApplications';

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

  // Computed stats
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
    loading: isLoading,      // Maps to the legacy loading API
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