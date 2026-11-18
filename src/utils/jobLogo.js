/**
 * jobLogo.js: Job logo class and color mappings.
 * Shared across Home, AllJobs, JobDetail, Favorite, Employer pages, etc.
 */

// Class mapping (for CSS)
export const getJobLogoClass = (title) => {
  switch (title) {
    case "AI Product Manager":       return "logo-ai-product-manager";
    case "AI Researcher":            return "logo-ai-researcher";
    case "Computer Vision Engineer": return "logo-computer-vision";
    case "Data Analyst":             return "logo-data-analyst";
    case "Data Scientist":           return "logo-data-scientist";
    case "ML Engineer":              return "logo-ml-engineer";
    case "NLP Engineer":             return "logo-nlp-engineer";
    case "Quant Researcher":         return "logo-quant-researcher";
    default:                         return "bg-blue-500";
  }
};

// Color mapping (for Recharts and inline styles)
// Uses the starting gradient color from JobDetail.css
const JOB_LOGO_COLORS = {
  "AI Product Manager":       "#3b82f6",  // blue
  "AI Researcher":            "#8b5cf6",  // violet
  "Computer Vision Engineer": "#ec4899",  // pink
  "Data Analyst":             "#10b981",  // emerald
  "Data Scientist":           "#f59e0b",  // amber
  "ML Engineer":              "#06b6d4",  // cyan
  "NLP Engineer":             "#6366f1",  // indigo
  "Quant Researcher":         "#ef4444",  // red
};

export const getJobLogoColor = (title) => {
  if (!title) return "#f0d154";
  return JOB_LOGO_COLORS[title] || "#f0d154";
};
