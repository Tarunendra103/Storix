import React from 'react';
import { useVault } from '../../context/VaultContext';

export function ToastContainer() {
  const { toasts, removeToast } = useVault();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = 'check_circle';
        let bgClass = 'bg-surface-container-lowest text-on-surface border-zinc-border';
        let iconColor = 'text-[#16a34a]';

        if (toast.type === 'error') {
          icon = 'error';
          iconColor = 'text-error';
          bgClass = 'bg-error-container text-on-error-container border-[#ffdad6]';
        } else if (toast.type === 'info') {
          icon = 'info';
          iconColor = 'text-primary';
          bgClass = 'bg-surface-container-lowest text-on-surface border-zinc-border';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-md font-body-sm text-body-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${bgClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`material-symbols-outlined text-[18px] shrink-0 ${iconColor}`}>
                {icon}
              </span>
              <span className="truncate font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded hover:bg-black/5 text-outline hover:text-on-surface transition-colors shrink-0"
              aria-label="Close notification"
            >
              <span className="material-symbols-outlined text-[16px] block">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
