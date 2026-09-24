import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/candidate/Splash.css';
import usePageTitle from '../hooks/usePageTitle';

export default function Splash() {
  usePageTitle("Welcome", { description: "JobJab — AI-powered job matching" });

  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 8000);

    const navTimer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className={`splash-container ${fadeOut ? 'fade-out' : ''}`}>
      {/* Background image */}
      <div className="splash-bg"></div>

      {/* Content */}
      <div className="splash-content">
        {/* Logo */}
        <div className="splash-logo">
          <img src="/Logo_in_app.svg" alt="JOBJAB" />
        </div>

        {/* Text */}
        <h1 className="splash-title">
          Welcome to <span>JOBJAB</span>
        </h1>
        <p className="splash-subtitle">
          Find your next opportunity
        </p>

        {/* Loading dots */}
        <div className="splash-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Bottom text */}
      <div className="splash-footer">
        <p>Find your dream job today</p>
      </div>
    </div>
  );
}