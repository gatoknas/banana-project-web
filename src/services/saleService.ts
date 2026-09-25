import { api } from './api';
import type { Sale, PaginatedSalesResponse, SaleFilter } from '../types';

export const saleService = {
  async getSales(filters?: SaleFilter): Promise<PaginatedSalesResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters?.userId) params.append('userId', String(filters.userId));
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<PaginatedSalesResponse>(`/api/v1/sales${query}`);
  },

  async getSaleById(id: number): Promise<Sale> {
    return api.get<Sale>(`/api/v1/sales/${id}`);
  }
};
