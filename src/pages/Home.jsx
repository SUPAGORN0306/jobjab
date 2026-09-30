import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useAuth } from "../context/AuthContext";
import { getMatchBadgeClass } from "../utils/matchBadge.js";
import MatchModal from '../components/MatchModal';
import FilterSheet from '../components/FilterSheet';
import useJobsQuery from '../hooks/useJobsQuery';
import useDebounce from '../hooks/useDebounce';
import { timeAgo } from '../utils/timeAgo';

// Lucide Icons
import {
  Flame,
  Info,
  ArrowRight,
  Cpu,
  BarChart3,
  Brain,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

import '../styles/home/Home.css';
import '../styles/home/RecommendedCard.css';
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import PageLoader from '../components/PageLoader';

// ============================================
// TRENDING
// ============================================

const TRENDING_CATEGORIES = [
  { label: "ML Engineer", Icon: Cpu },
  { label: "Data Analyst", Icon: BarChart3 },
  { label: "AI Researcher", Icon: Brain },
  { label: "NLP Engineer", Icon: MessageSquare },
  { label: "Data Scientist", Icon: TrendingUp },
];

const MAX_SALARY = 250000;
const PREVIEW_LIMIT = 20;

// ============================================
// COMPONENT
// ============================================

function Home() {
  usePageTitle("Home", { description: "Find your dream job with AI matching" });

  const { isFavorited, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // ─── Read filters from URL ───
  const urlQ = searchParams.get("q") || "";
  const urlPosition = searchParams.get("position") || "all";
  const urlLevel = searchParams.get("level") || "all";
  const urlType = searchParams.get("type") || "all";
  const urlIndustry = searchParams.get("industry") || "all";
  const urlSalaryMin = parseInt(searchParams.get("salary_min") || "0", 10);
  const urlSalaryMax = parseInt(searchParams.get("salary_max") || String(MAX_SALARY), 10);
  const urlSort = searchParams.get("sort") || "match";

  // ─── Local input state (สำหรับ debounce) ───
  const [searchInput, setSearchInput] = useState(urlQ);
  const [salaryRange, setSalaryRange] = useState([urlSalaryMin, urlSalaryMax]);
  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedSalary = useDebounce(salaryRange, 500);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  // ─── Sync search → URL (debounced) ───
  useEffect(() => {
    if (debouncedSearch !== urlQ) {
      updateUrl({ q: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ─── Sync salary → URL (debounced) ───
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

  // ─── useJobsQuery (preview 20) ───
  const {
    data,
    isLoading,
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
    limit: PREVIEW_LIMIT,
  });

  // ─── Derived data ───
  const jobs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page?.jobs || []);
  }, [data]);

  const pagination = data?.pages?.[0]?.pagination || {};
  const totalJobsCount = pagination.total || 0;
  const totalCompanies = pagination.total_companies || 0;
  const totalApplicants = pagination.total_applicants || 0;

  const featuredJob = jobs[0];
  const gridJobs = jobs.slice(1);

  // ─── Handlers ───
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      updateUrl({ q: searchInput.trim() });
    }
  };

  const handleFilterChange = (key, value) => {
    updateUrl({ [key]: value });
  };

  const clearFilters = () => {
    setSearchInput("");
    setSalaryRange([0, MAX_SALARY]);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (urlPosition !== 'all') count++;
    if (urlLevel !== 'all') count++;
    if (urlType !== 'all') count++;
    if (urlIndustry !== 'all') count++;
    if (urlSalaryMin > 0 || urlSalaryMax < MAX_SALARY) count++;
    return count;
  }, [urlPosition, urlLevel, urlType, urlIndustry, urlSalaryMin, urlSalaryMax]);

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

  // ─── "See all" URL (preserve filters) ───
  const seeAllUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (urlQ) params.set("q", urlQ);
    if (urlPosition !== "all") params.set("position", urlPosition);
    if (urlLevel !== "all") params.set("level", urlLevel);
    if (urlType !== "all") params.set("type", urlType);
    if (urlIndustry !== "all") params.set("industry", urlIndustry);
    if (urlSalaryMin > 0) params.set("salary_min", urlSalaryMin);
    if (urlSalaryMax < MAX_SALARY) params.set("salary_max", urlSalaryMax);
    if (urlSort !== "match") params.set("sort", urlSort);
    const qs = params.toString();
    return qs ? `/all-jobs?${qs}` : "/all-jobs";
  }, [urlQ, urlPosition, urlLevel, urlType, urlIndustry, urlSalaryMin, urlSalaryMax, urlSort]);

  // ─── Carousel scroll ───
  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  const handleScroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 340;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      updateScrollButtons();
    }, 100);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [jobs]);

  // ─── Shorthand for current salary display ───
  const minVal = salaryRange[0];
  const maxVal = salaryRange[1];

  return (
    <>
      <div className="container">
        <div className="logo">
          <img src="/Logo_in_app.svg" alt="JobLab" />
        </div>

        {/* ⭐ HERO (Desktop) */}
        <div className="top-page-1">
          <h2>Find your next <span>opportunity.</span><br />Build your <span>future.</span></h2>
          <p>Discover the right jobs and internships, compare salaries, and see the skills you need to succeed.</p>
        </div>

        {/* ⭐ MOBILE HERO */}
        <div className="mobile-hero">
          <h1>Find The Right <span>Job For You</span></h1>
        </div>

        {/* ⭐ MOBILE SEARCH + FILTER */}
        <div className="mobile-search-row">
          <div className="mobile-search-input-wrapper">
            <Search size={18} className="mobile-search-icon" />
            <input
              type="text"
              placeholder="Search jobs, companies..."
              className="mobile-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <button
            className="mobile-filter-btn"
            onClick={() => setShowFilterSheet(true)}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="mobile-filter-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* ⭐ QUICK STATS (Desktop) */}
        {!isLoading && (
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat-value">{totalJobsCount.toLocaleString()}</span>
              <span className="home-stat-label">Open Positions</span>
            </div>
            <div className="home-stat-divider"></div>
            <div className="home-stat">
              <span className="home-stat-value">{totalCompanies}</span>
              <span className="home-stat-label">Companies</span>
            </div>
            <div className="home-stat-divider"></div>
            <div className="home-stat">
              <span className="home-stat-value">{totalApplicants.toLocaleString()}</span>
              <span className="home-stat-label">Applicants</span>
            </div>
          </div>
        )}

        {/* ⭐ TRENDING (sync URL) */}
        <div className="trending-section">
          <span className="trending-label">
            <Flame size={16} />
            Trending:
          </span>
          <div className="trending-chips">
            {TRENDING_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                className={`trending-chip ${urlPosition === cat.label ? "active" : ""}`}
                onClick={() => {
                  handleFilterChange(
                    "position",
                    urlPosition === cat.label ? "all" : cat.label
                  );
                }}
              >
                <cat.Icon size={14} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ⭐ SEARCH + FILTER (Desktop) */}
        <div className="search-filter-section">
          <div className="search-box">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                className="search-input"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button
                className="search-btn"
                onClick={() => updateUrl({ q: searchInput.trim() })}
              >
                Search
              </button>
            </div>
          </div>

          <div className="filter-navbar">
            <div className="filter-item">
              <Select value={urlPosition} onValueChange={(v) => handleFilterChange('position', v)}>
                <SelectTrigger className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-[#616d7d] [&>span]:text-xs [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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
                <SelectTrigger className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-[#616d7d] [&>span]:text-xs [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Entry">Entry Level</SelectItem>
                  <SelectItem value="Mid">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-item">
              <Select value={urlType} onValueChange={(v) => handleFilterChange('type', v)}>
                <SelectTrigger className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-[#616d7d] [&>span]:text-xs [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-item">
              <Select value={urlIndustry} onValueChange={(v) => handleFilterChange('industry', v)}>
                <SelectTrigger className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-[#616d7d] [&>span]:text-xs [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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

          <div className="salary-filter-container">
            <div className="salary-header">
              <span className="salary-title">Salary Range:</span>
              <span className="salary-display-value">
                ${minVal.toLocaleString()} — ${maxVal.toLocaleString()}
              </span>
            </div>
            <div className="slider-wrapper">
              <Slider
                value={salaryRange}
                onValueChange={(val) => setSalaryRange(val)}
                max={MAX_SALARY}
                step={1000}
                className="salary-slider"
              />
            </div>
          </div>
        </div>

        {/* RECOMMENDED */}
        <div className="recommend-list w-full max-w-187.5 mx-auto mt-6 px-1">
          <div className="recommend-header-row">
            <div className="recommend-title-group">
              <h4 className="text-white font-bold text-lg m-0 whitespace-nowrap">
                Recommended for you
              </h4>

              <div className="sort-wrapper">
                <Select value={urlSort} onValueChange={(v) => handleFilterChange('sort', v)}>
                  <SelectTrigger className="sort-trigger">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Match Score</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="salary_high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary_low">Salary: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="recommend-actions">
              {hasActiveFilters() && (
                <button
                  className="clear-filters-text whitespace-nowrap"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              )}

              <span className="recommend-count">
                {isLoading
                  ? "Loading..."
                  : `Showing ${jobs.length} of ${totalJobsCount.toLocaleString()}`}
              </span>
            </div>
          </div>

          {isLoading && <PageLoader message="Loading jobs..." />}

          {!isLoading && jobs.length === 0 && (
            <div className="horizontal-scroll-empty">
              <p className="text-white text-base font-medium m-0">
                No jobs match your filters.
              </p>
            </div>
          )}

          {!isLoading && jobs.length > 0 && (
            <>
              {/* ⭐ FEATURED CARD */}
              {featuredJob && (
                <div className="featured-card-wrapper">
                  <Link
                    to={`/job/${featuredJob.id}`}
                    className="Recommended-card-link"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="featured-card">
                      <div className="featured-card-inner">
                        <div className="featured-badge">
                          <Sparkles size={11} />
                          TOP PICK FOR YOU
                        </div>

                        <div className="Recommended-card-top">
                          <div className="Recommended-company-info">
                            <div className={`Recommended-logo ${getJobLogoClass(featuredJob.title)}`}>
                              {featuredJob.logoLetter || featuredJob.title?.charAt(0) || 'J'}
                            </div>
                            <div>
                              <h4>{featuredJob.title}</h4>
                              <span>{featuredJob.company}</span>
                            </div>
                          </div>
                          <span
                            className={`Recommended-favorite-btn ${isFavorited(featuredJob.id) ? "is-favorited" : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(featuredJob);
                            }}
                          >
                            ♥
                          </span>
                        </div>

                        <div className="Recommended-tags">
                          {[featuredJob.type, featuredJob.level, featuredJob.work_mode || featuredJob.workMode].filter(Boolean).map((tag, idx) => (
                            <span key={idx}>{tag}</span>
                          ))}
                        </div>

                        <div className="Recommended-card-bottom">
                          <div>
                            <div className="Recommended-salary">{featuredJob.salary || 'N/A'}</div>
                            <div className="Recommended-applicants">
                              {featuredJob.applicants || ''}
                              {featuredJob.posted_date && ` · ${timeAgo(featuredJob.posted_date)}`}
                            </div>
                          </div>
                          <div
                            className={`Recommended-match-badge ${getMatchBadgeClass(featuredJob.match_score || featuredJob.match || 0)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedJobForMatch(featuredJob);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {featuredJob.match_score || featuredJob.match || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* ⭐ 2x2 GRID */}
              <div className="horizontal-scroll-wrapper">
                {canScrollLeft && (
                  <button
                    className="scroll-arrow scroll-arrow-left"
                    onClick={() => handleScroll("left")}
                  >
                    ‹
                  </button>
                )}

                <div
                  className="horizontal-scroll"
                  ref={scrollRef}
                  onScroll={updateScrollButtons}
                >
                  {gridJobs.map((job) => (
                    <Link
                      to={`/job/${job.id}`}
                      key={job.id}
                      className="Recommended-card-link horizontal-card"
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
                          {[job.type, job.level, job.work_mode || job.workMode].filter(Boolean).map((tag, idx) => (
                            <span key={idx}>{tag}</span>
                          ))}
                        </div>
                        <div className="Recommended-card-bottom">
                          <div>
                            <div className="Recommended-salary">{job.salary || 'N/A'}</div>
                            <div className="Recommended-applicants">
                              {job.applicants || ''}
                              {job.posted_date && ` · ${timeAgo(job.posted_date)}`}
                            </div>
                          </div>
                          <div
                            className={`Recommended-match-badge ${getMatchBadgeClass(job.match_score || job.match || 0)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedJobForMatch(job);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {job.match_score || job.match || 0}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {canScrollRight && (
                  <button
                    className="scroll-arrow scroll-arrow-right"
                    onClick={() => handleScroll("right")}
                  >
                    ›
                  </button>
                )}
              </div>
            </>
          )}

          {!isLoading && jobs.length > 0 && (
            <div className="see-all-wrapper">
              <Link to={seeAllUrl} className="see-all-btn">
                See all {totalJobsCount.toLocaleString()} jobs
              </Link>
            </div>
          )}
        </div>

        {/* ⭐ About link */}
        <div className="about-link-wrapper">
          <Link to="/about" className="about-link-btn">
            <Info size={16} />
            Learn more about JOBJAB
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* ⭐ MATCH MODAL */}
        {selectedJobForMatch && (
          <MatchModal
            job={selectedJobForMatch}
            onClose={() => setSelectedJobForMatch(null)}
          />
        )}
      </div>

      {/* ⭐ FILTER SHEET */}
      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        position={urlPosition} setPosition={(v) => handleFilterChange('position', v)}
        level={urlLevel} setLevel={(v) => handleFilterChange('level', v)}
        type={urlType} setType={(v) => handleFilterChange('type', v)}
        industry={urlIndustry} setIndustry={(v) => handleFilterChange('industry', v)}
        salaryRange={salaryRange} setSalaryRange={setSalaryRange}
        MAX_SALARY={MAX_SALARY}
        clearFilters={clearFilters}
      />
    </>
  );
}

export default Home;