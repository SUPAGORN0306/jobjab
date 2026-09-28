import { useState, useEffect, useCallback } from 'react';
import { fetchEmployerJobs, fetchJobApplications } from '../api';

/**
 * useEmployerData — fetch employer jobs + all applications
 *
 * ใช้ใน: EmployerDashboard, EmployerApplicants, EmployerProfile
 *
 * @returns {{
 *   jobs, applications, loading, error, reload,
 *   totalApplicants, activeJobs, jobsWithApplicants,
 *   respondedCount, responseRate
 * }}
 */
export default function useEmployerData() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployerJobs();
      const jobsList = data.jobs || [];
      setJobs(jobsList);

      // Fetch applications ของทุก job
      const appPromises = jobsList.map(async (job) => {
        try {
          const appData = await fetchJobApplications(job.id);
          return (appData.applications || []).map((a) => ({
            ...a,
            job_title: job.job_title,
            job_id: job.id,
          }));
        } catch {
          return [];
        }
      });

      const appResults = await Promise.all(appPromises);
      setApplications(appResults.flat());
    } catch (err) {
      console.error('[useEmployerData]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Computed stats ──
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
    loading,
    error,
    reload: load,
    totalApplicants,
    activeJobs,
    jobsWithApplicants,
    respondedCount,
    responseRate,
  };
}
