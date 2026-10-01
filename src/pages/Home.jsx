import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useAuth } from "../context/AuthContext";
import { getMatchBadgeClass } from "../utils/matchBadge.js";
import MatchModal from '../components/MatchModal';
import useJobsQuery from '../hooks/useJobsQuery';
import useDebounce from '../hooks/useDebounce';
import { timeAgo } from '../utils/timeAgo';

import {
  Flame,
  Info,
  ArrowRight,
  Cpu,
  BarChart3,
  Brain,
  MessageSquare,
  TrendingUp,
  Heart, 
  Search,
  Sparkles
} from 'lucide-react';

import '../styles/home/Home.css';
import '../styles/home/RecommendedCard.css';
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';
import PageLoader from '../components/PageLoader';

const TRENDING_CATEGORIES = [
  { label: "ML Engineer", Icon: Cpu },
  { label: "Data Analyst", Icon: BarChart3 },
  { label: "AI Researcher", Icon: Brain },
  { label: "NLP Engineer", Icon: MessageSquare },
  { label: "Data Scientist", Icon: TrendingUp },
];

const PREVIEW_LIMIT = 20;

function Home() {
  usePageTitle("Home", { description: "Find your dream job with AI matching" });

  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // ─── Read filters from URL (minimal) ───
  const urlQ = searchParams.get("q") || "";
  const urlSort = searchParams.get("sort") || "match";

  // ─── Local input state ───
  const [searchInput, setSearchInput] = useState(urlQ);
  const debouncedSearch = useDebounce(searchInput, 400);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Detect viewport
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' && window.innerWidth > 768
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // ─── useJobsQuery (preview 20) ───
  const { data, isLoading } = useJobsQuery({
    q: urlQ,
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

  // Desktop: ไม่มี featured, grid = jobs ทั้งหมด
  // Mobile: featured = jobs[0], grid = jobs[1..]
  const featuredJob = isDesktop ? null : jobs[0];
  const gridJobs = isDesktop ? jobs : jobs.slice(1);

  // ─── Handlers ───
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      updateUrl({ q: searchInput.trim() });
    }
  };

  // ⭐ Trending chip → navigate ไป AllJobs (preserve q)
  const handleTrendingClick = (position) => {
    const params = new URLSearchParams();
    if (urlQ) params.set("q", urlQ);
    params.set("position", position);
    navigate(`/all-jobs?${params.toString()}`);
  };

  const hasActiveFilters = () => urlQ !== "";

  // ─── "See all" URL (preserve q + sort) ───
  const seeAllUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (urlQ) params.set("q", urlQ);
    if (urlSort !== "match") params.set("sort", urlSort);
    const qs = params.toString();
    return qs ? `/all-jobs?${qs}` : "/all-jobs";
  }, [urlQ, urlSort]);

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

  return (
    <>
      <div className="container">
        {/* <div className="logo">
          <img src="/Logo_in_app.svg" alt="JobLab" />
        </div> */}

        {/* HERO (Desktop) */}
        <div className="top-page-1">
          <h2>Find your next <span>opportunity.</span><br />Build your <span>future.</span></h2>
          <p>Discover the right jobs and internships, compare salaries, and see the skills you need to succeed.</p>
        </div>

        {/* MOBILE HERO */}
        <div className="mobile-hero">
          <h1>Find The Right <span>Job For You</span></h1>
        </div>

        {/* MOBILE SEARCH */}
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
        </div>

        {/* QUICK STATS (Desktop) */}
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

        {/* TRENDING (navigate ไป AllJobs) */}
        <div className="trending-section">
          <span className="trending-label">
            <Flame size={16} />
            Trending:
          </span>
          <div className="trending-chips">
            {TRENDING_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                className="trending-chip"
                onClick={() => handleTrendingClick(cat.label)}
              >
                <cat.Icon size={14} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH (Desktop only — minimal) */}
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
                <Select value={urlSort} onValueChange={(v) => updateUrl({ sort: v })}>
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
                  onClick={() => {
                    setSearchInput("");
                    setSearchParams(new URLSearchParams(), { replace: true });
                  }}
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
                No jobs match your search.
              </p>
            </div>
          )}

          {!isLoading && jobs.length > 0 && (
            <>
              {/* FEATURED (Mobile only) */}
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
                            role="button"
                            aria-label={isFavorited(featuredJob.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart
                              size={20}
                              fill={isFavorited(featuredJob.id) ? 'currentColor' : 'none'}
                              stroke="currentColor"
                            />
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

              {/* GRID */}
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

        {/* About link */}
        <div className="about-link-wrapper">
          <Link to="/about" className="about-link-btn">
            <Info size={16} />
            Learn more about JOBJAB
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* MATCH MODAL */}
        {selectedJobForMatch && (
          <MatchModal
            job={selectedJobForMatch}
            onClose={() => setSelectedJobForMatch(null)}
          />
        )}
      </div>
    </>
  );
}

export default Home;
