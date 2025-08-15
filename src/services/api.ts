import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach access token on requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('tacar_token');
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function onTokenRefreshed(newToken: string | null) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

function addPendingRequest(cb: (token: string | null) => void) {
  pendingRequests.push(cb);
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Skip refresh for auth endpoints
    const isAuthEndpoint = /\/auth\/(login|register|refresh|logout)/.test(url || '');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('tacar_refresh');
        try {
          const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { access_token, refresh_token } = resp.data || {};
          if (access_token) {
            localStorage.setItem('tacar_token', access_token);
            (api.defaults.headers as any).Authorization = `Bearer ${access_token}`;
          }
          if (refresh_token) {
            localStorage.setItem('tacar_refresh', refresh_token);
          }
          onTokenRefreshed(access_token || null);
        } catch (e) {
          onTokenRefreshed(null);
          // Cleanup local storage on refresh failure
          localStorage.removeItem('tacar_token');
          localStorage.removeItem('tacar_refresh');
          localStorage.removeItem('tacar_user');
          throw e;
        } finally {
          isRefreshing = false;
        }
      }

      return new Promise((resolve, reject) => {
        addPendingRequest((token) => {
          if (!token) return reject(error);
          if (!originalRequest.headers) originalRequest.headers = {};
          (originalRequest.headers as any).Authorization = `Bearer ${token}`;
          resolve(api(originalRequest as any));
        });
      });
    }
    return Promise.reject(error);
  },
);

export default api;