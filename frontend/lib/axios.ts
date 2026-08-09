import axios from "axios";
import Router from "next/router";
import { useAuthStore } from "@/store/useAuthStore"; // 1. Impor Zustand Store

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
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

// 2. Interceptor untuk menangkap error dari Backend Golang
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika backend menolak karena token kedaluwarsa/tidak valid (Status 401 Unauthorized)
    if (error.response?.status === 401) {
      console.warn(
        "Sesi berakhir atau token tidak valid. Melakukan auto-logout...",
      );

      // Panggil fungsi logout dari Zustand tanpa hooks
      useAuthStore.getState().logout();

      // Arahkan paksa ke halaman login
      if (typeof window !== "undefined") {
        Router.push("/login");
      }
    }
    return Promise.reject(error);
  },
);
