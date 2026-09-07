import React, { useState } from 'react';

export function PdfPreview({ file }) {
  const [currentPage, setCurrentPage] = useState(4);
  const [zoomLevel, setZoomLevel] = useState(100);
  const totalPages = file.pagesCount || 28;

  const handlePageChange = (delta) => {
    setCurrentPage(prev => Math.min(totalPages, Math.max(1, prev + delta)));
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(100);

  const slides = [
    { page: 1, title: 'Title Slide', summary: 'CloudVault Unified Fabric Overview' },
    { page: 2, title: 'Architecture', summary: 'Federated Ingest & Provider Routing' },
    { page: 3, title: 'Ecosystem', summary: 'Cross-Cloud Sync Telemetry' },
    { page: 4, title: 'Cloud Metrics', summary: 'Unified Multi-Cloud Fabric Architecture' },
    { page: 5, title: 'Latency Mesh', summary: 'Zero-Cache WebAssembly Pipeline' },
    { page: 6, title: 'Appendix', summary: 'Security Attestation & SOC2' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Dynamic PDF Controls Strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-container border-b border-zinc-border">
        {/* Pagination Controls */}
        <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1 rounded-lg border border-zinc-border shadow-sm">
          <button
            type="button"
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container text-on-surface disabled:opacity-40 transition-colors"
            title="Previous Page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <span className="font-code-sm text-code-sm px-1 text-on-surface font-medium tabular-nums">
            Page <span className="font-semibold text-primary">{currentPage}</span> of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container text-on-surface disabled:opacity-40 transition-colors"
            title="Next Page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-surface-container-lowest px-2 py-1 rounded-lg border border-zinc-border shadow-sm">
          <button
            type="button"
            onClick={() => handleZoom(-10)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container text-on-surface transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="font-code-sm text-code-sm px-2 text-center w-14 font-medium">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(10)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container text-on-surface transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <div className="w-px h-4 bg-zinc-border mx-1" />
          <button
            type="button"
            onClick={resetZoom}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-container text-on-surface transition-colors"
            title="Fit to Screen (100%)"
          >
            <span className="material-symbols-outlined text-[16px]">fit_screen</span>
          </button>
        </div>
      </div>

      {/* Main PDF Stage: Scrubber + Document Canvas */}
      <div className="flex flex-1 min-h-0 bg-surface-container-low overflow-hidden">
        {/* Left Thumbnails Rail */}
        <aside className="w-48 bg-surface-container border-r border-zinc-border flex-shrink-0 flex flex-col p-3 gap-2 overflow-y-auto hidden sm:flex">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-border">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Slides
            </span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">
              {totalPages} Total
            </span>
          </div>

          {slides.map((slide) => {
            const isActive = currentPage === slide.page;
            return (
              <button
                key={slide.page}
                type="button"
                onClick={() => setCurrentPage(slide.page)}
                className={`flex flex-col gap-1 p-1.5 rounded-lg text-left transition-all border ${
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed border-primary shadow-sm'
                    : 'bg-surface-container-lowest hover:bg-surface-container-high border-zinc-border text-on-surface-variant'
                }`}
              >
                <div className="w-full aspect-[16/9] bg-surface-container-high rounded flex flex-col p-2 justify-between overflow-hidden shadow-sm">
                  <span className={`h-1.5 w-1/3 rounded-full ${isActive ? 'bg-primary' : 'bg-outline-variant'}`} />
                  <div className="space-y-1">
                    <span className="block h-1 w-full bg-outline-variant rounded" />
                    <span className="block h-1 w-2/3 bg-outline-variant rounded" />
                  </div>
                </div>
                <span className={`font-label-sm text-label-sm truncate ${isActive ? 'font-semibold text-primary' : ''}`}>
                  {slide.page} • {slide.title}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Center Stage Canvas Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
            className="w-full max-w-3xl aspect-[16/9] bg-surface-container-lowest rounded-xl border border-zinc-border shadow-xl p-6 sm:p-8 flex flex-col justify-between transition-transform duration-100"
          >
            {/* Slide Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
                </div>
                <span className="font-headline-md text-headline-md tracking-tight text-on-surface">
                  Unified Multi-Cloud Fabric Architecture
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-outline uppercase tracking-wider">
                CONFIDENTIAL • Q3 REVIEW
              </span>
            </div>

            {/* Slide Body: System Visual Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-auto items-center">
              {/* Card 1: Origin Cluster */}
              <div className="bg-surface-container p-4 rounded-xl flex flex-col gap-2 border border-zinc-border">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-headline-sm text-primary">Federated Ingest</span>
                  <span className="material-symbols-outlined text-[18px] text-outline">hub</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Zero-loss buffer pipeline directly bridging Google Drive, OneDrive, and Dropbox storage endpoints.
                </p>
                <div className="flex items-center justify-between font-code-sm text-code-sm pt-1 text-outline">
                  <span>Throughput</span>
                  <span className="text-on-surface font-semibold">1.4 GB/s</span>
                </div>
              </div>

              {/* Center Flow Wire */}
              <div className="flex flex-col items-center justify-center text-center p-2">
                <svg className="w-full h-12 text-primary" fill="none" viewBox="0 0 200 40">
                  <path opacity="0.4" d="M10 20 H180" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2" />
                  <circle cx="20" cy="20" fill="currentColor" r="4" />
                  <circle cx="100" cy="20" fill="currentColor" r="5" />
                  <polygon fill="currentColor" points="180,15 195,20 180,25" />
                </svg>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                  TLS 1.3 Tunnel
                </span>
              </div>

              {/* Card 2: Consumer Node */}
              <div className="bg-surface-container-high p-4 rounded-xl flex flex-col gap-2 border border-zinc-border">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-headline-sm text-on-surface">Client Engine</span>
                  <span className="material-symbols-outlined text-[18px] text-tertiary">devices</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Zero-download WebAssembly render kernel. High-res vector mapping directly onto browser canvas.
                </p>
                <div className="flex items-center justify-between font-code-sm text-code-sm pt-1 text-outline">
                  <span>Latency</span>
                  <span className="text-on-surface font-semibold">14ms Render</span>
                </div>
              </div>
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-border text-outline font-label-sm text-label-sm">
              <span>CloudVault Technical Deck • Slide {currentPage} / {totalPages}</span>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Encrypted at Rest
                </span>
                <span className="font-code-sm text-code-sm">UUID: {file.checksum?.substring(0, 12) || 'a82f-891d-002f'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
