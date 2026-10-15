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

// ⭐ helper
const safeStr = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(safeStr).filter(Boolean).join(', ');
  if (typeof v === 'object') {
    return v.name || v.skill_name || v.label || v.title || '';
  }
  return String(v);
};

const safeArr = (v) => (Array.isArray(v) ? v : []);

const parseScore = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const DEFAULT_WEIGHTS = {
  skills: 0.5,
  experience: 0.3,
  industry: 0.2,
};

export default function MatchModal({ job, onClose }) {
  const navigate = useNavigate();

  if (!job) return null;

  const score = Number(job.match_score) || Number(job.match) || 0;

  const breakdown = job.match_breakdown && typeof job.match_breakdown === 'object'
    ? {
        skills: parseScore(job.match_breakdown.skills),
        experience: parseScore(job.match_breakdown.experience),
        industry: parseScore(job.match_breakdown.industry),
      }
    : { skills: null, experience: null, industry: null };

  // ⭐ detail จาก backend
  const industryDetail = job.match_breakdown?.industry_detail || {};
  const experienceDetail = job.match_breakdown?.experience_detail || {};
  const skillsDetail = job.match_breakdown?.skills_detail || {};

  const hasSkills = breakdown.skills !== null;

  const matchedSkills = safeArr(job.matched_skills);
  const missingSkills = safeArr(job.missing_skills);
  const matchedSkillStrings = matchedSkills.map(safeStr).filter(Boolean);
  const missingSkillStrings = missingSkills.map(safeStr).filter(Boolean);

  const weights = job.match_breakdown?.weights || DEFAULT_WEIGHTS;

  function calcImpact(component, currentValue) {
    if (currentValue === null || currentValue === undefined) return 0;
    if (currentValue >= 100) return 0;
    const w = weights[component] || 0;
    return Math.round((100 - currentValue) * w);
  }

  // ═══════════════════════════════════════════════════════════════
  // ⭐ Suggestions — พร้อม detail ที่ชัดเจน
  // ═══════════════════════════════════════════════════════════════
  const suggestions = [];

  // ── Skills ──
  if (hasSkills && breakdown.skills < 100 && missingSkillStrings.length > 0) {
    const impact = calcImpact('skills', breakdown.skills);
    if (impact > 0) {
      suggestions.push({
        icon: Wrench,
        title: 'Add missing skills',
        detail: `Add ${missingSkillStrings.slice(0, 3).join(', ')}`,
        impact: `+${impact}%`,
      });
    }
  }

  // ── Experience ──
  if (breakdown.experience !== null && breakdown.experience < 100) {
    const impact = calcImpact('experience', breakdown.experience);
    const userYears = experienceDetail.user_years;
    const reqYears = experienceDetail.required_years;

    if (impact > 0) {
      const detailText = (userYears !== undefined && reqYears !== undefined)
        ? `You have ${userYears} yrs, need ${reqYears} yrs`
        : 'Add more years or detailed descriptions';

      suggestions.push({
        icon: Briefcase,
        title: 'Add more experience',
        detail: detailText,
        impact: `+${impact}%`,
      });
    }
  }

  // ── Industry ──
  if (breakdown.industry !== null && breakdown.industry < 100) {
    const impact = calcImpact('industry', breakdown.industry);
    const userInd = industryDetail.user_industry;
    const jobInd = industryDetail.job_industry;

    if (impact > 0) {
      let detailText = 'Match your industry to this job';
      if (userInd && jobInd) {
        detailText = `Change from "${userInd}" to "${jobInd}"`;
      } else if (jobInd && !userInd) {
        detailText = `Set your industry to "${jobInd}"`;
      } else if (!jobInd && userInd) {
        detailText = 'Job does not specify industry';
      }

      suggestions.push({
        icon: Building2,
        title: 'Update your industry',
        detail: detailText,
        impact: `+${impact}%`,
      });
    }
  }

  suggestions.sort((a, b) => {
    const ia = parseInt(a.impact.replace('+', '')) || 0;
    const ib = parseInt(b.impact.replace('+', '')) || 0;
    return ib - ia;
  });

  const getScoreColor = (s) => {
    if (s === null || s === undefined) return '#94a3b8';
    if (s >= 70) return '#80ffd5';
    if (s >= 40) return '#f0d154';
    return '#f472b6';
  };

  const getScoreMessage = (s) => {
    if (s >= 85) return { title: 'Excellent Match!', desc: "You're a top candidate for this role" };
    if (s >= 70) return { title: 'Great Match!', desc: "You're a strong candidate for this role" };
    if (s >= 55) return { title: 'Good Match', desc: 'You match several requirements' };
    if (s >= 40) return { title: 'Fair Match', desc: 'Some gaps to fill' };
    return { title: "Let's Improve", desc: 'Add more info to boost your match' };
  };

  const message = getScoreMessage(score);
  const scoreColor = getScoreColor(score);

  return (
    <div className="match-modal-overlay" onClick={onClose}>
      <div className="match-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="match-modal-header">
          <div>
            <h2>Match Score Breakdown</h2>
            <p>
              {safeStr(job.title || job.job_title)} · <span>{safeStr(job.company || job.company_name)}</span>
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
              background: `conic-gradient(${scoreColor} ${score}%, rgba(255,255,255,0.1) 0%)`,
            }}
          >
            <div className="score-circle-inner">
              <Target size={18} style={{ color: scoreColor }} />
              <span className="score-value">{score}%</span>
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
              {hasSkills ? (
                <span className="breakdown-value" style={{ color: getScoreColor(breakdown.skills) }}>
                  {breakdown.skills}%
                </span>
              ) : (
                <span className="breakdown-value" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  Not specified
                </span>
              )}
            </div>

            {hasSkills ? (
              <>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{
                      width: `${breakdown.skills}%`,
                      background: getScoreColor(breakdown.skills),
                    }}
                  />
                </div>

                {matchedSkillStrings.length > 0 && (
                  <div className="breakdown-details">
                    <span className="detail-label">Matched:</span>
                    <div className="skill-chips">
                      {matchedSkillStrings.slice(0, 4).map((s, i) => (
                        <span className="skill-chip green" key={i}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {missingSkillStrings.length > 0 && (
                  <div className="breakdown-details">
                    <span className="detail-label">Missing:</span>
                    <div className="skill-chips">
                      {missingSkillStrings.slice(0, 4).map((s, i) => (
                        <span className="skill-chip red" key={i}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm italic mt-2">
                This job doesn't specify required skills.
              </p>
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
                {breakdown.experience !== null ? `${breakdown.experience}%` : '—'}
              </span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${breakdown.experience ?? 0}%`,
                  background: getScoreColor(breakdown.experience),
                }}
              />
            </div>
            {/* ⭐ detail */}
            {experienceDetail.required_years !== undefined && (
              <div className="breakdown-details">
                <span className="detail-label">
                  {experienceDetail.required_years === 0
                    ? 'Entry level — no experience required'
                    : `${experienceDetail.user_years} yrs of ${experienceDetail.required_years} yrs required`}
                </span>
              </div>
            )}
          </div>

          {/* Industry */}
          <div className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">
                <Building2 size={14} />
                Industry Fit
              </span>
              <span className="breakdown-value" style={{ color: getScoreColor(breakdown.industry) }}>
                {breakdown.industry !== null ? `${breakdown.industry}%` : '—'}
              </span>
            </div>
            <div className="breakdown-bar">
              <div
                className="breakdown-fill"
                style={{
                  width: `${breakdown.industry ?? 0}%`,
                  background: getScoreColor(breakdown.industry),
                }}
              />
            </div>
            {/* ⭐ detail */}
            {industryDetail.user_industry && industryDetail.job_industry && (
              <div className="breakdown-details">
                <span className="detail-label">
                  You: "{industryDetail.user_industry}" · Job: "{industryDetail.job_industry}"
                </span>
              </div>
            )}
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