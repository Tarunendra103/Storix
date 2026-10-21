import React from 'react';
import { useVault } from '../context/VaultContext';
import { SegmentedStorageBar, SingleStorageBar } from '../components/ui/StorageBar';
import { formatBytes } from '../utils/fileUtils';

export function ConnectedAccounts() {
  const {
    connectedAccounts,
    storageOverview,
    setConnectAccountModalOpen,
    handleDisconnectAccount,
    handleRescan,
    syncing,
  } = useVault();

  const total = storageOverview?.totalStorage ?? null;
  const used = storageOverview?.usedStorage ?? null;
  const hasQuota = total !== null && used !== null && total > 0;
  const available = hasQuota ? Math.max(0, total - used) : null;
  const percentage = hasQuota ? ((used / total) * 100).toFixed(0) : null;

  return (
    <div className="flex flex-col w-full gap-6 pb-12 animate-in fade-in duration-200">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl border border-zinc-border shadow-sm">
        <div>
          <p className="font-label-sm uppercase tracking-wider text-outline">Google Drive</p>
          <h1 className="font-display text-display text-on-surface">Connected accounts</h1>
          <p className="mt-1 font-body-md text-on-surface-variant">Connect Drive, refresh its catalog, or remove Storix’s local connection.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button type="button" onClick={handleRescan} disabled={syncing || connectedAccounts.length === 0} className="h-9 px-4 rounded-lg border border-zinc-border bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
            <span className={`material-symbols-outlined text-[16px]${syncing ? ' animate-spin' : ''}`}>sync</span>
            {syncing ? 'Syncing…' : 'Sync Drive'}
          </button>
          <button type="button" onClick={() => setConnectAccountModalOpen(true)} className="h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add_to_drive</span>
            Connect Google Drive
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-zinc-border shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-label-sm uppercase tracking-wider text-outline">Provider quota</p>
              <p className="mt-1 text-2xl font-semibold text-on-surface tabular-nums">{used !== null ? formatBytes(used) : 'Unavailable'}</p>
              <p className="font-body-sm text-on-surface-variant">{hasQuota ? `of ${formatBytes(total)} used across connected accounts` : 'Google did not report a usable storage limit.'}</p>
            </div>
            <span className="px-2 py-1 rounded bg-surface-container text-on-surface-variant font-label-sm">{percentage === null ? 'Quota unknown' : `${percentage}% used`}</span>
          </div>
          <div className="mt-5"><SegmentedStorageBar accounts={connectedAccounts} total={total} className="h-3" /></div>
          <p className="mt-3 font-body-sm text-outline">{available === null ? 'Available storage is unknown.' : `${formatBytes(available)} available`}</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl border border-zinc-border shadow-sm">
          <span className="material-symbols-outlined text-primary">verified_user</span>
          <h2 className="mt-2 font-headline-md text-on-surface">How connection data is handled</h2>
          <p className="mt-2 font-body-sm text-on-surface-variant">Google OAuth credentials stay server-side. Files remain in Google Drive; disconnecting removes only Storix’s local connection and catalog metadata.</p>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="font-headline-lg text-on-surface">Your connected accounts</h2>
          <p className="font-body-sm text-on-surface-variant">Quota is shown only when Google provides it.</p>
        </div>
        {connectedAccounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-border p-8 text-center bg-surface-container-lowest">
            <span className="material-symbols-outlined text-3xl text-outline">add_to_drive</span>
            <h3 className="mt-2 font-headline-md text-on-surface">No Google Drive account connected</h3>
            <p className="mt-1 font-body-sm text-on-surface-variant">Connect one to synchronize its real Drive metadata.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedAccounts.map((account) => {
              const accountHasQuota = account.totalStorage !== null && account.usedStorage !== null && account.totalStorage > 0;
              const accountAvailable = accountHasQuota ? Math.max(0, account.totalStorage - account.usedStorage) : null;
              return (
                <article key={account.id} className="bg-surface-container-lowest p-5 rounded-xl border border-zinc-border shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="material-symbols-outlined p-2 rounded-lg text-white" style={{ backgroundColor: account.color }}>cloud</span>
                      <div className="min-w-0">
                        <h3 className="font-headline-md text-on-surface">Google Drive</h3>
                        <p className="truncate font-body-sm text-on-surface-variant">{account.accountEmail}</p>
                      </div>
                    </div>
                    <span className="text-xs text-outline">Connected</span>
                  </div>
                  <div className="mt-5">
                    <div className="flex justify-between gap-3 font-body-sm">
                      <span className="text-on-surface-variant">Storage</span>
                      <span className="text-on-surface text-right">{accountHasQuota ? `${formatBytes(account.usedStorage)} of ${formatBytes(account.totalStorage)}` : 'Unavailable or unlimited'}</span>
                    </div>
                    {accountHasQuota ? <SingleStorageBar used={account.usedStorage} total={account.totalStorage} color={account.color} className="h-2 mt-2" /> : <div className="w-full h-2 mt-2 rounded bg-surface-container" />}
                    <p className="mt-2 font-body-sm text-outline">{accountAvailable === null ? 'Available storage unknown' : `${formatBytes(accountAvailable)} available`}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-zinc-border flex justify-end">
                    <button type="button" onClick={() => handleDisconnectAccount(account.id)} className="h-8 px-3 rounded text-error hover:bg-error-container">Disconnect</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
