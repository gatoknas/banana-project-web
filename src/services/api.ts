import type { Session, RevenueSummary, EmailReceipt } from '../types';

const getBaseUrl = (): string => {
  // An explicit URL (e.g. remote API) always wins and bypasses the dev proxy.
  const configured = process.env.VUE_APP_API_URL;
  if (configured) {
    return configured.endsWith('/') ? configured.slice(0, -1) : configured;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local dev: stay same-origin so vue.config.js devServer.proxy forwards to the Go API.
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '';
    }
    // Deployed web app domain targeting the production Go API
    return 'https://api.ayurami.com';
  }

  // No env variable and no window context: assume same-origin.
  return '';
};

const BASE_URL = getBaseUrl();

// Helper to get authorization token from localStorage
function getAuthHeader(): Record<string, string> {
  const saved = localStorage.getItem('ayurami_session');
  if (saved) {
    try {
      const session: Session = JSON.parse(saved);
      if (session && session.token) {
        return { 'Authorization': `Bearer ${session.token}` };
      }
    } catch (e) {
      // Session parsing error, ignore
    }
  }
  return {};
}

// Handle fetch response and parse potential errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.message) {
        errorMessage = parsed.message;
      }
    } catch {
      if (text) {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  
  return {} as Promise<T>;
}

import { logger, generateTraceId } from '../utils/logger';

export const api = {
  async get<T>(path: string): Promise<T> {
    const traceId = generateTraceId();
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Trace-ID': traceId,
          ...getAuthHeader()
        }
      });
      return await handleResponse<T>(response);
    } catch (err) {
      logger.error('api_request_failed', `GET ${path} failed`, err, { path, method: 'GET' }, traceId);
      throw err;
    }
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const traceId = generateTraceId();
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Trace-ID': traceId,
          ...getAuthHeader()
        },
        body: JSON.stringify(body)
      });
      return await handleResponse<T>(response);
    } catch (err) {
      logger.error('api_request_failed', `POST ${path} failed`, err, { path, method: 'POST' }, traceId);
      throw err;
    }
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const traceId = generateTraceId();
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Trace-ID': traceId,
          ...getAuthHeader()
        },
        body: JSON.stringify(body)
      });
      return await handleResponse<T>(response);
    } catch (err) {
      logger.error('api_request_failed', `PUT ${path} failed`, err, { path, method: 'PUT' }, traceId);
      throw err;
    }
  },

  async delete<T>(path: string): Promise<T> {
    const traceId = generateTraceId();
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'X-Trace-ID': traceId,
          ...getAuthHeader()
        }
      });
      return await handleResponse<T>(response);
    } catch (err) {
      logger.error('api_request_failed', `DELETE ${path} failed`, err, { path, method: 'DELETE' }, traceId);
      throw err;
    }
  }
};

export const emailReceiptsApi = {
  getRevenueSummary(from?: string, to?: string): Promise<RevenueSummary> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<RevenueSummary>(`/api/v1/email-receipts/summary${query}`);
  },

  getEmailReceipts(from?: string, to?: string): Promise<EmailReceipt[]> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<EmailReceipt[]>(`/api/v1/email-receipts${query}`);
  },

  syncEmailReceipts(from: string, to: string): Promise<{ status: string; message: string; result: { fetched: number; imported: number; skipped: number; errors: number } }> {
    return api.post<{ status: string; message: string; result: { fetched: number; imported: number; skipped: number; errors: number } }>('/api/v1/email-receipts/sync', { from, to });
  }
};

