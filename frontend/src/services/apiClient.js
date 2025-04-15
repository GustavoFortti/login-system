import axios from "axios";
import { refreshAccessToken } from "./authService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token nas requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para renovar token automaticamente
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Evita loop infinito
    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      error.response?.data?.message?.includes("expired")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const data = await refreshAccessToken(refreshToken);
        localStorage.setItem("accessToken", data.accessToken);

        // Atualiza o token na requisição original
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
