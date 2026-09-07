import React, { useState, useRef, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';

export function FileContextMenu({ file }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const {
    openPreview,
    openFolder,
    handleToggleFavorite,
    setRenameModal,
    setDeleteModal,
    addToast
  } = useVault();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    if (file.isFolder) {
      openFolder(file);
    } else {
      openPreview(file);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    addToast(`Downloading ${file.name}...`, 'info');
  };

  const handleRenameClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    setRenameModal({ isOpen: true, file });
  };

  const handleMoveClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    addToast(`Move modal opened for ${file.name}`, 'info');
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    handleToggleFavorite(file.id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
    setDeleteModal({ isOpen: true, file, isBatch: false });
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
        title="More actions"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-[18px] block">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-md bg-surface-container-lowest border border-zinc-border shadow-lg py-1 z-30 font-body-sm text-body-sm text-on-surface animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={handleOpen}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">visibility</span>
            <span>{file.isFolder ? 'Open Folder' : 'Open'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">download</span>
            <span>Download</span>
          </button>

          <button
            onClick={handleRenameClick}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">drive_file_rename_outline</span>
            <span>Rename</span>
          </button>

          <button
            onClick={handleMoveClick}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-outline">drive_file_move</span>
            <span>Move</span>
          </button>

          <button
            onClick={handleFavoriteClick}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-zinc-hover transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] ${file.isFavorite ? 'text-primary fill' : 'text-outline'}`}>
              star
            </span>
            <span>{file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
          </button>

          <div className="h-px bg-zinc-border my-1" />

          <button
            onClick={handleDeleteClick}
            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-error-container text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
