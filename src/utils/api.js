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
 *
 * ⭐ v2 — fix: updateApplicationStatus รับ interviewDate + notes
 */
import apiClient from '../lib/apiClient';

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
  if (!uid) throw new Error('User not authenticated');
  const { data } = await apiClient.get(`/api/profile/${uid}/full`);
  return data;
};

export const updateProfile = async (data, userId) => {
  const uid = userId ?? getCurrentUserId();
  if (!uid) throw new Error('User not authenticated');
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
  // ⭐ user_id ไม่ต้องส่ง — backend ใช้ g.user_id จาก cookie
  const { data: response } = await apiClient.post('/api/applications', data);
  return response;
};

export const fetchUserApplications = async (userId) => {
  const uid = userId ?? getCurrentUserId();
  if (!uid) throw new Error('User not authenticated');
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

//เปลี่ยน active role (multi-role user)
export const switchRoleApi = async ({ role }) => {
  const { data } = await apiClient.post('/api/auth/switch-role', { role });
  return data;
};

// ============================================================
// EMPLOYER
// ============================================================

export const fetchEmployerJobs = async () => {
  // ⭐ backend ใช้ g.user_id
  const { data } = await apiClient.get('/api/employer/jobs');
  return data;
};

export const createEmployerJob = async (data) => {
  // ⭐ user_id ไม่ต้องส่ง
  const { data: response } = await apiClient.post('/api/employer/jobs', data);
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

/**
 * updateApplicationStatus — อัปเดต status ของผู้สมัคร
 *
 * @param {number} applicationId
 * @param {string} newStatus     — 'applied' | 'reviewing' | 'interview' | 'rejected'
 * @param {string|null} interviewDate — ISO 8601 string (ส่งเฉพาะตอน status=interview)
 * @param {string|null} notes    — บันทึกเพิ่มเติม (optional)
 *
 * ⭐ fix: ส่ง interview_date + notes ไป backend ด้วย
 */
export const updateApplicationStatus = async (
  applicationId,
  newStatus,
  interviewDate = null,
  notes = null
) => {
  const payload = { status: newStatus };

  // ⭐ ส่ง interview_date เฉพาะตอน status = interview และมีค่า
  if (newStatus === 'interview' && interviewDate) {
    payload.interview_date = interviewDate;
  }

  // ⭐ ส่ง notes ถ้ามี (ไม่ใช่ null/undefined)
  if (notes !== null && notes !== undefined) {
    payload.notes = notes;
  }

  const { data } = await apiClient.put(
    `/api/employer/applications/${applicationId}/status`,
    payload
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
  // uid = null ได้ → /api/jobs ไม่มี match score
  const { data } = await apiClient.get(`/api/jobs${uid ? `?user_id=${uid}` : ''}`);
  return data;
};

export const fetchJobsFiltered = async ({
  q,
  position,
  level,
  type,
  industry,
  salary_min,
  salary_max,
  sort = "newest",
  page = 1,
  limit = 24,
  userId,
} = {}) => {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (position && position !== "all") params.set("position", position);
  if (level && level !== "all") params.set("level", level);
  if (type && type !== "all") params.set("type", type);
  if (industry && industry !== "all") params.set("industry", industry);
  if (salary_min && salary_min > 0) params.set("salary_min", salary_min);
  if (salary_max && salary_max < 250000) params.set("salary_max", salary_max);
  if (sort) params.set("sort", sort);
  params.set("page", page);
  params.set("limit", limit);
  if (userId) params.set("user_id", userId);

  const { data } = await apiClient.get(`/api/jobs?${params.toString()}`);
  return data;
};

export const fetchJobDetailWithMatch = async (jobId, userId) => {
  const uid = userId ?? getCurrentUserId();
  const { data } = await apiClient.get(`/api/jobs/${jobId}${uid ? `?user_id=${uid}` : ''}`);
  return data;
};

export const fetchMatchScore = async (jobId, userId) => {
  const uid = userId ?? getCurrentUserId();
  if (!uid) throw new Error('User not authenticated');
  const { data } = await apiClient.get(`/api/match-score/${jobId}?user_id=${uid}`);
  return data;
};

// ============================================================
// FAVORITES (⭐ ใหม่ — ส่งผ่าน apiClient)
// ============================================================

export const fetchFavorites = async () => {
  // ⭐ backend ใช้ g.user_id จาก cookie
  const { data } = await apiClient.get('/api/favorites');
  return data;
};

export const toggleFavorite = async (jobId) => {
  // ⭐ user_id ไม่ต้องส่ง — backend ใช้ g.user_id
  const { data } = await apiClient.post('/api/favorites/toggle', {
    job_id: jobId,
  });
  return data;
};

// ============================================================
// EMPLOYER: ANALYTICS
// ============================================================

export const fetchEmployerAnalytics = async ({ period = '30' } = {}) => {
  const { data } = await apiClient.get(`/api/employer/analytics?period=${period}`);
  return data;
};

// ============================================================
// EMPLOYER: JOB MANAGEMENT (Sprint 11)
// ============================================================

export const updateEmployerJob = async (jobId, data) => {
  const { data: response } = await apiClient.put(
    `/api/employer/jobs/${jobId}`,
    data
  );
  return response;
};

export const deleteEmployerJob = async (jobId) => {
  const { data } = await apiClient.delete(`/api/employer/jobs/${jobId}`);
  return data;
};

export const updateJobStatus = async (jobId, status) => {
  const { data } = await apiClient.patch(
    `/api/employer/jobs/${jobId}/status`,
    { status }
  );
  return data;
};

// ─── Export analytics with full applicant details ───
export const exportEmployerAnalytics = async ({ period = '30' } = {}) => {
  const { data } = await apiClient.get(`/api/employer/analytics/export?period=${period}`);
  return data;
};

// ─── Analytics widgets (Top Matches / Funnel / Activity) ───
export const fetchAnalyticsWidgets = async ({ period = '30' } = {}) => {
  const { data } = await apiClient.get(`/api/employer/analytics/widgets?period=${period}`);
  return data;
};

// ─── BFF: All applications in 1 call ───
export const fetchAllEmployerApplications = async () => {
  const { data } = await apiClient.get('/api/employer/applications/all');
  return data;
};