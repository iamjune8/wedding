import { parseIsoDate, parseTime24 } from './time';

/** Low-level helpers for writing RFC 5545 (iCalendar) content. */

const MAX_LINE_OCTETS = 75;
const MINUTES_PER_DAY = 1440;
const encoder = new TextEncoder();

const octetLength = (value: string) => encoder.encode(value).length;

/** Escapes a TEXT value (RFC 5545 §3.3.11). */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

interface FoldState {
  readonly lines: readonly string[];
  readonly current: string;
  readonly size: number;
}

/** Escape pairs (\\ \; \, \n) or single characters: the pieces a line may be folded between. */
const FOLD_UNITS = /\\[\\;,nN]|[\s\S]/gu;

/**
 * Folds a content line so no physical line exceeds 75 octets (RFC 5545 §3.1).
 * Continuation lines start with a single space. A multi-byte UTF-8 character or an escape
 * sequence such as "\n" is never split, which keeps stricter calendar apps happy.
 */
export function foldIcsLine(line: string): string {
  if (octetLength(line) <= MAX_LINE_OCTETS) return line;

  const folded = (line.match(FOLD_UNITS) ?? []).reduce<FoldState>(
    (state, unit) => {
      const unitSize = octetLength(unit);
      const isFirstLine = state.lines.length === 0;
      const limit = isFirstLine ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
      if (state.size + unitSize > limit) {
        return { lines: [...state.lines, state.current], current: unit, size: unitSize };
      }
      return { ...state, current: state.current + unit, size: state.size + unitSize };
    },
    { lines: [], current: '', size: 0 },
  );

  return [...folded.lines, folded.current].join('\r\n ');
}

/** 2027-04-30T12:00:00Z → "20270430T120000Z" */
export function formatIcsUtcDateTime(instant: Date): string {
  return instant
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
    .replace(/[-:]/g, '');
}

/** { date: "2027-04-30", time: "17:30" } → "20270430T173000" (paired with a TZID). */
export function formatIcsLocalDateTime(local: {
  readonly date: string;
  readonly time: string;
}): string {
  parseIsoDate(local.date);
  parseTime24(local.time);
  return `${local.date.replace(/-/g, '')}T${local.time.replace(':', '')}00`;
}

/** 1440 → "P1D", 60 → "PT1H", 90 → "PT90M" */
export function formatIcsDuration(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new RangeError(`Invalid duration: ${minutes} minutes`);
  }
  if (minutes > 0 && minutes % MINUTES_PER_DAY === 0) return `P${minutes / MINUTES_PER_DAY}D`;
  if (minutes > 0 && minutes % 60 === 0) return `PT${minutes / 60}H`;
  return `PT${minutes}M`;
}
