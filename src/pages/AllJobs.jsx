import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useAuth } from "../context/AuthContext";
import { getMatchBadgeClass } from "../utils/matchBadge.js";
import { fetchJobsWithMatch } from '../api';
import '../styles/candidate/AllJobs.css';
import '../styles/home/RecommendedCard.css';
import { JobListSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { Search, Target, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import usePageTitle from '../hooks/usePageTitle';

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

const getJobLogoClass = (title) => {
  switch (title) {
    case "AI Product Manager": return "logo-ai-product-manager";
    case "AI Researcher": return "logo-ai-researcher";
    case "Computer Vision Engineer": return "logo-computer-vision";
    case "Data Analyst": return "logo-data-analyst";
    case "Data Scientist": return "logo-data-scientist";
    case "ML Engineer": return "logo-ml-engineer";
    case "NLP Engineer": return "logo-nlp-engineer";
    case "Quant Researcher": return "logo-quant-researcher";
    default: return "bg-blue-500";
  }
};

// ============================================
// COMPONENT
// ============================================

function AllJobs() {
  usePageTitle("All Jobs", { description: "Browse all available positions" });

  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  const MAX_SALARY = 250000;
  const [salaryRange, setSalaryRange] = useState([0, MAX_SALARY]);
  const minVal = salaryRange[0];
  const maxVal = salaryRange[1];

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(24);
  const [sortBy, setSortBy] = useState("match");

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

  // ============================================
  // FILTERED + SORTED
  // ============================================

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
      default:
        break;
    }

    return sorted;
  }, [jobs, searchQuery, position, level, type, industry, minVal, maxVal, sortBy]);

  const visibleJobs = useMemo(() => {
    return filteredJobs.slice(0, visibleCount);
  }, [filteredJobs, visibleCount]);

  const hasMore = visibleCount < filteredJobs.length;

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

  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, position, level, type, industry, minVal, maxVal, sortBy]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="all-jobs-container">
      {/* ⭐ HEADER ⭐ */}
      <div className="all-jobs-header">
        <button className="all-jobs-back" onClick={() => navigate('/home')}>
          ‹ Back to Home
        </button>
        <div className="all-jobs-title-row">
          <div>
            <h1>All Jobs</h1>
            <p className="all-jobs-subtitle">
              {loading ? 'Loading...' : `${filteredJobs.length.toLocaleString()} positions available`}
            </p>
          </div>
        </div>
      </div>

      {/* ⭐ FILTER BAR ⭐ */}
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
          <button className="search-btn" onClick={runSearch}>Search</button>
        </div>

        <div className="filter-navbar">
          <div className="filter-item">
            <Select value={position} onValueChange={setPosition}>
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

          <div className="filter-item">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="bg-white border border-slate-200 rounded-3xl px-4 py-2.5 text-[#616d7d] [&>span]:text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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
              <SelectTrigger className="bg-white border border-slate-200 rounded-3xl px-4 py-2.5 text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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

      {/* ⭐ RESULT BAR ⭐ */}
      <div className="all-jobs-result-bar">
        <div className="all-jobs-result-left">
          <span className="all-jobs-result-count">
            {loading ? 'Loading...' : `${filteredJobs.length.toLocaleString()} jobs found`}
          </span>
          {hasActiveFilters() && (
            <button className="clear-filters-text" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        <div className="all-jobs-sort">
          <span className="sort-label">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
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

      {/* ⭐ JOB GRID ⭐ */}
      {loading && <JobListSkeleton count={6} />}

      {!loading && filteredJobs.length === 0 && (
        <EmptyState
          icon={Search}
          title="ไม่พบงานที่ตรงกับตัวกรอง"
          description="ลองปรับการค้นหาหรือล้างตัวกรอง"
          actionLabel="ล้างตัวกรองทั้งหมด"
          onAction={clearFilters}
        />
      )}

      {!loading && visibleJobs.length > 0 && (
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

      {/* ⭐ LOAD MORE ⭐ */}
      {!loading && hasMore && (
        <div className="all-jobs-load-more-wrapper">
          <button
            className="all-jobs-load-more-btn"
            onClick={() => setVisibleCount((c) => c + 24)}
          >
            Load More
            <span className="all-jobs-load-more-count">
              {filteredJobs.length - visibleCount} remaining
            </span>
          </button>
        </div>
      )}

      {/* END MESSAGE */}
      {!loading && !hasMore && filteredJobs.length > 0 && (
        <p className="all-jobs-end-message">
          You've seen all {filteredJobs.length} jobs
        </p>
      )}
    </div>
  );
}

export default AllJobs;