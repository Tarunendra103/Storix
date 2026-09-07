import React from 'react';

export function EmptyState({ icon = 'folder_open', title = 'No files found', description = 'There are no files in this location.', actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-surface-container-lowest border border-zinc-border">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="h-8 px-4 rounded bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
