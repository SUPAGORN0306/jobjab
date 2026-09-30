// src/hooks/useJobsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobsFiltered } from '../utils/api';

const PAGE_SIZE = 24;

export default function useJobsQuery({
  q = "",
  position = "all",
  level = "all",
  type = "all",
  industry = "all",
  salary_min = 0,
  salary_max = 250000,
  sort = "newest",
  userId = null,
} = {}) {
  return useInfiniteQuery({
    queryKey: [
      'jobs', 'infinite',
      q, position, level, type, industry,
      salary_min, salary_max, sort, userId,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchJobsFiltered({
        q, position, level, type, industry,
        salary_min, salary_max, sort,
        page: pageParam,
        limit: PAGE_SIZE,
        userId,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pag = lastPage?.pagination || {};
      const page = pag.page || 1;
      const totalPages = pag.total_pages || 0;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}