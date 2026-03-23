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
