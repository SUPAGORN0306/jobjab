import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../apiClient';
import '../styles/candidate/Signup.css';

const INDUSTRIES = [
  'Tech',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'E-commerce',
  'Automotive',
];

const TOTAL_STEPS = 3;

// ⭐ คำนวณ password strength
const getPasswordStrength = (pwd) => {
  if (!pwd) return { level: 0, label: '', color: '' };

  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;

  if (score <= 2) return { level: 1, label: 'Weak', color: '#ef4444' };
  if (score <= 4) return { level: 2, label: 'Medium', color: '#f59e0b' };
  return { level: 3, label: 'Strong', color: '#22c55e' };
};

export default function Signup() {
  const navigate = useNavigate();
  // ⭐ ต้องใช้ทั้ง register + login
  const { register, login: authLogin } = useAuth();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    industry: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const isStepValid = useMemo(() => {
    switch (step) {
      case 1:
        return userType === 'seeker' || userType === 'employer';

      case 2: {
        const pwd = formData.password;
        return (
          formData.name.trim() !== '' &&
          formData.email.trim() !== '' &&
          pwd.length >= 8 &&
          /[a-zA-Z]/.test(pwd) &&
          /[0-9]/.test(pwd)
        );
      }

      case 3:
        if (userType === 'employer') {
          return formData.company_name.trim() !== '' && formData.industry !== '';
        }
        return true;

      default:
        return false;
    }
  }, [step, userType, formData]);

  const handleNext = () => {
    if (!isStepValid) return;

    if (step === 2 && userType === 'seeker') {
      handleSubmit();
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (userType === 'employer' && step === 3) {
      if (!formData.company_name.trim() || !formData.industry) {
        setError('Please fill in all fields');
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      const role = userType === 'employer' ? 'employer' : 'candidate';

      const payload = {
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        ...(role === 'employer' && {
          company_name: formData.company_name,
          industry: formData.industry,
        }),
      };

      // ⭐ 1. Register
      await register(payload);

      // ⭐ 2. Auto-login (สร้าง cookies)
      await authLogin(formData.email, formData.password, role);

      // ⭐ 3. Redirect ตาม role
      if (userType === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(getErrorMessage(err));
      if (step === 3) setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const displayStep = step;
  const isLastStep =
    (userType === 'employer' && step === 3) ||
    (userType === 'seeker' && step === 2);

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1>
          Join <span>JOBJAB</span>
        </h1>
        <p>Create your account in a few easy steps</p>
      </div>

      {/* ⭐ PROGRESS BAR */}
      <div className="signup-progress">
        <div className="progress-steps">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`progress-dot ${
                s < displayStep ? 'completed' : ''
              } ${s === displayStep ? 'active' : ''}`}
            >
              {s < displayStep ? '✓' : s}
            </div>
          ))}
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${
                userType === 'seeker'
                  ? ((displayStep - 1) / 2) * 100
                  : ((displayStep - 1) / 2) * 100
              }%`,
            }}
          />
        </div>
        <div className="progress-labels">
          <span>Role</span>
          <span>Account</span>
          <span>{userType === 'seeker' ? 'Done' : 'Company'}</span>
        </div>
      </div>

      {/* ⭐ CARD */}
      <div className="signup-card">
        {/* Error */}
        {error && <div className="signup-error">{error}</div>}

        {/* STEP 1 */}
        {displayStep === 1 && (
          <div className="signup-step">
            <h2 className="step-title">I am a...</h2>
            <p className="step-subtitle">Choose your account type</p>

            <div className="user-type-grid">
              <div
                onClick={() => setUserType('seeker')}
                className={`type-card ${userType === 'seeker' ? 'selected' : ''}`}
              >
                <div className="type-title">
                  <span
                    className={`dot ${userType === 'seeker' ? 'dot-active' : ''}`}
                  ></span>
                  <span>Job seeker</span>
                </div>
                <p className="type-desc">Find &amp; apply to jobs</p>
              </div>

              <div
                onClick={() => setUserType('employer')}
                className={`type-card ${userType === 'employer' ? 'selected' : ''}`}
              >
                <div className="type-title">
                  <span
                    className={`dot ${userType === 'employer' ? 'dot-active' : ''}`}
                  ></span>
                  <span>Employer</span>
                </div>
                <p className="type-desc">Post job openings</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {displayStep === 2 && (
          <div className="signup-step">
            <h2 className="step-title">Your account</h2>
            <p className="step-subtitle">Basic information</p>

            <div className="input-group">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Enter your name"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            {/* ⭐ Password + Show/Hide + Strength */}
            <div className="input-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          background:
                            i <= strength.level
                              ? strength.color
                              : 'rgba(255, 255, 255, 0.1)',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="strength-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}

              <span className="input-hint">
                At least 8 characters with letters and numbers
              </span>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {displayStep === 3 && userType === 'employer' && (
          <div className="signup-step">
            <h2 className="step-title">Your company</h2>
            <p className="step-subtitle">Tell us about your organization</p>

            <div className="input-group">
              <label>Company name</label>
              <input
                type="text"
                placeholder="Enter your company name"
                required
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Industry</label>
              <select
                required
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="industry-select"
              >
                <option value="">Select Industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="signup-actions">
          {displayStep > 1 && (
            <button
              type="button"
              className="back-btn"
              onClick={handleBack}
              disabled={loading}
            >
              ← Back
            </button>
          )}

          <button
            type="button"
            className={`next-btn ${!isStepValid ? 'disabled' : ''}`}
            onClick={isLastStep ? handleSubmit : handleNext}
            disabled={!isStepValid || loading}
          >
            {loading
              ? 'Creating account...'
              : isLastStep
              ? 'Create account'
              : 'Next →'}
          </button>
        </div>

        {/* Footer */}
        <div className="signup-footer">
          <span>Already have an account?</span>
          <Link to="/login" className="signup-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}