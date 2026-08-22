import { apiClient } from "../axios";

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  ahp_score?: number;
  rank?: number;
  created_at?: string;
}

export interface Criterion {
  id: string;
  code: string;
  name: string;
  type: "cost" | "benefit";
}

export interface CreateSupplierPayload {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierEvaluationInput {
  supplier_id: string;
  criterion_id: string;
  raw_value: number;
}

export interface CriterionComparisonInput {
  criterion_id_1: string;
  criterion_id_2: string;
  value: number;
}

export interface CriterionComparisonData {
  criterion_id_1: string;
  criterion_id_2: string;
  value: number;
}

export interface SupplierEvaluationData {
  supplier_id: string;
  criterion_id: string;
  raw_value: number;
}

export const suppliersApi = {
  // GET /suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<{ success: boolean; data: Supplier[] }>("/suppliers");
    return response.data.data;
  },

  // POST /suppliers
  createSupplier: async (payload: CreateSupplierPayload): Promise<Supplier> => {
    const response = await apiClient.post<{ success: boolean; data: Supplier }>("/suppliers", payload);
    return response.data.data;
  },

  // PUT /suppliers/{id}
  updateSupplier: async (id: string, payload: CreateSupplierPayload): Promise<Supplier> => {
    const response = await apiClient.put<{ success: boolean; data: Supplier }>(`/suppliers/${id}`, payload);
    return response.data.data;
  },

  // DELETE /suppliers/{id}
  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },

  // GET /criteria
  getCriteria: async (): Promise<Criterion[]> => {
    const response = await apiClient.get<{ success: boolean; data: Criterion[] }>("/criteria");
    return response.data.data;
  },

  // GET /supplier-evaluations
  getEvaluations: async (): Promise<SupplierEvaluationData[]> => {
    const response = await apiClient.get<{ success: boolean; data: SupplierEvaluationData[] }>("/supplier-evaluations");
    return response.data.data;
  },

  // POST /supplier-evaluations/bulk
  saveEvaluationsBulk: async (evaluations: SupplierEvaluationInput[]): Promise<void> => {
    await apiClient.post("/supplier-evaluations/bulk", { evaluations });
  },

  // GET /criterion-comparisons
  getComparisons: async (): Promise<CriterionComparisonData[]> => {
    const response = await apiClient.get<{ success: boolean; data: CriterionComparisonData[] }>("/criterion-comparisons");
    return response.data.data;
  },

  // POST /criterion-comparisons/bulk
  saveComparisonsBulk: async (comparisons: CriterionComparisonInput[]): Promise<void> => {
    await apiClient.post("/criterion-comparisons/bulk", { comparisons });
  },
};
