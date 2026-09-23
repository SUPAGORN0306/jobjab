import { Link } from 'react-router-dom';
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
  ArrowRight,
} from 'lucide-react';

import '../styles/candidate/About.css';

export default function About() {
  return (
    <div className="about-container">
      <div className="about-hero">
        <span className="about-hero-tag">
          <Star size={14} />
          ABOUT JOBJAB
        </span>
        <h1>Built for the modern <span>job market</span></h1>
        <p>Learn how JOBJAB connects talent with opportunity.</p>
      </div>

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
    </div>
  );
}