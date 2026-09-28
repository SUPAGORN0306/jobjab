import { Link } from 'react-router-dom';
import {
  Rocket,
  Briefcase,
  Star,
  Users,
  BarChart3,
  Target,
  Zap,
  DollarSign,
  Shield,
  ArrowRight,
  FileText,
  TrendingUp,
  Award,
  Building2,
} from 'lucide-react';

import '../styles/employer/EmployerAbout.css';
import usePageTitle from '../hooks/usePageTitle';

export default function EmployerAbout() {
  usePageTitle("About — For Employers", { description: "Learn how JobJab helps you hire" });

  return (
    <div className="employer-container emp-about-page">
      {/* ⭐ HERO */}
      <div className="emp-about-hero">
        <span className="emp-about-hero-tag">
          <Building2 size={14} />
          FOR EMPLOYERS
        </span>
        <h1>
          Hire smarter, <span>faster.</span><br />
          Build your <span>dream team.</span>
        </h1>
        <p>
          Everything you need to find, evaluate, and hire top talent —
          all in one place.
        </p>
        <div className="emp-about-hero-actions">
          <Link to="/employer/dashboard" className="emp-about-cta primary">
            Post a Job
            <ArrowRight size={16} />
          </Link>
          <Link to="/employer/analytics" className="emp-about-cta secondary">
            <BarChart3 size={16} />
            View Analytics
          </Link>
        </div>
      </div>

      {/* ⭐ WHY JOBJAB */}
      <section className="emp-about-section">
        <div className="emp-about-section-header">
          <span className="emp-about-tag">
            <Star size={14} />
            WHY JOBJAB
          </span>
          <h2>Built for modern hiring teams</h2>
          <p>Tools that save you time and help you find the right candidate — every time.</p>
        </div>

        <div className="emp-about-grid">
          <div className="emp-about-card">
            <div className="emp-about-icon yellow">
              <Target size={24} />
            </div>
            <h3>Match Score v2</h3>
            <p>See how well each candidate fits — powered by skills, experience, and industry alignment.</p>
          </div>

          <div className="emp-about-card">
            <div className="emp-about-icon mint">
              <Users size={24} />
            </div>
            <h3>Applicant Pipeline</h3>
            <p>Move candidates through applied → reviewing → interview → hired with one click.</p>
          </div>

          <div className="emp-about-card">
            <div className="emp-about-icon blue">
              <BarChart3 size={24} />
            </div>
            <h3>Real-time Analytics</h3>
            <p>Track applications, response rates, and top-performing jobs — export to CSV anytime.</p>
          </div>

          <div className="emp-about-card">
            <div className="emp-about-icon purple">
              <Zap size={24} />
            </div>
            <h3>Fast Posting</h3>
            <p>Create detailed job listings in minutes with our streamlined form.</p>
          </div>

          <div className="emp-about-card">
            <div className="emp-about-icon pink">
              <Shield size={24} />
            </div>
            <h3>Secure & Private</h3>
            <p>JWT authentication, encrypted storage, and full control over your data.</p>
          </div>

          <div className="emp-about-card">
            <div className="emp-about-icon amber">
              <DollarSign size={24} />
            </div>
            <h3>100% Free</h3>
            <p>No hidden fees. Post unlimited jobs and manage applicants without cost.</p>
          </div>
        </div>
      </section>

      {/* ⭐ HOW IT WORKS */}
      <section className="emp-about-section">
        <div className="emp-about-section-header">
          <span className="emp-about-tag">
            <Rocket size={14} />
            HOW IT WORKS
          </span>
          <h2>From posting to hiring in 4 steps</h2>
        </div>

        <div className="emp-about-steps">
          <div className="emp-about-step">
            <span className="step-num">01</span>
            <div className="step-icon">
              <FileText size={20} />
            </div>
            <h4>Post your job</h4>
            <p>Fill in role details, required skills, and salary range in minutes.</p>
          </div>

          <div className="emp-about-step">
            <span className="step-num">02</span>
            <div className="step-icon">
              <Users size={20} />
            </div>
            <h4>Review applicants</h4>
            <p>See candidate profiles with match scores, skills, and experience.</p>
          </div>

          <div className="emp-about-step">
            <span className="step-num">03</span>
            <div className="step-icon">
              <TrendingUp size={20} />
            </div>
            <h4>Track pipeline</h4>
            <p>Move candidates through stages and keep your team aligned.</p>
          </div>

          <div className="emp-about-step">
            <span className="step-num">04</span>
            <div className="step-icon">
              <Award size={20} />
            </div>
            <h4>Hire the best</h4>
            <p>Compare candidates and make confident hiring decisions.</p>
          </div>
        </div>
      </section>

      {/* ⭐ CTA */}
      <section className="emp-about-cta-section">
        <div className="emp-about-cta-content">
          <h2>Ready to find your next hire?</h2>
          <p>Join hundreds of employers already using JOBJAB.</p>
          <div className="emp-about-cta-buttons">
            <Link to="/employer/dashboard" className="emp-about-cta primary">
              Post a Job
              <ArrowRight size={16} />
            </Link>
            <Link to="/employer/jobs" className="emp-about-cta secondary">
              <Briefcase size={16} />
              View My Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
