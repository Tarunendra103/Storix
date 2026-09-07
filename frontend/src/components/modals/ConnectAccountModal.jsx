import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export function ConnectAccountModal() {
  const {
    connectAccountModalOpen,
    setConnectAccountModalOpen,
    handleConnectAccount
  } = useVault();

  const [selectedProvider, setSelectedProvider] = useState('google_drive');
  const [accountEmail, setAccountEmail] = useState('');
  const [label, setLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!connectAccountModalOpen) return null;

  const providers = [
    {
      id: 'google_drive',
      name: 'Google Drive',
      desc: '15 GB free personal or Google Workspace cloud',
      color: '#4285F4',
      icon: 'add_to_drive'
    },
    {
      id: 'onedrive',
      name: 'Microsoft OneDrive',
      desc: '5 GB personal or Microsoft 365 enterprise drive',
      color: '#0078D4',
      icon: 'cloud'
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      desc: '2 GB Basic or Dropbox Business cloud archive',
      color: '#0061FF',
      icon: 'inventory_2'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const prov = providers.find(p => p.id === selectedProvider);

    setTimeout(() => {
      handleConnectAccount({
        name: prov.name,
        type: selectedProvider,
        label: label.trim() || 'Additional Drive',
        accountEmail: accountEmail.trim() || `user.${selectedProvider}@cloudvault.net`,
        totalStorage: selectedProvider === 'google_drive' ? 15 * 1024 * 1024 * 1024 : selectedProvider === 'onedrive' ? 5 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024
      });
      setIsSubmitting(false);
      setAccountEmail('');
      setLabel('');
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" aria-labelledby="connect-account-modal-title" className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-zinc-border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-border bg-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">add_link</span>
            <h2 id="connect-account-modal-title" className="font-headline-md text-headline-md text-on-surface">Connect Cloud Account</h2>
          </div>
          <button
            type="button"
            onClick={() => setConnectAccountModalOpen(false)}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Select Provider
            </label>
            <div className="flex flex-col gap-2">
              {providers.map((p) => {
                const isSelected = selectedProvider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProvider(p.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedProvider(p.id);
                      }
                    }}
                    aria-checked={isSelected}
                    role="radio"
                    tabIndex={0}
                    className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-zinc-selection shadow-sm'
                        : 'border-zinc-border hover:bg-surface-container'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{p.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-headline-sm text-headline-sm text-on-surface">{p.name}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] truncate">
                        {p.desc}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        check_circle
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Account Email / Identifier
            </label>
            <input
              type="email"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="e.g. tarun.work@google.com"
              required
              className="h-9 px-3 bg-surface-container rounded border border-zinc-border font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
              Account Label (Optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Personal Backups, Acme Workspace"
              className="h-9 px-3 bg-surface-container rounded border border-zinc-border font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-lg bg-surface-container-high text-on-surface-variant font-body-sm text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">lock</span>
            <span>
              Zero-Password Vault: Authenticated via OAuth 2.0 PKCE. Your password is never shared with CloudVault.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-border">
            <button
              type="button"
              onClick={() => setConnectAccountModalOpen(false)}
              className="h-9 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-headline-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Authorize & Connect</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
