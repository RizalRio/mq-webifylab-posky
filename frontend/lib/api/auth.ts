import { apiClient } from "../axios";
import type { LoginCredentials, AuthResponse, ApiResponse } from "@/types";

export const authApi = {
  // Fungsi untuk Login
  login: async (credentials: LoginCredentials) => {
    // Menembak ke endpoint http://localhost:8080/api/v1/auth/login
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

  // Fungsi untuk Register (opsional jika pembuatan akun hanya via Admin)
  register: async (data: any) => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data,
    );
    return response.data;
  },
};
