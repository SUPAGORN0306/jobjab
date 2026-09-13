import { API_BASE } from '../utils/apiUrl';
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/candidate/JobDetail.css";
import { getCurrentUserId } from '../api';

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

function JobDetail() {

  const navigate = useNavigate();
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const response = await fetch(
          `${API_BASE}/jobs/${id}?user_id=${userId}`
        );
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setJob(data.job);
        }
      } catch (err) {
        console.error("❌ Error fetching job:", err);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);

  // แปลง JSON string เป็น array
  const parseArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  };

  if (loading) {
    return (
      <div className="job-detail-container">
        <Link to="/home" className="back-link">
          <span className="back-arrow">‹</span> Back to search
        </Link>
        <p className="job-not-found">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-detail-container">
        <Link to="/home" className="back-link">
          <span className="back-arrow">‹</span> Back to search
        </Link>
        <p className="job-not-found">Job not found</p>
      </div>
    );
  }

  const responsibilities = parseArray(job.responsibilities);
  const requirements = parseArray(job.requirements);
  const matchBreakdown = [
    {
      label: "Skills Match",
      percent: job.match_breakdown?.skills ?? job.match_score ?? 0,
    },
    {
      label: "Experience",
      percent: job.match_breakdown?.experience ?? 0,
    },
    {
      label: "Industry Fit",
      percent: job.match_breakdown?.industry ?? 0,
    },
  ];

  return (
    <div className="job-detail-container">
      <Link to="/home" className="back-link">
        <span className="back-arrow">‹</span> Back to search
      </Link>

      <div className="job-detail-grid">
        <div className="job-main-card">
          <div className="job-main-top">
            <div className="job-title-row">
              <div className={`job-logo ${getJobLogoClass(job.title)}`}>
                {job.title?.charAt(0) || 'J'}
              </div>
            </div>
            <button className="apply-btn" onClick={() => navigate(`/job/${job.id}/apply`)}>
              Apply now
            </button>
          </div>

          <h1 className="job-title">{job.title}</h1>
          <p className="job-meta">
            {job.company} · {job.location} · {job.work_mode || 'Remote'}
          </p>

          <div className="job-tags">
            <span>{job.type}</span>
            <span>{job.level}</span>
            {job.industry && <span>{job.industry}</span>}
            <span>{job.salary}</span>
          </div>

          <section className="job-section">
            <h3>About the role</h3>
            <p>{job.about_role || job.aboutRole || 'Job description not available.'}</p>
          </section>

          <section className="job-section">
            <h3>What you'll do</h3>
            <ul>
              {responsibilities.length > 0 ? (
                responsibilities.map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>Responsibilities not specified</li>
              )}
            </ul>
          </section>

          <section className="job-section">
            <h3>What we're looking for</h3>
            <ul>
              {requirements.length > 0 ? (
                requirements.map((item, i) => <li key={i}>{item}</li>)
              ) : (
                <li>Requirements not specified</li>
              )}
            </ul>
          </section>
        </div>

        <div className="job-sidebar">
          <div className="job-side-card">
            <h4>Match breakdown</h4>
            {matchBreakdown.map((item) => (
              <div className="match-row" key={item.label}>
                <div className="match-row-header">
                  <span>{item.label}</span>
                  <span>{item.percent}%</span>
                </div>
                <div className="match-bar-track">
                  <div
                    className="match-bar-fill"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="job-side-card">
            <h4>Quick facts</h4>
            {job.industry && (
              <div className="quick-fact-row">
                <span className="quick-fact-label">Industry</span>
                <span className="quick-fact-value">{job.industry}</span>
              </div>
            )}
            <div className="quick-fact-row">
              <span className="quick-fact-label">Posted</span>
              <span className="quick-fact-value">{job.posted_ago || 'Recently'}</span>
            </div>
            <div className="quick-fact-row">
              <span className="quick-fact-label">Team size</span>
              <span className="quick-fact-value">{job.team_size || 'TBD'}</span>
            </div>
            <div className="quick-fact-row">
              <span className="quick-fact-label">Visa sponsorship</span>
              <span className="quick-fact-value">{job.visa_sponsorship || 'TBD'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;