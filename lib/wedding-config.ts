import 'server-only';
import { z } from 'zod';
import { isValidTimeZone, parseIsoDate, zonedDateTimeToUtc } from './time';

/* ──────────────────────────────────────────────────────────────────────────────────────────
 * ALL WEDDING DETAILS LIVE HERE.
 *
 * To announce the Haldi venue later, replace `venue: null` in the Haldi event with:
 *   venue: {
 *     name: 'Venue name',
 *     address: 'Full address, City, State, India',   // used for directions + calendars
 *     shortAddress: 'Short address, City',             // used in the WhatsApp message
 *   },
 * and increase `calendar.sequence` by 1 so re-imported calendar entries update.
 * Directions, calendar files, the share message and the page update automatically.
 * ────────────────────────────────────────────────────────────────────────────────────────── */
export const rawWeddingConfig = {
  couple: {
    bride: { firstName: 'Nida', fullName: 'Nida Khatib' },
    groom: { firstName: 'Juned', fullName: 'Juned Shaikh' },
  },
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  site: {
    title: 'Nida & Juned | Nikah & Haldi Invitation',
    description:
      'You are warmly invited to the Nikah of Nida Khatib and Juned Shaikh on Friday, 30 April 2027, and their Haldi celebration on Wednesday, 28 April 2027.',
    // Keeps the invitation out of search results; link previews on WhatsApp still work.
    allowSearchIndexing: false,
    // Stable identifier suffix for calendar entries (not a real web address).
    calendarUidDomain: 'nida-juned.invitation',
  },
  copy: {
    // Al-Fatihah 1:1 in Uthmani orthography: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
    bismillahArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    bismillah: 'Bismillahir Rahmanir Rahim',
    families: 'Together with our families',
    inviteLine: 'Cordially invite you to celebrate their Nikah',
    scrollCue: 'Discover the celebration',
    message: [
      'With the blessings of Allah and the love and duas of our families, we warmly invite you to join us as Nida Khatib and Juned Shaikh begin their journey together in Nikah.',
      'Your presence and duas will make this blessed occasion even more special.',
    ],
    closing: [
      'May Allah bless this beautiful journey with love, barakah, understanding, and lifelong happiness.',
      'Keep us in your duas.',
    ],
    venuePending: 'Venue details will be announced soon.',
    calendarNote:
      'Reminders depend on your calendar app and its notification settings. On iPhone, choose Apple Calendar; on Android, Google Calendar is usually easiest.',
  },
  events: {
    nikah: {
      id: 'nikah',
      title: 'Nikah Ceremony',
      shortTitle: 'Nikah',
      date: '2027-04-30',
      startTime: '17:30',
      // No end time was provided, so calendar entries assume 60 minutes.
      durationMinutes: 60,
      timingNote: 'After Asr Namaaz',
      venue: {
        name: 'Seawood Jama Masjid',
        address: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
        shortAddress: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai',
      },
      calendar: { fileName: 'nida-juned-nikah.ics', sequence: 0, reminderMinutesBefore: 1440 },
      countdown: {
        heading: 'Counting down to the Nikah',
        reachedMessage: 'The blessed day is here',
        pastMessage: 'Alhamdulillah. Thank you for your duas.',
      },
    },
    haldi: {
      id: 'haldi',
      title: 'Haldi Ceremony',
      shortTitle: 'Haldi',
      date: '2027-04-28',
      startTime: '16:00',
      // No end time was provided, so calendar entries assume 60 minutes.
      durationMinutes: 60,
      timingNote: null,
      venue: null, // To be announced — see the note at the top of this file.
      calendar: { fileName: 'nida-juned-haldi.ics', sequence: 0, reminderMinutesBefore: 1440 },
      countdown: {
        heading: 'Counting down to the Haldi',
        reachedMessage: 'The Haldi celebration is here',
        pastMessage: 'Alhamdulillah. Thank you for celebrating with us.',
      },
    },
  },
} as const;

/* ─── Validation ─────────────────────────────────────────────────────────────────────────── */

const text = z.string().trim().min(1, 'Must not be empty');

const isoDate = z.string().refine(
  (value) => {
    try {
      parseIsoDate(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Use a real date in YYYY-MM-DD format, e.g. 2027-04-30' },
);

const time24 = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:mm format, e.g. 17:30 for 5:30 PM');

const venueSchema = z.strictObject({
  name: text,
  address: text,
  shortAddress: text,
});

const eventSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/, 'Use lowercase letters, numbers and dashes'),
  title: text,
  shortTitle: text,
  date: isoDate,
  startTime: time24,
  durationMinutes: z.number().int().min(15, 'At least 15 minutes').max(720, 'At most 12 hours'),
  timingNote: text.nullable(),
  venue: venueSchema.nullable(),
  calendar: z.strictObject({
    fileName: z
      .string()
      .regex(/^[a-z0-9-]+\.ics$/, 'Use lowercase letters, numbers and dashes ending in .ics'),
    sequence: z.number().int().min(0),
    reminderMinutesBefore: z.number().int().min(0).max(10_080).nullable(),
  }),
  countdown: z.strictObject({
    heading: text,
    reachedMessage: text,
    pastMessage: text,
  }),
});

const weddingConfigSchema = z
  .strictObject({
    couple: z.strictObject({
      bride: z.strictObject({ firstName: text, fullName: text }),
      groom: z.strictObject({ firstName: text, fullName: text }),
    }),
    timeZone: z.string().refine(isValidTimeZone, 'Use an IANA time zone such as Asia/Kolkata'),
    timeZoneLabel: text,
    site: z.strictObject({
      title: text,
      description: text,
      allowSearchIndexing: z.boolean(),
      calendarUidDomain: z.string().regex(/^[a-z0-9.-]+$/),
    }),
    copy: z.strictObject({
      bismillahArabic: text,
      bismillah: text,
      families: text,
      inviteLine: text,
      scrollCue: text,
      message: z.array(text).min(1),
      closing: z.array(text).min(1),
      venuePending: text,
      calendarNote: text,
    }),
    events: z.strictObject({ nikah: eventSchema, haldi: eventSchema }),
  })
  .superRefine((config, context) => {
    const events = Object.entries(config.events);
    const fileNames = events.map(([, event]) => event.calendar.fileName);
    if (new Set(fileNames).size !== fileNames.length) {
      context.addIssue({
        code: 'custom',
        path: ['events'],
        message: 'Each event needs a unique calendar file name',
      });
    }
    for (const [key, event] of events) {
      try {
        zonedDateTimeToUtc(event.date, event.startTime, config.timeZone);
      } catch (error) {
        context.addIssue({
          code: 'custom',
          path: ['events', key, 'startTime'],
          message: error instanceof Error ? error.message : 'Invalid start time',
        });
      }
    }
  });

export type WeddingConfig = z.infer<typeof weddingConfigSchema>;
export type WeddingEvent = WeddingConfig['events']['nikah'];
export type Venue = NonNullable<WeddingEvent['venue']>;

/** Validates wedding details and explains exactly which field is wrong. */
export function parseWeddingConfig(input: unknown): WeddingConfig {
  const result = weddingConfigSchema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `- ${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid wedding configuration in lib/wedding-config.ts:\n${details}`);
  }
  return result.data;
}

export const weddingConfig: WeddingConfig = parseWeddingConfig(rawWeddingConfig);
