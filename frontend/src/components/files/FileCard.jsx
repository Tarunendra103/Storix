import React from 'react';
import { useVault } from '../../context/VaultContext';
import { FileTypeIcon } from './FileTypeIcon';
import { FileContextMenu } from './FileContextMenu';
import { formatBytes, getProviderBadge } from '../../utils/fileUtils';

export function FileCard({ file }) {
  const {
    selectedFileIds,
    toggleSelectFile,
    inspectorFile,
    setInspectorFile,
    openPreview,
    openFolder,
    handleToggleFavorite
  } = useVault();

  const isSelected = selectedFileIds.includes(file.id);
  const isInspected = inspectorFile?.id === file.id;
  const providerBadge = getProviderBadge(file.provider);

  const handleClick = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setInspectorFile(file);
  };

  const handleDoubleClick = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    if (file.isFolder) {
      openFolder(file);
    } else {
      openPreview(file);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (file.isFolder) openFolder(file);
      else openPreview(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${file.isFolder ? 'Open folder' : 'Preview file'} ${file.name}`}
      className={`group relative flex flex-col rounded-lg border p-3 transition-all duration-150 cursor-pointer select-none bg-surface-container-lowest ${
        isSelected
          ? 'border-primary ring-1 ring-primary bg-zinc-selection'
          : isInspected
          ? 'border-primary/60 bg-primary-fixed/20 shadow-sm'
          : 'border-zinc-border hover:border-zinc-border-strong hover:shadow-sm'
      }`}
    >
      {/* Top Header: Checkbox & Star & 3-dot */}
      <div className="flex items-center justify-between mb-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectFile(file.id)}
          className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
          aria-label={`Select ${file.name}`}
        />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(file.id);
            }}
            className="p-1 rounded text-outline hover:text-primary transition-colors"
            title={file.isFavorite ? 'Starred' : 'Star file'}
          >
            <span className={`material-symbols-outlined text-[16px] ${file.isFavorite ? 'text-primary fill' : ''}`}>
              star
            </span>
          </button>
          <FileContextMenu file={file} />
        </div>
      </div>

      {/* Center Media / Icon Preview */}
      <div className="w-full h-28 bg-surface-container rounded-md flex items-center justify-center overflow-hidden mb-2 relative">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <FileTypeIcon file={file} className="text-[40px]" />
        )}
        {file.badge && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-code-sm text-[10px]">
            {file.badge}
          </span>
        )}
        {file.duration && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-code-sm text-[10px]">
            {file.duration}
          </span>
        )}
      </div>

      {/* Name and Metadata */}
      <div className="flex flex-col min-w-0">
        <span
          className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors mb-0.5"
          title={file.name}
        >
          {file.name}
        </span>
        <div className="flex items-center justify-between text-body-sm text-on-surface-variant font-code-sm text-[11px]">
          <span className="truncate">{file.isFolder ? `${file.itemCount} items` : formatBytes(file.size)}</span>
          <div className="flex items-center gap-1 truncate ml-1">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: providerBadge.dotColor }}
            />
            <span className="text-[10px] text-outline truncate">{providerBadge.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
