import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { JobListSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { getMatchBadgeClass } from "../utils/matchBadge.js";
import { fetchJobsWithMatch } from '../api';
import MatchModal from '../components/MatchModal';
import FilterSheet from '../components/FilterSheet';

// ⭐ Lucide Icons
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

// ============================================
// SEARCH HELPERS
// ============================================

const normalize = (str) =>
  (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const tokenize = (str) =>
  (str || "")
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter(Boolean);

const matchesQuery = (text, query) => {
  if (!query) return true;
  if (!text) return false;
  const normText = normalize(text);
  const normQuery = normalize(query);
  if (normText.includes(normQuery)) return true;
  const tokens = tokenize(query);
  if (tokens.length > 1) {
    return tokens.every((token) => normText.includes(token));
  }
  return false;
};

// ============================================
// JOB LOGO CLASS
// ============================================


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

// ============================================
// COMPONENT
// ============================================

function Home() {
  usePageTitle("Home", { description: "Find your dream job with AI matching" });

  const { isFavorited, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const MAX_SALARY = 250000;
  const [salaryRange, setSalaryRange] = useState([0, MAX_SALARY]);
  const minVal = salaryRange[0];
  const maxVal = salaryRange[1];

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("match");

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ⭐ Fetch jobs — ใช้ cookies + user.id
  useEffect(() => {
    const userId = user?.id;

    fetchJobsWithMatch(userId)
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, [user]);

  const TOTAL_JOBS_AVAILABLE = jobs.length;
  const totalCompanies = useMemo(() => {
    return new Set(jobs.map((j) => j.company).filter(Boolean)).size;
  }, [jobs]);
  const totalApplicants = useMemo(() => {
    return jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0);
  }, [jobs]);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState("all");
  const [level, setLevel] = useState("all");
  const [type, setType] = useState("all");
  const [industry, setIndustry] = useState("all");

  const runSearch = () => setSearchQuery(searchInput.trim());
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") runSearch();
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setPosition("all");
    setLevel("all");
    setType("all");
    setIndustry("all");
    setSalaryRange([0, MAX_SALARY]);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (position !== 'all') count++;
    if (level !== 'all') count++;
    if (type !== 'all') count++;
    if (industry !== 'all') count++;
    if (salaryRange[0] > 0 || salaryRange[1] < MAX_SALARY) count++;
    return count;
  }, [position, level, type, industry, salaryRange, MAX_SALARY]);

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      if (searchQuery) {
        const searchFields = [
          job.title, job.company, job.location, job.industry,
          job.type, job.level, job.about_role, job.aboutRole,
          job.skills_required, job.tools_preferred,
        ];
        const matchesSearch = searchFields.some((field) =>
          matchesQuery(field, searchQuery)
        );
        if (!matchesSearch) return false;
      }
      if (position && position !== "all" && job.title !== position) return false;
      if (level && level !== "all") {
        const jobLevel = job.level?.toLowerCase() || "";
        const matchesLevel =
          jobLevel === level.toLowerCase() ||
          jobLevel.includes(level.toLowerCase()) ||
          (level === "mid" && jobLevel.includes("middle"));
        if (!matchesLevel) return false;
      }
      if (type && type !== "all" && job.type !== type) return false;
      if (industry && industry !== "all" && job.industry !== industry) return false;
      const jobMinSalary = job.salary_min || 0;
      const jobMaxSalary = job.salary_max || jobMinSalary;
      if (jobMinSalary > 0 || jobMaxSalary > 0) {
        const overlaps = jobMaxSalary >= minVal && jobMinSalary <= maxVal;
        if (!overlaps) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case "match":
        sorted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        break;
      case "newest":
        sorted.sort((a, b) => {
          const da = a.posted_date ? new Date(a.posted_date) : 0;
          const db = b.posted_date ? new Date(b.posted_date) : 0;
          return db - da;
        });
        break;
      case "salary_high":
        sorted.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
        break;
      case "salary_low":
        sorted.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
        break;
      default: break;
    }
    return sorted;
  }, [jobs, searchQuery, position, level, type, industry, minVal, maxVal, sortBy]);

  const displayJobs = useMemo(() => {
    return filteredJobs.slice(0, 20);
  }, [filteredJobs]);

  const featuredJob = displayJobs[0];
  const gridJobs = displayJobs.slice(1);

  const hasActiveFilters = () => {
    return (
      searchInput.trim() !== "" ||
      searchQuery !== "" ||
      position !== "all" ||
      level !== "all" ||
      type !== "all" ||
      industry !== "all" ||
      salaryRange[0] > 0 ||
      salaryRange[1] < MAX_SALARY
    );
  };

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
  }, [displayJobs]);

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
        {!loading && (
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat-value">{TOTAL_JOBS_AVAILABLE.toLocaleString()}</span>
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

        {/* ⭐ TRENDING */}
        <div className="trending-section">
          <span className="trending-label">
            <Flame size={16} />
            Trending:
          </span>
          <div className="trending-chips">
            {TRENDING_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                className={`trending-chip ${position === cat.label ? "active" : ""}`}
                onClick={() => {
                  setPosition(position === cat.label ? "all" : cat.label);
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
              <button className="search-btn" onClick={runSearch}>Search</button>
            </div>
          </div>

          <div className="filter-navbar">
            <div className="filter-item">
              <Select value={position} onValueChange={setPosition}>
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
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-[#616d7d] [&>span]:text-xs [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-item">
              <Select value={type} onValueChange={setType}>
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
              <Select value={industry} onValueChange={setIndustry}>
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

        {/* ⭐ RECOMMENDED */}
        <div className="recommend-list w-full max-w-187.5 mx-auto mt-6 px-1">
          <div className="recommend-header-row">
            <div className="recommend-title-group">
              <h4 className="text-white font-bold text-lg m-0 whitespace-nowrap">
                Recommended for you
              </h4>

              <div className="sort-wrapper">
                <Select value={sortBy} onValueChange={setSortBy}>
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
                {loading
                  ? "Loading..."
                  : `Showing ${displayJobs.length} of ${filteredJobs.length}`}
              </span>
            </div>
          </div>

          {loading && (
            <div style={{ padding: '0 4px' }}>
              <JobListSkeleton count={3} />
            </div>
          )}

          {!loading && filteredJobs.length === 0 && (
            <div className="horizontal-scroll-empty">
              <p className="text-white text-base font-medium m-0">
                No jobs match your filters.
              </p>
            </div>
          )}

          {!loading && displayJobs.length > 0 && (
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
                            <div className="Recommended-applicants">{featuredJob.applicants || ''}</div>
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
                            <div className="Recommended-applicants">{job.applicants || ''}</div>
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

          {!loading && displayJobs.length > 0 && (
            <div className="see-all-wrapper">
              <Link to="/all-jobs" className="see-all-btn">
                See all {filteredJobs.length.toLocaleString()} jobs
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
        position={position} setPosition={setPosition}
        level={level} setLevel={setLevel}
        type={type} setType={setType}
        industry={industry} setIndustry={setIndustry}
        salaryRange={salaryRange} setSalaryRange={setSalaryRange}
        MAX_SALARY={MAX_SALARY}
        clearFilters={clearFilters}
      />
    </>
  );
}

export default Home;