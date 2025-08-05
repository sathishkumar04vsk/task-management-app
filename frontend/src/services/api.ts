import axios, { AxiosInstance } from "axios";
import { Auth } from "../store/auth";
import { refreshToken } from "./auth";

const createApiClient = (): AxiosInstance => {
  const token = Auth.getToken();
  const { clear } = Auth;
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refresh = Auth.getRefreshToken();

          if (refresh) {
            const { access } = await refreshToken(refresh);
            Auth.setToken(access, refresh);
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          } else {
            // No refresh token, clear auth and redirect to login
            clear();
            window.location.href = "/login";
          }
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          console.error("Token refresh failed:", refreshError);
          clear();
          window.location.href = "/login";
        }
      } else if (error.response?.status === 401) {
        // Already retried or no refresh token, clear auth and redirect to login
        clear();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
  return api;
};

export default createApiClient;
