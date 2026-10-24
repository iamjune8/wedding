'use client';

import { getCountdownState, padTwo, type CountdownState } from '@/lib/countdown';
import { useNow } from '@/lib/use-now';

export interface CountdownProps {
  readonly targetMs: number;
  readonly dayEndMs: number;
  /** Accessible name, e.g. "Time remaining until the Nikah". */
  readonly label: string;
  readonly reachedMessage: string;
  readonly pastMessage: string;
  readonly tone?: 'nikah' | 'haldi';
}

interface Unit {
  readonly key: string;
  readonly display: string | null;
  readonly label: string;
}

const UNIT_NAMES = [
  ['days', 'Day', 'Days'],
  ['hours', 'Hour', 'Hours'],
  ['minutes', 'Minute', 'Minutes'],
  ['seconds', 'Second', 'Seconds'],
] as const;

function safeState(now: number | null, targetMs: number, dayEndMs: number): CountdownState | null {
  if (now === null) return null;
  try {
    return getCountdownState(now, targetMs, dayEndMs);
  } catch (error) {
    console.error('Countdown could not be calculated', error);
    return null;
  }
}

function toUnits(state: Extract<CountdownState, { status: 'counting' }> | null): readonly Unit[] {
  return UNIT_NAMES.map(([key, singular, plural]) => {
    if (!state) return { key, display: null, label: plural };
    const value = state[key];
    return {
      key,
      display: key === 'days' ? String(value) : padTwo(value),
      label: value === 1 ? singular : plural,
    };
  });
}

/**
 * Live countdown to an exact instant. Before the page is interactive it shows quiet
 * placeholders rather than invented numbers; at zero it settles into a short message.
 */
export function Countdown({
  targetMs,
  dayEndMs,
  label,
  reachedMessage,
  pastMessage,
  tone = 'nikah',
}: CountdownProps) {
  const state = safeState(useNow(), targetMs, dayEndMs);

  if (state && state.status !== 'counting') {
    return (
      <div className={`countdown countdown--${tone} countdown--settled`}>
        <p className="countdown__message">
          {state.status === 'reached' ? reachedMessage : pastMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`countdown countdown--${tone}`}
      role="timer"
      aria-label={label}
      aria-busy={state === null}
    >
      {toUnits(state).map((unit) => (
        <div className="countdown__unit" key={unit.key}>
          <span className="countdown__value">
            {unit.display === null ? (
              <span className="countdown__placeholder" aria-hidden="true" />
            ) : (
              // A new key per value replays the short flip animation on every change.
              <span key={unit.display} className="countdown__digit">
                {unit.display}
              </span>
            )}
          </span>
          <span className="countdown__label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
