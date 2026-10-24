/**
 * Time-zone-aware date helpers.
 *
 * Every function here works from explicit calendar values and IANA time zones, never from the
 * time zone of the machine running the code, so results are identical on a build server, a
 * guest's phone in India, or a relative's laptop abroad.
 */

export interface IsoDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface TimeParts {
  readonly hour: number;
  readonly minute: number;
}

export interface ZonedParts extends IsoDateParts {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_24 = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MINUTE_MS = 60_000;

const pad2 = (value: number) => String(value).padStart(2, '0');

export function toIsoDateString({ year, month, day }: IsoDateParts): string {
  return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)}`;
}

export function parseIsoDate(value: string): IsoDateParts {
  const match = ISO_DATE.exec(value);
  if (!match) {
    throw new RangeError(`Invalid date "${value}": expected YYYY-MM-DD`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  const exists =
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day;
  if (!exists) {
    throw new RangeError(`Invalid date "${value}": that day does not exist`);
  }
  return { year, month, day };
}

export function parseTime24(value: string): TimeParts {
  const match = TIME_24.exec(value);
  if (!match) {
    throw new RangeError(`Invalid time "${value}": expected 24-hour HH:mm, e.g. 17:30`);
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function assertTimeZone(timeZone: string): void {
  if (!isValidTimeZone(timeZone)) {
    throw new RangeError(`Unknown time zone "${timeZone}": use an IANA name such as Asia/Kolkata`);
  }
}

/** Wall-clock calendar parts of `instant` as seen in `timeZone`. */
export function getZonedParts(instant: Date, timeZone: string): ZonedParts {
  assertTimeZone(timeZone);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    if (!part) {
      throw new Error(`Could not read the ${type} of ${instant.toISOString()} in ${timeZone}`);
    }
    return Number(part.value);
  };
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    // Some engines report midnight as 24 even with h23; normalise it.
    hour: read('hour') % 24,
    minute: read('minute'),
    second: read('second'),
  };
}

/** Offset of `timeZone` from UTC at `instant`, in minutes (IST is +330). */
export function getTimeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = getZonedParts(instant, timeZone);
  const wallClockAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  const wholeSecondInstant = Math.floor(instant.getTime() / 1000) * 1000;
  return Math.round((wallClockAsUtc - wholeSecondInstant) / MINUTE_MS);
}

/**
 * Converts a wall-clock date and time in `timeZone` to the exact UTC instant.
 * Throws if that local time is skipped by a daylight-saving change.
 */
export function zonedDateTimeToUtc(date: string, time: string, timeZone: string): Date {
  assertTimeZone(timeZone);
  const { year, month, day } = parseIsoDate(date);
  const { hour, minute } = parseTime24(time);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute);

  const firstGuess =
    wallClockAsUtc - getTimeZoneOffsetMinutes(new Date(wallClockAsUtc), timeZone) * MINUTE_MS;
  const settledOffset = getTimeZoneOffsetMinutes(new Date(firstGuess), timeZone);
  const candidate = new Date(wallClockAsUtc - settledOffset * MINUTE_MS);

  const check = getZonedParts(candidate, timeZone);
  const matches =
    check.year === year &&
    check.month === month &&
    check.day === day &&
    check.hour === hour &&
    check.minute === minute;
  if (!matches) {
    throw new RangeError(
      `Local time ${date} ${time} does not exist in ${timeZone} (skipped by a clock change)`,
    );
  }
  return candidate;
}

export function addDaysToIsoDate(date: string, days: number): string {
  const { year, month, day } = parseIsoDate(date);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return toIsoDateString({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

/** Formats an offset in minutes as ±HH:mm (e.g. 330 → "+05:30"). */
export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const absolute = Math.abs(offsetMinutes);
  return `${sign}${pad2(Math.floor(absolute / 60))}:${pad2(absolute % 60)}`;
}
