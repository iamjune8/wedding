import {
  escapeIcsText,
  foldIcsLine,
  formatIcsDuration,
  formatIcsLocalDateTime,
  formatIcsUtcDateTime,
} from './ics';
import { formatUtcOffset } from './time';

export interface LocalDateTime {
  readonly date: string;
  readonly time: string;
}

export interface CalendarReminder {
  readonly minutesBefore: number;
  readonly description: string;
}

export interface CalendarEventInput {
  readonly uid: string;
  readonly sequence: number;
  readonly title: string;
  readonly description: string;
  readonly location: string;
  readonly url?: string;
  /** IANA zone of a fixed-offset region (e.g. Asia/Kolkata); see `buildVTimezone`. */
  readonly timeZone: string;
  readonly timeZoneLabel: string;
  readonly utcOffsetMinutes: number;
  readonly startLocal: LocalDateTime;
  readonly endLocal: LocalDateTime;
  readonly startUtc: Date;
  readonly endUtc: Date;
  readonly reminder?: CalendarReminder;
}

const PRODUCT_ID = '-//Nida Khatib and Juned Shaikh//Wedding Invitation//EN';
const GOOGLE_CALENDAR_TEMPLATE = 'https://calendar.google.com/calendar/render';

/**
 * A VTIMEZONE for a zone without daylight saving (India has had none since 1945).
 * The caller is responsible for only passing fixed-offset zones.
 */
function buildVTimezone(event: CalendarEventInput): readonly string[] {
  const offset = formatUtcOffset(event.utcOffsetMinutes).replace(':', '');
  return [
    'BEGIN:VTIMEZONE',
    `TZID:${event.timeZone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    `TZOFFSETFROM:${offset}`,
    `TZOFFSETTO:${offset}`,
    `TZNAME:${escapeIcsText(event.timeZoneLabel)}`,
    'END:STANDARD',
    'END:VTIMEZONE',
  ];
}

function buildAlarm(reminder: CalendarReminder | undefined): readonly string[] {
  if (!reminder) return [];
  return [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(reminder.description)}`,
    `TRIGGER:-${formatIcsDuration(reminder.minutesBefore)}`,
    'END:VALARM',
  ];
}

function assertValidRange(event: CalendarEventInput): void {
  if (event.endUtc.getTime() <= event.startUtc.getTime()) {
    throw new RangeError(`Calendar event "${event.title}" must end after it starts`);
  }
}

/** Builds a complete, RFC 5545-compatible .ics document for a single event. */
export function buildIcsCalendar(event: CalendarEventInput, generatedAt: Date): string {
  assertValidRange(event);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODUCT_ID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...buildVTimezone(event),
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `SEQUENCE:${event.sequence}`,
    `DTSTAMP:${formatIcsUtcDateTime(generatedAt)}`,
    `DTSTART;TZID=${event.timeZone}:${formatIcsLocalDateTime(event.startLocal)}`,
    `DTEND;TZID=${event.timeZone}:${formatIcsLocalDateTime(event.endLocal)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    ...(event.url ? [`URL:${event.url}`] : []),
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    ...buildAlarm(event.reminder),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}

/**
 * Google Calendar "add event" link. Times are sent in UTC so they cannot be misread; `ctz`
 * shows the event in India Standard Time. Reminders cannot be set through this link.
 */
export function buildGoogleCalendarUrl(event: CalendarEventInput): string {
  assertValidRange(event);
  const params: ReadonlyArray<readonly [string, string]> = [
    ['action', 'TEMPLATE'],
    ['text', event.title],
    ['dates', `${formatIcsUtcDateTime(event.startUtc)}/${formatIcsUtcDateTime(event.endUtc)}`],
    ['ctz', event.timeZone],
    ['details', event.description],
    ['location', event.location],
  ];
  const query = params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `${GOOGLE_CALENDAR_TEMPLATE}?${query}`;
}
