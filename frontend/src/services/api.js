const API_BASE = import.meta.env?.VITE_API_BASE_URL || "/api";

export function getStoredTokens() {
  try {
    const raw = localStorage.getItem("placetrace_tokens");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens) {
  if (!tokens) {
    localStorage.removeItem("placetrace_tokens");
  } else {
    localStorage.setItem("placetrace_tokens", JSON.stringify(tokens));
  }
}

export async function apiRequest(endpoint, options = {}) {
  const tokens = getStoredTokens();
  const headers = {
    ...(options.isFormData ? {} : { "Content-Type": "application/json" }),
    ...(tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errMsg =
      data?.message ||
      data?.detail ||
      (typeof data?.details === "string" ? data.details : null) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication & Account
  auth: {
    login: (payload) =>
      apiRequest("/auth/login/", { method: "POST", body: JSON.stringify(payload) }),
    register: (payload) =>
      apiRequest("/auth/register/", { method: "POST", body: JSON.stringify(payload) }),
    logout: (refresh) =>
      apiRequest("/auth/logout/", { method: "POST", body: JSON.stringify({ refresh }) }),
    verifyEmail: (token) =>
      apiRequest("/auth/verify-email/", { method: "POST", body: JSON.stringify({ token }) }),
    resendVerification: () =>
      apiRequest("/auth/resend-verification/", { method: "POST" }),
    forgotPassword: (email) =>
      apiRequest("/auth/forgot-password/", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (payload) =>
      apiRequest("/auth/reset-password/", { method: "POST", body: JSON.stringify(payload) }),
    me: () => apiRequest("/auth/me/"),
    updateMe: (payload) =>
      apiRequest("/auth/me/", { method: "PATCH", body: JSON.stringify(payload) }),
    notifications: () => apiRequest("/auth/notifications/"),
    markNotificationsRead: (id = null) =>
      apiRequest(id ? `/auth/notifications/${id}/read/` : "/auth/notifications/read/", {
        method: "POST",
      }),
    exportData: () => apiRequest("/auth/export-data/"),
    deleteAccount: (password) =>
      apiRequest("/auth/delete-account/", {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
    // Admin endpoints
    adminUsers: (params = "") => apiRequest(`/auth/admin/users/${params}`),
    adminUpdateUser: (id, payload) =>
      apiRequest(`/auth/admin/users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    adminInviteCodes: () => apiRequest("/auth/admin/invite-codes/"),
    adminCreateInviteCode: (payload) =>
      apiRequest("/auth/admin/invite-codes/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    adminAuditLogs: (params = "") => apiRequest(`/auth/admin/audit-logs/${params}`),
  },

  // Students & Skills & Resume
  students: {
    getMe: () => apiRequest("/students/me/"),
    updateMe: (payload) =>
      apiRequest("/students/me/", { method: "PATCH", body: JSON.stringify(payload) }),
    getSkills: () => apiRequest("/students/me/skills/"),
    addSkill: (payload) =>
      apiRequest("/students/me/skills/", { method: "POST", body: JSON.stringify(payload) }),
    updateSkill: (id, payload) =>
      apiRequest(`/students/me/skills/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    removeSkill: (id) =>
      apiRequest(`/students/me/skills/${id}/`, { method: "DELETE" }),
    getResume: () => apiRequest("/students/me/resume/"),
    uploadResume: (payloadOrFormData, isFormData = false) =>
      apiRequest("/students/me/resume/", {
        method: "POST",
        isFormData,
        body: isFormData ? payloadOrFormData : JSON.stringify(payloadOrFormData),
      }),
    // TPO Student Management
    listAll: (queryString = "") => apiRequest(`/students/${queryString}`),
    updateStudentStatus: (id, payload) =>
      apiRequest(`/students/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  },

  skills: {
    list: () => apiRequest("/skills/"),
  },

  companies: {
    list: (queryString = "") => apiRequest(`/companies/${queryString}`),
    create: (payload) =>
      apiRequest("/companies/", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      apiRequest(`/companies/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  },

  jobs: {
    list: (queryString = "") => apiRequest(`/jobs/${queryString}`),
    recommended: () => apiRequest("/jobs/recommended/"),
    detail: (id) => apiRequest(`/jobs/${id}/`),
    create: (payload) =>
      apiRequest("/jobs/", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      apiRequest(`/jobs/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    bookmark: (id) =>
      apiRequest(`/jobs/${id}/bookmark/`, { method: "POST" }),
  },

  applications: {
    list: (queryString = "") => apiRequest(`/applications/${queryString}`),
    detail: (id) => apiRequest(`/applications/${id}/`),
    apply: (payload) =>
      apiRequest("/applications/", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      apiRequest(`/applications/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  },

  placements: {
    list: (queryString = "") => apiRequest(`/placements/${queryString}`),
    create: (payload) =>
      apiRequest("/placements/", { method: "POST", body: JSON.stringify(payload) }),
  },

  study: {
    roadmap: () => apiRequest("/study/roadmap/"),
    updateRoadmapTopic: (id, status) =>
      apiRequest(`/study/roadmap/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    tasks: (queryString = "") => apiRequest(`/study/tasks/${queryString}`),
    createTask: (payload) =>
      apiRequest("/study/tasks/", { method: "POST", body: JSON.stringify(payload) }),
    updateTask: (id, payload) =>
      apiRequest(`/study/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    deleteTask: (id) =>
      apiRequest(`/study/tasks/${id}/`, { method: "DELETE" }),
  },

  quizzes: {
    list: (queryString = "") => apiRequest(`/quizzes/${queryString}`),
    dashboard: () => apiRequest("/quizzes/dashboard/"),
    detail: (id) => apiRequest(`/quizzes/${id}/`),
    submit: (id, answers) =>
      apiRequest(`/quizzes/${id}/submit/`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      }),
  },

  projects: {
    list: () => apiRequest("/projects/"),
    create: (payload) =>
      apiRequest("/projects/", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      apiRequest(`/projects/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
    delete: (id) =>
      apiRequest(`/projects/${id}/`, { method: "DELETE" }),
  },

  resources: {
    list: (queryString = "") => apiRequest(`/resources/${queryString}`),
    create: (payload) =>
      apiRequest("/resources/", { method: "POST", body: JSON.stringify(payload) }),
  },

  analytics: {
    platform: () => apiRequest("/analytics/"),
    studentDashboard: () => apiRequest("/analytics/student-dashboard/"),
  },

  ml: {
    analyzeResume: (raw_text) =>
      apiRequest("/ml/analyze-resume/", {
        method: "POST",
        body: JSON.stringify({ raw_text }),
      }),
    parseJd: (jd_text, title = "") =>
      apiRequest("/ml/parse-jd/", {
        method: "POST",
        body: JSON.stringify({ jd_text, title }),
      }),
    skillGap: (job_id) =>
      apiRequest("/ml/skill-gap/", {
        method: "POST",
        body: JSON.stringify({ job_id }),
      }),
    jobCompatibility: () => apiRequest("/ml/job-compatibility/"),
  },
};
