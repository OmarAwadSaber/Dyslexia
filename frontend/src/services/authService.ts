import { API_ENDPOINTS } from '../core/config/api';
import { AuthState } from '../types';

const ACCESS_TOKEN_KEY = 'dyslexia_access_token';
const REFRESH_TOKEN_KEY = 'dyslexia_refresh_token';

export const authService = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  saveTokens(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  },

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  async login(username: string, password: string): Promise<AuthState> {
    const response = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials or authentication failure.');
    }

    const data = await response.json();
    this.saveTokens(data.access, data.refresh);

    return {
      isAuthenticated: true,
      user: data.user,
      accessToken: data.access,
      refreshToken: data.refresh,
    };
  },

  async refreshAccessToken(): Promise<string | null> {
    const refresh = this.getRefreshToken();
    if (!refresh) return null;

    try {
      const response = await fetch(API_ENDPOINTS.AUTH_REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const data = await response.json();
      this.saveTokens(data.access);
      return data.access;
    } catch (e) {
      this.clearTokens();
      return null;
    }
  },

  logout() {
    this.clearTokens();
  },
};
