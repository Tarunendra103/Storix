import React from 'react';
import { useVault } from '../../context/VaultContext';

/** Shared, confirmation-gated selection controls for a visible file category. */
export function BulkActions({ files }) {
  const { selectedFileIds, setSelectedFileIds, setDeleteModal } = useVault();
  const visibleIds = files.map((file) => file.id);
  const selectedIds = selectedFileIds.filter((id) => visibleIds.includes(id));
  const allSelected = visibleIds.length > 0 && selectedIds.length === visibleIds.length;

  const selectVisible = () => setSelectedFileIds(allSelected ? [] : visibleIds);
  const confirmDelete = () => {
    if (!selectedIds.length) return;
    setSelectedFileIds(selectedIds);
    setDeleteModal({ isOpen: true, file: null, isBatch: true });
  };

  if (!visibleIds.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" onClick={selectVisible} className="h-8 px-3 rounded border border-zinc-border bg-surface-container text-on-surface hover:bg-surface-container-high text-sm">
        {allSelected ? 'Clear selection' : `Select all (${visibleIds.length})`}
      </button>
      {selectedIds.length > 0 && (
        <button type="button" onClick={confirmDelete} className="h-8 px-3 rounded border border-error text-error hover:bg-error-container text-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Delete selected ({selectedIds.length})
        </button>
      )}
    </div>
  );
}
