import axios from 'axios';

// __API_URL__ is replaced at build-time by Vite's `define`:
//   • dev  → '/api'  (Vite proxy forwards to localhost:5001)
//   • prod → the absolute Render API URL via VITE_API_URL env var
/* global __API_URL__ */
const api = axios.create({
  baseURL: typeof __API_URL__ !== 'undefined' ? __API_URL__ : '/api',
  withCredentials: true,
});

let accessToken = localStorage.getItem('accessToken') || '';
let csrfToken = localStorage.getItem('csrfToken') || '';

export function setSession({ accessToken: at, csrfToken: ct } = {}) {
  if (at !== undefined) {
    accessToken = at || '';
    if (at) localStorage.setItem('accessToken', at);
    else localStorage.removeItem('accessToken');
  }
  if (ct !== undefined) {
    csrfToken = ct || '';
    if (ct) localStorage.setItem('csrfToken', ct);
    else localStorage.removeItem('csrfToken');
  }
}

export function clearSession() {
  accessToken = '';
  csrfToken = '';
  localStorage.removeItem('accessToken');
  localStorage.removeItem('csrfToken');
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (csrfToken) config.headers['X-CSRF-Token'] = csrfToken;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/login')) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = api.post('/auth/refresh').then((r) => {
            setSession({ accessToken: r.data.accessToken, csrfToken: r.data.csrfToken });
            return r.data;
          }).finally(() => {
            refreshing = null;
          });
        }
        await refreshing;
        original.headers.Authorization = `Bearer ${accessToken}`;
        original.headers['X-CSRF-Token'] = csrfToken;
        return api(original);
      } catch {
        clearSession();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
