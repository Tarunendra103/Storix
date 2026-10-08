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
};