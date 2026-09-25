import { api } from './api';
import type { Purchase, PurchaseRequest } from '../types';

export interface PurchaseFilter {
  supplierId?: number;
  fromDate?: string;
  toDate?: string;
}

export const purchaseService = {
  async getPurchases(filters?: PurchaseFilter): Promise<Purchase[]> {
    const params = new URLSearchParams();
    if (filters?.supplierId) params.append('supplierId', String(filters.supplierId));
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<Purchase[]>(`/api/v1/purchases${query}`);
  },

  async getPurchaseById(id: number): Promise<Purchase> {
    return api.get<Purchase>(`/api/v1/purchases/${id}`);
  },

  async createPurchase(payload: PurchaseRequest): Promise<{ message: string; id?: number }> {
    return api.post<{ message: string; id?: number }>('/api/v1/purchases', payload);
  }
};
