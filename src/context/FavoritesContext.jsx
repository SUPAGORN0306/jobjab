import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchFavorites, toggleFavorite as apiToggleFavorite } from "../api";
import { toast } from 'sonner';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD FAVORITES
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      if (!user) {
        if (!cancelled) {
          setFavorites([]);
          setLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) setLoading(true);
        const data = await fetchFavorites();

        if (cancelled) return;

        const mapped = (data.favorites || []).map((f) => ({
          id: f.job_id,
          favorite_id: f.id,
          title: f.job_title,
          company: f.company_name,
          job_title: f.job_title,
          company_name: f.company_name,
          location: f.location,
          salary_min: f.salary_min,
          salary_max: f.salary_max,
          industry: f.industry,
          experience_level: f.experience_level,
          employment_type: f.employment_type,
          skills_required: f.skills_required,
          match_score: 0,
        }));

        setFavorites(mapped);
      } catch (err) {
        console.error('Error loading favorites:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // ============================================================
  // SET for O(1) isFavorited lookup
  // ============================================================
  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites]
  );

  // ============================================================
  // isFavorited — memoized
  // ============================================================
  const isFavorited = useCallback(
    (jobId) => favoriteIds.has(jobId),
    [favoriteIds]
  );

  // ============================================================
  // toggleFavorite — memoized
  // ============================================================
  const toggleFavorite = useCallback(
    async (job) => {
      if (!user) {
        toast.error("Please log in to save jobs");
        return;
      }

      try {
        const data = await apiToggleFavorite(job.id);

        if (data.favorited) {
          setFavorites((prev) => [...prev, job]);
        } else {
          setFavorites((prev) =>
            prev.filter((f) => f.id !== job.id && f.job_id !== job.id)
          );
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
        toast.error(err.message || 'Failed to update favorite. Please try again.');
      }
    },
    [user]
  );

  // ============================================================
  // CONTEXT VALUE — memoized
  // ============================================================
  const value = useMemo(
    () => ({
      favorites,
      isFavorited,
      toggleFavorite,
      loading,
    }),
    [favorites, isFavorited, toggleFavorite, loading]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites() must be used within <FavoritesProvider>");
  }
  return context;
}
