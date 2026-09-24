import { resolveFileUrl } from '../utils/apiUrl';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchJobDetail, fetchFullProfile, submitApplication, fetchSkills } from '../api';
import { useAuth } from '../context/AuthContext';
import apiClient from '../apiClient';

import {
  Briefcase,
  GraduationCap,
  AlertCircle,
  X,
  FileText,
  Upload,
} from 'lucide-react';

import '../styles/candidate/Apply.css';
import { toast } from 'sonner';
import usePageTitle from '../hooks/usePageTitle';

const PENDING_APP_KEY = 'pendingApplication';

export default function Apply() {
  usePageTitle("Apply", { description: "Submit your job application" });

  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [allSkills, setAllSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUploadError, setResumeUploadError] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    resumeFilename: '',
    resumeUrl: null,
    coverLetter: '',
    avatar: null,
    skills: [],
    experiences: [],
    educations: [],
  });

  const { user } = useAuth();
  const userId = user?.id;
  const isGuest = !user;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const pendingRaw = localStorage.getItem(PENDING_APP_KEY);
        const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

        const [jobData, profileData, skillsData] = await Promise.all([
          fetchJobDetail(id),
          isGuest
            ? Promise.resolve({ profile: {}, skills: [], experiences: [], educations: [] })
            : fetchFullProfile(),
          fetchSkills(),
        ]);

        setJob(jobData.job);
        setAllSkills(skillsData.skills || []);

        if (pending && String(pending.jobId) === String(id)) {
          setFormData({
            fullName: pending.formData.fullName || '',
            email: pending.formData.email || '',
            phone: pending.formData.phone || '',
            location: pending.formData.location || '',
            resumeFilename: pending.formData.resumeFilename || '',
            resumeUrl: pending.formData.resumeUrl || null,
            coverLetter: pending.formData.coverLetter || '',
            avatar: pending.formData.avatar || null,
            skills: pending.formData.skills || [],
            experiences: pending.formData.experiences || [],
            educations: pending.formData.educations || [],
          });
        } else {
          const p = profileData.profile || {};
          setFormData({
            fullName: p.full_name || '',
            email: p.email || '',
            phone: p.phone || '',
            location: p.location || '',
            resumeFilename: p.resume_filename || (p.resume_url ? 'resume.pdf' : ''),
            resumeUrl: p.resume_url || null,
            coverLetter: '',
            avatar: p.profile_image || null,
            skills: profileData.skills || [],
            experiences: profileData.experiences || [],
            educations: profileData.educations || [],
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isGuest]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      setResumeUploadError('Only PDF files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadError('File size must be under 5MB');
      return;
    }

    try {
      setUploadingResume(true);
      setResumeUploadError(null);

      const fd = new FormData();
      fd.append('resume', file);
      // ⭐ user_id ไม่ต้องส่ง — backend ใช้ g.user_id จาก cookie

      const { data } = await apiClient.post('/api/upload/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((prev) => ({
        ...prev,
        resumeUrl: data.resume_url,
        resumeFilename: data.filename || file.name,
      }));
    } catch (err) {
      setResumeUploadError(err.message);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setFormData((prev) => ({
      ...prev,
      resumeUrl: null,
      resumeFilename: '',
    }));
    setResumeUploadError(null);
  };

  const existingSkillNames = formData.skills.map((s) =>
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
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { skill_name: trimmed, skill_level: 'Intermediate' }],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (idx) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (canAddSkill) addSkill(newSkill);
    }
  };

  const canAddExperience = () => {
    if (formData.experiences.length === 0) return true;
    const last = formData.experiences[formData.experiences.length - 1];
    return last.job_title?.trim().length > 0 && last.company_name?.trim().length > 0;
  };

  const handleAddExperience = () => {
    if (!canAddExperience()) return;
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          job_title: '',
          company_name: '',
          location: '',
          start_date: '',
          end_date: null,
          is_current: false,
          description: '',
        },
      ],
    }));
  };

  const handleRemoveExperience = (idx) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== idx),
    }));
  };

  const handleExperienceChange = (idx, field, value) => {
    setFormData((prev) => {
      const copy = [...prev.experiences];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'is_current' && value === true) {
        copy[idx].end_date = null;
      }
      return { ...prev, experiences: copy };
    });
  };

  const canAddEducation = () => {
    if (formData.educations.length === 0) return true;
    const last = formData.educations[formData.educations.length - 1];
    return last.institution?.trim().length > 0;
  };

  const handleAddEducation = () => {
    if (!canAddEducation()) return;
    setFormData((prev) => ({
      ...prev,
      educations: [
        ...prev.educations,
        {
          institution: '',
          degree: '',
          field_of_study: '',
          start_date: '',
          end_date: null,
          is_current: false,
          gpa: null,
        },
      ],
    }));
  };

  const handleRemoveEducation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== idx),
    }));
  };

  const handleEducationChange = (idx, field, value) => {
    setFormData((prev) => {
      const copy = [...prev.educations];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'is_current' && value === true) {
        copy[idx].end_date = null;
      }
      return { ...prev, educations: copy };
    });
  };

  const handleViewResume = () => {
    if (!formData.resumeUrl) return;
    setShowResumeModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (isGuest) {
      localStorage.setItem(
        PENDING_APP_KEY,
        JSON.stringify({
          jobId: id,
          formData: { ...formData },
          timestamp: Date.now(),
        })
      );
      toast.error('Please login to submit your application.\n' +
        'Your information has been saved and will be restored after login.');
      navigate('/login');
      return;
    }

    if (!formData.resumeUrl) {
      toast.error('Please upload your resume first');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        jobId: parseInt(id),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        resumeFilename: formData.resumeFilename,
        resumeUrl: formData.resumeUrl,
        coverLetter: formData.coverLetter,
        skills: formData.skills.map((s) => ({
          name: s.skill_name,
          level: s.skill_level,
        })),
        experiences: formData.experiences
          .filter((e) => e.job_title?.trim() || e.company_name?.trim())
          .map((exp) => ({
            job_title: exp.job_title,
            company_name: exp.company_name,
            location: exp.location,
            start_date: exp.start_date || null,
            end_date: exp.end_date || null,
            is_current: exp.is_current || false,
            description: exp.description || '',
          })),
        educations: formData.educations
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
      };

      const result = await submitApplication(payload);
      localStorage.removeItem(PENDING_APP_KEY);
      toast.success(`Applied successfully! ${result.message || ''} (ID: ${result.application_id})`);
      navigate('/status');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-container">
        <p className="apply-loading">Loading...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="apply-container">
        <Link to="/home" className="back-link">
          <span className="back-arrow">‹</span> Back to jobs
        </Link>
        <p className="apply-error">{error || 'Job not found'}</p>
      </div>
    );
  }

  return (
    <div className="apply-container">
      {isGuest && (
        <div className="guest-banner">
          <AlertCircle size={16} />
          <div>
            <strong>You're browsing as Guest</strong>
            <p>Fill the form → Submit → Login → Your info will be saved</p>
          </div>
        </div>
      )}

      <div className="apply-nav-row">
        <Link to={`/job/${id}`} className="back-link">
          <span className="back-arrow">‹</span> Back to job details
        </Link>
      </div>

      <div className="apply-header">
        <div>
          <h1>Apply for position</h1>
          <p className="apply-sub-title">
            {job.title} · <span>{job.company}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="apply-grid">
        <div className="apply-card-left">
          <div className="avatar-wrapper" style={{ overflow: 'hidden', padding: 0 }}>
            {formData.avatar ? (
              <img
                src={
                  formData.avatar.startsWith('http') || formData.avatar.startsWith('data:')
                    ? formData.avatar
                    : resolveFileUrl(formData.avatar)
                }
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '28px', fontWeight: 'bold' }}>
                {formData.fullName?.charAt(0) || 'U'}
              </span>
            )}
          </div>

          <div className="profile-info">
            <h2>{formData.fullName || 'Your Name'}</h2>
            <p>{formData.location || 'Location'}</p>
          </div>

          <div className="apply-notice-box">
            <span className="notice-dot"></span>
            <p>Edits apply to this application only</p>
          </div>

          <div className="apply-summary">
            <div className="summary-item">
              <span className="summary-value">{formData.skills.length}</span>
              <span className="summary-label">Skills</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{formData.experiences.length}</span>
              <span className="summary-label">Exp</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{formData.educations.length}</span>
              <span className="summary-label">Edu</span>
            </div>
          </div>

          <div className="skills-preview">
            {formData.skills.length > 0 ? (
              <>
                {formData.skills.slice(0, 6).map((s, i) => (
                  <span className="skill-tag" key={i}>{s.skill_name}</span>
                ))}
                {formData.skills.length > 6 && (
                  <span className="skills-more">+{formData.skills.length - 6} more</span>
                )}
              </>
            ) : (
              <span className="skills-empty">No skills yet</span>
            )}
          </div>
        </div>

        <div className="apply-right-column">
          <div className="apply-card-right">
            <h3 className="section-title">Contact Details</h3>
            <div className="contact-grid">
              <div className="contact-field">
                <span className="field-label">Full name <span className="required">*</span></span>
                <input
                  type="text"
                  className="field-input-editable"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  required
                />
              </div>
              <div className="contact-field">
                <span className="field-label">Email <span className="required">*</span></span>
                <input
                  type="email"
                  className="field-input-editable"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="contact-field">
                <span className="field-label">Phone</span>
                <input
                  type="tel"
                  className="field-input-editable"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="contact-field">
                <span className="field-label">Location</span>
                <input
                  type="text"
                  className="field-input-editable"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>

              {!isGuest && (
                <div className="contact-field full-width">
                  <span className="field-label">Resume <span className="required">*</span></span>

                  {formData.resumeUrl ? (
                    <div className="resume-uploaded-box">
                      <div className="resume-file-info">
                        <FileText size={16} />
                        <span className="resume-filename">{formData.resumeFilename}</span>
                      </div>
                      <div className="resume-actions">
                        <button type="button" onClick={handleViewResume} className="resume-action-btn view">
                          View
                        </button>
                        <label className="resume-action-btn change">
                          Change
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleResumeUpload}
                            style={{ display: 'none' }}
                            disabled={uploadingResume}
                          />
                        </label>
                        <button type="button" onClick={handleRemoveResume} className="resume-action-btn remove">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="resume-upload-box">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleResumeUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingResume}
                      />
                      {uploadingResume ? (
                        <>
                          <div className="resume-upload-spinner"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          <span>Click to upload resume</span>
                          <span className="resume-upload-hint">PDF only · Max 5MB</span>
                        </>
                      )}
                    </label>
                  )}

                  {resumeUploadError && (
                    <div className="resume-upload-error">
                      <AlertCircle size={14} />
                      {resumeUploadError}
                    </div>
                  )}
                </div>
              )}

              <div className="contact-field full-width">
                <span className="field-label">Cover Letter</span>
                <textarea
                  className="field-textarea-editable"
                  rows={4}
                  value={formData.coverLetter}
                  onChange={(e) => handleChange('coverLetter', e.target.value)}
                  placeholder="Why are you a good fit?"
                />
              </div>
            </div>
          </div>

          <div className="apply-card-right">
            <h3 className="section-title">
              Skills
              <span className="section-count">{formData.skills.length}</span>
            </h3>

            <div className="skill-input-wrapper" ref={wrapperRef}>
              <div className="skill-input-row">
                <input
                  type="text"
                  className="field-input-editable skill-input"
                  placeholder="Type a skill..."
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
              {formData.skills.length > 0 ? (
                formData.skills.map((s, i) => (
                  <span className="skill-chip" key={i}>
                    {s.skill_name}
                    <button
                      type="button"
                      className="skill-chip-remove"
                      onClick={() => handleRemoveSkill(i)}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="skills-empty-text">No skills yet — type above to add</span>
              )}
            </div>
          </div>

          <div className="apply-card-right">
            <div className="section-header-row">
              <h3 className="section-title">
                Experience
                <span className="section-count">{formData.experiences.length}</span>
                <span className="optional-badge">optional</span>
              </h3>
              <button
                type="button"
                className={`add-item-btn ${!canAddExperience() ? 'disabled' : ''}`}
                onClick={handleAddExperience}
                disabled={!canAddExperience()}
              >
                + Add
              </button>
            </div>

            {formData.experiences.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-icon-wrapper">
                  <Briefcase size={28} />
                </div>
                <p className="empty-text">No experience yet? That's totally fine!</p>
                <p className="empty-subtext">You can skip this section.</p>
              </div>
            ) : (
              <div className="items-list">
                {formData.experiences.map((exp, idx) => (
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
                        <span className="field-mini-label">Job Title <span className="required">*</span></span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Data Analyst"
                          value={exp.job_title || ''}
                          onChange={(e) => handleExperienceChange(idx, 'job_title', e.target.value)}
                        />
                      </div>
                      <div className="field-wrap">
                        <span className="field-mini-label">Company <span className="required">*</span></span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Acme Inc."
                          value={exp.company_name || ''}
                          onChange={(e) => handleExperienceChange(idx, 'company_name', e.target.value)}
                        />
                      </div>
                      <div className="field-wrap field-full">
                        <span className="field-mini-label">Location</span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Bangkok"
                          value={exp.location || ''}
                          onChange={(e) => handleExperienceChange(idx, 'location', e.target.value)}
                        />
                      </div>

                      <div className="date-range field-full">
                        <div className="date-field">
                          <span className="date-label">Start Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={exp.start_date || ''}
                            onChange={(e) => handleExperienceChange(idx, 'start_date', e.target.value)}
                          />
                        </div>
                        <span className="date-sep">→</span>
                        <div className="date-field">
                          <span className="date-label">End Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={exp.end_date || ''}
                            onChange={(e) => handleExperienceChange(idx, 'end_date', e.target.value)}
                            disabled={exp.is_current}
                          />
                        </div>
                      </div>
                    </div>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={exp.is_current || false}
                        onChange={(e) => handleExperienceChange(idx, 'is_current', e.target.checked)}
                      />
                      <span>Currently working here</span>
                    </label>

                    <textarea
                      className="field-textarea-editable"
                      rows={2}
                      placeholder="Description (optional)"
                      value={exp.description || ''}
                      onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="apply-card-right">
            <div className="section-header-row">
              <h3 className="section-title">
                Education
                <span className="section-count">{formData.educations.length}</span>
                <span className="optional-badge">optional</span>
              </h3>
              <button
                type="button"
                className={`add-item-btn ${!canAddEducation() ? 'disabled' : ''}`}
                onClick={handleAddEducation}
                disabled={!canAddEducation()}
              >
                + Add
              </button>
            </div>

            {formData.educations.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-icon-wrapper">
                  <GraduationCap size={28} />
                </div>
                <p className="empty-text">Self-taught? That's totally fine!</p>
                <p className="empty-subtext">You can skip this section.</p>
              </div>
            ) : (
              <div className="items-list">
                {formData.educations.map((edu, idx) => (
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
                        <span className="field-mini-label">Institution <span className="required">*</span></span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Chulalongkorn University"
                          value={edu.institution || ''}
                          onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                        />
                      </div>
                      <div className="field-wrap">
                        <span className="field-mini-label">Degree</span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Bachelor"
                          value={edu.degree || ''}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        />
                      </div>
                      <div className="field-wrap">
                        <span className="field-mini-label">Field of Study</span>
                        <input
                          className="field-input-editable"
                          placeholder="e.g. Computer Science"
                          value={edu.field_of_study || ''}
                          onChange={(e) => handleEducationChange(idx, 'field_of_study', e.target.value)}
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
                          onChange={(e) => handleEducationChange(idx, 'gpa', e.target.value)}
                        />
                      </div>

                      <div className="date-range field-full">
                        <div className="date-field">
                          <span className="date-label">Start Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={edu.start_date || ''}
                            onChange={(e) => handleEducationChange(idx, 'start_date', e.target.value)}
                          />
                        </div>
                        <span className="date-sep">→</span>
                        <div className="date-field">
                          <span className="date-label">End Date</span>
                          <input
                            className="field-input-editable"
                            type="date"
                            value={edu.end_date || ''}
                            onChange={(e) => handleEducationChange(idx, 'end_date', e.target.value)}
                            disabled={edu.is_current}
                          />
                        </div>
                      </div>
                    </div>

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={edu.is_current || false}
                        onChange={(e) => handleEducationChange(idx, 'is_current', e.target.checked)}
                      />
                      <span>Currently studying here</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="apply-actions-row">
            <button
              type="button"
              className="cancel-action-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn-custom"
              disabled={submitting}
            >
              {isGuest
                ? 'Login to Submit'
                : submitting
                  ? 'Submitting...'
                  : 'Submit Application'}
            </button>
          </div>
        </div>
      </form>

      {/* ⭐ Resume Preview Modal — Google Docs Viewer */}
      {showResumeModal && formData.resumeUrl && (
        <div
          onClick={() => setShowResumeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: '900px',
              height: '90vh',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #eee',
              }}
            >
              <strong style={{ fontSize: '16px', color: '#000'}}>Resume Preview</strong>
              <button
                onClick={() => setShowResumeModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* ⭐ Google Docs Viewer */}
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(formData.resumeUrl)}&embedded=true`}
              title="Resume Preview"
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}