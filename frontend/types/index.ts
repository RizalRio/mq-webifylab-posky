// src/types/index.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type Role = "ADMIN" | "KASIR" | "PAKAR" | "admin" | "kasir" | "cashier" | string;

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type BusinessMode = "BARANG" | "JASA" | "SEWA";

export interface Product {
  id: string | number;
  sku: string;
  name: string;
  mode: BusinessMode;
  price: number;
  stock: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export interface AHPRecommendation {
  id: string | number;
  supplierName: string;
  ahpScore: number;
  rank: number;
  category: "Terbaik" | "Alternatif" | "Hindari";
}

export interface ProphetPrediction {
  date: string;
  actualAmount: number | null;
  predictedAmount: number;
  confidenceLowerBound?: number;
  confidenceUpperBound?: number;
}
