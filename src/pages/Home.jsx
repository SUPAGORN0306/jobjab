import { API_BASE } from '../utils/apiUrl';
import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { getMatchBadgeClass } from "../utils/matchBadge.js";
import { getCurrentUserId } from '../api';
import MatchModal from '../components/MatchModal';

// ⭐ Lucide Icons
import {
  Rocket,
  Briefcase,
  Star,
  FileText,
  Users,
  BarChart3,
  Target,
  Zap,
  DollarSign,
  Shield,
  Flame,
  ArrowRight,
  GraduationCap,
  Wrench,
} from 'lucide-react';

import '../styles/home/Home.css';
import '../styles/home/RecommendedCard.css';

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
// TRENDING CATEGORIES
// ============================================

const TRENDING_CATEGORIES = [
  { label: "ML Engineer", icon: "🤖" },
  { label: "Data Analyst", icon: "📊" },
  { label: "AI Researcher", icon: "🧠" },
  { label: "NLP Engineer", icon: "💬" },
  { label: "Data Scientist", icon: "📈" },
];

// ============================================
// COMPONENT
// ============================================

function Home() {
  const { isFavorited, toggleFavorite } = useFavorites();

  const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);

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

  useEffect(() => {
    const userId = getCurrentUserId();
    fetch(`${API_BASE}/jobs?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

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

  const displayJobs = useMemo(() => {
    return filteredJobs.slice(0, 20);
  }, [filteredJobs]);

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

        <div className="top-page-1">
          <h2>Find your next <span>opportunity.</span><br />Build your <span>future.</span></h2>
          <p>Discover the right jobs and internships, compare salaries, and see the skills you need to succeed.</p>
        </div>

        {/* ⭐ QUICK STATS ⭐ */}
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

        {/* ⭐ TRENDING ⭐ */}
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
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ⭐ SEARCH + FILTER ⭐ */}
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
                <SelectTrigger className="custom-select-trigger bg-white border border-slate-200 rounded-3xl px-4 py-2.5 text-[#616d7d] hover:bg-white/10 transition-all h-auto">
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

        {/* ⭐ RECOMMENDED ⭐ */}
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
                    <SelectItem value="match">🎯 Match Score</SelectItem>
                    <SelectItem value="newest">🆕 Newest</SelectItem>
                    <SelectItem value="salary_high">💰 Salary: High to Low</SelectItem>
                    <SelectItem value="salary_low">💵 Salary: Low to High</SelectItem>
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
            <div className="horizontal-scroll-empty">
              <p className="text-white text-base font-medium m-0">Loading...</p>
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
            <div className="horizontal-scroll-wrapper">
              {canScrollLeft && (
                <button
                  className="scroll-arrow scroll-arrow-left"
                  onClick={() => handleScroll("left")}
                  aria-label="Scroll left"
                >
                  ‹
                </button>
              )}

              <div
                className="horizontal-scroll"
                ref={scrollRef}
                onScroll={updateScrollButtons}
              >
                {displayJobs.map((job) => (
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
                          <div className="Recommended-applicants">{job.applicants ? `${job.applicants}` : ''}</div>
                        </div>
                        <div
                          className={`Recommended-match-badge ${getMatchBadgeClass(job.match_score || job.match || 0)}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedJobForMatch(job);
                          }}
                          style={{ cursor: 'pointer' }}
                          title="Click to see match breakdown"
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
                  aria-label="Scroll right"
                >
                  ›
                </button>
              )}
            </div>
          )}

          {!loading && displayJobs.length > 0 && (
            <div className="see-all-wrapper">
              <Link to="/all-jobs" className="see-all-btn">
                See all {filteredJobs.length.toLocaleString()} jobs
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* ⭐ SECTION 1: HOW IT WORKS ⭐ */}
        {/* ============================================ */}
        <section className="landing-section">
          <div className="landing-grid">
            <div className="landing-image-wrapper">
              <img
                src="/job-seeker.jpg"
                alt="Job Seeker"
                className="landing-image"
                loading="lazy"
              />
              <div className="landing-image-badge">For Job Seekers</div>
            </div>

            <div className="landing-content">
              <span className="landing-tag">
                <Rocket size={14} />
                HOW IT WORKS
              </span>
              <h2>Find your dream job in 3 simple steps</h2>
              <p className="landing-description">
                We make job hunting effortless. Create your profile once,
                get matched with jobs that fit your skills, and apply with a single click.
              </p>

              <div className="landing-steps">
                <div className="landing-step">
                  <span className="step-number">01</span>
                  <div>
                    <h4>Create your profile</h4>
                    <p>Add your skills, experience, and let us understand your strengths.</p>
                  </div>
                </div>
                <div className="landing-step">
                  <span className="step-number">02</span>
                  <div>
                    <h4>Browse matched jobs</h4>
                    <p>See personalized recommendations based on your profile.</p>
                  </div>
                </div>
                <div className="landing-step">
                  <span className="step-number">03</span>
                  <div>
                    <h4>Apply & get hired</h4>
                    <p>One-click apply. Track your applications in real-time.</p>
                  </div>
                </div>
              </div>

              <Link to="/profile/edit" className="landing-btn">
                Complete Your Profile
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* ⭐ SECTION 2: FOR EMPLOYERS ⭐ */}
        {/* ============================================ */}
        <section className="landing-section landing-reverse">
          <div className="landing-grid">
            <div className="landing-content">
              <span className="landing-tag">
                <Briefcase size={14} />
                FOR EMPLOYERS
              </span>
              <h2>Hire the best talent, faster</h2>
              <p className="landing-description">
                Post your job openings and reach thousands of qualified candidates.
                Manage applications, track candidates, and build your dream team.
              </p>

              <div className="landing-features">
                <div className="landing-feature">
                  <div className="feature-icon">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4>Post jobs for free</h4>
                    <p>Create detailed job listings in minutes.</p>
                  </div>
                </div>
                <div className="landing-feature">
                  <div className="feature-icon">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4>Review applicants</h4>
                    <p>See candidate profiles with skills and experience.</p>
                  </div>
                </div>
                <div className="landing-feature">
                  <div className="feature-icon">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h4>Track hiring pipeline</h4>
                    <p>Move candidates from applied to interview to hired.</p>
                  </div>
                </div>
              </div>

              <Link to="/?role=employer" className="landing-btn">
                Post a Job
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="landing-image-wrapper">
              <img
                src="/employer.jpg"
                alt="Employer"
                className="landing-image"
                loading="lazy"
              />
              <div className="landing-image-badge">For Employers</div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* ⭐ SECTION 3: WHY CHOOSE US ⭐ */}
        {/* ============================================ */}
        <section className="landing-why">
          <div className="landing-why-header">
            <span className="landing-tag">
              <Star size={14} />
              WHY JOBJAB
            </span>
            <h2>Built for the modern job market</h2>
            <p>Everything you need to succeed — for both candidates and employers.</p>
          </div>

          <div className="landing-why-grid">
            <div className="landing-why-card">
              <div className="why-icon">
                <Target size={28} />
              </div>
              <h3>Match Score</h3>
              <p>See how well you match each job — powered by skills, experience, and industry.</p>
            </div>
            <div className="landing-why-card">
              <div className="why-icon">
                <Zap size={28} />
              </div>
              <h3>1-Click Apply</h3>
              <p>Apply to multiple jobs instantly with your saved profile.</p>
            </div>
            <div className="landing-why-card">
              <div className="why-icon">
                <DollarSign size={28} />
              </div>
              <h3>100% Free</h3>
              <p>No hidden fees. Free for candidates and employers alike.</p>
            </div>
            <div className="landing-why-card">
              <div className="why-icon">
                <Shield size={28} />
              </div>
              <h3>Privacy First</h3>
              <p>Your data is yours. We never share without your permission.</p>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* ⭐ SECTION 4: FINAL CTA ⭐ */}
        {/* ============================================ */}
        <section className="landing-cta">
          <div className="landing-cta-content">
            <h2>Ready to find your dream job?</h2>
            <p>Join thousands of candidates and employers already using JOBJAB.</p>
            <div className="landing-cta-buttons">
              <Link to="/all-jobs" className="landing-cta-btn primary">
                Browse Jobs
                <ArrowRight size={16} />
              </Link>
              <Link to="/profile/edit" className="landing-cta-btn secondary">
                Create Profile
              </Link>
            </div>
          </div>
        </section>
        {/* ⭐ MATCH MODAL ⭐ */}
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