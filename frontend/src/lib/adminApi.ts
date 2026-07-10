import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let accessToken = "";

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

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

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized =
      error.response?.status === 401 ||
      error.response?.data?.error?.code === "UNAUTHORIZED";

    if (isUnauthorized && !originalRequest._retry) {
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
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed or expired
        setAccessToken("");
        if (typeof window !== "undefined") {
          // Fire event or redirect
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
