/**
 * axiosInstance.js
 * Configured Axios instance for EzBias API.
 * - Base URL from env
 * - 30s timeout
 * - Auto-attach Authorization header from localStorage
 * - Response transformer: always returns { success, data, message }
 * - Global 401 redirect to login
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5171";
const TOKEN_KEY = "ezbias_user";

function getToken() {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export function ok(data, message = "Success") {
  return { success: true, data, message };
}

export function fail(message, data = null) {
  return { success: false, data, message };
}

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request: attach token ─────────────────────────────────────────────────────

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: normalize to { success, data, message } ────────────────────────

instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data.success === "boolean") return data;
    return ok(data);
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.resolve(fail("Request cancelled."));
    }

    if (!error.response) {
      const msg =
        error.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Network error. Check your connection.";
      return Promise.resolve(fail(msg));
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Auth endpoints returning 401 mean wrong credentials — don't redirect,
      // just return the server's message so the form can display it.
      const isAuthEndpoint = error.config?.url?.startsWith("/api/auth/");
      if (!isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY);
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
      const msg = data?.message ?? "Session expired. Please log in again.";
      return Promise.resolve(fail(msg));
    }

    const message =
      data?.message ??
      {
        400: "Invalid request.",
        403: "You don't have permission to do that.",
        404: "Resource not found.",
        422: "Validation failed.",
        500: "Server error. Please try again later.",
      }[status] ??
      `Request failed (${status}).`;

    return Promise.resolve(fail(message, data ?? null));
  },
);

export default instance;
