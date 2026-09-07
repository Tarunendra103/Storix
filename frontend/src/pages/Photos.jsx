import React from 'react';
import { useVault } from '../context/VaultContext';
import { EmptyState } from '../components/ui/EmptyState';
import { formatBytes, getProviderBadge } from '../utils/fileUtils';

export function Photos() {
  const {
    files,
    openPreview,
    handleToggleFavorite,
    setUploadModalOpen
  } = useVault();

  const photoFiles = files.filter(f => f.category === 'photos' || f.type === 'Image');

  return (
    <div className="flex flex-col w-full gap-space-md animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-border">
        <div>
          <h1 className="font-display text-display text-on-surface">Photos & Gallery</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {photoFiles.length} photos aggregated from your connected cloud drives
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="h-8 px-4 rounded bg-primary-container text-on-primary font-headline-sm text-headline-sm hover:bg-primary transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
          <span>Upload Photos</span>
        </button>
      </div>

      {photoFiles.length === 0 ? (
        <EmptyState
          icon="image"
          title="No photos found"
          description="Upload images or connect cloud accounts to aggregate your gallery here."
          actionText="Upload Photos"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {photoFiles.map((photo) => {
            const providerBadge = getProviderBadge(photo.provider);
            return (
              <div
                key={photo.id}
                onClick={() => openPreview(photo)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-surface-container cursor-pointer transition-all duration-200 border border-zinc-border/60 hover:shadow-lg"
              >
                <img
                  src={photo.thumbnailUrl || photo.previewUrl}
                  alt={photo.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Subtle Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between select-none">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-white font-label-sm text-[10px] backdrop-blur">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: providerBadge.dotColor }}
                      />
                      {providerBadge.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(photo.id);
                      }}
                      className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                      title={photo.isFavorite ? 'Unstar' : 'Star'}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${photo.isFavorite ? 'text-primary fill' : ''}`}>
                        star
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-col text-white">
                    <span className="font-headline-sm text-xs truncate leading-tight">
                      {photo.name}
                    </span>
                    <span className="font-code-sm text-[10px] text-zinc-300 tabular-nums">
                      {formatBytes(photo.size)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
