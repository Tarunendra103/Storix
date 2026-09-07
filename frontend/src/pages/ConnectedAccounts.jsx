import React, { useState } from 'react';
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
    addToast
  } = useVault();

  const [endpointFilter, setEndpointFilter] = useState('all');

  const total = storageOverview?.totalStorage || 37 * 1024 * 1024 * 1024;
  const used = storageOverview?.usedStorage || 17.4 * 1024 * 1024 * 1024;
  const available = Math.max(0, total - used);
  const percentage = total > 0 ? ((used / total) * 100).toFixed(0) : '47';

  const accounts = storageOverview?.accounts || connectedAccounts;

  const filteredAccounts = accounts.filter(a => {
    if (endpointFilter === 'all') return true;
    if (endpointFilter === 'personal') return a.label.toLowerCase().includes('personal') || a.label.toLowerCase().includes('archive');
    if (endpointFilter === 'work') return a.label.toLowerCase().includes('work') || a.label.toLowerCase().includes('acme');
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-12 animate-in fade-in duration-200">
      {/* Breadcrumb & Encryption Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-lg">
        <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
          <span>Storage</span>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-semibold">Connected Accounts</span>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-zinc-border">
            <span className="material-symbols-outlined text-[14px] text-primary">security</span>
            <span>AES-256 Multi-Cloud Encryption</span>
          </div>
          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-zinc-border">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Gateway Heartbeat: 42ms</span>
          </div>
        </div>
      </div>

      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl pb-space-lg bg-surface-container-lowest p-space-lg rounded-xl border border-zinc-border shadow-sm">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-display text-display text-on-surface">Connected Accounts</h1>
            <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed font-semibold">
              {accounts.length} Active
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your integrated cloud storage accounts, quota allocations, and sync schedules across providers.
          </p>
        </div>

        <div className="flex items-center gap-space-sm shrink-0">
          <button
            type="button"
            onClick={handleRescan}
            className="h-9 px-space-md rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-space-xs transition-colors border border-zinc-border"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Sync All</span>
          </button>
          <button
            type="button"
            onClick={() => setConnectAccountModalOpen(true)}
            className="h-9 px-space-base bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-headline-sm text-headline-sm rounded-lg flex items-center gap-space-xs transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_link</span>
            <span>Connect Cloud Account</span>
          </button>
        </div>
      </div>

      {/* Unified Quota Overview Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-xl">
        {/* Main Aggregate Metric (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl border border-zinc-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Aggregated Storage Quota
                </span>
                <div className="flex items-baseline gap-space-xs mt-1 flex-wrap">
                  <span className="font-display text-2xl font-bold text-on-surface tabular-nums">
                    {formatBytes(used)}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant tabular-nums">
                    of {formatBytes(total)} combined limit
                  </span>
                  <span className="ml-2 font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold">
                    {percentage}% Utilized
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full my-space-base">
              <SegmentedStorageBar accounts={accounts} total={total} className="h-3" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-space-xs border-t border-zinc-border/60 gap-2">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <span>Automatic quota deduplication enabled across cloud mounts</span>
            </div>
            <span className="font-code-sm text-code-sm text-outline tabular-nums">
              {formatBytes(available)} headroom available
            </span>
          </div>
        </div>

        {/* Security & OAuth Trust Card (4 cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl border border-zinc-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center text-on-primary-fixed mb-space-sm">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Zero-Password Vault</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              CloudVault connects exclusively via official OAuth 2.0 PKCE. Credentials never transit or touch our index servers. Revoke tokens anytime at the provider level.
            </p>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-zinc-border/60 flex items-center justify-between font-label-sm text-label-sm">
            <span className="text-on-surface font-medium">SOC2 Type II Attested</span>
            <button
              type="button"
              onClick={() => addToast('SOC2 Type II security certificate verified', 'info')}
              className="text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Security Whitepaper</span>
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Providers Grid */}
      <div className="flex items-center justify-between mb-space-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Configured Endpoints</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Real-time sync telemetry and individual cloud limits
          </p>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="font-label-sm text-label-sm text-outline">Filter:</span>
          <button
            type="button"
            onClick={() => setEndpointFilter('all')}
            className={`px-space-sm py-0.5 rounded font-label-sm text-label-sm transition-colors ${
              endpointFilter === 'all'
                ? 'bg-surface-container-high text-on-surface font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All ({accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setEndpointFilter('personal')}
            className={`px-space-sm py-0.5 rounded font-label-sm text-label-sm transition-colors ${
              endpointFilter === 'personal'
                ? 'bg-surface-container-high text-on-surface font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => setEndpointFilter('work')}
            className={`px-space-sm py-0.5 rounded font-label-sm text-label-sm transition-colors ${
              endpointFilter === 'work'
                ? 'bg-surface-container-high text-on-surface font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Work
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-base">
        {filteredAccounts.map((account) => {
          const accPerc = account.totalStorage > 0
            ? Math.round((account.usedStorage / account.totalStorage) * 100)
            : 0;
          return (
            <div
              key={account.id}
              className="bg-surface-container-lowest p-space-lg rounded-xl border border-zinc-border shadow-sm hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-space-md">
                  <div className="flex items-center gap-space-md">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 p-2"
                      style={{ backgroundColor: account.color }}
                    >
                      <span className="material-symbols-outlined text-[22px]">cloud</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-space-xs">
                        <h3 className="font-headline-md text-headline-md text-on-surface">{account.name}</h3>
                        <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-medium">
                          {account.label}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant font-code-sm text-xs">
                        {account.accountEmail}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>{account.status}</span>
                  </span>
                </div>

                <div className="space-y-space-xs mb-space-md">
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="text-on-surface-variant">Storage Allocation</span>
                    <span className="font-semibold text-on-surface tabular-nums">
                      {formatBytes(account.usedStorage)} of {formatBytes(account.totalStorage)} ({accPerc}%)
                    </span>
                  </div>
                  <SingleStorageBar
                    used={account.usedStorage}
                    total={account.totalStorage}
                    color={account.color}
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                    <span className="tabular-nums">
                      {formatBytes(account.totalStorage - account.usedStorage)} available
                    </span>
                    <span>Synced {account.lastSynced}</span>
                  </div>
                </div>
              </div>

              <div className="pt-space-sm border-t border-zinc-border/60 flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => {
                      addToast(`Synced ${account.name} (${account.label})`, 'success');
                    }}
                    className="h-7 px-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors border border-zinc-border"
                  >
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    <span>Sync Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addToast(`Settings opened for ${account.name}`, 'info')}
                    className="h-7 px-2.5 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">settings</span>
                    <span>Settings</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDisconnectAccount(account.id)}
                  className="h-7 px-2 rounded hover:bg-error-container text-outline hover:text-on-error-container font-label-sm text-label-sm transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
