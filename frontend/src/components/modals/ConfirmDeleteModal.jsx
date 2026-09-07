import React from 'react';
import { useVault } from '../../context/VaultContext';

export function ConfirmDeleteModal() {
  const {
    deleteModal,
    setDeleteModal,
    handleDelete,
    handleBatchDelete,
    selectedFileIds
  } = useVault();

  if (!deleteModal.isOpen) return null;

  const isBatch = deleteModal.isBatch;
  const targetFile = deleteModal.file;
  const count = isBatch ? selectedFileIds.length : 1;

  const onConfirm = () => {
    if (isBatch) {
      handleBatchDelete();
    } else if (targetFile) {
      handleDelete(targetFile.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-zinc-border shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">delete</span>
            </div>
            <div>
              <h2 id="delete-modal-title" className="font-headline-md text-headline-md text-on-surface">
                {isBatch ? `Delete ${count} items?` : `Delete "${targetFile?.name}"?`}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {isBatch
                  ? `These ${count} items will be removed from your cloud vault and free up storage space across your accounts.`
                  : `This file will be deleted from ${targetFile?.provider || 'your cloud'}. You can re-upload anytime.`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-border">
            <button
              type="button"
              onClick={() => setDeleteModal({ isOpen: false, file: null, isBatch: false })}
              className="h-8 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="h-8 px-4 rounded-lg bg-error text-white hover:opacity-90 font-headline-sm text-headline-sm transition-opacity shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
