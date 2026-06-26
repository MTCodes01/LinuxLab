import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('linuxlab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('linuxlab_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
};

// ─── Containers ────────────────────────────────────
export const containersAPI = {
  list: () => api.get('/containers'),
  get: (id) => api.get(`/containers/${id}`),
  create: (data) => api.post('/containers', data),
  delete: (id) => api.delete(`/containers/${id}`),
  start: (id) => api.post(`/containers/${id}/start`),
  stop: (id) => api.post(`/containers/${id}/stop`),
  restart: (id) => api.post(`/containers/${id}/restart`),
  reset: (id) => api.post(`/containers/${id}/reset`),
  stats: (id) => api.get(`/containers/${id}/stats`),
};

// ─── Templates ─────────────────────────────────────
export const templatesAPI = {
  list: () => api.get('/templates'),
  get: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

// ─── Monitoring ────────────────────────────────────
export const monitoringAPI = {
  overview: () => api.get('/monitoring/overview'),
};

// ─── Logs ──────────────────────────────────────────
export const logsAPI = {
  list: (params) => api.get('/logs', { params }),
};

// ─── Sessions ──────────────────────────────────────
export const sessionsAPI = {
  list: (params) => api.get('/sessions', { params }),
};

// ─── WebSocket helpers ─────────────────────────────
export function getTerminalWSUrl(containerId) {
  const token = localStorage.getItem('linuxlab_token');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/terminal/${containerId}?token=${token}`;
}

export function getMonitoringWSUrl(containerId) {
  const token = localStorage.getItem('linuxlab_token');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/monitoring/${containerId}?token=${token}`;
}

export default api;
