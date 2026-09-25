import { api } from './api';
import type { Supplier, SupplierRequest } from '../types';

export const supplierService = {
  async getSuppliers(search?: string): Promise<Supplier[]> {
    const query = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return api.get<Supplier[]>(`/api/v1/suppliers${query}`);
  },

  async getSupplier(id: number): Promise<Supplier> {
    return api.get<Supplier>(`/api/v1/suppliers/${id}`);
  },

  async createSupplier(payload: SupplierRequest): Promise<{ message: string; id?: number }> {
    return api.post<{ message: string; id?: number }>('/api/v1/suppliers', payload);
  },

  async updateSupplier(id: number, payload: SupplierRequest): Promise<{ message: string }> {
    return api.put<{ message: string }>(`/api/v1/suppliers/${id}`, payload);
  },

  async deleteSupplier(id: number): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/api/v1/suppliers/${id}`);
  }
};
