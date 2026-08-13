import { apiClient } from "../axios";
import type { LoginCredentials, AuthResponse, ApiResponse } from "@/types";

export const authApi = {
  // Fungsi untuk Login
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data;
  },

  // Fungsi untuk mendapatkan profil user saat ini (Validasi Token)
  getMe: async () => {
    const response = await apiClient.get<ApiResponse<AuthResponse>>("/auth/me");
    return response.data;
  },

  // Fungsi untuk Logout
  logout: async () => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>("/auth/logout");
    return response.data;
  },

  // Fungsi untuk Register
  register: async (data: any) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data,
    );
    return response.data;
  },
};
