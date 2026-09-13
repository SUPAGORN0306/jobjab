import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  X,
  Lightbulb,
  Wrench,
  Briefcase,
  Building2,
} from 'lucide-react';
import '../styles/components/MatchModal.css';

export default function MatchModal({ job, onClose }) {
  const navigate = useNavigate();

  if (!job) return null;

  const breakdown = job.match_breakdown || {
    skills: 0,
    experience: 0,
    industry: 0,
  };

  const matchedSkills = job.matched_skills || [];
  const missingSkills = job.missing_skills || [];

  // Suggestions
  const suggestions = [];
  if (breakdown.skills < 100 && missingSkills.length > 0) {
    suggestions.push({
      icon: Wrench,
      title: 'Add missing skills',
      detail: `Add ${missingSkills.slice(0, 3).join(', ')}`,
      impact: '+15%',
    });
  }
  if (breakdown.experience < 100) {
    suggestions.push({
      icon: Briefcase,
      title: 'Add more experience',
      detail: 'More years or detailed descriptions',
      impact: '+10%',
    });
  }
  if (breakdown.industry < 100) {
    suggestions.push({
      icon: Building2,
      title: 'Update your industry',
      detail: 'Match your industry to this job',
      impact: '+10%',
    });
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#80ffd5';
    if (score >= 40) return '#f0d154';
    return '#f472b6';
  };

  const getScoreMessage = (score) => {
    if (score >= 70) return { title: 'Great Match!', desc: "You're a strong candidate for this role" };
    if (score >= 40) return { title: 'Good Match', desc: 'You match several requirements' };
    return { title: "Let's Improve", desc: 'Add more info to boost your match' };
  };

  const message = getScoreMessage(job.match_score || 0);
  const scoreColor = getScoreColor(job.match_score || 0);

  return (
    <div className="match-modal-overlay" onClick={onClose}>
      <div className="match-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="match-modal-header">
          <div>
            <h2>Match Score Breakdown</h2>
            <p>
              {job.title} · <span>{job.company}</span>
            </p>
          </div>
          <button className="match-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Score Circle */}
        <div className="match-modal-score">
          <div
            className="score-circle"
            style={{
              background: `conic-gradient(${scoreColor} ${job.match_score}%, rgba(255,255,255,0.1) 0%)`,
            }}
          >
            <div className="score-circle-inner">
              <Target size={18} style={{ color: scoreColor }} />
              <span className="score-value">{job.match_score || 0}%</span>
            </div>
          </div>
          <div className="score-message">
            <h3 style={{ color: scoreColor }}>{message.title}</h3>
            <p>{message.desc}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="match-modal-breakdown">
          <h4>Match Breakdown</h4>

          {/* Skills */}
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">
                <Wrench size={14} />
                Skills Match
              </span>
              <span className="breakdown-value" style={{ color: getScoreColor(breakdown.skills) }}>
                {breakdown.skills}%
              </span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${breakdown.skills}%`,
                  background: getScoreColor(breakdown.skills),
                }}
              ></div>
            </div>
            {matchedSkills.length > 0 && (
              <div className="breakdown-details">
                <span className="detail-label">Matched:</span>
                <div className="skill-chips">
                  {matchedSkills.slice(0, 4).map((s, i) => (
                    <span className="skill-chip green" key={i}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="breakdown-details">
                <span className="detail-label">Missing:</span>
                <div className="skill-chips">
                  {missingSkills.slice(0, 4).map((s, i) => (
                    <span className="skill-chip red" key={i}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">
                <Briefcase size={14} />
                Experience Match
              </span>
              <span className="breakdown-value" style={{ color: getScoreColor(breakdown.experience) }}>
                {breakdown.experience}%
              </span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${breakdown.experience}%`,
                  background: getScoreColor(breakdown.experience),
                }}
              ></div>
            </div>
          </div>

          {/* Industry */}
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">
                <Building2 size={14} />
                Industry Fit
              </span>
              <span className="breakdown-value" style={{ color: getScoreColor(breakdown.industry) }}>
                {breakdown.industry}%
              </span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${breakdown.industry}%`,
                  background: getScoreColor(breakdown.industry),
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="match-modal-suggestions">
            <h4>
              <Lightbulb size={16} />
              Improve Your Score
            </h4>
            {suggestions.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div className="suggestion-row" key={idx}>
                  <div className="suggestion-icon-wrapper">
                    <Icon size={18} />
                  </div>
                  <div className="suggestion-info">
                    <h5>{s.title}</h5>
                    <p>{s.detail}</p>
                  </div>
                  <span className="suggestion-impact">{s.impact}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="match-modal-actions">
          <button className="match-modal-btn secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="match-modal-btn primary"
            onClick={() => {
              onClose();
              navigate('/profile/edit');
            }}
          >
            Improve Profile
          </button>
        </div>
      </div>
    </div>
  );
}