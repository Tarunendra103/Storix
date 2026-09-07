import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';

export function Settings() {
  const { addToast, theme, setTheme } = useVault();
  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState('Tarun K.');
  const [email, setEmail] = useState('tarun.personal@gmail.com');
  const [notifySync, setNotifySync] = useState(true);
  const [notifyUpload, setNotifyUpload] = useState(true);
  const [autoDeduplicate, setAutoDeduplicate] = useState(true);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    addToast('Profile preferences saved', 'success');
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: 'person' },
    { key: 'appearance', label: 'Appearance', icon: 'palette' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications' },
    { key: 'security', label: 'Security & Auth', icon: 'shield' }
  ];

  return (
    <div className="flex flex-col w-full pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="pb-2 border-b border-zinc-border mb-6">
        <h1 className="font-display text-display text-on-surface">Vault Settings</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Manage your personal profile, desktop preferences, and cloud security configuration
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Settings Navigation Tabs */}
        <aside className="w-full md:w-56 bg-surface-container-lowest rounded-xl border border-zinc-border p-2 shadow-sm flex md:flex-col gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left font-body-sm text-body-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 min-w-0 bg-surface-container-lowest rounded-xl border border-zinc-border p-6 shadow-sm">
          {/* Section: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 max-w-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface pb-2 border-b border-zinc-border">
                Personal Profile
              </h2>

              <div className="flex items-center gap-4 py-2">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shadow-sm">
                  TK
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{fullName}</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Unified Vault Owner</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Display Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 px-3 bg-surface-container rounded border border-zinc-border font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Primary Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 px-3 bg-surface-container rounded border border-zinc-border font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
                />
              </div>

              <button
                type="submit"
                className="h-9 px-5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-headline-sm transition-colors shadow-sm self-start mt-2"
              >
                Save Profile
              </button>
            </form>
          )}

          {/* Section: Appearance */}
          {activeTab === 'appearance' && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface pb-2 border-b border-zinc-border">
                Appearance & Theme
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Select your preferred interface style. CloudVault follows modern desktop utility standards.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => { setTheme('light'); addToast('Light mode set', 'info'); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setTheme('light');
                      addToast('Light mode set', 'info');
                    }
                  }}
                  role="radio"
                  tabIndex={0}
                  aria-pressed={theme === 'light'}
                  className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all text-left ${
                    theme === 'light'
                      ? 'border-primary ring-1 ring-primary bg-zinc-selection shadow-sm'
                      : 'border-zinc-border hover:bg-surface-container'
                  }`}
                >
                  <div className="h-16 bg-white border border-zinc-border rounded-md flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[24px] text-amber-500">light_mode</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface text-center">Light (Default)</span>
                </div>

                <div
                  onClick={() => { setTheme('dark'); addToast('Dark mode set', 'info'); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setTheme('dark');
                      addToast('Dark mode set', 'info');
                    }
                  }}
                  role="radio"
                  tabIndex={0}
                  aria-pressed={theme === 'dark'}
                  className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all text-left ${
                    theme === 'dark'
                      ? 'border-primary ring-1 ring-primary bg-zinc-selection shadow-sm'
                      : 'border-zinc-border hover:bg-surface-container'
                  }`}
                >
                  <div className="h-16 bg-zinc-900 border border-zinc-700 rounded-md flex items-center justify-center text-zinc-300">
                    <span className="material-symbols-outlined text-[24px]">dark_mode</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface text-center">Dark</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Notifications */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface pb-2 border-b border-zinc-border">
                Notification Preferences
              </h2>

              <div className="flex items-center justify-between py-2 border-b border-zinc-border/40">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Sync Telemetry Alerts</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Notify when background scans complete</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifySync}
                  onChange={(e) => setNotifySync(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-zinc-border/40">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Upload Confirmations</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Show toasts when file uploads complete</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyUpload}
                  onChange={(e) => setNotifyUpload(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Section: Security */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-4 max-w-lg">
              <h2 className="font-headline-lg text-headline-lg text-on-surface pb-2 border-b border-zinc-border">
                Security & Multi-Cloud Encryption
              </h2>

              <div className="p-4 rounded-xl bg-surface-container flex flex-col gap-2 border border-zinc-border">
                <div className="flex items-center gap-2 text-primary font-headline-sm">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                  <span>Zero-Password Architecture</span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Your files are stored directly with your trusted providers (Google Drive, OneDrive, Dropbox). CloudVault only stores encrypted access tokens via standard Spring Security OAuth 2.0 PKCE.
                </p>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-zinc-border/40">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Cross-Cloud Deduplication</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Deduplicate identical file hashes across mounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoDeduplicate}
                  onChange={(e) => setAutoDeduplicate(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
