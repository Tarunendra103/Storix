import { apiRequest } from './httpClient';

function mapFile(file) {
  const providerMap = {
    GOOGLE_DRIVE: 'Google Drive',
    ONEDRIVE: 'OneDrive',
    DROPBOX: 'Dropbox',
  };

  return {
    ...file,

    // Frontend naming
    isFavorite: file.favorite,

    // Human-readable provider
    provider: providerMap[file.provider] || file.provider,

    // Used by the existing UI
    providerType: file.provider?.toLowerCase(),

    // Backend already gives us these
    modifiedAt: file.updatedAt,
    createdAt: file.createdAt,

    // Keep the existing frontend category format
    category: file.category?.toLowerCase() || 'other',

    // Folder information
    isFolder: Boolean(file.isFolder),

    // Existing UI expects this
    providerAccount: file.accountEmail,
  };
}

export const fileApi = {
  async getFiles() {
    const files = await apiRequest('/files');
    return files.map(mapFile);
  },

  async getFile(id) {
    const file = await apiRequest(`/files/${id}`);
    return mapFile(file);
  },

  /**
   * DELETE /api/files/{id}
   * Returns null (204 No Content) on success.
   */
  async deleteFile(id) {
    return apiRequest(`/files/${id}`, { method: 'DELETE' });
  },

  /**
   * POST /api/files/upload  (multipart/form-data)
   * Required params:
   *   - connectedAccountId (Long) — query param
   *   - file (MultipartFile)       — form field named "file"
   *
   * Returns the created FileResponse.
   */
  async uploadFile(connectedAccountId, multipartFile) {
    const formData = new FormData();
    formData.append('file', multipartFile);

    const file = await apiRequest(
      `/files/upload?connectedAccountId=${encodeURIComponent(connectedAccountId)}`,
      {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type here; the browser sets it with the boundary.
      }
    );
    return mapFile(file);
  },

  /**
   * POST /api/files/sync
   * Triggers Google Drive sync for the authenticated user.
   */
  async syncFiles() {
    return apiRequest('/files/sync', { method: 'POST' });
  },
};