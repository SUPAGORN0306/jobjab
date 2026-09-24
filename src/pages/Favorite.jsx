import '../styles/candidate/Favorite.css';
import '../styles/home/RecommendedCard.css';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { getMatchBadgeClass } from '../utils/matchBadge.js';
import { FavoriteSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { Heart } from "lucide-react";
import usePageTitle from '../hooks/usePageTitle';
import { getJobLogoClass } from '../utils/jobLogo';


export default function Favorite() {
  usePageTitle("Favorites", { description: "Your saved jobs" });

  const navigate = useNavigate();
  const { favorites, toggleFavorite, loading } = useFavorites();

  const formatSalary = (job) => {
    if (job.salary) return job.salary;
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
    }
    return 'N/A';
  };

  return (
    <div className="status-container">
      <div className="recommend-list">
        <div className="recommend-list-header">
          <div>
            <h3>Your favorites</h3>
            <span style={{ fontSize: '0.85rem', color: '#8c9bae' }}>
              Sorted by most recently saved
            </span>
          </div>
          <span>{favorites.length} saved jobs</span>
        </div>

        {loading && <FavoriteSkeleton count={3} />}

        {!loading && favorites.length === 0 && (
          <EmptyState
            icon={Heart}
            title="No saved jobs yet"
            description="Click the heart on jobs you like to save them here"
            actionLabel="Browse Jobs"
            onAction={() => navigate('/home')}
          />
        )}

        {!loading && favorites.length > 0 && (
          <div className="Recommended-cards-grid">
            {favorites.map((job) => {
              const jobId = job.id || job.job_id;
              const title = job.job_title || job.title;
              const company = job.company_name || job.company;

              return (
                <div
                  className="Recommended-card"
                  key={jobId}
                  onClick={() => navigate(`/job/${jobId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="Recommended-card-top">
                    <div className="Recommended-company-info">
                      <div className={`Recommended-logo ${getJobLogoClass(title)}`}>
                        {title?.charAt(0) || 'J'}
                      </div>
                      <div>
                        <h4>{title}</h4>
                        <span>{company}</span>
                      </div>
                    </div>
                    <span
                      className="Recommended-favorite-btn is-favorited"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(job);
                      }}
                    >
                      ♥
                    </span>
                  </div>

                  <div className="Recommended-tags">
                    {[
                      job.employment_type || job.type,
                      job.experience_level || job.level,
                      job.work_mode || job.workMode,
                    ]
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span key={idx}>{tag}</span>
                      ))}
                  </div>

                  <div className="Recommended-card-bottom">
                    <div>
                      <div className="Recommended-salary">
                        {formatSalary(job)}
                      </div>
                      <div className="Recommended-applicants">
                        {job.applicants || ''}
                      </div>
                    </div>
                    <div
                      className={`Recommended-match-badge ${getMatchBadgeClass(
                        job.match_score || job.match || 0
                      )}`}
                    >
                      {job.match_score || job.match || 0}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}