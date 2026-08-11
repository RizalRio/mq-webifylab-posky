import { apiClient } from "../axios";

export interface DashboardMetrics {
  revenue: {
    total: number;
    growth: number;
  };
  transactions: {
    total: number;
    growth: number;
  };
  customers: {
    total: number;
    growth: number;
  };
  inventory: {
    low_stock_count: number;
  };
  sales_trend: Array<{
    date: string;
    sales: number;
  }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardMetrics;
}

export interface RfmCustomerItem {
  id: string;
  name: string;
  phone: string | null;
  last_transaction_at: string | null;
  total_transactions: number;
  total_spent: number;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_segment: string;
}

export interface RfmAnalyticsResponse {
  success: boolean;
  message: string;
  summary: Record<string, number>;
  data: RfmCustomerItem[];
}

export type CohortMatrixData = Record<string, Record<string, number>>;

export interface CohortAnalyticsResponse {
  success: boolean;
  message: string;
  data: CohortMatrixData;
}

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await apiClient.get<DashboardResponse>(
    "/analytics/dashboard",
  );
  return response.data.data;
};

export const getRfmAnalytics = async (): Promise<RfmAnalyticsResponse> => {
  const response = await apiClient.get<RfmAnalyticsResponse>("/analytics/rfm");
  return response.data;
};

export const getCohortAnalytics = async (): Promise<CohortMatrixData> => {
  const response = await apiClient.get<CohortAnalyticsResponse>("/analytics/cohort");
  return response.data.data;
};
