import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../apiClient';
import '../styles/candidate/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [userType, setUserType] = useState('seeker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const role = userType === 'employer' ? 'employer' : 'candidate';

      // ⭐ ใช้ authLogin ใหม่ — รับ (email, password, role)
      await authLogin(formData.email, formData.password, role);

      // ⭐ เช็ค pending application ก่อน redirect
      const pendingRaw = localStorage.getItem('pendingApplication');
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);

          const goToApply = window.confirm(
            `You have an unsaved job application.\n\n` +
              `Do you want to continue filling it out?`
          );

          if (goToApply) {
            navigate(`/job/${pending.jobId}/apply`);
            return;
          } else {
            localStorage.removeItem('pendingApplication');
          }
        } catch {
          localStorage.removeItem('pendingApplication');
        }
      }

      // ⭐ Redirect ตาม role
      if (userType === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>
          Welcome to <span>JOBJAB</span>
        </h1>
        <p>Log in to save jobs, track applications, and get matched.</p>
      </div>

      <div className="login-card">
        {/* User Type Selection */}
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

        {/* Error */}
        {error && <div className="signup-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
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

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>

          <div className="submit-container">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : 'Log in'}
            </button>
          </div>
        </form>

        {/* Link ไป Signup */}
        <div className="login-footer">
          <span>Don't have an account?</span>
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}