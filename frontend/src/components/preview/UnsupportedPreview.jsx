import React from 'react';
import { formatBytes, getProviderBadge } from '../../utils/fileUtils';
import { FileTypeIcon } from '../files/FileTypeIcon';
import { useVault } from '../../context/VaultContext';

export function UnsupportedPreview({ file }) {
  const { addToast } = useVault();
  const providerBadge = getProviderBadge(file.provider);

  const handleDownload = () => {
    addToast(`Downloading ${file.name}...`, 'info');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-surface-container-low">
      <div className="w-20 h-20 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-4 text-outline border border-zinc-border">
        <FileTypeIcon file={file} className="text-[44px]" />
      </div>

      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1 break-all max-w-md">
        {file.name}
      </h2>

      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-6">
        This file format cannot be previewed directly in the browser. You can download it to view or edit on your computer.
      </p>

      {/* File Details Card */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-lg border border-zinc-border p-4 text-left font-body-sm text-body-sm mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-outline">File Type</span>
          <span className="text-on-surface font-medium">{file.type || 'Binary File'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-outline">File Size</span>
          <span className="font-code-sm text-code-sm text-on-surface tabular-nums">
            {formatBytes(file.size)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-outline">Origin Cloud</span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: providerBadge.dotColor }}
            />
            <span className="text-on-surface font-medium">{providerBadge.name}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={handleDownload}
        className="h-10 px-6 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-headline-sm text-headline-sm flex items-center gap-2 shadow-sm transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">download</span>
        <span>Download File</span>
      </button>
    </div>
  );
}
