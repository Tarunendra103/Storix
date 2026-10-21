import React, { useEffect, useRef, useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { formatBytes } from '../../utils/fileUtils';

export function UploadModal() {
  const {
    uploadModalOpen,
    setUploadModalOpen,
    handleUploadComplete,
    connectedAccounts,
    addToast,
  } = useVault();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  useEffect(() => {
    if (!selectedAccountId && connectedAccounts.length) {
      setSelectedAccountId(String(connectedAccounts[0].id));
    }
  }, [connectedAccounts, selectedAccountId]);

  if (!uploadModalOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const startUpload = async (fileList) => {
    if (!selectedAccountId) {
      addToast('Connect a Google Drive account before uploading.', 'error');
      return;
    }
    const newItems = Array.from(fileList).map((f, idx) => ({
      id: `queue-${Date.now()}-${idx}`,
      fileObj: f,
      name: f.name,
      size: f.size,
      mimeType: f.type || 'application/octet-stream',
      progress: 0,
      status: 'Waiting to upload'
    }));

    setUploadQueue(prev => [...prev, ...newItems]);

    for (const item of newItems) {
      setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'Uploading to Google Drive…' } : q));
      try {
        await handleUploadComplete({ fileObj: item.fileObj, connectedAccountId: Number(selectedAccountId) });
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: 100, status: 'Uploaded' } : q));
      } catch (error) {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: error.message || 'Upload failed' } : q));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      startUpload(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      startUpload(e.target.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div role="dialog" aria-modal="true" aria-labelledby="upload-modal-title" className="w-full max-w-lg bg-surface-container-lowest rounded-xl border border-zinc-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-border bg-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">cloud_upload</span>
            <h2 id="upload-modal-title" className="font-headline-md text-headline-md text-on-surface">Upload to Storix</h2>
          </div>
          <button
            type="button"
            onClick={() => setUploadModalOpen(false)}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Close upload dialog"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
              isDragging
                ? 'border-primary bg-zinc-selection scale-[1.01]'
                : 'border-zinc-border-strong hover:border-primary hover:bg-surface-container-low'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-3">
              <span className="material-symbols-outlined text-[24px]">upload_file</span>
            </div>
            <p className="font-headline-sm text-headline-sm text-on-surface mb-1">
              Drag & Drop files here, or <span className="text-primary underline">browse</span>
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Files are uploaded to the selected Google Drive account. Storix stores only their metadata.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <label className="flex flex-col gap-1.5 font-label-sm text-label-sm text-outline">
            Upload destination
            <select
              value={selectedAccountId}
              onChange={(event) => setSelectedAccountId(event.target.value)}
              disabled={!connectedAccounts.length}
              className="h-9 px-3 rounded border border-zinc-border bg-surface-container text-on-surface"
            >
              {!connectedAccounts.length && <option value="">No connected Google Drive accounts</option>}
              {connectedAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} — {account.accountEmail}</option>)}
            </select>
          </label>

          {/* Quick Select Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 rounded-lg border border-zinc-border hover:bg-surface-container text-on-surface font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">description</span>
              <span>Upload Files</span>
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="h-9 rounded-lg border border-zinc-border hover:bg-surface-container text-on-surface font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">folder</span>
              <span>Upload Folder Contents</span>
            </button>
          </div>

          {/* Upload Queue & Progress Monitor */}
          {uploadQueue.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-border">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                Uploading ({uploadQueue.length})
              </span>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-surface-container rounded-lg border border-zinc-border flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-body-sm text-body-sm">
                      <span className="font-medium text-on-surface truncate max-w-[240px]">
                        {item.name}
                      </span>
                      <span className="font-code-sm text-code-sm text-on-surface-variant tabular-nums">
                        {formatBytes(item.size)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                      <span>{item.status}</span>
                      <span className="font-code-sm">{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-surface-container border-t border-zinc-border flex items-center justify-between text-outline font-label-sm text-label-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Files are stored in the selected Google Drive account</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-zinc-border transition-colors font-body-sm text-body-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
