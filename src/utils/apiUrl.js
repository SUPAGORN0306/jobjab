// src/utils/apiUrl.js

/**
 * Dev: relative path via Vite proxy (same-origin so cookies work)
 * Prod: relative path via Vercel rewrite (same-origin so cookies work)
 *
 * API_ORIGIN and API_BASE are empty strings so all calls use relative paths,
 * keeping requests same-origin for cookie support on iOS Safari.
 */

export const API_ORIGIN = '';

/**
 * API_BASE is an empty string (not '/api') because all API calls already
 * include '/api/...'. Setting API_BASE to '/api' would duplicate it to '/api/api/...'.
 */
export const API_BASE = '';

/**
 * Convert a relative path to a full URL.
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