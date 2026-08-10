import { apiClient } from "../axios";
import type { ApiResponse } from "@/types";
import type { PaginatedResponse } from "./products";

export interface TransactionItemPayload {
  itemable_type: "product" | "service" | "rental_item" | string;
  itemable_id: string;
  quantity: number;
  unit_price: number;
  scheduled_start?: string;
  technician_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface CreateTransactionPayload {
  customer_id?: string | null;
  type: "sale" | "service" | "rental" | "mixed" | string;
  payment_method: "cash" | "qris" | "transfer" | string;
  discount?: number;
  tax?: number;
  deposit_paid?: number;
  items: TransactionItemPayload[];
}

export interface BackendTransactionItem {
  id: string;
  transaction_id: string;
  itemable_type: string;
  itemable_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  itemable?: any;
  rentalBooking?: {
    id: string;
    start_date: string;
    end_date: string;
    actual_return_date?: string | null;
    late_fee?: number;
  };
  serviceSchedule?: {
    id: string;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
  };
}

export interface BackendTransaction {
  id: string;
  tenant_id: string;
  customer_id?: string | null;
  cashier_id: string;
  type: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  items: BackendTransactionItem[];
}

export interface ReturnRentalPayload {
  actual_return_date: string;
  condition?: string;
  notes?: string;
}

export interface ReturnRentalResponse {
  transaction_id: string;
  actual_return_date: string;
  expected_return_date: string | null;
  days_late: number;
  late_fee: number;
  deposit_refund: number;
  total_charged: number;
}

export const transactionsApi = {
  // GET /transactions
  getTransactions: async (params?: {
    search?: string;
    type?: string;
    payment_method?: string;
    sort?: string;
    order?: "asc" | "desc";
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get<PaginatedResponse<BackendTransaction>>("/transactions", { params });
    return response.data;
  },

  // GET /transactions/{id}
  getTransaction: async (id: string) => {
    const response = await apiClient.get<ApiResponse<BackendTransaction>>(`/transactions/${id}`);
    return response.data;
  },

  // POST /transactions
  createTransaction: async (data: CreateTransactionPayload) => {
    const response = await apiClient.post<ApiResponse<BackendTransaction>>("/transactions", data);
    return response.data;
  },

  // POST /transactions/{id}/return
  returnRental: async (id: string, data: ReturnRentalPayload) => {
    const response = await apiClient.post<ApiResponse<ReturnRentalResponse>>(`/transactions/${id}/return`, data);
    return response.data;
  },
};
