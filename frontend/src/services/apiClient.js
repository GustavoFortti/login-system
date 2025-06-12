import axios from "axios";
import { refreshAccessToken } from "./authService";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar access token nas requisições
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

// Interceptor para renovar token automaticamente ao receber "TokenExpiredError"
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.message === "TokenExpiredError";

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const data = await refreshAccessToken(refreshToken);
        localStorage.setItem("accessToken", data.accessToken);

        // Atualiza o token na requisição original
        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest); // Reenvia a requisição original
      } catch (err) {
        // Se falhar a renovação, limpa tudo e redireciona para login
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
