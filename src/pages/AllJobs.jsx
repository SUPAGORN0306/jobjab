import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useAuth } from "../context/AuthContext";
import { getMatchBadgeClass } from "../utils/matchBadge.js";
import useJobsQuery from '../hooks/useJobsQuery';
import useDebounce from '../hooks/useDebounce';
import '../styles/candidate/AllJobs.css';
import '../styles/home/RecommendedCard.css';
import PageLoader from '../components/PageLoader';
import EmptyState from "../components/EmptyState";
import FilterChips from '../components/FilterChips';
import SalaryPopover from '../components/SalaryPopover';
import MatchModal from '../components/MatchModal';
import { Search, Target, Sparkles, TrendingDown, TrendingUp, Heart } from "lucide-react";
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import { timeAgo } from '../utils/timeAgo';

const MAX_SALARY = 250000;

// ⭐ helper — กัน object ถูก render
const safeStr = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(safeStr).filter(Boolean).join(', ');
  if (typeof v === 'object') return v.name || v.title || v.label || '';
  return String(v);
};

function AllJobs() {
  usePageTitle("All Jobs", { description: "Browse all available positions" });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);

  // ─── Read filters from URL ───
  const urlQ = searchParams.get("q") || "";
  const urlPosition = searchParams.get("position") || "all";
  const urlLevel = searchParams.get("level") || "all";
  const urlType = searchParams.get("type") || "all";
  const urlIndustry = searchParams.get("industry") || "all";
  const urlSalaryMin = parseInt(searchParams.get("salary_min") || "0", 10);
  const urlSalaryMax = parseInt(searchParams.get("salary_max") || String(MAX_SALARY), 10);
  const urlSort = searchParams.get("sort") || "match";

  // ─── Local input state ───
  const [searchInput, setSearchInput] = useState(urlQ);
  const debouncedSearch = useDebounce(searchInput, 400);

  // ─── Helper: update URL ───
  function updateUrl(patch = {}) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  }

  // ─── Sync search → URL ───
  useEffect(() => {
    if (debouncedSearch !== urlQ) {
      updateUrl({ q: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ─── useInfiniteQuery ───
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useJobsQuery({
    q: urlQ,
    position: urlPosition,
    level: urlLevel,
    type: urlType,
    industry: urlIndustry,
    salary_min: urlSalaryMin,
    salary_max: urlSalaryMax,
    sort: urlSort,
    userId: user?.id,
  });

  const visibleJobs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page?.jobs || []);
  }, [data]);

  const firstPage = data?.pages?.[0] || {};
  const pagination = firstPage.pagination || {};
  const total = pagination.total || 0;

  // ─── Handlers ───
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      updateUrl({ q: searchInput.trim() });
    }
  };

  const handleFilterChange = (key, value) => {
    updateUrl({ [key]: value });
  };

  const handleRemoveFilter = (key) => {
    if (key === 'salary') {
      updateUrl({ salary_min: null, salary_max: null });
    } else {
      updateUrl({ [key]: null });
    }
  };

  const handleApplySalary = (min, max) => {
    updateUrl({
      salary_min: min > 0 ? String(min) : null,
      salary_max: max < MAX_SALARY ? String(max) : null,
    });
  };

  const handleClearSalary = () => {
    updateUrl({ salary_min: null, salary_max: null });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const filterData = useMemo(() => ({
    q: urlQ,
    position: urlPosition,
    level: urlLevel,
    type: urlType,
    industry: urlIndustry,
    salary_min: urlSalaryMin,
    salary_max: urlSalaryMax,
  }), [urlQ, urlPosition, urlLevel, urlType, urlIndustry, urlSalaryMin, urlSalaryMax]);

  const hasActiveFilters = () => {
    return (
      urlQ !== "" ||
      urlPosition !== "all" ||
      urlLevel !== "all" ||
      urlType !== "all" ||
      urlIndustry !== "all" ||
      urlSalaryMin > 0 ||
      urlSalaryMax < MAX_SALARY
    );
  };

  const remaining = total - visibleJobs.length;

  return (
    <div className="all-jobs-container">
      {/* HEADER */}
      <div className="all-jobs-header">
        <button className="all-jobs-back" onClick={() => navigate('/home')}>
          ‹ Back to Home
        </button>
        <div className="all-jobs-title-row">
          <div>
            <h1>All Jobs</h1>
            <p className="all-jobs-subtitle">
              {isLoading ? 'Loading...' : `${total.toLocaleString()} positions available`}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="all-jobs-filter-card">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search jobs, companies, or keywords..."
            className="search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <div className="filter-navbar">
          <div className="filter-item">
            <Select value={urlPosition} onValueChange={(v) => handleFilterChange('position', v)}>
              <SelectTrigger className="filter-trigger">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="AI Product Manager">AI Product Manager</SelectItem>
                <SelectItem value="AI Researcher">AI Researcher</SelectItem>
                <SelectItem value="Computer Vision Engineer">Computer Vision Engineer</SelectItem>
                <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                <SelectItem value="ML Engineer">ML Engineer</SelectItem>
                <SelectItem value="NLP Engineer">NLP Engineer</SelectItem>
                <SelectItem value="Quant Researcher">Quant Researcher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="filter-item">
            <Select value={urlLevel} onValueChange={(v) => handleFilterChange('level', v)}>
              <SelectTrigger className="filter-trigger">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Entry">Entry</SelectItem>
                <SelectItem value="Mid">Mid</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="filter-item">
            <Select value={urlType} onValueChange={(v) => handleFilterChange('type', v)}>
              <SelectTrigger className="filter-trigger">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="filter-item">
            <Select value={urlIndustry} onValueChange={(v) => handleFilterChange('industry', v)}>
              <SelectTrigger className="filter-trigger">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Automotive">Automotive</SelectItem>
                <SelectItem value="E-commerce">E-commerce</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Tech">Tech</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="filter-item">
            <SalaryPopover
              salaryMin={urlSalaryMin}
              salaryMax={urlSalaryMax}
              onApply={handleApplySalary}
              onClear={handleClearSalary}
            />
          </div>

          <div className="filter-item">
            <Select value={urlSort} onValueChange={(v) => handleFilterChange('sort', v)}>
              <SelectTrigger className="filter-trigger">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match"><Target size={14} style={{ display: "inline", marginRight: 6 }} />Match Score</SelectItem>
                <SelectItem value="newest"><Sparkles size={14} style={{ display: "inline", marginRight: 6 }} />Newest</SelectItem>
                <SelectItem value="salary_high"><TrendingDown size={14} style={{ display: "inline", marginRight: 6 }} />Salary: High to Low</SelectItem>
                <SelectItem value="salary_low"><TrendingUp size={14} style={{ display: "inline", marginRight: 6 }} />Salary: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ACTIVE FILTER CHIPS */}
      {hasActiveFilters() && (
        <FilterChips
          filters={filterData}
          onRemove={handleRemoveFilter}
          onClearAll={clearFilters}
        />
      )}

      {/* RESULT BAR */}
      <div className="all-jobs-result-bar">
        <div className="all-jobs-result-left">
          <span className="all-jobs-result-count">
            {isLoading ? 'Loading...' : `${total.toLocaleString()} jobs found`}
          </span>
        </div>
      </div>

      {/* LOADING */}
      {isLoading && <PageLoader message="Loading jobs..." />}

      {/* EMPTY */}
      {!isLoading && visibleJobs.length === 0 && (
        <EmptyState
          icon={Search}
          title="No jobs match your filters"
          description="Try adjusting your search or clearing the filters"
          actionLabel="Clear all filters"
          onAction={clearFilters}
        />
      )}

      {/* JOB GRID */}
      {!isLoading && visibleJobs.length > 0 && (
        <div className="all-jobs-grid">
          {visibleJobs.map((job) => (
            <Link
              to={`/job/${job.id}`}
              key={job.id}
              className="Recommended-card-link"
            >
              <div className="Recommended-card">
                <div className="Recommended-card-top">
                  <div className="Recommended-company-info">
                    <div className={`Recommended-logo ${getJobLogoClass(safeStr(job.title || job.job_title))}`}>
                      {safeStr(job.logo_letter || job.logoLetter || (job.title || job.job_title)?.charAt?.(0) || 'J')}
                    </div>
                    <div>
                      <h4>{safeStr(job.title || job.job_title)}</h4>
                      <span>{safeStr(job.company || job.company_name)}</span>
                    </div>
                  </div>
                  <span
                    className={`Recommended-favorite-btn ${isFavorited(job.id) ? "is-favorited" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(job);
                    }}
                    role="button"
                    aria-label={isFavorited(job.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart
                      size={20}
                      fill={isFavorited(job.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    />
                  </span>
                </div>
                <div className="Recommended-tags">
                  {[job.type, job.level, job.work_mode || job.workMode]
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span key={idx}>{safeStr(tag)}</span>
                    ))}
                </div>
                <div className="Recommended-card-bottom">
                  <div>
                    <div className="Recommended-salary">{safeStr(job.salary) || 'N/A'}</div>
                    <div className="Recommended-applicants">
                      {safeStr(job.applicants) || ''}
                      {job.posted_date && ` · ${timeAgo(job.posted_date)}`}
                    </div>
                  </div>
                  <div
                    className={`Recommended-match-badge ${getMatchBadgeClass(Number(job.match_score || job.match || 0))}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedJobForMatch(job);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {Number(job.match_score || job.match || 0)}%
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* LOAD MORE */}
      {!isLoading && hasNextPage && (
        <div className="all-jobs-load-more-wrapper">
          <button
            className="all-jobs-load-more-btn"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
            <span className="all-jobs-load-more-count">
              {remaining > 0 ? `${remaining.toLocaleString()} remaining` : ''}
            </span>
          </button>
        </div>
      )}

      {/* END MESSAGE */}
      {!isLoading && !hasNextPage && visibleJobs.length > 0 && (
        <p className="all-jobs-end-message">
          You've seen all {total.toLocaleString()} jobs
        </p>
      )}

      {/* ⭐ MATCH MODAL */}
      {selectedJobForMatch && (
        <MatchModal
          job={selectedJobForMatch}
          onClose={() => setSelectedJobForMatch(null)}
        />
      )}
    </div>
  );
}

export default AllJobs;