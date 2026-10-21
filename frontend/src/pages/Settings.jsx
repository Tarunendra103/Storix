import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { key: 'account', label: 'Account', icon: 'person' },
  { key: 'appearance', label: 'Appearance', icon: 'palette' },
  { key: 'security', label: 'Security', icon: 'shield' },
];

export function Settings() {
  const { addToast, theme, setTheme } = useVault();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const chooseTheme = (nextTheme) => {
    setTheme(nextTheme);
    addToast(`${nextTheme === 'dark' ? 'Dark' : 'Light'} mode set`, 'info');
  };

  return (
    <div className="flex flex-col w-full pb-12 animate-in fade-in duration-200">
      <header className="pb-4 border-b border-zinc-border mb-6">
        <h1 className="font-display text-display text-on-surface">Settings</h1>
        <p className="font-body-sm text-on-surface-variant">Manage the available Storix preferences and your sign-in session.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <nav aria-label="Settings sections" className="w-full md:w-52 bg-surface-container-lowest rounded-xl border border-zinc-border p-2 shadow-sm flex md:flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left font-body-sm transition-colors ${activeTab === tab.key ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 min-w-0 bg-surface-container-lowest rounded-xl border border-zinc-border p-6 shadow-sm">
          {activeTab === 'account' && (
            <section className="max-w-lg">
              <h2 className="font-headline-lg text-on-surface">Account</h2>
              <p className="mt-2 font-body-sm text-on-surface-variant">Profile editing is not available in this build. You can safely end this browser session below.</p>
              <button type="button" onClick={logout} className="mt-6 h-9 px-4 rounded-lg border border-error text-error hover:bg-error-container">Log out</button>
            </section>
          )}

          {activeTab === 'appearance' && (
            <section className="max-w-lg">
              <h2 className="font-headline-lg text-on-surface">Appearance</h2>
              <p className="mt-2 font-body-sm text-on-surface-variant">This preference is saved locally in this browser.</p>
              <div className="grid grid-cols-2 gap-3 mt-5" role="radiogroup" aria-label="Theme">
                {[
                  { value: 'light', label: 'Light', icon: 'light_mode', preview: 'bg-white border-zinc-border text-amber-500' },
                  { value: 'dark', label: 'Dark', icon: 'dark_mode', preview: 'bg-zinc-900 border-zinc-700 text-zinc-300' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={theme === option.value}
                    onClick={() => chooseTheme(option.value)}
                    className={`p-4 rounded-xl border flex flex-col gap-2 text-left transition-all ${theme === option.value ? 'border-primary ring-1 ring-primary bg-zinc-selection shadow-sm' : 'border-zinc-border hover:bg-surface-container'}`}
                  >
                    <span className={`h-16 border rounded-md flex items-center justify-center ${option.preview}`}><span className="material-symbols-outlined text-[24px]">{option.icon}</span></span>
                    <span className="font-headline-sm text-on-surface text-center">{option.label}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="max-w-lg">
              <h2 className="font-headline-lg text-on-surface">Security</h2>
              <div className="mt-4 p-4 rounded-xl bg-surface-container border border-zinc-border">
                <div className="flex items-center gap-2 text-primary font-headline-sm"><span className="material-symbols-outlined">verified_user</span>Google OAuth connection</div>
                <p className="mt-2 font-body-sm text-on-surface-variant">Google access and refresh tokens stay on the server and are never returned to this browser. Files stay in Google Drive.</p>
              </div>
              <p className="mt-4 font-body-sm text-outline">To remove access, disconnect a Drive account from Connected Accounts or revoke Storix in your Google Account.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
