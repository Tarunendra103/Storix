import React from 'react';
import { formatBytes } from '../../utils/fileUtils';
import { PreviewStatus, useFilePreview } from './useFilePreview.jsx';

export function VideoPreview({ file }) {
  const preview = useFilePreview(file);
  if (preview.loading || preview.error) return <PreviewStatus {...preview} />;
  return (
    <div className="flex flex-col h-full w-full bg-black/95 items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
        <video src={preview.url} controls autoPlay className="w-full max-h-[520px] object-contain bg-black">Your browser cannot play this cloud video.</video>
        <div className="p-3 bg-zinc-900 flex items-center justify-between text-zinc-300 font-body-sm text-body-sm">
          <span className="font-semibold text-white truncate max-w-md">{file.name}</span>
          <span>{formatBytes(file.size)}</span>
        </div>
      </div>
    </div>
  );
}
