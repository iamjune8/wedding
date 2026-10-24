import 'server-only';
import { buildIcsCalendar } from './calendar';
import { buildCalendarInput } from './events';
import { weddingConfig } from './wedding-config';

const calendarEvents = () => [weddingConfig.events.nikah, weddingConfig.events.mehndi] as const;

export function listCalendarFileNames(): string[] {
  return calendarEvents().map((event) => event.calendar.fileName);
}

/** Renders the .ics file with the given name, or null if no event uses that name. */
export function renderCalendarFile(
  fileName: string,
  siteUrl: string | null,
  generatedAt: Date,
): string | null {
  const event = calendarEvents().find((candidate) => candidate.calendar.fileName === fileName);
  if (!event) return null;
  return buildIcsCalendar(buildCalendarInput(event, weddingConfig, siteUrl), generatedAt);
}
