import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { SegmentedStorageBar } from '../components/ui/StorageBar';
import { FileTable } from '../components/files/FileTable';
import { formatBytes, getCategoryStats } from '../utils/fileUtils';

export function Home() {
  const {
    files,
    storageOverview,
    connectedAccounts,
    handleRescan,
    setUploadModalOpen,
    setActiveNav
  } = useVault();

  const [activeChip, setActiveChip] = useState('all');
  const categoryStats = getCategoryStats(files);

  const total = storageOverview?.totalStorage || 37 * 1024 * 1024 * 1024;
  const used = storageOverview?.usedStorage || 17.4 * 1024 * 1024 * 1024;
  const available = Math.max(0, total - used);
  const percentage = total > 0 ? ((used / total) * 100).toFixed(1) : '47.0';

  // Recent files filtering
  let recentFiles = files.filter(f => !f.isFolder).slice(0, 7);

  if (activeChip === 'today') {
    const today = new Date().toDateString();
    recentFiles = recentFiles.filter(f => new Date(f.modifiedAt).toDateString() === today);
  } else if (activeChip === 'starred') {
    recentFiles = recentFiles.filter(f => f.isFavorite);
  }

  const accountsList = storageOverview?.accounts || connectedAccounts;

  return (
    <div className="flex flex-col w-full gap-space-xl pb-12 animate-in fade-in duration-200">
      {/* Top Welcome & Status Area */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-display text-display text-on-surface tracking-tight">
              Good evening, Tarun
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm border border-zinc-border">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your {accountsList.length || 4} cloud accounts are in sync. Unified personal drive active.
          </p>
        </div>

        <div className="flex items-center gap-space-xs shrink-0">
          <button
            type="button"
            onClick={handleRescan}
            className="h-8 px-space-md rounded bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-zinc-border shadow-sm hover:bg-surface-container transition-colors flex items-center gap-space-xs"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">sync</span>
            <span>Rescan All</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="h-8 px-space-md rounded bg-primary-container text-on-primary font-body-sm text-body-sm shadow-sm hover:bg-primary transition-colors flex items-center gap-space-xs"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            <span>Upload Files</span>
          </button>
        </div>
      </section>

      {/* Unified Storage Overview Section */}
      <section className="bg-surface-container-lowest rounded-lg p-space-lg border border-zinc-border shadow-sm flex flex-col gap-space-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-2xs border-b border-zinc-border/60">
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex items-baseline gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Capacity:
              </span>
              <span className="font-headline-md text-headline-md text-on-surface tabular-nums">
                {formatBytes(total)}
              </span>
            </div>
            <span className="text-surface-container-highest">•</span>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Used:
              </span>
              <span className="font-headline-md text-headline-md text-primary tabular-nums">
                {formatBytes(used)}
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant tabular-nums">
                ({percentage}%)
              </span>
            </div>
            <span className="text-surface-container-highest">•</span>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                Available:
              </span>
              <span className="font-headline-md text-headline-md text-on-surface-variant tabular-nums">
                {formatBytes(available)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-xs">
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 border border-zinc-border/40">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Connected • {accountsList.length} accounts
            </span>
            <button
              type="button"
              onClick={() => setActiveNav('connected-accounts')}
              className="px-2 py-0.5 rounded text-primary hover:bg-surface-container-high font-label-sm text-label-sm transition-colors"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Segmented Multi-provider Progress Bar */}
        <div className="flex flex-col gap-space-xs">
          <SegmentedStorageBar
            accounts={accountsList}
            total={total}
            className="h-3"
          />

          {/* Compact Provider Badges Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs pt-space-xs">
            {accountsList.map((acc) => (
              <div
                key={acc.id}
                onClick={() => setActiveNav('connected-accounts')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveNav('connected-accounts');
                  }
                }}
                role="button"
                tabIndex={0}
                className="flex items-center justify-between p-space-xs rounded bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer border border-zinc-border/40 text-left"
              >
                <div className="flex items-center gap-space-xs min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: acc.color }}
                  />
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    {acc.name} ({acc.label})
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant shrink-0 ml-1 tabular-nums">
                  {formatBytes(acc.usedStorage)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Category Shortcuts */}
      <section className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between px-space-2xs">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            File Categories
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Auto-aggregated from all clouds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Photos */}
          <div
            onClick={() => setActiveNav('photos')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveNav('photos');
              }
            }}
            role="button"
            tabIndex={0}
            className="group p-space-md rounded-lg bg-surface-container-lowest border border-zinc-border shadow-sm hover:border-primary hover:shadow-md transition-all flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer text-left"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">image</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                Photos
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {categoryStats.photos.count} files • {formatBytes(categoryStats.photos.size)}
              </p>
            </div>
          </div>

          {/* Videos */}
          <div
            onClick={() => setActiveNav('videos')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveNav('videos');
              }
            }}
            role="button"
            tabIndex={0}
            className="group p-space-md rounded-lg bg-surface-container-lowest border border-zinc-border shadow-sm hover:border-secondary hover:shadow-md transition-all flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer text-left"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <span className="material-symbols-outlined text-[20px]">movie</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">
                Videos
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {categoryStats.videos.count} files • {formatBytes(categoryStats.videos.size)}
              </p>
            </div>
          </div>

          {/* Documents */}
          <div
            onClick={() => setActiveNav('documents')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveNav('documents');
              }
            }}
            role="button"
            tabIndex={0}
            className="group p-space-md rounded-lg bg-surface-container-lowest border border-zinc-border shadow-sm hover:border-primary hover:shadow-md transition-all flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer text-left"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary-container" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                Documents
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {categoryStats.documents.count} files • {formatBytes(categoryStats.documents.size)}
              </p>
            </div>
          </div>

          {/* Other / Archives */}
          <div
            onClick={() => setActiveNav('other')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setActiveNav('other');
              }
            }}
            role="button"
            tabIndex={0}
            className="group p-space-md rounded-lg bg-surface-container-lowest border border-zinc-border shadow-sm hover:border-tertiary hover:shadow-md transition-all flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer text-left"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                <span className="material-symbols-outlined text-[20px]">folder_zip</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-tertiary" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-tertiary transition-colors">
                Other / Archives
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {categoryStats.other.count} files • {formatBytes(categoryStats.other.size)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Files Table Section */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">Recent Files</h2>
            <span className="text-surface-container-highest hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <button
                type="button"
                onClick={() => setActiveChip('all')}
                className={`px-2.5 py-1 rounded font-headline-sm text-headline-sm transition-colors ${
                  activeChip === 'all'
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container font-body-sm text-body-sm'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveChip('today')}
                className={`px-2.5 py-1 rounded font-headline-sm text-headline-sm transition-colors ${
                  activeChip === 'today'
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container font-body-sm text-body-sm'
                }`}
              >
                Modified Today
              </button>
              <button
                type="button"
                onClick={() => setActiveChip('starred')}
                className={`px-2.5 py-1 rounded font-headline-sm text-headline-sm transition-colors ${
                  activeChip === 'starred'
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container font-body-sm text-body-sm'
                }`}
              >
                Starred
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveNav('my-files')}
            className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View all files in My Files</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <FileTable files={recentFiles} emptyMessage="No recent files match this filter" />
      </section>
    </div>
  );
}
