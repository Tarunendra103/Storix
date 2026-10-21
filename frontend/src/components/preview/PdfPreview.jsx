import React from 'react';
import { PreviewStatus, useFilePreview } from './useFilePreview.jsx';

export function PdfPreview({ file }) {
  const preview = useFilePreview(file);
  if (preview.loading || preview.error) return <PreviewStatus {...preview} />;
  return <iframe src={preview.url} title={`Preview of ${file.name}`} className="w-full h-full border-0 bg-surface-container-lowest" />;
}
