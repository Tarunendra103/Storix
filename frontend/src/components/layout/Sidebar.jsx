import React from 'react';
import { useVault } from '../../context/VaultContext';
import { SegmentedStorageBar } from '../ui/StorageBar';
import { formatBytes } from '../../utils/fileUtils';

export function Sidebar() {
  const {
    activeNav,
    setActiveNav,
    storageOverview,
    connectedAccounts,
    setUploadModalOpen,
    isMobileNavOpen,
    setIsMobileNavOpen
  } = useVault();

  const total = storageOverview?.totalStorage || 37 * 1024 * 1024 * 1024;
  const used = storageOverview?.usedStorage || 17.4 * 1024 * 1024 * 1024;

  const handleNavClick = (navKey) => {
    setActiveNav(navKey);
    setIsMobileNavOpen(false);
  };

  const navItems = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'my-files', label: 'My Files', icon: 'folder' },
    { key: 'photos', label: 'Photos', icon: 'image' },
    { key: 'videos', label: 'Videos', icon: 'movie' },
    { key: 'documents', label: 'Documents', icon: 'description' },
    { key: 'other', label: 'Other', icon: 'category' }
  ];

  const filterItems = [
    { key: 'favorites', label: 'Favorites', icon: 'star' },
    { key: 'recent', label: 'Recent', icon: 'schedule' }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Header & Logo */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-[52px] px-space-base flex items-center justify-between border-b border-surface-container-highest">
          <button type="button" className="flex items-center gap-space-sm cursor-pointer bg-transparent border-0 p-0" onClick={() => handleNavClick('home')}>
            {/* Authentic CloudVault SVG Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" fill="none" className="shrink-0">
              <rect width="32" height="32" rx="6" fill="#18181B"/>
              <path d="M10 13a4 4 0 0 1 7.7-1.5A3.5 3.5 0 0 1 22 15a3.5 3.5 0 0 1-2.5 3.4M9 19h14M9 22h14" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-headline-md text-headline-md tracking-tight text-on-surface font-semibold">
              CloudVault
            </span>
          </button>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="md:hidden p-1 text-outline hover:text-on-surface"
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Upload Button */}
        <div className="px-space-md pt-space-md pb-space-xs">
          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="w-full h-9 px-space-base bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-headline-sm text-headline-sm rounded-lg flex items-center justify-center gap-space-xs transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Upload</span>
          </button>
        </div>

        {/* Scrollable Navigation links */}
        <div className="flex-1 overflow-y-auto px-space-xs py-space-xs flex flex-col gap-space-md">
          {/* Section: Storage */}
          <div className="flex flex-col gap-space-2xs">
            <span className="px-space-md py-space-2xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
              Storage
            </span>
            <nav className="flex flex-col gap-space-2xs">
              {navItems.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`flex items-center gap-space-sm px-space-md py-space-xs rounded transition-colors text-left ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : ''}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Section: Filter */}
          <div className="flex flex-col gap-space-2xs">
            <span className="px-space-md py-space-2xs font-label-sm text-label-sm uppercase tracking-wider text-outline">
              Filter
            </span>
            <nav className="flex flex-col gap-space-2xs">
              {filterItems.map((item) => {
                const isActive = activeNav === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`flex items-center gap-space-sm px-space-md py-space-xs rounded transition-colors text-left ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : ''}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Footer Storage Indicator & Settings */}
      <div className="p-space-md border-t border-surface-container-highest flex flex-col gap-space-sm bg-surface-container">
        {/* Storage Bar widget */}
        <div
          onClick={() => handleNavClick('storage')}
          className="flex flex-col gap-space-xs cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span className="font-semibold">Storage</span>
            <span className="font-code-sm text-code-sm tabular-nums">
              {formatBytes(used)} of {formatBytes(total)}
            </span>
          </div>
          <SegmentedStorageBar
            accounts={storageOverview?.accounts || connectedAccounts}
            total={total}
            className="h-1.5"
          />
        </div>

        {/* Secondary Links */}
        <nav className="flex flex-col gap-space-2xs pt-space-xs">
          <button
            type="button"
            onClick={() => handleNavClick('connected-accounts')}
            className={`flex items-center justify-between px-space-md py-space-xs rounded transition-colors text-left ${
              activeNav === 'connected-accounts'
                ? 'bg-surface-container-high text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
            }`}
          >
            <span className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-[18px]">cloud</span>
              <span>Connected</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-highest text-on-surface-variant">
              {connectedAccounts.length || 4}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-space-sm px-space-md py-space-xs rounded transition-colors text-left ${
              activeNav === 'settings'
                ? 'bg-surface-container-high text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md text-body-md'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[230px] bg-surface-container border-r border-surface-container-highest z-50 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative w-[260px] h-full bg-surface-container border-r border-surface-container-highest z-10 shadow-2xl flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
