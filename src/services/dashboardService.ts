import { api } from './api';
import type { DashboardStats } from '../types';

export const dashboardService = {
  async getDashboardStats(from?: string, to?: string): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<DashboardStats>(`/api/v1/dashboard/stats${query}`);
  }
};
