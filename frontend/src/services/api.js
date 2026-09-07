import { initialFiles, initialAccounts, initialCategories } from './mockData';
import { getFileCategory } from '../utils/fileUtils';

// In-memory state for runtime operations (mocking Spring Boot REST endpoints)
let files = [...initialFiles];
let accounts = [...initialAccounts];

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- File Management ---
  async getFiles(filter = {}) {
    await delay();
    let result = [...files];

    if (filter.category && filter.category !== 'all') {
      result = result.filter(f => f.category === filter.category);
    }
    if (filter.isFavorite) {
      result = result.filter(f => f.isFavorite);
    }
    if (filter.provider && filter.provider !== 'all') {
      result = result.filter(f => f.provider === filter.provider);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        (f.type && f.type.toLowerCase().includes(q)) ||
        (f.provider && f.provider.toLowerCase().includes(q))
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
    await delay();
    const index = files.findIndex(f => f.id === id);
    if (index === -1) throw new Error(`File with id ${id} not found`);
    const removed = files.splice(index, 1)[0];

    // Decrement used storage on corresponding account
    const acc = accounts.find(a => a.accountEmail === removed.providerAccount);
    if (acc && !removed.isFolder) {
      acc.usedStorage = Math.max(0, acc.usedStorage - (removed.size || 0));
    }

    return { success: true, file: removed };
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
    await delay();
    const totalStorage = accounts.reduce((acc, a) => acc + a.totalStorage, 0);
    const usedStorage = accounts.reduce((acc, a) => acc + a.usedStorage, 0);
    const availableStorage = Math.max(0, totalStorage - usedStorage);

    return {
      totalStorage,
      usedStorage,
      availableStorage,
      percentage: totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0,
      accounts: [...accounts],
      categories: { ...initialCategories }
    };
  },

  // --- Connected Cloud Accounts ---
  async getConnectedAccounts() {
    await delay();
    return [...accounts];
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
