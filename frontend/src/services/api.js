
import { getFileCategory } from '../utils/fileUtils';
import { fileApi } from './fileApi';
import { accountApi } from './accountApi';
// In-memory state for runtime operations (mocking Spring Boot REST endpoints)


const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- File Management ---
  async getFiles(filter = {}) {
  let result = await fileApi.getFiles();

  if (filter.category && filter.category !== 'all') {
    result = result.filter(
      f => f.category === filter.category
    );
  }

  if (filter.isFavorite) {
    result = result.filter(f => f.isFavorite);
  }

  if (filter.provider && filter.provider !== 'all') {
    result = result.filter(
      f => f.provider === filter.provider
    );
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();

    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.mimeType &&
        f.mimeType.toLowerCase().includes(q)) ||
      (f.provider &&
        f.provider.toLowerCase().includes(q))
    );
  }

  return result;
},

  async getFile(id) {
    await delay();
    const file = files.find(f => f.id === id);
    if (!file) throw new Error(`File not found with id: ${id}`);
    return file;
  },

  async uploadFile(fileData) {
    await delay(300);
    // Determine provider automatically (simulating smart unified backend routing)
    const availableAccount = accounts.find(a => a.totalStorage - a.usedStorage >= fileData.size) || accounts[0];
    
    const category = fileData.category || getFileCategory(fileData.name, fileData.mimeType);
    const type = fileData.type || (
      category === 'photos' ? 'Image' :
      category === 'videos' ? 'Video' :
      category === 'documents' ? 'Document' : 'File'
    );

    const newFile = {
      id: `file-${Date.now()}`,
      name: fileData.name,
      isFolder: false,
      type,
      mimeType: fileData.mimeType || 'application/octet-stream',
      size: fileData.size,
      category,
      provider: availableAccount ? `${availableAccount.name} (${availableAccount.label})` : 'Google Drive #1',
      providerAccount: availableAccount ? availableAccount.accountEmail : 'tarun.personal@gmail.com',
      providerType: availableAccount ? availableAccount.type : 'google_drive',
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isFavorite: false,
      syncStatus: 'synced',
      previewUrl: fileData.previewUrl || null,
      thumbnailUrl: fileData.thumbnailUrl || fileData.previewUrl || null,
      parentId: fileData.parentId || null,
      checksum: Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)
    };

    files.unshift(newFile);

    // Update used storage on the assigned account
    if (availableAccount) {
      availableAccount.usedStorage += fileData.size;
    }

    return newFile;
  },

  async deleteFile(id) {
    // Calls DELETE /api/files/{id} on the Spring Boot backend.
    await fileApi.deleteFile(id);
    return { success: true };
  },


  async deleteBatch(ids) {
    await delay();
    const removedFiles = [];
    files = files.filter(f => {
      if (ids.includes(f.id)) {
        removedFiles.push(f);
        return false;
      }
      return true;
    });
    removedFiles.forEach((file) => {
      const account = accounts.find(a => a.accountEmail === file.providerAccount);
      if (account && !file.isFolder) {
        account.usedStorage = Math.max(0, account.usedStorage - (file.size || 0));
      }
    });
    return { success: true, removedCount: removedFiles.length };
  },

  async renameFile(id, newName) {
    await delay();
    const file = files.find(f => f.id === id);
    if (!file) throw new Error(`File with id ${id} not found`);
    file.name = newName;
    file.modifiedAt = new Date().toISOString();
    return file;
  },

  async toggleFavorite(id) {
    await delay();
    const file = files.find(f => f.id === id);
    if (!file) throw new Error(`File with id ${id} not found`);
    file.isFavorite = !file.isFavorite;
    return file;
  },

  async createFolder(name, parentId = null) {
    await delay();
    const newFolder = {
      id: `folder-${Date.now()}`,
      name,
      isFolder: true,
      itemCount: 0,
      provider: 'Google Drive #1',
      providerAccount: 'tarun.personal@gmail.com',
      providerType: 'google_drive',
      modifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isFavorite: false,
      syncStatus: 'synced',
      category: 'other',
      parentId
    };
    files.unshift(newFolder);
    return newFolder;
  },

  // --- Storage & Quota ---

async getStorageOverview() {
  const [files, accounts] = await Promise.all([
    fileApi.getFiles(),
    accountApi.getConnectedAccounts(),
  ]);

  const actualFiles = files.filter(file => !file.isFolder);

  // Category statistics come from synchronized file metadata (count + sizes).
  // This is intentionally separate from account quota: quota tracks total Drive
  // usage (including items Storix hasn't synced), while category stats only
  // count files that Storix has indexed.
  const categories = {
    photos: { count: 0, size: 0 },
    videos: { count: 0, size: 0 },
    documents: { count: 0, size: 0 },
    other: { count: 0, size: 0 },
  };

  actualFiles.forEach(file => {
    const category = categories[file.category] ? file.category : 'other';
    categories[category].count += 1;
    categories[category].size += Number(file.size) || 0;
  });

  // Aggregate real quota data from connected accounts.
  // An account contributes to the totals only when both its totalStorage and
  // usedStorage are non-null (i.e. quota has been fetched from the provider).
  // Accounts with null quota (not yet synced, or unlimited Workspace plans)
  // are skipped so we never invent a number.
  let aggregateTotalStorage = null;
  let aggregateUsedStorage = null;

  accounts.forEach(account => {
    if (account.totalStorage !== null && account.usedStorage !== null) {
      aggregateTotalStorage = (aggregateTotalStorage ?? 0) + account.totalStorage;
      aggregateUsedStorage = (aggregateUsedStorage ?? 0) + account.usedStorage;
    }
  });

  // Calculate derived values only when we have real quota data.
  const availableStorage =
    aggregateTotalStorage !== null && aggregateUsedStorage !== null
      ? Math.max(0, aggregateTotalStorage - aggregateUsedStorage)
      : null;

  const percentage =
    aggregateTotalStorage !== null &&
    aggregateTotalStorage > 0 &&
    aggregateUsedStorage !== null
      ? Number(((aggregateUsedStorage / aggregateTotalStorage) * 100).toFixed(1))
      : null;

  return {
    totalStorage: aggregateTotalStorage,
    usedStorage: aggregateUsedStorage,
    availableStorage,
    percentage,
    accounts,
    categories,
  };
},



  // --- Connected Cloud Accounts ---
  async getConnectedAccounts() {
  return accountApi.getConnectedAccounts();
},

  async connectAccount(accountData) {
    await delay(350);
    const newAccount = {
      id: `acc-${Date.now()}`,
      name: accountData.name,
      type: accountData.type,
      label: accountData.label || 'Connected Drive',
      accountEmail: accountData.accountEmail || 'user.drive@cloud.io',
      totalStorage: accountData.totalStorage || 15 * 1024 * 1024 * 1024,
      usedStorage: 0.1 * 1024 * 1024 * 1024,
      status: 'Active',
      lastSynced: 'Just now',
      color: accountData.type === 'dropbox' ? '#0061FF' : accountData.type === 'onedrive' ? '#0078D4' : '#4285F4',
      syncTelemetry: '35ms latency'
    };
    accounts.push(newAccount);
    return newAccount;
  },

  async disconnectAccount(id) {
    await delay();
    const index = accounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error(`Account ${id} not found`);
    const removed = accounts.splice(index, 1)[0];
    return { success: true, account: removed };
  },

  async triggerRescanAll() {
    await delay(600);
    accounts.forEach(a => {
      a.lastSynced = 'Just now';
    });
    return { success: true, timestamp: new Date().toISOString() };
  }
};
