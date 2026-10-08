import { apiRequest } from './httpClient';

function mapAccount(account) {
  const providerMap = {
    GOOGLE_DRIVE: 'Google Drive',
    ONEDRIVE: 'OneDrive',
    DROPBOX: 'Dropbox',
  };

  return {
    ...account,

    provider:
      providerMap[account.provider] || account.provider,

    providerType:
      account.provider?.toLowerCase(),

    label:
      account.accountEmail || 'Cloud Account',

    email:
      account.accountEmail,

    totalStorage:
      account.totalStorage || 0,

    usedStorage:
      account.usedStorage || 0,
  };
}

export const accountApi = {

  async getConnectedAccounts() {
    const accounts = await apiRequest('/accounts');

    return accounts.map(mapAccount);
  },

  async connectGoogle() {
  const response = await apiRequest(
    '/accounts/google/connect'
  );

  window.location.href = response.authorizationUrl;
}
};