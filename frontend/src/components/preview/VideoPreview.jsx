import React from 'react';
import { formatBytes } from '../../utils/fileUtils';

export function VideoPreview({ file }) {
  return (
    <div className="flex flex-col h-full w-full bg-black/95 items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        <video
          src={file.previewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
          controls
          autoPlay
          className="w-full max-h-[520px] object-contain bg-black"
        />
        <div className="p-3 bg-zinc-900 flex items-center justify-between text-zinc-300 font-body-sm text-body-sm border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">movie</span>
            <span className="font-semibold text-white truncate max-w-md">{file.name}</span>
            {file.badge && (
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-code-sm text-[10px]">
                {file.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 font-code-sm text-code-sm">
            <span>Duration: {file.duration || '04:32'}</span>
            <span>•</span>
            <span>{formatBytes(file.size)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
