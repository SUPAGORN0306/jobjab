// src/utils/apiUrl.js

/**
 * Dev  → relative path → Vite proxy (same-origin → cookie ทำงาน)
 * Prod → absolute URL จาก VITE_API_URL
 */
export const API_ORIGIN = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

/**
 * Origin สำหรับ resolve static files (uploads, avatars)
 * ต้องเป็น absolute เสมอ → ไม่งั้น path /uploads/* จะ 404
 */
const STATIC_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * API base URL (มี /api)
 */
export const API_BASE = `${API_ORIGIN}/api`;

/**
 * แปลง path → full URL
 * - http/https/data → คืนเดิม (Supabase URL)
 * - relative (/uploads/...) → prepend STATIC_ORIGIN (absolute)
 */
export function resolveFileUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('data:')
  ) {
    return pathOrUrl;
  }
  return `${STATIC_ORIGIN}${pathOrUrl}`;
}