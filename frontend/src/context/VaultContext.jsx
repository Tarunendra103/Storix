import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { fileApi } from '../services/fileApi';
import { accountApi } from '../services/accountApi';
const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const [activeNav, setActiveNav] = useState('home');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [storageOverview, setStorageOverview] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  // Search, filter, sorting, view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterScope, setActiveFilterScope] = useState('all'); // all, personal, work
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('modified-desc'); // 'modified-desc', 'name-asc', 'size-desc'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('storix-theme') || 'light');

  // Selection & Inspector
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [inspectorFile, setInspectorFile] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  // Modals
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [connectAccountModalOpen, setConnectAccountModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [renameModal, setRenameModal] = useState({ isOpen: false, file: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, file: null, isBatch: false });

  // Mobile sidebar
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Notification Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(16).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [allFiles, accounts] = await Promise.all([
        api.getFiles(),
        api.getConnectedAccounts()
      ]);
      setFiles(allFiles);
      setStorageOverview(await api.getStorageOverview(allFiles, accounts));
      setConnectedAccounts(accounts);
      if (allFiles.length > 0) {
        setInspectorFile(current => current || allFiles[0]);
      }
    } catch (err) {
      console.error('Failed to load initial vault data:', err);
      addToast('Failed to load vault data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('storix-theme', theme);
  }, [theme]);

  // Keyboard shortcut listener for global search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Selection handlers
  const toggleSelectFile = useCallback((fileId) => {
    setSelectedFileIds(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
    const found = files.find(f => f.id === fileId);
    if (found) {
      setInspectorFile(found);
    }
  }, [files]);

  const selectAllFiles = useCallback((allIds) => {
    if (selectedFileIds.length === allIds.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(allIds);
    }
  }, [selectedFileIds]);

  const clearSelection = useCallback(() => {
    setSelectedFileIds([]);
  }, []);

  // Actions
  const handleToggleFavorite = async (fileId) => {
    try {
      const current = files.find((file) => file.id === fileId);
      if (!current) throw new Error('File no longer exists.');
      const updated = await fileApi.setFavorite(fileId, !current.isFavorite);
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, isFavorite: updated.isFavorite } : f));
      if (inspectorFile && inspectorFile.id === fileId) {
        setInspectorFile(prev => ({ ...prev, isFavorite: updated.isFavorite }));
      }
      addToast(updated.isFavorite ? 'Added to favorites' : 'Removed from favorites', 'info');
    } catch {
      addToast('Error updating favorite status', 'error');
    }
  };

  const handleRename = async (fileId, newName) => {
    try {
      const updated = await api.renameFile(fileId, newName);
      setFiles(prev => prev.map(f => f.id === fileId ? updated : f));
      if (inspectorFile && inspectorFile.id === fileId) {
        setInspectorFile(updated);
      }
      setRenameModal({ isOpen: false, file: null });
      addToast(`Renamed to "${newName}"`, 'success');
    } catch {
      addToast('Failed to rename item', 'error');
    }
  };

  const handleDelete = async (fileId) => {
    try {
      // Calls DELETE /api/files/{id} — removes from Google Drive and MySQL.
      await fileApi.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFileIds(prev => prev.filter(id => id !== fileId));
      if (inspectorFile && inspectorFile.id === fileId) {
        setInspectorFile(files.find(f => f.id !== fileId) || null);
      }
      setDeleteModal({ isOpen: false, file: null, isBatch: false });
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      addToast('File deleted', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      addToast('Failed to delete file: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  const handleDownload = async (file) => {
    try {
      await fileApi.downloadFile(file.id, file.name);
      addToast(`Downloaded ${file.name}`, 'success');
    } catch (error) {
      addToast(error.message || 'Download failed', 'error');
    }
  };

  const handleBatchDownload = async () => {
    const selectedFiles = files.filter((file) => selectedFileIds.includes(file.id) && !file.isFolder);
    if (!selectedFiles.length) {
      addToast('Folders cannot be downloaded. Select one or more files instead.', 'info');
      return;
    }
    try {
      await Promise.all(selectedFiles.map((file) => fileApi.downloadFile(file.id, file.name)));
      addToast(`Downloaded ${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'}`, 'success');
    } catch (error) {
      addToast(error.message || 'One or more downloads failed', 'error');
    }
  };

  const handleBatchDelete = async () => {
    const idsToDelete = [...selectedFileIds];
    if (!idsToDelete.length) return;

    const results = [];
    for (const fileId of idsToDelete) {
      try {
        await fileApi.deleteFile(fileId);
        results.push({ fileId, deleted: true });
      } catch (error) {
        results.push({ fileId, deleted: false, error });
      }
    }

    const deletedIds = results.filter((result) => result.deleted).map((result) => result.fileId);
    const failedIds = results.filter((result) => !result.deleted).map((result) => result.fileId);
    if (deletedIds.length) {
      setFiles((current) => current.filter((file) => !deletedIds.includes(file.id)));
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
    }
    setSelectedFileIds(failedIds);
    setDeleteModal({ isOpen: false, file: null, isBatch: false });

    if (!failedIds.length) {
      addToast(`Deleted ${deletedIds.length} item${deletedIds.length === 1 ? '' : 's'}`, 'success');
    } else if (deletedIds.length) {
      addToast(`Deleted ${deletedIds.length}; ${failedIds.length} could not be deleted.`, 'error');
    } else {
      addToast('None of the selected files could be deleted. Sync Drive to remove entries that are no longer accessible.', 'error');
    }
  };

  const openFolder = useCallback((folder) => {
    if (!folder?.isFolder) return;
    setCurrentFolderId(folder.id);
    setInspectorFile(folder);
    setActiveNav('my-files');
  }, []);

  const handleCreateFolder = async (folderName) => {
    try {
      const currentFolder = currentFolderId ? files.find((file) => file.id === currentFolderId) : null;
      const connectedAccountId = currentFolder?.connectedAccountId || connectedAccounts[0]?.id;
      if (!connectedAccountId) throw new Error('Connect a Google Drive account before creating a folder.');
      const newFolder = await api.createFolder(folderName, connectedAccountId, currentFolderId);
      setFiles(prev => [newFolder, ...prev]);
      setNewFolderModalOpen(false);
      setInspectorFile(newFolder);
      addToast(`Folder "${folderName}" created`, 'success');
    } catch {
      addToast('Failed to create folder', 'error');
    }
  };

  const handleUploadComplete = async (fileData) => {
    try {
      if (!fileData.fileObj || !fileData.connectedAccountId) {
        throw new Error('Choose a connected Google Drive account and a local file.');
      }
      const created = await fileApi.uploadFile(fileData.connectedAccountId, fileData.fileObj, currentFolderId);
      setFiles(prev => [created, ...prev]);
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      setInspectorFile(created);
      addToast(`Uploaded ${created.name}`, 'success');
    } catch (err) {
      console.error('Upload failed:', err);
      addToast('Failed to upload file: ' + (err.message || 'Unknown error'), 'error');
      throw err;
    }
  };

  const handleConnectAccount = async () => {
    try {
      await accountApi.connectGoogle();
    } catch (error) {
      addToast(error.message || 'Failed to start Google authorization', 'error');
      throw error;
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    try {
      await api.disconnectAccount(accountId);
      setConnectedAccounts(prev => prev.filter(a => a.id !== accountId));
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      addToast('Account disconnected', 'info');
    } catch {
      addToast('Failed to disconnect account', 'error');
    }
  };

  const handleRescan = async () => {
    if (syncing) return; // Prevent concurrent sync calls
    setSyncing(true);
    addToast('Syncing Google Drive files…', 'info');
    try {
      // POST /api/files/sync — triggers Google Drive sync + quota refresh on backend
      const syncResult = await fileApi.syncFiles();

      const [newFiles, newAccounts] = await Promise.all([
        fileApi.getFiles(), accountApi.getConnectedAccounts(),
      ]);
      setFiles(newFiles);
      setConnectedAccounts(newAccounts);
      setStorageOverview(await api.getStorageOverview(newFiles, newAccounts));

      addToast(
        syncResult?.failedAccounts
          ? `Synced ${syncResult.syncedAccounts} account(s); ${syncResult.failedAccounts} failed. Reconnect the failed account and try again.`
          : `Synced ${syncResult?.syncedAccounts ?? newAccounts.length} account(s)`,
        syncResult?.failedAccounts ? 'error' : 'success'
      );
    } catch (error) {
      console.error('Google Drive sync failed:', error);
      addToast(
        'Sync failed: ' + (error.message || 'Check the backend logs.'),
        'error'
      );
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('connected') !== 'google') return;
    window.history.replaceState({}, document.title, window.location.pathname);
    handleRescan();
  // The callback marker exists only once after OAuth; running once avoids a duplicate sync.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const openPreview = (file) => {
    if (!file) return;
    setPreviewModal({ isOpen: true, file });
  };

  const closePreview = () => {
    setPreviewModal({ isOpen: false, file: null });
  };

  const value = {
    activeNav,
    setActiveNav,
    files,
    setFiles,
    loading,
    syncing,
    storageOverview,
    connectedAccounts,
    searchQuery,
    setSearchQuery,
    activeFilterScope,
    setActiveFilterScope,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    categoryFilter,
    setCategoryFilter,
    currentFolderId,
    setCurrentFolderId,
    theme,
    setTheme,
    selectedFileIds,
    setSelectedFileIds,
    toggleSelectFile,
    selectAllFiles,
    clearSelection,
    inspectorFile,
    setInspectorFile,
    isInspectorOpen,
    setIsInspectorOpen,
    previewModal,
    openPreview,
    closePreview,
    uploadModalOpen,
    setUploadModalOpen,
    connectAccountModalOpen,
    setConnectAccountModalOpen,
    newFolderModalOpen,
    setNewFolderModalOpen,
    renameModal,
    setRenameModal,
    deleteModal,
    setDeleteModal,
    isMobileNavOpen,
    setIsMobileNavOpen,
    toasts,
    addToast,
    removeToast,
    handleToggleFavorite,
    handleRename,
    handleDelete,
    handleDownload,
    handleBatchDownload,
    handleBatchDelete,
    openFolder,
    handleCreateFolder,
    handleUploadComplete,
    handleConnectAccount,
    handleDisconnectAccount,
    handleRescan
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
