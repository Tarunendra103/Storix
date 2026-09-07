import React, { useState, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';
import { PdfPreview } from './PdfPreview';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { UnsupportedPreview } from './UnsupportedPreview';
import { formatBytes, getProviderBadge, getFileExtension } from '../../utils/fileUtils';

export function FilePreviewModal() {
  const { previewModal, closePreview } = useVault();
  const file = previewModal.file;

  if (!previewModal.isOpen || !file) return null;

  return <FilePreviewModalContent file={file} onClose={closePreview} />;
}

function getInitialMode(f) {
  if (!f) return 'pdf';
  const ext = getFileExtension(f.name);
  if (f.category === 'photos' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
  if (f.category === 'videos' || ['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['md', 'txt', 'js', 'json', 'html', 'css'].includes(ext)) return 'code';
  return 'unsupported';
}

function FilePreviewModalContent({ file, onClose }) {
  const { handleToggleFavorite, addToast } = useVault();
  const [activeMode, setActiveMode] = useState(() => getInitialMode(file));

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const providerBadge = getProviderBadge(file.provider);

  const handleDownload = () => {
    addToast(`Downloading ${file.name}...`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(`https://cloudvault.app/f/${file.id}`);
    addToast('Direct link copied to clipboard', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" aria-label={`Preview ${file.name}`} className="relative w-full max-w-6xl h-[92vh] max-h-[920px] bg-surface-container-lowest rounded-xl shadow-2xl border border-zinc-border flex flex-col overflow-hidden">
        {/* Top Header Chrome */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-surface-container border-b border-zinc-border select-none">
          {/* File Title & Origin Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">
                {file.category === 'photos' ? 'image' : file.category === 'videos' ? 'movie' : 'description'}
              </span>
            </div>
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                  {file.name}
                </span>
                <span className="material-symbols-outlined text-[14px] text-tertiary" title="Protected File">
                  lock
                </span>
              </div>
              <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant text-[11px]">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: providerBadge.dotColor }}
                  />
                  {providerBadge.name}
                </span>
                <span>•</span>
                <span className="font-code-sm text-code-sm tabular-nums">{formatBytes(file.size)}</span>
              </div>
            </div>
          </div>

          {/* Center Format Switcher Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-surface-container-high p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveMode('pdf')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-headline-sm text-xs transition-colors ${
                activeMode === 'pdf'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>PDF Document</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('image')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-headline-sm text-xs transition-colors ${
                activeMode === 'image'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">image</span>
              <span>Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('video')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-headline-sm text-xs transition-colors ${
                activeMode === 'video'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">movie</span>
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-headline-sm text-xs transition-colors ${
                activeMode === 'code'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              <span>Source / MD</span>
            </button>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleToggleFavorite(file.id)}
              className="p-1.5 rounded-lg bg-surface-container-lowest text-outline hover:text-primary hover:bg-surface-container border border-zinc-border transition-colors"
              title={file.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <span className={`material-symbols-outlined text-[18px] ${file.isFavorite ? 'text-primary fill' : ''}`}>
                star
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="h-8 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center gap-1 transition-colors border border-zinc-border"
              title="Share"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-2.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md flex items-center gap-1 transition-colors border border-zinc-border hidden sm:flex"
              title="Print"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="h-8 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md flex items-center gap-1 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-lowest hover:bg-error-container hover:text-on-error-container text-outline border border-zinc-border transition-colors ml-1"
              title="Exit Preview (Esc)"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Dynamic Viewer Surface */}
        <div className="flex-1 min-h-0 relative overflow-hidden bg-surface-container-low">
          {activeMode === 'pdf' && <PdfPreview file={file} />}
          {activeMode === 'image' && <ImagePreview file={file} />}
          {activeMode === 'video' && <VideoPreview file={file} />}
          {activeMode === 'code' && (
            <div className="w-full h-full p-6 overflow-auto font-mono text-sm bg-surface-container-lowest text-on-surface">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {file.content || `# Content of ${file.name}
Uploaded to ${file.provider}
Size: ${formatBytes(file.size)}

// Sample decrypted view directly from client stream
{
  "fileId": "${file.id}",
  "name": "${file.name}",
  "provider": "${file.provider}",
  "checksum": "${file.checksum || 'e4d909c290d0'}"
}`}
              </pre>
            </div>
          )}
          {activeMode === 'unsupported' && <UnsupportedPreview file={file} />}
        </div>
      </div>
    </div>
  );
}
