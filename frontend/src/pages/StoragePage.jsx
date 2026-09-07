import React from 'react';
import { useVault } from '../context/VaultContext';
import { SegmentedStorageBar, SingleStorageBar } from '../components/ui/StorageBar';
import { formatBytes, getCategoryStats } from '../utils/fileUtils';

export function StoragePage() {
  const { files, storageOverview, connectedAccounts, setActiveNav, setConnectAccountModalOpen } = useVault();

  const total = storageOverview?.totalStorage || 37 * 1024 * 1024 * 1024;
  const used = storageOverview?.usedStorage || 17.4 * 1024 * 1024 * 1024;
  const available = Math.max(0, total - used);
  const percentage = total > 0 ? ((used / total) * 100).toFixed(1) : '47.0';

  const accounts = storageOverview?.accounts || connectedAccounts;

  const categoryStats = getCategoryStats(files);
  const categories = [
    { key: 'photos', name: 'Photos & Gallery', ...categoryStats.photos, color: '#2563eb', icon: 'image' },
    { key: 'videos', name: 'Videos & Media', ...categoryStats.videos, color: '#4b41e1', icon: 'movie' },
    { key: 'documents', name: 'Documents & Worksheets', ...categoryStats.documents, color: '#0053db', icon: 'description' },
    { key: 'other', name: 'Archives & Other', ...categoryStats.other, color: '#bc4800', icon: 'folder_zip' }
  ];

  return (
    <div className="flex flex-col w-full gap-space-xl pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-border">
        <div>
          <h1 className="font-display text-display text-on-surface">Storage Management</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Unified capacity aggregated across {accounts.length} connected cloud drives
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConnectAccountModalOpen(true)}
          className="h-8 px-4 rounded bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">add_link</span>
          <span>Add More Storage</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-zinc-border shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Combined Capacity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-3xl font-bold text-on-surface tabular-nums">
                {formatBytes(used)}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant tabular-nums">
                used of {formatBytes(total)} total ({percentage}%)
              </span>
            </div>
          </div>
          <span className="font-code-sm text-code-sm text-primary font-medium">
            {formatBytes(available)} headroom available
          </span>
        </div>

        <SegmentedStorageBar accounts={accounts} total={total} className="h-3.5" />
      </div>

      {/* Provider Breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Cloud Provider Breakdown</h2>
          <button
            type="button"
            onClick={() => setActiveNav('connected-accounts')}
            className="text-primary hover:underline font-label-md text-label-md"
          >
            Manage Accounts
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const accPercentage = account.totalStorage > 0
              ? ((account.usedStorage / account.totalStorage) * 100).toFixed(0)
              : 0;
            return (
              <div
                key={account.id}
                className="bg-surface-container-lowest p-5 rounded-xl border border-zinc-border shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: account.color }}
                    />
                    <span className="font-headline-md text-headline-md text-on-surface">
                      {account.name}
                    </span>
                    <span className="font-label-sm text-xs px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                      {account.label}
                    </span>
                  </div>
                  <span className="font-label-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    {account.status}
                  </span>
                </div>

                <div className="flex items-center justify-between font-body-sm text-body-sm">
                  <span className="text-on-surface-variant font-code-sm text-xs">
                    {account.accountEmail}
                  </span>
                  <span className="font-code-sm text-code-sm font-semibold text-on-surface tabular-nums">
                    {formatBytes(account.usedStorage)} / {formatBytes(account.totalStorage)} ({accPercentage}%)
                  </span>
                </div>

                <SingleStorageBar
                  used={account.usedStorage}
                  total={account.totalStorage}
                  color={account.color}
                  className="h-2"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage By Category */}
      <div className="flex flex-col gap-3">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Storage by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const catPercentage = total > 0 ? ((cat.size / total) * 100).toFixed(1) : 0;
            return (
              <div
                key={cat.key}
                onClick={() => setActiveNav(cat.key === 'other' ? 'my-files' : cat.key)}
                className="bg-surface-container-lowest p-4 rounded-xl border border-zinc-border shadow-sm flex flex-col justify-between h-36 cursor-pointer hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  </div>
                  <span className="font-code-sm text-xs text-outline tabular-nums">
                    {catPercentage}%
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">{cat.name}</h3>
                  <div className="flex items-center justify-between font-body-sm text-xs text-on-surface-variant">
                    <span>{cat.count} files</span>
                    <span className="font-semibold text-on-surface font-code-sm tabular-nums">
                      {formatBytes(cat.size)}
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${catPercentage * 2}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
