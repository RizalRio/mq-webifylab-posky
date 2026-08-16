import { apiClient } from "../axios";

export interface AhpSupplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  ahp_score?: number;
  rank?: number;
  category?: string;
}

export interface AhpResponse {
  success: boolean;
  message: string;
  data: AhpSupplier[];
}

export interface StockPrediction {
  id: string;
  product_id: string;
  estimated_stockout_date: string;
  safety_stock_level: number;
  confidence_score: number;
  last_calculated_at: string;
  product?: {
    id: string;
    name: string;
    stock: number;
  };
}

export interface ProphetResponse {
  success: boolean;
  message: string;
  data: StockPrediction[];
}

export const aiApi = {
  // GET /ahp/recommendations
  getAhpRecommendations: async (): Promise<AhpSupplier[]> => {
    const response = await apiClient.get<AhpResponse>("/ahp/recommendations");
    return response.data.data;
  },

  // POST /ahp/calculate
  triggerAhpCalculation: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>("/ahp/calculate");
    return response.data;
  },

  // GET /prophet/predictions
  getProphetPredictions: async (): Promise<StockPrediction[]> => {
    const response = await apiClient.get<ProphetResponse>("/prophet/predictions");
    return response.data.data;
  },

  // POST /prophet/predict
  triggerProphetPrediction: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>("/prophet/predict");
    return response.data;
  },
};
