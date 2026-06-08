import type { Session } from '../types';

const getBaseUrl = (): string => {
  // Check if VUE_APP_API_URL is configured (e.g., in local .env files or during build time)
  let url = process.env.VUE_APP_API_URL;

  if (!url && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If running locally, default to the local backend port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      url = 'http://localhost:8082';
    } else {
      // Deployed web app domain targeting the production Go API
      url = 'https://api.ayurami.com';
    }
  }

  // Final fallback if no environment variable or window context exists
  if (!url) {
    url = 'http://localhost:8082';
  }

  // Strip trailing slash if present to avoid double slash routes like /api/v1//login
  return url.endsWith('/') ? url.slice(0, -1) : url;
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

export const api = {
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeader()
      }
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(body)
    });
    return handleResponse<T>(response);
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(body)
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeader()
      }
    });
    return handleResponse<T>(response);
  }
};
