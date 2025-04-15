// services/authService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/v1/app/login/register`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/v1/app/login/sign-in`, credentials);
  return response.data;
};

export const requestResetCode = async (email) => {
  const response = await axios.post(`${API_URL}/v1/app/login/lost-password/request-reset`, { email });
  return response.data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await axios.post(`${API_URL}/v1/app/login/lost-password/reset-password`, { token, newPassword });
  return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await axios.post(`${API_URL}/v1/app/login/refresh-token`, { refreshToken });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await axios.post(`${API_URL}/v1/app/login/verify-email`, { token });
  return response.data;
};

export const googleLogin = async (idToken) => {
  const response = await axios.post(`${API_URL}/v1/app/login/google-login`, { idToken });
  return response.data;
};