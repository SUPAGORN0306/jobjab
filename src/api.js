/**
 * api.js — API functions
 *
 * ทุก call ใช้ apiClient (axios + cookies + auto-refresh)
 *
 * Changes from v1:
 * - ใช้ apiClient แทน fetch
 * - cookies ส่งอัตโนมัติ (withCredentials)
 * - auto-refresh เมื่อ 401
 * - error format มาตรฐาน
 */
import apiClient from './apiClient';

// ============================================================
// MODULE-LEVEL USER STATE
// ============================================================
// sync จาก AuthContext — ใช้สำหรับ api.js ที่ไม่ใช่ React component

let _currentUser = null;

/**
 * setCurrentUser — เรียกจาก AuthContext ทุกครั้งที่ user เปลี่ยน
 * @param {object|null} user
 */
export const setCurrentUser = (user) => {
  _currentUser = user;
};

export const getCurrentUserId = () => {
  return _currentUser?.id ?? null;
};

export const getCurrentUserRole = () => {
  return _currentUser?.role ?? 'candidate';
};

export const getCurrentUserName = () => {
  return _currentUser?.full_name ?? '';
};

// ============================================================
// PROFILE
// ============================================================

export const fetchFullProfile = async (userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data } = await apiClient.get(`/api/profile/${uid}/full`);
  return data;
};

export const updateProfile = async (data, userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data: response } = await apiClient.put(`/api/profile/${uid}`, {
    ...data,
    profile_image: data.profile_image || undefined,
  });
  return response;
};

// ============================================================
// JOBS
// ============================================================

export const fetchJobs = async () => {
  const { data } = await apiClient.get('/api/jobs');
  return data;
};

export const fetchJobDetail = async (jobId) => {
  const { data } = await apiClient.get(`/api/jobs/${jobId}`);
  return data;
};

// ============================================================
// APPLICATIONS
// ============================================================

export const submitApplication = async (data) => {
  const payload = { user_id: getCurrentUserId(), ...data };
  const { data: response } = await apiClient.post('/api/applications', payload);
  return response;
};

export const fetchUserApplications = async (userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data } = await apiClient.get(`/api/applications/user/${uid}`);
  return data;
};

export const fetchApplicationDetail = async (applicationId) => {
  const { data } = await apiClient.get(`/api/applications/${applicationId}/detail`);
  return data;
};

// ============================================================
// AUTH
// ============================================================

export const register = async (data) => {
  const { data: response } = await apiClient.post('/api/auth/register', data);
  return response;
};

export const login = async (data) => {
  const { data: response } = await apiClient.post('/api/auth/login', data);
  return response;
};

// ⭐ ใหม่ — Sprint 1
export const logout = async () => {
  const { data } = await apiClient.post('/api/auth/logout');
  return data;
};

export const fetchMe = async () => {
  const { data } = await apiClient.get('/api/auth/me');
  return data;
};

export const refreshToken = async () => {
  const { data } = await apiClient.post('/api/auth/refresh');
  return data;
};

// ============================================================
// EMPLOYER
// ============================================================

export const fetchEmployerJobs = async (userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data } = await apiClient.get(`/api/employer/jobs?user_id=${uid}`);
  return data;
};

export const createEmployerJob = async (data) => {
  const payload = { user_id: getCurrentUserId(), ...data };
  const { data: response } = await apiClient.post('/api/employer/jobs', payload);
  return response;
};

// ============================================================
// EMPLOYER: APPLICATIONS
// ============================================================

export const fetchJobApplications = async (jobId) => {
  const { data } = await apiClient.get(`/api/employer/jobs/${jobId}/applications`);
  return data;
};

export const fetchApplicationSnapshot = async (applicationId) => {
  const { data } = await apiClient.get(`/api/employer/applications/${applicationId}/detail`);
  return data;
};

export const updateApplicationStatus = async (applicationId, newStatus) => {
  const { data } = await apiClient.put(
    `/api/employer/applications/${applicationId}/status`,
    { status: newStatus }
  );
  return data;
};

// ============================================================
// SKILLS
// ============================================================

export const fetchSkills = async () => {
  const { data } = await apiClient.get('/api/skills');
  return data;
};

// ============================================================
// MATCH SCORE
// ============================================================

export const fetchJobsWithMatch = async (userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data } = await apiClient.get(`/api/jobs?user_id=${uid}`);
  return data;
};

export const fetchJobDetailWithMatch = async (jobId, userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data } = await apiClient.get(`/api/jobs/${jobId}?user_id=${uid}`);
  return data;
};

export const fetchMatchScore = async (jobId, userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data } = await apiClient.get(`/api/match-score/${jobId}?user_id=${uid}`);
  return data;
};

// ============================================================
// FAVORITES (⭐ ใหม่ — ส่งผ่าน apiClient)
// ============================================================

export const fetchFavorites = async () => {
  const { data } = await apiClient.get('/api/favorites');
  return data;
};

export const toggleFavorite = async (jobId) => {
  const { data } = await apiClient.post('/api/favorites/toggle', {
    user_id: getCurrentUserId(),
    job_id: jobId,
  });
  return data;
};
