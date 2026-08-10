import { API_ENDPOINTS } from '../core/config/api';
import { DocumentItem, UserSettings } from '../types';

export const apiService = {
  /**
   * Uploads raw text extracted via OCR
   * POST /api/documents/
   */
  async createDocument(rawText: string, source: 'camera' | 'upload' | 'sample' = 'camera'): Promise<DocumentItem> {
    const response = await fetch(API_ENDPOINTS.DOCUMENTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source,
        raw_text: rawText,
        metadata: {
          client: 'flutter_android_app',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit document text to server.');
    }

    return response.json();
  },

  /**
   * Triggers backend AI processing on document
   * POST /api/documents/{id}/process/
   */
  async processDocument(id: string): Promise<{ id: string; status: string; message: string }> {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_PROCESS(id), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to initiate AI document processing.');
    }

    return response.json();
  },

  /**
   * Retrieves processed document result
   * GET /api/documents/{id}/processed/
   */
  async getProcessedDocument(id: string): Promise<DocumentItem> {
    const response = await fetch(API_ENDPOINTS.DOCUMENT_PROCESSED(id));

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch processed document.');
    }

    return response.json();
  },

  /**
   * Gets history of all processed documents
   * GET /api/documents/
   */
  async getDocumentsHistory(): Promise<DocumentItem[]> {
    const response = await fetch(API_ENDPOINTS.DOCUMENTS);

    if (!response.ok) {
      throw new Error('Failed to fetch document history.');
    }

    return response.json();
  },

  /**
   * Gets user settings
   * GET /api/users/{id}/settings/
   */
  async getUserSettings(): Promise<UserSettings> {
    const response = await fetch(API_ENDPOINTS.USER_SETTINGS('me'));

    if (!response.ok) {
      throw new Error('Failed to fetch user settings.');
    }

    return response.json();
  },

  /**
   * Updates user settings
   * PUT /api/users/{id}/settings/
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await fetch(API_ENDPOINTS.USER_SETTINGS('me'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error('Failed to update user settings.');
    }

    return response.json();
  },
};
