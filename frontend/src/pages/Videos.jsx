import React from 'react';
import { useVault } from '../context/VaultContext';
import { EmptyState } from '../components/ui/EmptyState';
import { formatBytes, getProviderBadge } from '../utils/fileUtils';
import { FileTypeIcon } from '../components/files/FileTypeIcon';
import { BulkActions } from '../components/files/BulkActions';

export function Videos() {
  const { files, openPreview, setUploadModalOpen, handleToggleFavorite, selectedFileIds, toggleSelectFile } = useVault();

  const videoFiles = files.filter((file) => file.category === 'videos');

  return (
    <div className="flex flex-col w-full gap-space-md animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-border">
        <div>
          <h1 className="font-display text-display text-on-surface">Videos & Stream</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {videoFiles.length} videos synchronized from your connected Google Drive accounts
          </p>
        </div>
        <div className="flex items-center gap-2"><BulkActions files={videoFiles} /><button type="button" onClick={() => setUploadModalOpen(true)} className="h-8 px-4 rounded bg-primary-container text-on-primary hover:bg-primary flex items-center gap-1.5 shadow-sm"><span className="material-symbols-outlined text-[16px]">video_call</span>Upload</button></div>
      </div>

      {videoFiles.length === 0 ? (
        <EmptyState
          icon="movie"
          title="No videos found"
          description="Upload your personal or work video captures to stream them directly."
          actionText="Upload Video"
          onAction={() => setUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videoFiles.map((video) => {
            const providerBadge = getProviderBadge(video.provider);
            return (
              <div
                key={video.id}
                onClick={() => openPreview(video)}
                className="group flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest border border-zinc-border hover:border-secondary hover:shadow-md transition-all cursor-pointer select-none"
              >
                <div className="relative aspect-[16/9] bg-surface-container overflow-hidden">
                  <label className="absolute top-2 left-2 z-10 p-1 rounded bg-black/55 text-white" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={selectedFileIds.includes(video.id)} onChange={() => toggleSelectFile(video.id)} className="accent-primary" aria-label={`Select ${video.name}`} />
                  </label>
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : <FileTypeIcon file={video} className="text-[44px]" />}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:bg-black/40 transition-all">
                    <div className="w-11 h-11 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[24px] ml-0.5">play_arrow</span>
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    {video.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-black/80 text-white font-code-sm text-[10px] backdrop-blur">
                        {video.badge}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(video.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${video.isFavorite ? 'text-primary fill' : ''}`}>
                      star
                    </span>
                  </button>
                </div>

                <div className="p-3 flex flex-col gap-1">
                  <span
                    className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-secondary transition-colors"
                    title={video.name}
                  >
                    {video.name}
                  </span>
                  <div className="flex items-center justify-between text-body-sm text-on-surface-variant font-code-sm text-[11px]">
                    <span className="tabular-nums">{formatBytes(video.size)}</span>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: providerBadge.dotColor }}
                      />
                      <span className="text-outline">{providerBadge.name}</span>
                    </div>
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
