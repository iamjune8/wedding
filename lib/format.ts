import { parseIsoDate, parseTime24 } from './time';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * Display helpers work directly from the event's local calendar values, so the text is the
 * same everywhere and never shifts with the visitor's device time zone.
 */
export function getWeekdayName(date: string): string {
  const { year, month, day } = parseIsoDate(date);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  if (!weekday) throw new RangeError(`Could not determine the weekday of ${date}`);
  return weekday;
}

/** "2027-04-30" → "Friday, 30 April 2027" */
export function formatLongDate(date: string): string {
  const { year, month, day } = parseIsoDate(date);
  return `${getWeekdayName(date)}, ${day} ${MONTHS[month - 1]} ${year}`;
}

/** "17:30" → "5:30 PM" */
export function formatTime12h(time: string): string {
  const { hour, minute } = parseTime24(time);
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

export interface DateParts {
  readonly weekday: string;
  readonly day: number;
  readonly month: string;
  readonly year: number;
}

/** "2027-04-30" → { weekday: 'Friday', day: 30, month: 'April', year: 2027 }, for the hero date. */
export function getDateParts(date: string): DateParts {
  const { year, month, day } = parseIsoDate(date);
  const monthName = MONTHS[month - 1];
  if (!monthName) throw new RangeError(`Could not determine the month of ${date}`);
  return { weekday: getWeekdayName(date), day, month: monthName, year };
}
