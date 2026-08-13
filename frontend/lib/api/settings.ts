import { apiClient } from "../axios";

export interface TenantSettings {
  id: string;
  name: string;
  subdomain: string;
  business_type: string;
  phone: string | null;
  address: string | null;
  tax_percentage: number;
  receipt_footer: string | null;
  default_discount: number;
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  data: TenantSettings;
}

export interface UpdateSettingsPayload {
  name?: string;
  phone?: string | null;
  address?: string | null;
  tax_percentage?: number;
  receipt_footer?: string | null;
  default_discount?: number;
}

export const settingsApi = {
  // GET /settings
  getSettings: async (): Promise<TenantSettings> => {
    const response = await apiClient.get<SettingsResponse>("/settings");
    return response.data.data;
  },

  // PUT /settings
  updateSettings: async (payload: UpdateSettingsPayload): Promise<TenantSettings> => {
    const response = await apiClient.put<SettingsResponse>("/settings", payload);
    return response.data.data;
  },
};
