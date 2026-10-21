import { apiRequest } from './httpClient';

// Maps the backend StorageProvider enum value to a human-readable name.
const PROVIDER_NAMES = {
  GOOGLE_DRIVE: 'Google Drive',
  ONEDRIVE: 'OneDrive',
  DROPBOX: 'Dropbox',
};

// Brand colours used by the storage-bar and account cards.
const PROVIDER_COLORS = {
  GOOGLE_DRIVE: '#4285F4',
  ONEDRIVE: '#0078D4',
  DROPBOX: '#0061FF',
};

/**
 * Derives a short label from the account email.
 * Uses the actual email domain as a compact, non-speculative account label.
 */
function deriveLabel(accountEmail = '') {
  return accountEmail.split('@')[1] || 'Google Drive';
}

/**
 * Maps a raw backend AccountResponse to the shape expected by the UI.
 *
 * Backend fields:  id, provider (enum string), accountEmail, totalStorage (Long|null), usedStorage (Long|null)
 * Added UI fields: name, label, color, providerType, email, status
 *
 * IMPORTANT: totalStorage and usedStorage are kept as-is (null means quota not yet
 * fetched, 0 means genuinely zero). Do NOT coerce null → 0 because callers use
 * null to distinguish "unknown" from "zero".
 */
function mapAccount(account) {
  const providerKey = account.provider; // raw enum string from backend

  return {
    // Pass through all backend fields unchanged
    ...account,

    // Human-readable provider name
    name: PROVIDER_NAMES[providerKey] || account.provider,

    // Lowercase variant used by legacy UI components
    providerType: providerKey?.toLowerCase(),

    // Legacy alias
    label: deriveLabel(account.accountEmail),

    // UI display alias
    email: account.accountEmail,

    // Brand colour for the storage bar segments
    color: PROVIDER_COLORS[providerKey] || '#737686',

    // The backend returns configured connected accounts; it does not claim a
    // live provider-health check for each rendered card.
    status: 'Connected',

    // Quota values: preserve null so callers can distinguish "unknown" from "zero"
    totalStorage: account.totalStorage ?? null,
    usedStorage: account.usedStorage ?? null,
  };
}

export const accountApi = {

  async getConnectedAccounts() {
    const accounts = await apiRequest('/accounts');
    return accounts.map(mapAccount);
  },

  async connectGoogle() {
    const response = await apiRequest('/accounts/google/connect');
    window.location.href = response.authorizationUrl;
  },

  async disconnectAccount(id) {
    return apiRequest(`/accounts/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
