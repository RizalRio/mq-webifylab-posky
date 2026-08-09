import { apiClient } from "../axios";
import type { ApiResponse } from "@/types";

export interface BackendProduct {
  id: string;
  tenant_id?: string;
  sku: string;
  name: string;
  category?: string;
  stock: number;
  min_stock_threshold?: number;
  cost_price: string | number;
  sell_price: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface BackendService {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: string | number;
  created_at?: string;
}

export interface BackendRentalItem {
  id: string;
  serial_number: string;
  name: string;
  category?: string;
  daily_rate: string | number;
  deposit_amount: string | number;
  status: "available" | "rented" | "maintenance";
  created_at?: string;
}

export interface PaginatedMeta {
  page: number;
  per_page: number;
  total: number;
  last_page?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginatedMeta;
}

export const productsApi = {
  // GET /products (Barang)
  getProducts: async (params?: { search?: string; category?: string; low_stock?: boolean; page?: number; per_page?: number }) => {
    const response = await apiClient.get<PaginatedResponse<BackendProduct>>("/products", { params });
    return response.data;
  },

  // POST /products
  createProduct: async (data: {
    sku: string;
    name: string;
    category?: string;
    stock: number;
    min_stock_threshold?: number;
    cost_price: number;
    sell_price: number;
  }) => {
    const response = await apiClient.post<ApiResponse<BackendProduct>>("/products", data);
    return response.data;
  },

  // PUT /products/{id}
  updateProduct: async (id: string, data: Partial<BackendProduct>) => {
    const response = await apiClient.put<ApiResponse<BackendProduct>>(`/products/${id}`, data);
    return response.data;
  },

  // DELETE /products/{id}
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
    return response.data;
  },

  // GET /services (Jasa)
  getServices: async (params?: { search?: string; page?: number; per_page?: number }) => {
    const response = await apiClient.get<PaginatedResponse<BackendService>>("/services", { params });
    return response.data;
  },

  // POST /services
  createService: async (data: {
    name: string;
    description?: string;
    duration_minutes: number;
    price: number;
  }) => {
    const response = await apiClient.post<ApiResponse<BackendService>>("/services", data);
    return response.data;
  },

  // PUT /services/{id}
  updateService: async (id: string, data: Partial<BackendService>) => {
    const response = await apiClient.put<ApiResponse<BackendService>>(`/services/${id}`, data);
    return response.data;
  },

  // DELETE /services/{id}
  deleteService: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/services/${id}`);
    return response.data;
  },

  // GET /rental-items (Sewa)
  getRentalItems: async (params?: { search?: string; status?: string; page?: number; per_page?: number }) => {
    const response = await apiClient.get<PaginatedResponse<BackendRentalItem>>("/rental-items", { params });
    return response.data;
  },

  // POST /rental-items
  createRentalItem: async (data: {
    serial_number: string;
    name: string;
    category?: string;
    daily_rate: number;
    deposit_amount: number;
  }) => {
    const response = await apiClient.post<ApiResponse<BackendRentalItem>>("/rental-items", data);
    return response.data;
  },

  // PUT /rental-items/{id}
  updateRentalItem: async (id: string, data: Partial<BackendRentalItem>) => {
    const response = await apiClient.put<ApiResponse<BackendRentalItem>>(`/rental-items/${id}`, data);
    return response.data;
  },

  // DELETE /rental-items/{id}
  deleteRentalItem: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/rental-items/${id}`);
    return response.data;
  },
};
