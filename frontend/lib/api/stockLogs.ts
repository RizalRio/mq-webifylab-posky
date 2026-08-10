import { apiClient } from "../axios";
import type { ApiResponse } from "@/types";
import type { PaginatedResponse } from "./products";

export interface BackendStockLog {
  id: string;
  tenant_id: string;
  product_id: string;
  user_id?: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export const stockLogsApi = {
  // GET /stock-logs
  getStockLogs: async (params?: {
    type?: "in" | "out" | "adjustment";
    product_id?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<BackendStockLog>>("/stock-logs", { params });
    return response.data;
  },

  // POST /stock-logs
  adjustStock: async (data: {
    product_id: string;
    type: "in" | "out" | "adjustment";
    quantity: number;
    notes?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<BackendStockLog>>("/stock-logs", data);
    return response.data;
  },
};
