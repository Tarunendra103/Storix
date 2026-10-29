import { useCallback, useEffect, useState } from 'react';
import { fileApi } from '../../services/fileApi';

const MAX_PREVIEW_BYTES = 50 * 1024 * 1024;

export function useFilePreview(file) {
  const [state, setState] = useState({ url: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let objectUrl = null;
    setState({ url: null, loading: true, error: null });
    if (file.size && file.size > MAX_PREVIEW_BYTES) {
      setState({
        url: null,
        loading: false,
        error: 'This file is too large to preview safely. Download it to view the full content.',
      });
      return undefined;
    }
    fileApi.getPreviewBlob(file.id)
      .then(({ blob }) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ url: null, loading: false, error: error.message || 'Unable to load this cloud file.' });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id, file.size, attempt]);

  return { ...state, retry: useCallback(() => setAttempt((value) => value + 1), []) };
}

export function PreviewStatus({ loading, error, retry }) {
  if (loading) return <div className="h-full w-full flex items-center justify-center text-on-surface-variant">Loading cloud file…</div>;
  if (error) return (
    <div className="h-full w-full flex flex-col gap-3 items-center justify-center text-on-surface-variant">
      <span>{error}</span>
      {retry && <button type="button" onClick={retry} className="px-3 py-1.5 rounded bg-primary text-on-primary">Retry</button>}
    </div>
  );
  return null;
}
