import React, { useEffect, useState } from 'react';
import { fileApi } from '../../services/fileApi';
import { PreviewStatus } from './useFilePreview.jsx';

const MAX_TEXT_PREVIEW_BYTES = 2 * 1024 * 1024;

/** Renders text as escaped text rather than executing downloaded HTML or script. */
export function TextPreview({ file }) {
  const [state, setState] = useState({ text: '', loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const isTooLarge = Boolean(file.size && file.size > MAX_TEXT_PREVIEW_BYTES);

  useEffect(() => {
    if (isTooLarge) return undefined;
    let active = true;
    // Defer the loading state by one microtask so the effect stays an external
    // request synchronization point rather than a synchronous render update.
    Promise.resolve()
      .then(() => {
        if (active) setState({ text: '', loading: true, error: null });
        return fileApi.getPreviewBlob(file.id);
      })
      .then(({ blob }) => blob.text())
      .then((text) => {
        if (active) setState({ text, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ text: '', loading: false, error: error.message || 'Unable to load this cloud file.' });
      });
    return () => { active = false; };
  }, [file.id, isTooLarge, attempt]);

  if (isTooLarge) {
    return <PreviewStatus
      loading={false}
      error="This text file is too large to preview safely. Download it to view the full content."
    />;
  }

  if (state.loading || state.error) {
    return <PreviewStatus {...state} retry={() => setAttempt((value) => value + 1)} />;
  }

  return (
    <pre className="h-full w-full overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-sm leading-6 text-on-surface bg-surface-container-lowest">
      {state.text}
    </pre>
  );
}
