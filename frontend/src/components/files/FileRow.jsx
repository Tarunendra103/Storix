import React from 'react';
import { useVault } from '../../context/VaultContext';
import { FileTypeIcon } from './FileTypeIcon';
import { FileContextMenu } from './FileContextMenu';
import { formatBytes, formatDate, getProviderBadge } from '../../utils/fileUtils';

export function FileRow({ file }) {
  const {
    selectedFileIds,
    toggleSelectFile,
    inspectorFile,
    setInspectorFile,
    openPreview,
    openFolder
  } = useVault();

  const isSelected = selectedFileIds.includes(file.id);
  const isInspected = inspectorFile?.id === file.id;
  const providerBadge = getProviderBadge(file.provider);

  const handleRowClick = (e) => {
    // If clicking directly on a button or checkbox, do nothing
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

  return (
    <tr
      onClick={handleRowClick}
      onDoubleClick={handleDoubleClick}
      className={`h-10 text-body-sm text-on-surface border-b border-zinc-border/40 transition-colors group cursor-pointer select-none ${
        isSelected
          ? 'bg-zinc-selection'
          : isInspected
          ? 'bg-primary-fixed/30'
          : 'hover:bg-zinc-hover'
      }`}
    >
      {/* Checkbox */}
      <td className="w-10 px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelectFile(file.id)}
          className="w-3.5 h-3.5 rounded accent-primary cursor-pointer align-middle"
          aria-label={`Select ${file.name}`}
        />
      </td>

      {/* Name */}
      <td className="px-3 py-2 min-w-0 max-w-[280px] xl:max-w-md">
        <div className="flex items-center gap-2 min-w-0">
          <FileTypeIcon file={file} className="text-[20px] shrink-0" />
          <span
            className={`font-headline-sm text-headline-sm truncate ${
              isSelected || isInspected ? 'text-primary font-semibold' : 'text-on-surface group-hover:text-primary'
            } transition-colors`}
          >
            {file.name}
          </span>
          {file.versionTag && (
            <span className="px-1.5 py-0.2 rounded font-code-sm text-code-sm bg-primary/10 text-primary shrink-0">
              {file.versionTag}
            </span>
          )}
          {file.tag && (
            <span className="px-1 py-0.2 bg-surface-container rounded text-[10px] text-outline shrink-0">
              {file.tag}
            </span>
          )}
          {file.isFolder && (
            <span className="px-1.5 py-0.2 bg-surface-container rounded text-[10px] text-outline shrink-0">
              {file.itemCount} items
            </span>
          )}
        </div>
      </td>

      {/* Provider */}
      <td className="px-3 py-2 hidden sm:table-cell">
        <div className="flex items-center gap-1.5 truncate">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: providerBadge.dotColor }}
          />
          <span className="text-on-surface-variant font-medium truncate">
            {providerBadge.name}
          </span>
        </div>
      </td>

      {/* Type */}
      <td className="px-3 py-2 hidden md:table-cell text-outline truncate">
        {file.isFolder ? 'Folder' : file.type || 'File'}
      </td>

      {/* Size */}
      <td className="px-3 py-2 hidden md:table-cell font-code-sm text-code-sm tabular-nums text-on-surface-variant">
        {file.isFolder ? '--' : formatBytes(file.size)}
      </td>

      {/* Modified Date */}
      <td className="px-3 py-2 hidden lg:table-cell text-body-sm text-on-surface-variant tabular-nums truncate">
        {formatDate(file.modifiedAt)}
      </td>

      {/* Actions */}
      <td className="px-3 py-2 text-right">
        <div className="inline-flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {!file.isFolder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPreview(file);
              }}
              className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              title="Preview"
            >
              <span className="material-symbols-outlined text-[16px] block">visibility</span>
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addToast(`Downloading ${file.name}...`, 'info');
            }}
            className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            title="Download"
          >
            <span className="material-symbols-outlined text-[16px] block">download</span>
          </button>
          <FileContextMenu file={file} />
        </div>
      </td>
    </tr>
  );
}
