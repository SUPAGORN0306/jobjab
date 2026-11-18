/**
 * apiClient.js: Axios instance with cookie support and automatic token refresh.
 *
 * Features:
 * - withCredentials: true sends cookies automatically
 * - Response interceptor refreshes the session on 401
 * - Helper: getErrorMessage()
 *
 * baseURL is empty so calls use relative '/api/...' paths, keeping requests
 * same-origin for cookie support on iOS.
 */
import axios from 'axios';

import { API_BASE } from '../utils/apiUrl';   // = ''

// Axios instance

const apiClient = axios.create({
  baseURL: API_BASE,   // Empty string so '/api/auth/me' stays relative
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for automatic refresh on 401

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config || {};

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

// Error message helper

export function getErrorMessage(error) {
  if (error?.isRateLimit) {
    return error.message || 'Too many attempts. Please wait.';
  }

  const data = error?.response?.data;

  if (!data) {
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