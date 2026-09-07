import React from 'react';
import { useVault } from '../../context/VaultContext';
import { FileRow } from './FileRow';
import { EmptyState } from '../ui/EmptyState';
import { formatBytes } from '../../utils/fileUtils';

export function FileTable({ files = [], emptyMessage = 'No files found' }) {
  const {
    selectedFileIds,
    selectAllFiles,
    setUploadModalOpen,
    sortBy,
    setSortBy
  } = useVault();

  if (!files || files.length === 0) {
    return (
      <EmptyState
        icon="folder_open"
        title={emptyMessage}
        description="Try clearing your search query or uploading new files into your vault."
        actionText="Upload Files"
        onAction={() => setUploadModalOpen(true)}
      />
    );
  }

  const allIds = files.map(f => f.id);
  const isAllSelected = files.length > 0 && selectedFileIds.length === files.length;
  const isIndeterminate = selectedFileIds.length > 0 && selectedFileIds.length < files.length;

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const folderCount = files.filter(f => f.isFolder).length;
  const fileCount = files.length - folderCount;

  const toggleSort = (col) => {
    if (col === 'name') {
      setSortBy(prev => prev === 'name-asc' ? 'name-desc' : 'name-asc');
    } else if (col === 'modified') {
      setSortBy(prev => prev === 'modified-desc' ? 'modified-asc' : 'modified-desc');
    } else if (col === 'size') {
      setSortBy(prev => prev === 'size-desc' ? 'size-asc' : 'size-desc');
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-lg border border-zinc-border shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container h-8 font-label-sm text-label-sm uppercase tracking-wider text-outline select-none border-b border-zinc-border">
              {/* Checkbox column */}
              <th className="w-10 px-3 py-1 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => el && (el.indeterminate = isIndeterminate)}
                  onChange={() => selectAllFiles(allIds)}
                  className="w-3.5 h-3.5 rounded accent-primary cursor-pointer align-middle"
                  aria-label="Select all files in table"
                />
              </th>

              {/* Name column */}
              <th
                onClick={() => toggleSort('name')}
                className="px-3 py-1 font-medium hover:text-on-surface cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  {sortBy.startsWith('name') && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortBy === 'name-asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>

              {/* Provider */}
              <th className="w-36 px-3 py-1 font-medium hidden sm:table-cell">Origin Provider</th>

              {/* Type */}
              <th className="w-28 px-3 py-1 font-medium hidden md:table-cell">Type</th>

              {/* Size */}
              <th
                onClick={() => toggleSort('size')}
                className="w-24 px-3 py-1 font-medium hover:text-on-surface cursor-pointer hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Size</span>
                  {sortBy.startsWith('size') && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortBy === 'size-desc' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  )}
                </div>
              </th>

              {/* Modified */}
              <th
                onClick={() => toggleSort('modified')}
                className="w-36 px-3 py-1 font-medium hover:text-on-surface cursor-pointer hidden lg:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Last Modified</span>
                  {sortBy.startsWith('modified') && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortBy === 'modified-desc' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  )}
                </div>
              </th>

              {/* Actions */}
              <th className="w-28 px-3 py-1 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {files.map(file => (
              <FileRow key={file.id} file={file} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer Metrics */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-container font-label-sm text-label-sm text-outline border-t border-zinc-border select-none mt-auto">
        <div className="flex items-center gap-3">
          <span>{files.length} items ({folderCount} folders, {fileCount} files)</span>
          <span className="w-1 h-1 rounded-full bg-outline hidden sm:inline-block"></span>
          <span className="hidden sm:inline-block">Unified index across all connected clouds</span>
        </div>
        <div className="font-code-sm text-code-sm tabular-nums text-on-surface-variant">
          {formatBytes(totalSize)} total size
        </div>
      </div>
    </div>
  );
}
