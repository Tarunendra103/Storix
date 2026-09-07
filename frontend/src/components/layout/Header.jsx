import React, { useState, useRef, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    connectedAccounts,
    handleRescan,
    setIsMobileNavOpen,
    isInspectorOpen,
    setIsInspectorOpen,
    setActiveNav
  } = useVault();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 md:left-[230px] right-0 h-[52px] bg-surface-container-lowest border-b border-surface-container-highest z-40 flex items-center justify-between px-4 md:px-space-xl">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-space-md flex-1 max-w-xl min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="md:hidden p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[22px] block">menu</span>
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value;
              setSearchQuery(query);
              if (query.trim()) setActiveNav('my-files');
            }}
            placeholder="Search files across all cloud accounts..."
            className="w-full h-8 pl-8 pr-12 bg-surface-container rounded border border-surface-container-highest font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-space-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          ) : (
            <span className="absolute right-space-sm top-1/2 -translate-y-1/2 px-1 py-0.5 rounded bg-surface-container-high font-code-sm text-code-sm text-outline border border-surface-container-highest hidden sm:inline-block">
              ⌘K
            </span>
          )}
        </div>

        {/* Sync Telemetry Badge */}
        <button
          type="button"
          onClick={handleRescan}
          className="hidden xl:flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant cursor-pointer hover:opacity-80 transition-opacity shrink-0"
          title="Click to trigger rescan of all accounts"
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>All {connectedAccounts.length || 4} accounts synced</span>
        </button>
      </div>

      {/* Right Controls: View switcher, Sort, Inspector, User Profile */}
      <div className="flex items-center gap-2 sm:gap-space-md shrink-0">
        {/* View mode toggle (List / Grid) */}
        <div className="flex items-center rounded border border-surface-container-highest bg-surface-container p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`p-1 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-surface-container-lowest text-on-surface shadow-none'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="Grid view"
          >
            <span className="material-symbols-outlined text-[18px] block">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`p-1 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-surface-container-lowest text-on-surface shadow-none'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="List view"
          >
            <span className="material-symbols-outlined text-[18px] block">format_list_bulleted</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen(prev => !prev)}
            className="h-8 px-space-sm rounded border border-surface-container-highest bg-surface-container-lowest text-on-surface font-body-sm text-body-sm flex items-center gap-space-xs hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">sort</span>
            <span className="hidden sm:inline">Sort</span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-surface-container-lowest rounded-lg border border-zinc-border shadow-lg py-1 z-50 text-body-sm text-on-surface animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 font-label-sm text-label-sm text-outline uppercase border-b border-zinc-border">
                Sort Files By
              </div>
              <button
                onClick={() => { setSortBy('modified-desc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-hover ${
                  sortBy === 'modified-desc' ? 'text-primary font-semibold' : ''
                }`}
              >
                <span>Modified (Newest)</span>
                {sortBy === 'modified-desc' && <span className="material-symbols-outlined text-[16px]">check</span>}
              </button>
              <button
                onClick={() => { setSortBy('modified-asc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-hover ${
                  sortBy === 'modified-asc' ? 'text-primary font-semibold' : ''
                }`}
              >
                <span>Modified (Oldest)</span>
                {sortBy === 'modified-asc' && <span className="material-symbols-outlined text-[16px]">check</span>}
              </button>
              <button
                onClick={() => { setSortBy('name-asc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-hover ${
                  sortBy === 'name-asc' ? 'text-primary font-semibold' : ''
                }`}
              >
                <span>Name (A to Z)</span>
                {sortBy === 'name-asc' && <span className="material-symbols-outlined text-[16px]">check</span>}
              </button>
              <button
                onClick={() => { setSortBy('name-desc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-hover ${
                  sortBy === 'name-desc' ? 'text-primary font-semibold' : ''
                }`}
              >
                <span>Name (Z to A)</span>
                {sortBy === 'name-desc' && <span className="material-symbols-outlined text-[16px]">check</span>}
              </button>
              <button
                onClick={() => { setSortBy('size-desc'); setIsSortOpen(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-zinc-hover ${
                  sortBy === 'size-desc' ? 'text-primary font-semibold' : ''
                }`}
              >
                <span>Size (Largest)</span>
                {sortBy === 'size-desc' && <span className="material-symbols-outlined text-[16px]">check</span>}
              </button>
            </div>
          )}
        </div>

        {/* Inspector Pane Toggle button */}
        <button
          type="button"
          onClick={() => setIsInspectorOpen(prev => !prev)}
          className={`h-8 w-8 rounded flex items-center justify-center transition-colors ${
            isInspectorOpen
              ? 'bg-surface-container-high text-primary'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
          title="Toggle File Inspector (Info)"
          aria-label="Toggle inspector"
        >
          <span className="material-symbols-outlined text-[18px]">info</span>
        </button>

        <div className="h-4 w-px bg-surface-container-highest"></div>

        {/* User Profile Info */}
        <button
          type="button"
          onClick={() => setActiveNav('settings')}
          className="flex items-center gap-space-sm cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-0 p-0"
          title="Account Settings"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-semibold text-xs shadow-sm">
            TK
          </div>
          <span className="hidden sm:inline font-headline-sm text-headline-sm text-on-surface">
            Tarun K.
          </span>
        </button>
      </div>
    </header>
  );
}
