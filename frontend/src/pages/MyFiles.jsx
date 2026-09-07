import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { FileTable } from '../components/files/FileTable';
import { FileGrid } from '../components/files/FileGrid';
import { InspectorPane } from '../components/layout/InspectorPane';

export function MyFiles() {
  const {
    files,
    searchQuery,
    viewMode,
    setViewMode,
    sortBy,
    selectedFileIds,
    clearSelection,
    setUploadModalOpen,
    setNewFolderModalOpen,
    setDeleteModal,
    isInspectorOpen,
    setIsInspectorOpen,
    addToast,
    activeNav,
    currentFolderId,
    setCurrentFolderId
  } = useVault();

  const [inFolderFilter, setInFolderFilter] = useState('');
  const [providerScope, setProviderScope] = useState('all');
  const currentFolder = currentFolderId ? files.find(f => f.id === currentFolderId) : null;

  let displayedFiles = [...files];

  if (currentFolder) {
    displayedFiles = displayedFiles.filter(f => f.parentId === currentFolder.id);
  } else if (activeNav === 'other') {
    displayedFiles = displayedFiles.filter(f => f.category === 'other');
  } else if (activeNav === 'recent') {
    displayedFiles = displayedFiles.filter(f => !f.isFolder);
  }

  if (inFolderFilter.trim()) {
    const q = inFolderFilter.toLowerCase();
    displayedFiles = displayedFiles.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.type && f.type.toLowerCase().includes(q)) ||
      (f.tag && f.tag.toLowerCase().includes(q))
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedFiles = displayedFiles.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.type && f.type.toLowerCase().includes(q)) ||
      (f.provider && f.provider.toLowerCase().includes(q))
    );
  }

  if (providerScope !== 'all') {
    displayedFiles = displayedFiles.filter(f =>
      (f.provider || '').toLowerCase().includes(providerScope.toLowerCase())
    );
  }

  displayedFiles.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    if (sortBy === 'modified-desc') {
      return new Date(b.modifiedAt) - new Date(a.modifiedAt);
    }
    if (sortBy === 'modified-asc') {
      return new Date(a.modifiedAt) - new Date(b.modifiedAt);
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === 'size-desc') {
      return (b.size || 0) - (a.size || 0);
    }
    if (sortBy === 'size-asc') {
      return (a.size || 0) - (b.size || 0);
    }
    return 0;
  });

  return (
    <div className="flex flex-col w-full gap-space-md animate-in fade-in duration-200">
      {/* Top Context Toolbar & Navigation Bar */}
      <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-lg border border-zinc-border shadow-sm">
        {/* Row 1: Breadcrumbs & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          {/* Breadcrumbs */}
          <nav aria-label="Folder Path" className="flex items-center gap-space-xs font-body-md text-body-md min-w-0">
            <button
              type="button"
              onClick={() => setCurrentFolderId(null)}
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-body-sm text-body-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">cloud</span>
              <span>My Cloud</span>
            </button>
            <span className="text-outline text-label-sm font-label-sm">/</span>
            <span className="text-on-surface font-semibold font-body-sm text-body-sm">
              {currentFolder ? currentFolder.name : 'All Vault Files'}
            </span>
          </nav>

          {/* Primary & Batch Operations */}
          <div className="flex items-center gap-space-xs flex-wrap">
            {selectedFileIds.length > 0 && (
              <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded border border-zinc-border animate-in fade-in duration-100">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-label-sm text-label-sm text-on-surface">
                  {selectedFileIds.length} items selected
                </span>
                <div className="h-3 w-px bg-surface-container-highest mx-0.5" />
                <button
                  type="button"
                  onClick={() => addToast(`Downloading ${selectedFileIds.length} items...`, 'info')}
                  className="h-6 px-2 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-body-sm text-body-sm flex items-center gap-1 transition-colors border border-zinc-border"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: true, isBatch: true })}
                  className="h-6 px-2 rounded bg-surface-container-lowest text-error hover:bg-error-container font-body-sm text-body-sm flex items-center gap-1 transition-colors border border-[#ffdad6]"
                  title="Delete selected"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="h-6 px-1.5 rounded text-outline hover:text-on-surface text-xs"
                >
                  Clear
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setNewFolderModalOpen(true)}
              className="h-8 px-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm flex items-center gap-space-xs transition-colors border border-zinc-border"
            >
              <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
              <span>New Folder</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="h-8 px-space-md rounded bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-headline-sm text-headline-sm flex items-center gap-space-xs transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>Upload</span>
            </button>
          </div>
        </div>

        {/* Row 2: Filtering, View toggles & Sort specs */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-zinc-border/40">
          <div className="flex items-center gap-space-sm flex-1 max-w-xl">
            {/* Provider Scope Filter */}
            <select
              value={providerScope}
              onChange={(e) => setProviderScope(e.target.value)}
              className="h-8 px-space-sm bg-surface-container rounded border border-zinc-border font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Providers (4)</option>
              <option value="google">Google Drive</option>
              <option value="onedrive">OneDrive</option>
              <option value="dropbox">Dropbox</option>
            </select>

            {/* In-folder filter search */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                search
              </span>
              <input
                type="text"
                value={inFolderFilter}
                onChange={(e) => setInFolderFilter(e.target.value)}
                placeholder="Filter by name, extension, or tag..."
                className="w-full h-8 pl-8 pr-7 bg-surface-container rounded border border-zinc-border font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
              />
              {inFolderFilter && (
                <button
                  type="button"
                  onClick={() => setInFolderFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-surface-container p-0.5 rounded border border-zinc-border">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 rounded flex items-center transition-colors ${
                  viewMode === 'list'
                    ? 'bg-surface-container-lowest text-primary shadow-none font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="List View"
              >
                <span className="material-symbols-outlined text-[16px]">view_list</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded flex items-center transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-surface-container-lowest text-primary shadow-none font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                title="Grid / Gallery View"
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
              </button>
            </div>

            {/* Toggle Detail Pane */}
            <button
              type="button"
              onClick={() => setIsInspectorOpen(prev => !prev)}
              className={`h-8 w-8 rounded flex items-center justify-center transition-colors border border-zinc-border ${
                isInspectorOpen
                  ? 'bg-surface-container-high text-primary'
                  : 'bg-surface-container text-outline hover:text-on-surface'
              }`}
              title="Toggle File Inspector"
            >
              <span className="material-symbols-outlined text-[18px]">info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Work Area: Split File Viewport + Inspector Pane */}
      <div className="flex w-full items-start gap-space-md">
        <div className="flex-1 min-w-0">
          {viewMode === 'list' ? (
            <FileTable files={displayedFiles} emptyMessage="No files found matching your criteria" />
          ) : (
            <FileGrid files={displayedFiles} emptyMessage="No files found matching your criteria" />
          )}
        </div>

        {/* Contextual File Details Inspector */}
        <InspectorPane />
      </div>
    </div>
  );
}
