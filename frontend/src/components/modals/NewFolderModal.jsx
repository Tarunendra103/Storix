import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export function NewFolderModal() {
  const { newFolderModalOpen, setNewFolderModalOpen, handleCreateFolder } = useVault();
  const [folderName, setFolderName] = useState('');

  if (!newFolderModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    handleCreateFolder(folderName.trim());
    setFolderName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" aria-labelledby="new-folder-modal-title" className="w-full max-w-sm bg-surface-container-lowest rounded-xl border border-zinc-border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-border bg-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f59e0b] text-[20px]">create_new_folder</span>
            <h2 id="new-folder-modal-title" className="font-headline-md text-headline-md text-on-surface">New Folder</h2>
          </div>
          <button
            type="button"
            onClick={() => setNewFolderModalOpen(false)}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Folder Name
            </label>
            <input
              type="text"
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Project Specs, Photos 2025"
              required
              className="h-9 px-3 bg-surface-container rounded border border-zinc-border font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-border">
            <button
              type="button"
              onClick={() => setNewFolderModalOpen(false)}
              className="h-8 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-8 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-headline-sm transition-colors shadow-sm"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
