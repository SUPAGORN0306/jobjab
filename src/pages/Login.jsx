import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/candidate/Login.css';

import { API_BASE } from '../utils/apiUrl';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [userType, setUserType] = useState('seeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // === Submit: Register หรือ Login ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const role = userType === 'employer' ? 'employer' : 'candidate';

      const endpoint = isSignUp ? '/auth/register' : '/auth/login';
      const payload = isSignUp
        ? {
            full_name: formData.name,
            email: formData.email,
            password: formData.password,
            role,
            ...(role === 'employer' && {
              company_name: formData.company_name,
              industry: formData.industry,
            }),
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // === บันทึก user ผ่าน AuthContext → return roles ===
      const roles = authLogin(data.user);

      // === Redirect ตาม roles ===
      if (roles.length >= 2) {
        // มี 2 roles → default = candidate
        // (ในอนาคต: ทำหน้า /choose-role)
        navigate('/home');
      } else if (roles[0] === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/home');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Guest ===
  const handleGuest = () => {
    authLogin({
      id: 1,
      role: 'candidate',
      full_name: 'Guest User',
    });
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Welcome to <span>JOBJAB</span></h1>
        <p>Log in to save jobs, track applications, and get matched.</p>
      </div>

      <div className="login-card">
        {/* Tabs */}
        <div className="login-tabs">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`tab-btn ${!isSignUp ? 'active-login' : ''}`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`tab-btn ${isSignUp ? 'active-signup' : ''}`}
          >
            Sign up
          </button>
        </div>

        {/* User Type Selection — แสดงเฉพาะตอน Signup */}
        {isSignUp && (
          <div className="user-type-grid">
            <div
              onClick={() => setUserType('seeker')}
              className={`type-card ${userType === 'seeker' ? 'selected' : ''}`}
            >
              <div className="type-title">
                <span className={`dot ${userType === 'seeker' ? 'dot-active' : ''}`}></span>
                <span>Job seeker</span>
              </div>
              <p className="type-desc">Find & apply to jobs</p>
            </div>

            <div
              onClick={() => setUserType('employer')}
              className={`type-card ${userType === 'employer' ? 'selected' : ''}`}
            >
              <div className="type-title">
                <span className={`dot ${userType === 'employer' ? 'dot-active' : ''}`}></span>
                <span>Employer</span>
              </div>
              <p className="type-desc">Post job openings</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            marginBottom: '4px',
          }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="input-group">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>

          {/* Employer-only fields */}
          {isSignUp && userType === 'employer' && (
            <>
              <div className="input-group">
                <label>Company name</label>
                <input
                  type="text"
                  placeholder="Acme Inc."
                  required
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Industry</label>
                <input
                  type="text"
                  placeholder="Tech / Finance / Healthcare..."
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                />
              </div>
            </>
          )}

          <div className="submit-container">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : (isSignUp ? 'Create account' : 'Log in')}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Guest */}
        <div className="guest-container">
          <button type="button" onClick={handleGuest} className="guest-btn">
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}