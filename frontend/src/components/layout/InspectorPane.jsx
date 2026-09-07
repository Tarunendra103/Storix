import React from 'react';
import { useVault } from '../../context/VaultContext';
import { FileTypeIcon } from '../files/FileTypeIcon';
import { formatBytes, formatDate, getProviderBadge } from '../../utils/fileUtils';

export function InspectorPane() {
  const {
    inspectorFile,
    isInspectorOpen,
    setIsInspectorOpen,
    openPreview,
    openFolder,
    setRenameModal,
    addToast
  } = useVault();

  if (!isInspectorOpen) return null;

  if (!inspectorFile) {
    return (
      <aside className="w-[300px] shrink-0 bg-surface-container-lowest rounded-lg p-space-md border border-zinc-border shadow-sm flex flex-col items-center justify-center text-center text-outline h-96">
        <span className="material-symbols-outlined text-[36px] mb-2">info</span>
        <p className="font-body-sm text-body-sm">Select a file to inspect metadata and actions</p>
      </aside>
    );
  }

  const providerBadge = getProviderBadge(inspectorFile.provider);

  const handleShareLink = () => {
    navigator.clipboard?.writeText?.(`https://cloudvault.app/f/${inspectorFile.id}`);
    addToast('CloudVault share link copied to clipboard', 'success');
  };

  return (
    <aside
      id="fileInspectorPane"
      className="w-[300px] shrink-0 bg-surface-container-lowest rounded-lg p-space-md border border-zinc-border shadow-sm flex flex-col gap-space-md select-none animate-in fade-in slide-in-from-right-2 duration-150"
    >
      {/* Inspector Header & Close Button */}
      <div className="flex items-center justify-between pb-space-xs border-b border-zinc-border">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-primary">description</span>
          <span className="font-headline-sm text-headline-sm text-on-surface">File Inspector</span>
        </div>
        <button
          type="button"
          onClick={() => setIsInspectorOpen(false)}
          className="w-6 h-6 rounded flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          title="Close Inspector"
          aria-label="Close pane"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* File Visual Preview Box */}
      <div className="flex flex-col gap-space-xs">
        <div
          onClick={() => !inspectorFile.isFolder && openPreview(inspectorFile)}
          onKeyDown={(event) => {
            if (!inspectorFile.isFolder && event.key === 'Enter') {
              event.preventDefault();
              openPreview(inspectorFile);
            }
          }}
          role={inspectorFile.isFolder ? undefined : 'button'}
          tabIndex={inspectorFile.isFolder ? undefined : 0}
          aria-label={inspectorFile.isFolder ? undefined : `Preview ${inspectorFile.name}`}
          className={`w-full h-36 bg-surface-container rounded flex flex-col items-center justify-center p-space-sm relative overflow-hidden group ${
            !inspectorFile.isFolder ? 'cursor-pointer' : ''
          }`}
        >
          {inspectorFile.thumbnailUrl || inspectorFile.previewUrl || inspectorFile.previewThumbnail ? (
            <img
              src={inspectorFile.thumbnailUrl || inspectorFile.previewUrl || inspectorFile.previewThumbnail}
              alt={inspectorFile.name}
              className="w-full h-full object-cover rounded opacity-95 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <FileTypeIcon file={inspectorFile} className="text-[54px]" />
          )}

          {!inspectorFile.isFolder && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-label-sm text-label-sm text-white font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">zoom_in</span> Click to Preview
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col pt-1">
          <span className="font-headline-sm text-headline-sm text-on-surface break-all leading-tight">
            {inspectorFile.name}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {inspectorFile.isFolder ? 'Directory Folder' : inspectorFile.type || 'File'}
          </span>
        </div>
      </div>

      {/* Quick Action Commands Bar */}
      <div className="grid grid-cols-2 gap-space-xs">
        {!inspectorFile.isFolder ? (
          <button
            type="button"
            onClick={() => openPreview(inspectorFile)}
            className="h-8 px-2 rounded bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
            <span>Preview</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openFolder(inspectorFile)}
            className="h-8 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-headline-sm flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">folder_open</span>
            <span>Open</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => addToast(`Downloading ${inspectorFile.name}...`, 'info')}
          className="h-8 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-headline-sm flex items-center justify-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">download</span>
          <span>Download</span>
        </button>

        <button
          type="button"
          onClick={handleShareLink}
          className="h-8 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm flex items-center justify-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">link</span>
          <span>Share Link</span>
        </button>

        <button
          type="button"
          onClick={() => setRenameModal({ isOpen: true, file: inspectorFile })}
          className="h-8 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm flex items-center justify-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">drive_file_rename_outline</span>
          <span>Rename</span>
        </button>
      </div>

      {/* Metadata Breakdown Table */}
      <div className="flex flex-col gap-space-xs">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
          Information & Origin
        </span>
        <div className="flex flex-col gap-1.5 bg-surface-container-low p-space-sm rounded font-body-sm text-body-sm border border-zinc-border/40">
          <div className="flex items-start justify-between gap-2">
            <span className="text-outline shrink-0">Origin</span>
            <div className="flex items-center gap-1 truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: providerBadge.dotColor }}
              />
              <span className="text-on-surface font-medium truncate">{providerBadge.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-outline">File Size</span>
            <span className="font-code-sm text-code-sm text-on-surface tabular-nums">
              {inspectorFile.isFolder ? '--' : formatBytes(inspectorFile.size)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-outline">Created</span>
            <span className="text-on-surface text-right truncate">
              {formatDate(inspectorFile.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-outline">Modified</span>
            <span className="text-on-surface text-right truncate">
              {formatDate(inspectorFile.modifiedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-outline">Account</span>
            <span className="text-on-surface font-code-sm text-[11px] truncate max-w-[150px]">
              {inspectorFile.providerAccount || 'tarun.personal@gmail.com'}
            </span>
          </div>

          {inspectorFile.checksum && (
            <div className="flex flex-col pt-1 border-t border-zinc-border/30">
              <span className="text-outline text-label-sm text-[10px]">MD5 Checksum</span>
              <span className="font-code-sm text-code-sm text-on-surface select-all break-all bg-surface-container px-1 py-0.5 rounded mt-0.5 text-[10px]">
                {inspectorFile.checksum}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* External Provider Deep Link */}
      <div className="pt-space-xs mt-auto">
        <button
          type="button"
          onClick={() => addToast(`Redirecting to ${providerBadge.name}...`, 'info')}
          className="w-full flex items-center justify-between p-space-sm rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors border border-zinc-border/60"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary">cloud</span>
            <span>Open in {providerBadge.name}</span>
          </div>
          <span className="material-symbols-outlined text-[14px] text-outline">open_in_new</span>
        </button>
      </div>
    </aside>
  );
}
