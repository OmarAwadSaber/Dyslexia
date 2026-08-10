// Central API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  AUTH_LOGIN: `${API_BASE_URL}/auth/jwt/create/`,
  AUTH_REFRESH: `${API_BASE_URL}/auth/jwt/refresh/`,
  AUTH_VERIFY: `${API_BASE_URL}/auth/jwt/verify/`,
  AUTH_ME: `${API_BASE_URL}/auth/users/me/`,
  
  DOCUMENTS: `${API_BASE_URL}/documents/`,
  DOCUMENT_BY_ID: (id: string) => `${API_BASE_URL}/documents/${id}/`,
  DOCUMENT_PROCESS: (id: string) => `${API_BASE_URL}/documents/${id}/process/`,
  DOCUMENT_PROCESSED: (id: string) => `${API_BASE_URL}/documents/${id}/processed/`,
  
  USER_SETTINGS: (id: string = 'me') => `${API_BASE_URL}/users/${id}/settings/`,
};
