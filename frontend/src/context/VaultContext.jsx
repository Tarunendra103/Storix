import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const [activeNav, setActiveNav] = useState('home');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageOverview, setStorageOverview] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  // Search, filter, sorting, view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterScope, setActiveFilterScope] = useState('all'); // all, personal, work
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('modified-desc'); // 'modified-desc', 'name-asc', 'size-desc'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('cloudvault-theme') || 'light');

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
      const [allFiles, storage, accounts] = await Promise.all([
        api.getFiles(),
        api.getStorageOverview(),
        api.getConnectedAccounts()
      ]);
      setFiles(allFiles);
      setStorageOverview(storage);
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
    localStorage.setItem('cloudvault-theme', theme);
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
      const updated = await api.toggleFavorite(fileId);
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
      await api.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFileIds(prev => prev.filter(id => id !== fileId));
      if (inspectorFile && inspectorFile.id === fileId) {
        setInspectorFile(files.find(f => f.id !== fileId) || null);
      }
      setDeleteModal({ isOpen: false, file: null, isBatch: false });
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      addToast('File moved to trash', 'success');
    } catch {
      addToast('Failed to delete file', 'error');
    }
  };

  const handleBatchDelete = async () => {
    try {
      const count = selectedFileIds.length;
      await api.deleteBatch(selectedFileIds);
      setFiles(prev => prev.filter(f => !selectedFileIds.includes(f.id)));
      setSelectedFileIds([]);
      setDeleteModal({ isOpen: false, file: null, isBatch: false });
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      addToast(`Deleted ${count} items`, 'success');
    } catch {
      addToast('Failed to delete selected items', 'error');
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
      const newFolder = await api.createFolder(folderName, currentFolderId);
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
      const created = await api.uploadFile({ ...fileData, parentId: currentFolderId });
      setFiles(prev => [created, ...prev]);
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      setInspectorFile(created);
      addToast(`Uploaded ${created.name} (${created.provider})`, 'success');
    } catch {
      addToast('Failed to upload file', 'error');
    }
  };

  const handleConnectAccount = async (accountData) => {
    try {
      const newAcc = await api.connectAccount(accountData);
      setConnectedAccounts(prev => [...prev, newAcc]);
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      setConnectAccountModalOpen(false);
      addToast(`Connected ${newAcc.name} (${newAcc.label})`, 'success');
    } catch {
      addToast('Failed to connect cloud account', 'error');
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
    try {
      addToast('Scanning all 4 cloud accounts...', 'info');
      await api.triggerRescanAll();
      const updatedStorage = await api.getStorageOverview();
      setStorageOverview(updatedStorage);
      addToast('All cloud accounts in sync', 'success');
    } catch {
      addToast('Sync failed. Please retry.', 'error');
    }
  };

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
