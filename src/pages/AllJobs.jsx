import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useAuth } from "../context/AuthContext";
import { getMatchBadgeClass } from "../utils/matchBadge.js";
import useJobsQuery from '../hooks/useJobsQuery';
import useDebounce from '../hooks/useDebounce';
import '../styles/candidate/AllJobs.css';
import '../styles/home/RecommendedCard.css';
import PageLoader from '../components/PageLoader';
import EmptyState from "../components/EmptyState";
import { Search, Target, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';

const MAX_SALARY = 250000;

function AllJobs() {
  usePageTitle("All Jobs", { description: "Browse all available positions" });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { user } = useAuth();

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
  const [salaryRange, setSalaryRange] = useState([urlSalaryMin, urlSalaryMax]);
  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedSalary = useDebounce(salaryRange, 500);

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

  // ─── Sync salary → URL ───
  useEffect(() => {
    const [minV, maxV] = debouncedSalary;
    if (minV !== urlSalaryMin || maxV !== urlSalaryMax) {
      updateUrl({
        salary_min: minV > 0 ? String(minV) : null,
        salary_max: maxV < MAX_SALARY ? String(maxV) : null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSalary]);

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

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSalaryRange([0, MAX_SALARY]);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

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
          {/* ⭐ Position */}
          <div className="filter-item">
            <Select value={urlPosition} onValueChange={(v) => handleFilterChange('position', v)}>
              <SelectTrigger className="bg-white border border-slate-200 rounded-3xl px-4 py-2.5 text-[#616d7d] [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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

          {/* Level */}
          <div className="filter-item">
            <Select value={urlLevel} onValueChange={(v) => handleFilterChange('level', v)}>
              <SelectTrigger className="bg-white border border-slate-200 rounded-3xl px-4 py-2.5 text-[#616d7d] [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Entry">Entry Level</SelectItem>
                <SelectItem value="Mid">Mid Level</SelectItem>
                <SelectItem value="Senior">Senior Level</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type */}
          <div className="filter-item">
            <Select value={urlType} onValueChange={(v) => handleFilterChange('type', v)}>
              <SelectTrigger className="bg-white border border-slate-200 rounded-3xl px-4 py-2.5 text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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

          {/* Industry */}
          <div className="filter-item">
            <Select value={urlIndustry} onValueChange={(v) => handleFilterChange('industry', v)}>
              <SelectTrigger className="bg-white border border-slate-200 rounded-3xl px-4 py-2.5 text-[#616d7d] [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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
        </div>

        {/* Salary */}
        <div className="salary-filter-container">
          <div className="salary-header">
            <span className="salary-title">Salary Range:</span>
            <span className="salary-display-value">
              ${salaryRange[0].toLocaleString()} — ${salaryRange[1].toLocaleString()}
            </span>
          </div>
          <div className="slider-wrapper">
            <Slider
              value={salaryRange}
              onValueChange={setSalaryRange}
              max={MAX_SALARY}
              step={1000}
              className="salary-slider"
            />
          </div>
        </div>
      </div>

      {/* RESULT BAR */}
      <div className="all-jobs-result-bar">
        <div className="all-jobs-result-left">
          <span className="all-jobs-result-count">
            {isLoading ? 'Loading...' : `${total.toLocaleString()} jobs found`}
          </span>
          {hasActiveFilters() && (
            <button className="clear-filters-text" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        <div className="all-jobs-sort">
          <span className="sort-label">Sort by:</span>
          <Select value={urlSort} onValueChange={(v) => handleFilterChange('sort', v)}>
            <SelectTrigger className="sort-trigger">
              <SelectValue placeholder="Sort by" />
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
                    <div className={`Recommended-logo ${getJobLogoClass(job.title)}`}>
                      {job.logoLetter || job.title?.charAt(0) || 'J'}
                    </div>
                    <div>
                      <h4>{job.title}</h4>
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <span
                    className={`Recommended-favorite-btn ${isFavorited(job.id) ? "is-favorited" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(job);
                    }}
                  >
                    ♥
                  </span>
                </div>
                <div className="Recommended-tags">
                  {[job.type, job.level, job.work_mode || job.workMode]
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span key={idx}>{tag}</span>
                    ))}
                </div>
                <div className="Recommended-card-bottom">
                  <div>
                    <div className="Recommended-salary">{job.salary || 'N/A'}</div>
                    <div className="Recommended-applicants">
                      {job.applicants ? `${job.applicants}` : ''}
                    </div>
                  </div>
                  <div className={`Recommended-match-badge ${getMatchBadgeClass(job.match_score || job.match || 0)}`}>
                    {job.match_score || job.match || 0}%
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
    </div>
  );
}

export default AllJobs;