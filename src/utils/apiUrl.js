// src/utils/apiUrl.js

/**
 * Dev  → relative path → Vite proxy (same-origin → cookie ทำงาน)
 * Prod → relative path → Vercel rewrite (same-origin → cookie ทำงาน)
 *
 * ⭐ API_ORIGIN = '' + API_BASE = '' → ทุก call ใช้ relative path
 * → same-origin → cookie ทำงานบน iOS Safari
 */

export const API_ORIGIN = '';

/**
 * ⭐ API_BASE = '' (ไม่ใช่ '/api')
 * เพราะ call ทุกที่ใช้ '/api/...' อยู่แล้ว
 * ถ้า API_BASE = '/api' → จะซ้ำเป็น '/api/api/...'
 */
export const API_BASE = '';

/**
 * แปลง path → full URL
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

  return `${API_ORIGIN}${pathOrUrl}`;
}