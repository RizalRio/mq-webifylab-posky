import { apiClient } from "../axios";
import type { ApiResponse } from "@/types";
import type { PaginatedResponse } from "./products";

export interface BackendCustomer {
  id: string;
  tenant_id?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  last_transaction_at?: string;
  total_transactions?: number;
  total_spent?: number;
  r_score?: number;
  f_score?: number;
  m_score?: number;
  rfm_segment?: string;
  created_at?: string;
  updated_at?: string;
  transactions_count?: number;
}

export const customersApi = {
  // GET /customers
  getCustomers: async (params?: {
    search?: string;
    rfm_segment?: string;
    sort?: "name" | "created_at";
    order?: "asc" | "desc";
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<BackendCustomer>>("/customers", { params });
    return response.data;
  },

  // GET /analytics/rfm
  getRfmAnalytics: async () => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      summary: Record<string, number>;
      data: BackendCustomer[];
    }>("/analytics/rfm");
    return response.data;
  },

  // POST /customers
  createCustomer: async (data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<BackendCustomer>>("/customers", data);
    return response.data;
  },

  // GET /customers/{id}
  getCustomer: async (id: string) => {
    const response = await apiClient.get<ApiResponse<BackendCustomer>>(`/customers/${id}`);
    return response.data;
  },

  // PUT /customers/{id}
  updateCustomer: async (
    id: string,
    data: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
    }
  ) => {
    const response = await apiClient.put<ApiResponse<BackendCustomer>>(`/customers/${id}`, data);
    return response.data;
  },

  // DELETE /customers/{id}
  deleteCustomer: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(`/customers/${id}`);
    return response.data;
  },
};
