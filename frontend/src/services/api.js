import { getCategoryStats } from '../utils/fileUtils';
import { accountApi } from './accountApi';
import { fileApi } from './fileApi';

function storageOverview(files, accounts) {
  const knownQuotaAccounts = accounts.filter(
    (account) => account.totalStorage !== null && account.usedStorage !== null
  );
  const totalStorage = knownQuotaAccounts.length
    ? knownQuotaAccounts.reduce((total, account) => total + account.totalStorage, 0)
    : null;
  const usedStorage = knownQuotaAccounts.length
    ? knownQuotaAccounts.reduce((total, account) => total + account.usedStorage, 0)
    : null;
  return {
    totalStorage,
    usedStorage,
    availableStorage: totalStorage === null ? null : Math.max(0, totalStorage - usedStorage),
    percentage: totalStorage !== null && totalStorage > 0 && usedStorage !== null
      ? Number(((usedStorage / totalStorage) * 100).toFixed(1))
      : null,
    accounts,
    categories: getCategoryStats(files),
  };
}

export const api = {
  getFiles: (filter = {}) => fileApi.getFiles().then((files) => files.filter((file) =>
    (!filter.category || filter.category === 'all' || file.category === filter.category)
      && (!filter.isFavorite || file.isFavorite)
      && (!filter.search || file.name.toLowerCase().includes(filter.search.toLowerCase()))
  )),
  getFile: (id) => fileApi.getFile(id),
  deleteFile: (id) => fileApi.deleteFile(id),
  deleteBatch: (ids) => Promise.all(ids.map((id) => fileApi.deleteFile(id))),
  renameFile: (id, name) => fileApi.renameFile(id, name),
  async toggleFavorite(id) {
    const current = await fileApi.getFile(id);
    return fileApi.setFavorite(id, !current.isFavorite);
  },
  createFolder: (name, connectedAccountId, parentId) => fileApi.createFolder(connectedAccountId, name, parentId),
  getConnectedAccounts: () => accountApi.getConnectedAccounts(),
  disconnectAccount: (id) => accountApi.disconnectAccount(id),
  async getStorageOverview(files, accounts) {
    if (!files || !accounts) {
      [files, accounts] = await Promise.all([fileApi.getFiles(), accountApi.getConnectedAccounts()]);
    }
    return storageOverview(files, accounts);
  },
};
