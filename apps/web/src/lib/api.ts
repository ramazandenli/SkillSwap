import axios from 'axios';

const STORAGE_KEY = 'ss_token';

let accessToken: string | null = localStorage.getItem(STORAGE_KEY);
let onAuthChange: ((token: string | null) => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
  onAuthChange?.(token);
}

export function getAccessToken() {
  return accessToken;
}

export function subscribeAuth(cb: (token: string | null) => void) {
  onAuthChange = cb;
}

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      setAccessToken(null);
    }
    return Promise.reject(error);
  },
);
