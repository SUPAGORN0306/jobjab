import { useQuery } from '@tanstack/react-query';
import { API_ORIGIN } from '../utils/apiUrl';

async function fetchStats() {
  const res = await fetch(`${API_ORIGIN}/api/jobs?limit=1`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return {
    totalJobs: data.pagination?.total_all_jobs ?? 0,
    totalCompanies: data.pagination?.total_companies ?? 0,
    totalApplicants: data.pagination?.total_applicants ?? 0,
  };
}

export function useLandingStats() {
  return useQuery({
    queryKey: ['landing', 'stats'],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}