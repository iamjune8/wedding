'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useIsClient } from '@/lib/use-browser-value';

/** Matches the opening choreography in styles/letter.css. */
export const ENVELOPE_OPEN_MS = 2250;

type EnvelopeState = 'sealed' | 'opening' | 'open';

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface SealedEnvelopeProps {
  readonly initials: readonly [string, string];
  readonly hint: string;
  /** The letter itself (server-rendered, so it is complete without JavaScript). */
  readonly children: ReactNode;
}

/**
 * The invitation letter arrives sealed in an envelope. A tap breaks the seal, the flap lifts,
 * the letter rises out and the envelope falls away. Without JavaScript the letter is simply
 * shown open; with reduced motion it opens at once.
 */
export function SealedEnvelope({ initials, hint, children }: SealedEnvelopeProps) {
  const isClient = useIsClient();
  const [state, setState] = useState<EnvelopeState>('sealed');
  const letterRef = useRef<HTMLDivElement>(null);

  const reveal = () => setState('open');

  // Once the letter is on the page, move focus to it so screen readers start reading there.
  useEffect(() => {
    if (state === 'open') letterRef.current?.focus({ preventScroll: true });
  }, [state]);

  const open = () => {
    if (state !== 'sealed') return;
    if (prefersReducedMotion()) {
      reveal();
      return;
    }
    setState('opening');
    window.setTimeout(reveal, ENVELOPE_OPEN_MS);
  };

  const showEnvelope = isClient && state !== 'open';

  return (
    <div className="envelope-stage" data-ready={isClient ? '' : undefined} data-state={state}>
      {showEnvelope ? (
        <button
          type="button"
          className="envelope"
          onClick={open}
          aria-expanded={false}
          aria-controls="invitation-letter"
          disabled={state === 'opening'}
        >
          <span className="envelope__body" aria-hidden="true">
            <span className="envelope__back" />
            <span className="envelope__peek">
              <span className="envelope__peek-script">Nikah</span>
              <span className="envelope__peek-rule" />
              <span className="envelope__peek-rule envelope__peek-rule--short" />
            </span>
            <svg
              className="envelope__pocket"
              viewBox="0 0 100 70"
              preserveAspectRatio="none"
              focusable="false"
            >
              <path d="M0 0L50 40L100 0V70H0Z" className="envelope__pocket-face" />
              <path
                d="M0 70L41 33M100 70L59 33"
                className="envelope__fold"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="envelope__flap" />
            <span className="envelope__seal">
              <span>{initials[0]}</span>
              <span className="envelope__seal-dot" />
              <span>{initials[1]}</span>
            </span>
          </span>
          <span className="envelope__hint">{hint}</span>
        </button>
      ) : null}
      <div
        id="invitation-letter"
        ref={letterRef}
        className="letter"
        tabIndex={-1}
        aria-hidden={showEnvelope && state === 'sealed' ? true : undefined}
      >
        {children}
      </div>
    </div>
  );
}
