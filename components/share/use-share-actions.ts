import { useEffect, useRef, useState } from 'react';
import { copyText } from '@/lib/clipboard';

export type ShareStatus = 'idle' | 'copied' | 'error';

const STATUS_RESET_MS = 5000;

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

interface ShareTarget {
  readonly url: string | null;
  readonly title: string;
  readonly text: string;
}

/** Copy-link and device-share actions, with a short-lived status message for screen readers. */
export function useShareActions({ url, title, text }: ShareTarget) {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const announce = (next: ShareStatus) => {
    setStatus(next);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setStatus('idle'), STATUS_RESET_MS);
  };

  const copyLink = async () => {
    if (!url) return;
    announce((await copyText(url)) ? 'copied' : 'error');
  };

  const shareNatively = async () => {
    if (!url) return;
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      if (isAbort(error)) return;
      await copyLink();
    }
  };

  return { status, copyLink, shareNatively } as const;
}
