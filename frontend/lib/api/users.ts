import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Interceptor untuk menyematkan Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manajer' | 'kasir';
  created_at?: string;
  updated_at?: string;
}

export const usersApi = {
  getUsers: async () => {
    const res = await api.get('/users');
    return res.data; // { success: true, data: User[] }
  },

  createUser: async (data: Partial<User> & { password?: string }) => {
    const res = await api.post('/users', data);
    return res.data;
  },

  updateUser: async (id: string, data: Partial<User> & { password?: string }) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};
