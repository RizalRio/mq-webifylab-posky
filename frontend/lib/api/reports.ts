import { apiClient as api } from '@/lib/axios';

export interface SalesReportSummary {
  total_transactions: number;
  total_revenue: number;
  total_tax: number;
  total_discount: number;
}

export interface SalesReportData {
  date: string;
  total_transactions: number;
  total_subtotal: number;
  total_discount: number;
  total_tax: number;
  total_revenue: number;
}

export interface SalesReportResponse {
  success: boolean;
  summary: SalesReportSummary;
  data: SalesReportData[];
}

export interface ItemsReportData {
  id: string;
  type: string;
  name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface ItemsReportResponse {
  success: boolean;
  data: ItemsReportData[];
}

export const getSalesReport = async (startDate: string, endDate: string): Promise<SalesReportResponse> => {
  const response = await api.get('/reports/sales', {
    params: { start_date: startDate, end_date: endDate }
  });
  return response.data;
};

export const getItemsReport = async (startDate: string, endDate: string): Promise<ItemsReportResponse> => {
  const response = await api.get('/reports/items', {
    params: { start_date: startDate, end_date: endDate }
  });
  return response.data;
};

export const exportPdfReport = async (startDate: string, endDate: string): Promise<Blob> => {
  const response = await api.get('/reports/export-pdf', {
    params: { start_date: startDate, end_date: endDate },
    responseType: 'blob'
  });
  return response.data;
};
