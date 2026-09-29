import { useState, useEffect, useCallback } from 'react';
import { fetchAllEmployerApplications } from '../utils/api';

/**
 * useEmployerData — fetch employer jobs + all applications
 *
 * ใช้ใน: EmployerDashboard, EmployerApplicants, EmployerProfile
 *
 * ⚡ Performance (Session 5):
 * - เปลี่ยนจาก N+1 (loop fetchJobApplications) → 1 BFF call
 * - เดิม: 10 requests × 1-3s = 10-30s
 * - ใหม่: 1 request ~500ms (cold) / ~5ms (cache)
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
      // ⚡ 1 call แทน N calls
      const data = await fetchAllEmployerApplications();
      setJobs(data.jobs || []);
      setApplications(data.applications || []);
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