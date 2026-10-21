import { apiBlobRequest, apiRequest } from './httpClient';

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

  async updateFile(id, changes) {
    const file = await apiRequest(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
    return mapFile(file);
  },

  async renameFile(id, name) {
    return this.updateFile(id, { name });
  },

  async setFavorite(id, favourite) {
    return this.updateFile(id, { favourite });
  },

  /**
   * POST /api/files/upload  (multipart/form-data)
   * Required params:
   *   - connectedAccountId (Long) — query param
   *   - file (MultipartFile)       — form field named "file"
   *
   * Returns the created FileResponse.
   */
  async uploadFile(connectedAccountId, multipartFile, parentId = null) {
    const formData = new FormData();
    formData.append('file', multipartFile);

    const file = await apiRequest(
      `/files/upload?connectedAccountId=${encodeURIComponent(connectedAccountId)}${parentId ? `&parentId=${encodeURIComponent(parentId)}` : ''}`,
      {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type here; the browser sets it with the boundary.
      }
    );
    return mapFile(file);
  },

  async createFolder(connectedAccountId, name, parentId = null) {
    const params = new URLSearchParams({ connectedAccountId: String(connectedAccountId), name });
    if (parentId) params.set('parentId', String(parentId));
    return mapFile(await apiRequest(`/files/folders?${params}`, { method: 'POST' }));
  },

  async getPreviewBlob(id) {
    return apiBlobRequest(`/files/${id}/preview`);
  },

  async downloadFile(id, fallbackName) {
    const { blob, contentDisposition } = await apiBlobRequest(`/files/${id}/download`);
    const fromHeader = contentDisposition?.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i)?.[1];
    const fileName = decodeURIComponent(fromHeader || fallbackName || 'download');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  },

  /**
   * POST /api/files/sync
   * Triggers Google Drive sync for the authenticated user.
   */
  async syncFiles() {
    return apiRequest('/files/sync', { method: 'POST' });
  },
};
