import { Link } from 'react-router-dom';
import { Briefcase, Building2, ArrowRight } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import { useLandingStats } from '../hooks/useLandingStats';
import '../styles/landing/Landing.css';

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

export default function Landing() {
  usePageTitle('Find Your Next Opportunity', {
    description: 'Discover jobs and internships matched to your skills. Browse thousands of openings from top companies.',
  });

  const { data: stats, isLoading } = useLandingStats();

  return (
    <div className="landing">
        <nav className="landing-nav">
            <div className="landing-logo">
                <img src="/Logo_in_app.svg" alt="JobJab" className="landing-logo-full" />
            </div>
            <div className="landing-nav-links">
                <Link to="/about" className="landing-nav-link">About</Link>
                <Link to="/login" className="landing-nav-link">Login</Link>
            </div>
        </nav>

      <main className="landing-hero">
        <h1 className="landing-title">
          Find your next opportunity.
          <br />
          <span className="landing-title-accent">Build your future.</span>
        </h1>

        <p className="landing-subtitle">
          Discover jobs and internships matched to your skills.
        </p>

        <Link to="/login" className="landing-hero-cta">
          Get Started
          <ArrowRight size={18} className="landing-hero-cta-arrow" />
        </Link>

        {!isLoading && stats && (
          <div className="landing-stats">
            <span className="landing-stat-item">
              <Briefcase size={16} />
              {formatNumber(stats.totalJobs)} jobs
            </span>
            <span className="landing-dot">·</span>
            <span className="landing-stat-item">
              <Building2 size={16} />
              {formatNumber(stats.totalCompanies)} companies
            </span>
          </div>
        )}

        {isLoading && (
          <div className="landing-stats">
            <span className="landing-stat-item">
              <Briefcase size={16} />
              <span className="landing-skeleton" aria-label="Loading" /> jobs
            </span>
            <span className="landing-dot">·</span>
            <span className="landing-stat-item">
              <Building2 size={16} />
              <span className="landing-skeleton" aria-label="Loading" /> companies
            </span>
          </div>
        )}
      </main>

      <footer className="landing-footer">
        <Link to="/about">About</Link>
        <span className="landing-dot">·</span>
        <span>2026 JobJab</span>
      </footer>
    </div>
  );
}