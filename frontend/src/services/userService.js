// services/userService.js

import apiClient from "./apiClient";

export const getUser = async () => {
  const response = await apiClient.get("/v1/app/auth/user/show");
  return response.data;
};

export const updateUser = async (formData) => {
  const response = await apiClient.put("/v1/app/auth/user/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};