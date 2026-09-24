/**
 * apiClient.js — Axios instance with cookie support + auto-refresh
 *
 * Features:
 * - withCredentials: true → ส่ง cookies อัตโนมัติ
 * - Response interceptor → auto-refresh เมื่อ 401
 * - Helper: getErrorMessage()
 */
import axios from 'axios';

import { API_ORIGIN } from './utils/apiUrl';

// ============================================================
// AXIOS INSTANCE
// ============================================================

const apiClient = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true, // ← ส่ง cookies: access_token, refresh_token, csrf_token
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 วิ
});

// ============================================================
// RESPONSE INTERCEPTOR — AUTO REFRESH ON 401
// ============================================================

apiClient.interceptors.response.use(
  // Success — pass through
  (response) => response,

  // Error handler
  async (error) => {
    const originalRequest = error.config || {};

    // ⭐ Handle 429 Rate Limit — แสดงข้อความชัดเจน
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || '60';
      const customError = new Error(
        `Too many attempts. Please wait ${retryAfter} seconds.`
      );
      customError.response = error.response;
      customError.isRateLimit = true;
      customError.retryAfter = parseInt(retryAfter, 10);
      return Promise.reject(customError);
    }

    // ไม่ refresh ถ้า:
    // 1. ไม่ใช่ 401
    // 2. เคย retry แล้ว
    // 3. เป็น auth endpoint
    const isAuthEndpoint =
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/register') ||
      originalRequest.url?.includes('/api/auth/logout');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await apiClient.post('/api/auth/refresh');
        return apiClient(originalRequest);
      } catch (refreshError) {
        const isLoginPage = window.location.pathname === '/login';
        if (!isLoginPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================
// HELPER — ERROR MESSAGE
// ============================================================

export function getErrorMessage(error) {
  // ⭐ Rate limit (429) — แสดงข้อความจาก custom error
  if (error?.isRateLimit) {
    return error.message || 'Too many attempts. Please wait.';
  }

  const data = error?.response?.data;

  if (!data) {
    // Network error (no response)
    if (error?.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Please check your connection.';
    }
    return error?.message || 'Something went wrong';
  }

  if (data.error?.message) return data.error.message;
  if (typeof data.error === 'string') return data.error;
  if (data.message) return data.message;
  if (data.detail) return data.detail;

  return 'Something went wrong';
}

export default apiClient;
