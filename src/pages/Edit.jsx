import { resolveFileUrl } from '../utils/apiUrl';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFullProfile, updateProfile, fetchSkills } from '../api';
import { useAuth } from '../context/AuthContext';
import AvatarUploader from '../components/AvatarUploader';
import ResumeUploader from '../components/ResumeUploader';

import { Briefcase, GraduationCap, X } from 'lucide-react';

import '../styles/candidate/Edit.css';
import { toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';

export default function Edit() {
  usePageTitle("Edit Profile", { description: "Update your profile information" });

  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Profile
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    industry: '',
    profile_image: null,
    resume_url: null,   
    resume_filename: null,     
  });

  // Skills / Exp / Edu
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  // Skills suggestions
  const [allSkills, setAllSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  // === Avatar ===
  const handleAvatarUploaded = (newImageUrl) => {
    setProfile((prev) => ({ ...prev, profile_image: newImageUrl }));
  };

  // === Resume ===
  const handleResumeUploaded = (newResumeUrl, newFilename) => {
    setProfile((prev) => ({
      ...prev,
      resume_url: newResumeUrl,
      resume_filename: newFilename || null,
    }));
  };

  const handleResumeDeleted = () => {
    setProfile((prev) => ({
      ...prev,
      resume_url: null,
      resume_filename: null,
    }));
  };

  // === Load ===
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileData, skillsData] = await Promise.all([
          fetchFullProfile(),
          fetchSkills(),
        ]);

        const p = profileData.profile || {};
        setProfile({
          full_name: p.full_name || '',
          phone: p.phone || '',
          location: p.location || '',
          bio: p.bio || '',
          industry: p.industry || '',
          profile_image: p.profile_image || null,
          resume_url: p.resume_url || null,        
          resume_filename: p.resume_filename || null, 
        });
        setSkills(profileData.skills || []);
        setExperiences(profileData.experiences || []);
        setEducations(profileData.educations || []);
        setAllSkills(skillsData.skills || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // === Close suggestions ===
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // === Profile ===
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // === Skills ===
  const existingSkillNames = skills.map((s) =>
    (s.skill_name || '').toLowerCase()
  );

  const filteredSuggestions = allSkills
    .filter((s) => {
      const lower = s.toLowerCase();
      const search = newSkill.trim().toLowerCase();
      if (!search) return !existingSkillNames.includes(lower);
      return lower.includes(search) && !existingSkillNames.includes(lower);
    })
    .slice(0, 12);

  const canAddSkill = newSkill.trim().length > 0;

  const addSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (existingSkillNames.includes(trimmed.toLowerCase())) {
      setNewSkill('');
      return;
    }
    setSkills((prev) => [
      ...prev,
      { skill_name: trimmed, skill_level: 'Intermediate' },
    ]);
    setNewSkill('');
  };

  const handleRemoveSkill = (idx) => {
    setSkills((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canAddSkill) addSkill(newSkill);
    }
  };

  // === Experience ===
  const canAddExperience = () => {
    if (experiences.length === 0) return true;
    const last = experiences[experiences.length - 1];
    return (
      last.job_title?.trim().length > 0 &&
      last.company_name?.trim().length > 0
    );
  };

  const handleAddExperience = () => {
    if (!canAddExperience()) return;
    setExperiences((prev) => [
      ...prev,
      {
        job_title: '',
        company_name: '',
        location: '',
        start_date: '',
        end_date: null,
        is_current: false,
        description: '',
      },
    ]);
  };

  const handleRemoveExperience = (idx) => {
    setExperiences((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleExperienceChange = (idx, field, value) => {
    setExperiences((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'is_current' && value === true) {
        copy[idx].end_date = null;
      }
      return copy;
    });
  };

  // === Education ===
  const canAddEducation = () => {
    if (educations.length === 0) return true;
    const last = educations[educations.length - 1];
    return last.institution?.trim().length > 0;
  };

  const handleAddEducation = () => {
    if (!canAddEducation()) return;
    setEducations((prev) => [
      ...prev,
      {
        institution: '',
        degree: '',
        field_of_study: '',
        start_date: '',
        end_date: null,
        is_current: false,
        gpa: null,
      },
    ]);
  };

  const handleRemoveEducation = (idx) => {
    setEducations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEducationChange = (idx, field, value) => {
    setEducations((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'is_current' && value === true) {
        copy[idx].end_date = null;
      }
      return copy;
    });
  };

  // === Save ===
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        full_name: profile.full_name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        industry: profile.industry,
        profile_image: profile.profile_image,
        skills: skills.map((s) => ({
          name: s.skill_name,
          level: s.skill_level,
        })),
        experiences: experiences
          .filter((e) => e.job_title?.trim() || e.company_name?.trim())
          .map((e) => ({
            job_title: e.job_title,
            company_name: e.company_name,
            location: e.location,
            start_date: e.start_date || null,
            end_date: e.end_date || null,
            is_current: e.is_current || false,
            description: e.description || '',
          })),
        educations: educations
          .filter((ed) => ed.institution?.trim())
          .map((ed) => ({
            institution: ed.institution,
            degree: ed.degree,
            field_of_study: ed.field_of_study,
            start_date: ed.start_date || null,
            end_date: ed.end_date || null,
            is_current: ed.is_current || false,
            gpa: ed.gpa || null,
          })),
      });
      navigate('/profile');
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // === Loading ===
  if (loading) {
    return (
      <div className="edit-container">
        <p className="edit-loading">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="edit-container">
      {/* ============ HEADER ============ */}
      <div className="edit-header">
        <div>
          <h1>Edit Profile</h1>
          <p className="edit-sub-title">
            Update your information to improve your profile strength
          </p>
        </div>
        <div className="edit-header-actions">
          <button
            className="cancel-btn"
            onClick={() => navigate('/profile')}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className="edit-error">{error}</div>}

      <div className="edit-grid">
        {/* ============ LEFT CARD ============ */}
        <div className="edit-card-left">
          {/* Avatar */}
          <AvatarUploader
            currentImage={
              profile.profile_image
                ? profile.profile_image.startsWith('http')
                  ? profile.profile_image
                  : resolveFileUrl(profile.profile_image)
                : null
            }
            userId={user?.id}
            onUploadSuccess={handleAvatarUploaded}
          />

          {/* Full Name */}
          <div className="edit-field">
            <span className="field-label">
              Full Name <span className="required">*</span>
            </span>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. John Smith"
              value={profile.full_name}
              onChange={(e) => handleProfileChange('full_name', e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="edit-field">
            <span className="field-label">Phone</span>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. +66 91 234 5678"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
            />
          </div>

          {/* Location */}
          <div className="edit-field">
            <span className="field-label">Location</span>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Bangkok, Thailand"
              value={profile.location}
              onChange={(e) => handleProfileChange('location', e.target.value)}
            />
          </div>

          {/* Industry */}
          <div className="edit-field">
            <span className="field-label">Industry</span>
            <select
              className="field-input"
              value={profile.industry}
              onChange={(e) => handleProfileChange('industry', e.target.value)}
            >
              <option value="">Select Industry</option>
              <option value="Tech">Tech</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Education">Education</option>
              <option value="Automotive">Automotive</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Bio */}
          <div className="edit-field">
            <span className="field-label">Bio</span>
            <textarea
              className="field-input"
              rows={3}
              placeholder="Tell recruiters about yourself..."
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
            />
          </div>

          {/* Resume */}
          <div className="edit-field">
            <ResumeUploader
              currentResume={profile.resume_url}
              currentFilename={profile.resume_filename}
              userId={user?.id}
              onUploadSuccess={handleResumeUploaded}
              onDeleteSuccess={handleResumeDeleted}
            />
          </div>

          {/* Skills */}
          <div className="edit-field skills-field">
            <div className="section-header-row">
              <span className="field-label">
                Skills <span className="section-count">{skills.length}</span>
              </span>
            </div>

            <div className="skill-input-wrapper" ref={wrapperRef}>
              <div className="skill-input-row">
                <input
                  type="text"
                  className="field-input skill-input"
                  placeholder="Type a skill, e.g. Python, React..."
                  value={newSkill}
                  onChange={(e) => {
                    setNewSkill(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleSkillKeyDown}
                />
                <button
                  type="button"
                  className={`skill-add-btn ${!canAddSkill ? 'disabled' : ''}`}
                  onClick={() => canAddSkill && addSkill(newSkill)}
                  disabled={!canAddSkill}
                >
                  + Add
                </button>
              </div>

              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="skill-suggestions-chips">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="skill-suggestion-chip"
                      onClick={() => addSkill(s)}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="skills-list-editable">
              {skills.length > 0 ? (
                skills.map((s, i) => (
                  <span className="skill-chip" key={i}>
                    {s.skill_name}
                    <button
                      type="button"
                      className="skill-chip-remove"
                      onClick={() => handleRemoveSkill(i)}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="skills-empty-text">
                  No skills yet — type above to add
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="edit-right-column">
          {/* Experience */}
          <div className="edit-card-right">
            <div className="section-header-row">
              <h3 className="section-title">
                Experience
                <span className="section-count">{experiences.length}</span>
                <span className="optional-badge">optional</span>
              </h3>
              <button
                type="button"
                className={`add-item-btn ${!canAddExperience() ? 'disabled' : ''}`}
                onClick={handleAddExperience}
                disabled={!canAddExperience()}
                title={!canAddExperience() ? 'Fill required fields first' : 'Add another experience'}
              >
                + Add
              </button>
            </div>

            {experiences.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-icon-wrapper">
                  <Briefcase size={28} />
                </div>
                <p className="empty-text">
                  No experience yet? That's totally fine!
                </p>
                <p className="empty-subtext">
                  You can skip this section and focus on your skills.
                </p>
              </div>
            ) : (
              <div className="items-list">
                {experiences.map((exp, idx) => (
                  <div className="item-card" key={idx}>
                    <div className="item-header">
                      <span className="item-number">Experience #{idx + 1}</span>
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => handleRemoveExperience(idx)}
                      >
                        <X size={12} />
                        Remove
                      </button> 
                    </div>

                    <div className="item-grid">
                      <div className="field-wrap">
                        <span className="field-mini-label">
                          Job Title <span className="required">*</span>
                        </span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Data Analyst"
                          value={exp.job_title || ''}
                          onChange={(e) =>
                            handleExperienceChange(idx, 'job_title', e.target.value)
                          }
                        />
                      </div>
                      <div className="field-wrap">
                        <span className="field-mini-label">
                          Company <span className="required">*</span>
                        </span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Acme Inc."
                          value={exp.company_name || ''}
                          onChange={(e) =>
                            handleExperienceChange(idx, 'company_name', e.target.value)
                          }
                        />
                      </div>
                      <div className="field-wrap field-full">
                        <span className="field-mini-label">Location</span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Bangkok, Thailand"
                          value={exp.location || ''}
                          onChange={(e) =>
                            handleExperienceChange(idx, 'location', e.target.value)
                          }
                        />
                      </div>

                      <div className="date-range field-full">
                        <div className="date-field">
                          <span className="date-label">Start Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={exp.start_date || ''}
                            onChange={(e) =>
                              handleExperienceChange(idx, 'start_date', e.target.value)
                            }
                          />
                        </div>
                        <span className="date-sep">→</span>
                        <div className="date-field">
                          <span className="date-label">End Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={exp.end_date || ''}
                            onChange={(e) =>
                              handleExperienceChange(idx, 'end_date', e.target.value)
                            }
                            disabled={exp.is_current}
                          />
                        </div>
                      </div>
                    </div>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={exp.is_current || false}
                        onChange={(e) =>
                          handleExperienceChange(idx, 'is_current', e.target.checked)
                        }
                      />
                      <span>Currently working here</span>
                    </label>

                    <textarea
                      className="field-textarea-editable"
                      rows={2}
                      placeholder="Description (optional)"
                      value={exp.description || ''}
                      onChange={(e) =>
                        handleExperienceChange(idx, 'description', e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="edit-card-right">
            <div className="section-header-row">
              <h3 className="section-title">
                Education
                <span className="section-count">{educations.length}</span>
                <span className="optional-badge">optional</span>
              </h3>
              <button
                type="button"
                className={`add-item-btn ${!canAddEducation() ? 'disabled' : ''}`}
                onClick={handleAddEducation}
                disabled={!canAddEducation()}
                title={!canAddEducation() ? 'Fill Institution first' : 'Add another education'}
              >
                + Add
              </button>
            </div>

            {educations.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-icon-wrapper">
                  <GraduationCap size={28} />
                </div>
                <p className="empty-text">
                  Self-taught? That's totally fine!
                </p>
                <p className="empty-subtext">
                  You can skip this section.
                </p>
              </div>
            ) : (
              <div className="items-list">
                {educations.map((edu, idx) => (
                  <div className="item-card" key={idx}>
                    <div className="item-header">
                      <span className="item-number">Education #{idx + 1}</span>
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => handleRemoveEducation(idx)}
                      >
                        <X size={12} />
                        Remove
                      </button>
                    </div>

                    <div className="item-grid">
                      <div className="field-wrap field-full">
                        <span className="field-mini-label">
                          Institution <span className="required">*</span>
                        </span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Chulalongkorn University"
                          value={edu.institution || ''}
                          onChange={(e) =>
                            handleEducationChange(idx, 'institution', e.target.value)
                          }
                        />
                      </div>
                      <div className="field-wrap">
                        <span className="field-mini-label">Degree</span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Bachelor"
                          value={edu.degree || ''}
                          onChange={(e) =>
                            handleEducationChange(idx, 'degree', e.target.value)
                          }
                        />
                      </div>
                      <div className="field-wrap">
                        <span className="field-mini-label">Field of Study</span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Computer Science"
                          value={edu.field_of_study || ''}
                          onChange={(e) =>
                            handleEducationChange(idx, 'field_of_study', e.target.value)
                          }
                        />
                      </div>
                      <div className="field-wrap field-full">
                        <span className="field-mini-label">GPA</span>
                        <input
                          className="field-input-editable"
                          type="number"
                          step="0.01"
                          placeholder="e.g. 3.50"
                          value={edu.gpa || ''}
                          onChange={(e) =>
                            handleEducationChange(idx, 'gpa', e.target.value)
                          }
                        />
                      </div>

                      <div className="date-range field-full">
                        <div className="date-field">
                          <span className="date-label">Start Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={edu.start_date || ''}
                            onChange={(e) =>
                              handleEducationChange(idx, 'start_date', e.target.value)
                            }
                          />
                        </div>
                        <span className="date-sep">→</span>
                        <div className="date-field">
                          <span className="date-label">End Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={edu.end_date || ''}
                            onChange={(e) =>
                              handleEducationChange(idx, 'end_date', e.target.value)
                            }
                            disabled={edu.is_current}
                          />
                        </div>
                      </div>
                    </div>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={edu.is_current || false}
                        onChange={(e) =>
                          handleEducationChange(idx, 'is_current', e.target.checked)
                        }
                      />
                      <span>Currently studying here</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}