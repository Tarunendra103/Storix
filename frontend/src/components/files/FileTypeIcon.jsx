import React from 'react';
import { getFileIconInfo } from '../../utils/fileUtils';

export function FileTypeIcon({ file, className = 'text-[20px]' }) {
  const iconInfo = getFileIconInfo(file);

  return (
    <span
      className={`material-symbols-outlined shrink-0 ${iconInfo.colorClass} ${iconInfo.fill ? 'fill' : ''} ${className}`}
      title={iconInfo.label}
    >
      {iconInfo.icon}
    </span>
  );
}
