import { buildGoogleCalendarUrl, type CalendarEventInput } from './calendar';
import { type DateParts, formatLongDate, formatTime12h, getDateParts } from './format';
import { buildDirectionsUrl } from './maps';
import type { ShareEventSummary } from './share';
import {
  addDaysToIsoDate,
  formatUtcOffset,
  getTimeZoneOffsetMinutes,
  getZonedParts,
  toIsoDateString,
  zonedDateTimeToUtc,
} from './time';
import type { Venue, WeddingConfig, WeddingEvent } from './wedding-config';

/** Everything the page needs about one event, as plain serialisable data. */
export interface EventView {
  readonly id: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly heading: string;
  readonly intro: string;
  readonly dateLabel: string;
  readonly dateParts: DateParts;
  readonly timeLabel: string;
  readonly timingNote: string | null;
  readonly subtitle: string | null;
  /** e.g. "2027-04-30T17:30:00+05:30", for <time dateTime>. */
  readonly startIsoWithOffset: string;
  readonly startsAtMs: number;
  /** Midnight at the end of the event's local day; the countdown's "today" state ends here. */
  readonly dayEndsAtMs: number;
  readonly venue: Venue | null;
  readonly hostedAt: string | null;
  readonly directionsUrl: string | null;
  readonly calendar: {
    readonly fileName: string;
    readonly path: string;
    readonly googleUrl: string;
  };
  readonly countdown: WeddingEvent['countdown'];
}

const MINUTE_MS = 60_000;
const pad2 = (value: number) => String(value).padStart(2, '0');

export const coupleNames = (config: WeddingConfig) =>
  `${config.couple.bride.fullName} & ${config.couple.groom.fullName}`;

const timeLabelOf = (event: WeddingEvent, config: WeddingConfig) =>
  `${formatTime12h(event.startTime)} ${config.timeZoneLabel}`;

/** The calendar generator writes a single fixed-offset VTIMEZONE, so refuse DST zones. */
function assertFixedOffsetZone(timeZone: string, year: number): number {
  const january = getTimeZoneOffsetMinutes(new Date(Date.UTC(year, 0, 1)), timeZone);
  const july = getTimeZoneOffsetMinutes(new Date(Date.UTC(year, 6, 1)), timeZone);
  if (january !== july) {
    throw new Error(
      `${timeZone} observes daylight saving time; calendar files only support fixed-offset zones.`,
    );
  }
  return january;
}

const calendarTitle = (event: WeddingEvent, config: WeddingConfig) =>
  `${event.title} — ${coupleNames(config)}`;

/** Calendar notes: the invitation line, date and time, venue (or its TBA status) and link. */
function buildCalendarDescription(
  event: WeddingEvent,
  config: WeddingConfig,
  siteUrl: string | null,
): string {
  const timeLabel = timeLabelOf(event, config);
  const timingLine = event.timingNote ? `${timeLabel} · ${event.timingNote}` : timeLabel;
  const venueLines = event.venue
    ? [event.venue.name, event.venue.address]
    : event.hostedAt
      ? [event.hostedAt]
      : [
          'Venue: To be announced (not yet confirmed).',
          'Please check the invitation for the venue once it is announced.',
        ];
  const linkLines = siteUrl ? ['', `Invitation: ${siteUrl}`] : [];
  return [
    `You are warmly invited to the ${event.title} of ${coupleNames(config)}.`,
    '',
    formatLongDate(event.date),
    timingLine,
    '',
    ...venueLines,
    ...linkLines,
  ].join('\n');
}

function buildCalendarReminder(
  event: WeddingEvent,
  config: WeddingConfig,
): CalendarEventInput['reminder'] {
  const minutesBefore = event.calendar.reminderMinutesBefore;
  if (minutesBefore === null) return undefined;
  const when = `${formatLongDate(event.date)}, ${timeLabelOf(event, config)}`;
  return { minutesBefore, description: `Reminder: ${calendarTitle(event, config)} — ${when}` };
}

const locationOf = (event: WeddingEvent) =>
  event.venue
    ? `${event.venue.name}, ${event.venue.address}`
    : (event.hostedAt ?? 'Venue to be announced');

export function buildCalendarInput(
  event: WeddingEvent,
  config: WeddingConfig,
  siteUrl: string | null,
): CalendarEventInput {
  const startUtc = zonedDateTimeToUtc(event.date, event.startTime, config.timeZone);
  const endUtc = new Date(startUtc.getTime() + event.durationMinutes * MINUTE_MS);
  const end = getZonedParts(endUtc, config.timeZone);

  return {
    // Stable per event, so a re-imported file updates the guest's entry (see SEQUENCE).
    uid: `${event.id}@${config.site.calendarUidDomain}`,
    sequence: event.calendar.sequence,
    title: calendarTitle(event, config),
    description: buildCalendarDescription(event, config, siteUrl),
    location: locationOf(event),
    url: siteUrl ?? undefined,
    timeZone: config.timeZone,
    timeZoneLabel: config.timeZoneLabel,
    utcOffsetMinutes: assertFixedOffsetZone(config.timeZone, end.year),
    startLocal: { date: event.date, time: event.startTime },
    endLocal: { date: toIsoDateString(end), time: `${pad2(end.hour)}:${pad2(end.minute)}` },
    startUtc,
    endUtc,
    reminder: buildCalendarReminder(event, config),
  };
}

export function buildEventView(
  event: WeddingEvent,
  config: WeddingConfig,
  siteUrl: string | null,
): EventView {
  const startUtc = zonedDateTimeToUtc(event.date, event.startTime, config.timeZone);
  const dayEndUtc = zonedDateTimeToUtc(addDaysToIsoDate(event.date, 1), '00:00', config.timeZone);
  const offset = getTimeZoneOffsetMinutes(startUtc, config.timeZone);

  return {
    id: event.id,
    title: event.title,
    shortTitle: event.shortTitle,
    heading: event.heading,
    intro: event.intro,
    dateLabel: formatLongDate(event.date),
    dateParts: getDateParts(event.date),
    timeLabel: timeLabelOf(event, config),
    timingNote: event.timingNote,
    subtitle: event.subtitle,
    startIsoWithOffset: `${event.date}T${event.startTime}:00${formatUtcOffset(offset)}`,
    startsAtMs: startUtc.getTime(),
    dayEndsAtMs: dayEndUtc.getTime(),
    venue: event.venue,
    hostedAt: event.hostedAt,
    directionsUrl: buildDirectionsUrl(event.venue),
    calendar: {
      fileName: event.calendar.fileName,
      path: `/calendar/${event.calendar.fileName}`,
      googleUrl: buildGoogleCalendarUrl(buildCalendarInput(event, config, siteUrl)),
    },
    countdown: event.countdown,
  };
}

/** The slice of an event that goes into the WhatsApp / share-sheet message. */
export function toShareSummary(view: EventView): ShareEventSummary {
  return {
    label: view.shortTitle,
    dateLabel: view.dateLabel,
    timeLabel: view.timeLabel,
    timingNote: view.timingNote,
    venue: view.venue ? { name: view.venue.name, shortAddress: view.venue.shortAddress } : null,
    hostedAt: view.hostedAt,
  };
}

export function buildEventViews(config: WeddingConfig, siteUrl: string | null) {
  return {
    nikah: buildEventView(config.events.nikah, config, siteUrl),
    mehndi: buildEventView(config.events.mehndi, config, siteUrl),
  } as const;
}
