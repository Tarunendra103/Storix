import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export function ConnectAccountModal() {
  const { connectAccountModalOpen, setConnectAccountModalOpen, handleConnectAccount } = useVault();
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!connectAccountModalOpen) return null;

  const connect = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await handleConnectAccount();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="connect-account-modal-title" className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-zinc-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-border bg-surface-container">
          <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">add_to_drive</span><h2 id="connect-account-modal-title" className="font-headline-md text-on-surface">Connect Google Drive</h2></div>
          <button type="button" onClick={() => setConnectAccountModalOpen(false)} className="p-1 rounded text-outline hover:text-on-surface" aria-label="Close"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={connect} className="p-6 flex flex-col gap-4">
          <p className="font-body-sm text-on-surface-variant">Storix will open Google’s consent screen. Choose the Drive account there; no account email or cloud password is collected by Storix.</p>
          <div className="p-3 rounded-lg bg-surface-container-high text-on-surface-variant font-body-sm text-[11px] flex items-start gap-2"><span className="material-symbols-outlined text-primary text-[16px]">lock</span><span>Google access and refresh tokens remain server-side and are never returned to this browser.</span></div>
          <p className="font-body-sm text-outline">OneDrive and Dropbox are not available in this build.</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-border">
            <button type="button" onClick={() => setConnectAccountModalOpen(false)} className="h-9 px-4 rounded-lg bg-surface-container text-on-surface">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="h-9 px-4 rounded-lg bg-primary text-on-primary disabled:opacity-50">{isSubmitting ? 'Redirecting…' : 'Continue with Google'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
