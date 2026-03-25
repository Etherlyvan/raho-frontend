import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { env } from "@/lib/env";

const TOKEN_KEY  = "raho_token";
const COOKIE_OPTS = { expires: 1, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production" };

// ─── Token helpers ─────────────────────────────────────────────

export const tokenStorage = {
  get:    ()            => Cookies.get(TOKEN_KEY) ?? null,
  set:    (t: string)   => Cookies.set(TOKEN_KEY, t, COOKIE_OPTS),
  remove: ()            => Cookies.remove(TOKEN_KEY),
};

// ─── Axios instance ────────────────────────────────────────────

export const api = axios.create({
  baseURL:         env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers:         { "Content-Type": "application/json" },
  timeout:         15_000,
});

// ─── Request interceptor — attach Bearer token ─────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — handle 401 ────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.remove();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Wrapper dengan helper methods — di-import oleh semua endpoint file
// sebagai: import api from '@/lib/api/axios'
const apiClient = {
  getApiResponse: <T>(url: string, config?: AxiosRequestConfig) =>
    api.get<ApiResponse<T>>(url, config),

  getPaginatedResponse: <T>(
    url: string,
    params?: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ) => api.get<PaginatedResponse<T>>(url, { params, ...config }),

  postApiResponse: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<ApiResponse<T>>(url, data, config),

  patchApiResponse: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<ApiResponse<T>>(url, data, config),

  putApiResponse: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.put<ApiResponse<T>>(url, data, config),

  deleteApiResponse: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<ApiResponse<T>>(url, config),

  getBlob: (url: string, config?: AxiosRequestConfig) =>
    api.get<Blob>(url, { responseType: 'blob', ...config }),
};

export default apiClient;