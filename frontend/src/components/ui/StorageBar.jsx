import React from 'react';
import { formatBytes } from '../../utils/fileUtils';

export function SegmentedStorageBar({ accounts = [], total = 0, className = 'h-3' }) {
  if (!accounts || accounts.length === 0 || !total) {
    return (
      <div className={`w-full ${className} bg-surface-container-high rounded-full overflow-hidden flex p-0.5`}>
        <div className="h-full bg-primary rounded-full transition-all duration-500 w-[47%]"></div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className} bg-surface-container-high rounded-full overflow-hidden flex p-0.5 gap-0.5`}>
      {accounts.map((account) => {
        const percentage = total > 0 ? (account.usedStorage / total) * 100 : 0;
        if (percentage <= 0) return null;
        return (
          <div
            key={account.id}
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: account.color }}
            title={`${account.name} (${account.label}): ${formatBytes(account.usedStorage)}`}
          />
        );
      })}
    </div>
  );
}

export function SingleStorageBar({ used = 0, total = 1, color = '#2563eb', className = 'h-2' }) {
  const percentage = Math.min(100, Math.max(0, (used / total) * 100));
  return (
    <div className={`w-full ${className} bg-surface-container rounded-full overflow-hidden`}>
      <div
        className="h-full transition-all duration-500 rounded-full"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}
