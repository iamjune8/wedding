export type CountdownState =
  | {
      readonly status: 'counting';
      readonly days: number;
      readonly hours: number;
      readonly minutes: number;
      readonly seconds: number;
    }
  | { readonly status: 'reached' }
  | { readonly status: 'past' };

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

/**
 * Remaining time from `nowMs` to `targetMs`, always derived from the two absolute instants so a
 * long-open page can never drift.
 *
 * - `counting` until the target instant (partial seconds round up, so it never reads 0 early)
 * - `reached` from the target until the event's local day ends (`dayEndMs`)
 * - `past` afterwards
 */
export function getCountdownState(
  nowMs: number,
  targetMs: number,
  dayEndMs: number,
): CountdownState {
  if (![nowMs, targetMs, dayEndMs].every(Number.isFinite)) {
    throw new TypeError('Countdown times must be finite millisecond timestamps');
  }
  if (dayEndMs < targetMs) {
    throw new RangeError('The event day must end after the event starts');
  }
  if (nowMs >= dayEndMs) return { status: 'past' };
  if (nowMs >= targetMs) return { status: 'reached' };

  const totalSeconds = Math.ceil((targetMs - nowMs) / 1000);
  return {
    status: 'counting',
    days: Math.floor(totalSeconds / SECONDS_PER_DAY),
    hours: Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
}

export function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}
