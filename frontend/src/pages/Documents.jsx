import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { FileTable } from '../components/files/FileTable';

export function Documents() {
  const { files } = useVault();
  const [docTypeFilter, setDocTypeFilter] = useState('all');

  const docFiles = files.filter(f => f.category === 'documents' || ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md'].includes(f.type?.toLowerCase()));

  const filteredDocs = docFiles.filter(f => {
    if (docTypeFilter === 'all') return true;
    if (docTypeFilter === 'pdf') return f.name.endsWith('.pdf');
    if (docTypeFilter === 'spreadsheets') return f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv');
    if (docTypeFilter === 'presentations') return f.name.endsWith('.pptx') || f.name.endsWith('.ppt');
    if (docTypeFilter === 'text') return f.name.endsWith('.txt') || f.name.endsWith('.md') || f.name.endsWith('.docx');
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-md animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-border">
        <div>
          <h1 className="font-display text-display text-on-surface">Documents & Office</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {docFiles.length} documents across PDF, Spreadsheets, Presentations, and Notes
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setDocTypeFilter('all')}
            className={`px-3 py-1 rounded font-headline-sm text-xs transition-colors ${
              docTypeFilter === 'all'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            All Docs
          </button>
          <button
            type="button"
            onClick={() => setDocTypeFilter('pdf')}
            className={`px-3 py-1 rounded font-headline-sm text-xs transition-colors ${
              docTypeFilter === 'pdf'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            PDFs
          </button>
          <button
            type="button"
            onClick={() => setDocTypeFilter('spreadsheets')}
            className={`px-3 py-1 rounded font-headline-sm text-xs transition-colors ${
              docTypeFilter === 'spreadsheets'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Sheets
          </button>
          <button
            type="button"
            onClick={() => setDocTypeFilter('presentations')}
            className={`px-3 py-1 rounded font-headline-sm text-xs transition-colors ${
              docTypeFilter === 'presentations'
                ? 'bg-primary text-on-primary font-semibold'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Presentations
          </button>
        </div>
      </div>

      <FileTable files={filteredDocs} emptyMessage="No documents found in this category" />
    </div>
  );
}
