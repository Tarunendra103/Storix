import React from 'react';
import { useVault } from '../context/VaultContext';
import { FileTable } from '../components/files/FileTable';
import { FileGrid } from '../components/files/FileGrid';
import { InspectorPane } from '../components/layout/InspectorPane';

export function Favorites() {
  const { files, viewMode } = useVault();

  const favoriteFiles = files.filter(f => f.isFavorite);

  return (
    <div className="flex flex-col w-full gap-space-md animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px] fill">star</span>
          </div>
          <div>
            <h1 className="font-display text-display text-on-surface">Favorites</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {favoriteFiles.length} starred files across all connected cloud accounts
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-start gap-space-md">
        <div className="flex-1 min-w-0">
          {viewMode === 'list' ? (
            <FileTable files={favoriteFiles} emptyMessage="No favorites yet. Click the star on any file to add it here." />
          ) : (
            <FileGrid files={favoriteFiles} emptyMessage="No favorites yet. Click the star on any file to add it here." />
          )}
        </div>
        <InspectorPane />
      </div>
    </div>
  );
}
