import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

let accessToken = "";
// Guard: localStorage is only available in browser (not during SSR)
if (typeof window !== "undefined") {
  accessToken = localStorage.getItem("admin_token") || "";
}

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

/** Returns true if the error is a network connectivity failure (backend unreachable) */
const isNetworkError = (error: any): boolean =>
  !error.response &&
  (error.code === "ERR_NETWORK" ||
    error.code === "ECONNREFUSED" ||
    error.message === "Network Error");

export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ensure refresh token cookies are sent
});

adminApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints that should NOT trigger the silent refresh flow
const AUTH_ENDPOINTS = ["/admin/refresh", "/admin/login", "/admin/verify"];

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If backend is completely unreachable (no response), skip refresh logic
    if (isNetworkError(error)) {
      return Promise.reject(error);
    }

    const isUnauthorized =
      error.response?.status === 401 ||
      error.response?.data?.error?.code === "UNAUTHORIZED";

    // Skip refresh logic for auth endpoints themselves to avoid loops
    const requestUrl: string = originalRequest?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    if (isUnauthorized && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Attempt silent refresh
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/admin/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data?.data?.token || refreshResponse.data?.token;
        if (newToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_token", newToken);
          }
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed or expired — clear state silently
        setAccessToken("");
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          // Only redirect if on an admin-protected page
          if (window.location.pathname.startsWith("/admin") &&
              window.location.pathname !== "/admin/login") {
            window.location.href = "/admin/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
