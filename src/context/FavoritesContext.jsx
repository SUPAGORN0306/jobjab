import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { fetchFavorites, toggleFavorite as apiToggleFavorite } from "../api";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ โหลด favorites จาก API ตอน mount
  useEffect(() => {
    const loadFavorites = async () => {
      // ยังไม่ login → ไม่โหลด
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchFavorites();

        // ⭐ แปลงข้อมูลจาก DB เป็นรูปแบบที่ UI ใช้
        const mapped = (data.favorites || []).map((f) => ({
          id: f.job_id,                        // ⭐ ใช้ job_id เป็น id หลัก
          favorite_id: f.id,                   // ⭐ เก็บ favorite_id
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
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const isFavorited = (jobId) => {
    return favorites.some((job) => job.id === jobId || job.job_id === jobId);
  };

  // ⭐ toggleFavorite — เรียก API
  const toggleFavorite = async (job) => {
    // ยังไม่ login → แจ้งเตือน
    if (!user) {
      alert("Please login first to save favorites");
      return;
    }

    try {
      const data = await apiToggleFavorite(job.id);

      if (data.favorited) {
        // ⭐ เพิ่มเข้า state
        setFavorites((prev) => [...prev, job]);
      } else {
        // ⭐ ลบออกจาก state
        setFavorites((prev) =>
          prev.filter((f) => f.id !== job.id && f.job_id !== job.id)
        );
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert(err.message || 'Failed to update favorite. Please try again.');
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorited, toggleFavorite, loading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites() ต้องถูกเรียกใช้ภายใน <FavoritesProvider> เท่านั้น");
  }
  return context;
}