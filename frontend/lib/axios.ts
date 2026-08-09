import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore"; // 1. Impor Zustand Store

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 2. Interceptor untuk menangkap error dari Backend (Status 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(
        "Sesi berakhir atau token tidak valid. Melakukan auto-logout...",
      );

      // Panggil fungsi logout dari Zustand
      useAuthStore.getState().logout();

      // Arahkan paksa ke halaman login tanpa import next/router
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
