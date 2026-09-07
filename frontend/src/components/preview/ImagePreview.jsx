import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';

export function ImagePreview({ file }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const { files, openPreview } = useVault();

  // Find all photos for previous / next navigation
  const photoFiles = files.filter(f => f.category === 'photos' || f.type === 'Image');
  const currentIndex = photoFiles.findIndex(f => f.id === file.id);

  const handlePrev = () => {
    if (currentIndex > 0) {
      openPreview(photoFiles[currentIndex - 1]);
      setZoomLevel(100);
    }
  };

  const handleNext = () => {
    if (currentIndex < photoFiles.length - 1) {
      openPreview(photoFiles[currentIndex + 1]);
      setZoomLevel(100);
    }
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(250, Math.max(50, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(100);

  const exif = file.exif || {
    camera: 'Sony ILCE-7RM4',
    lens: 'FE 24-70mm F2.8 GM',
    iso: '100',
    shutter: '1/320s',
    aperture: 'f/4.0',
    dimensions: '3840 x 2160'
  };

  return (
    <div className="flex flex-col h-full w-full bg-black/90 relative">
      {/* Top Toolbar overlay */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/50 backdrop-blur z-20 text-white">
        <div className="flex items-center gap-2">
          <span className="font-headline-sm text-headline-sm">{file.name}</span>
          <span className="font-code-sm text-code-sm text-zinc-400">
            ({currentIndex >= 0 ? `${currentIndex + 1} of ${photoFiles.length}` : '1 of 1'})
          </span>
        </div>

        {/* Zoom & Navigation controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleZoom(-15)}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-code-sm text-code-sm px-2 text-center w-12 text-white">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(15)}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/20 text-white transition-colors ml-1"
              title="Reset Zoom"
            >
              <span className="material-symbols-outlined text-[16px]">fit_screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative select-none">
        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur shadow-lg transition-all"
            title="Previous Photo"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>
        )}

        {/* Image Container */}
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          className="relative max-w-4xl max-h-[580px] rounded-xl overflow-hidden shadow-2xl transition-transform duration-100 flex items-center justify-center"
        >
          <img
            src={file.previewUrl || file.thumbnailUrl}
            alt={file.name}
            className="max-h-[540px] w-auto object-contain rounded-lg shadow-2xl"
          />

          {/* Floating EXIF Metadata Badge Overlay */}
          <div className="absolute bottom-3 left-3 right-3 bg-surface-container-lowest/90 backdrop-blur px-3 py-2 rounded-lg flex items-center justify-between text-on-surface shadow-md border border-white/20">
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-label-sm font-semibold">{exif.camera}</span>
              <span className="text-outline text-xs">•</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant font-mono text-[11px] hidden sm:inline">
                {exif.lens}
              </span>
            </div>
            <div className="flex items-center gap-2 font-code-sm text-code-sm text-outline text-[11px]">
              <span>ISO {exif.iso}</span>
              <span>{exif.shutter}</span>
              <span>{exif.aperture}</span>
              <span className="hidden sm:inline font-medium text-on-surface">[{exif.dimensions}]</span>
            </div>
          </div>
        </div>

        {/* Next Button */}
        {currentIndex < photoFiles.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur shadow-lg transition-all"
            title="Next Photo"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
        )}
      </div>
    </div>
  );
}
