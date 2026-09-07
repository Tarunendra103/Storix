import React from 'react';
import { FileCard } from './FileCard';
import { EmptyState } from '../ui/EmptyState';
import { useVault } from '../../context/VaultContext';

export function FileGrid({ files = [], emptyMessage = 'No files found' }) {
  const { setUploadModalOpen } = useVault();

  if (!files || files.length === 0) {
    return (
      <EmptyState
        icon="grid_view"
        title={emptyMessage}
        description="Try clearing your filter or uploading new files."
        actionText="Upload Files"
        onAction={() => setUploadModalOpen(true)}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {files.map(file => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
