import 'server-only';
import { z } from 'zod';
import { isValidTimeZone, parseIsoDate, zonedDateTimeToUtc } from './time';

/* ──────────────────────────────────────────────────────────────────────────────────────────
 * ALL WEDDING DETAILS LIVE HERE.
 *
 * The Mehndi is hosted at home (`hostedAt`). To publish the home address later, replace
 * `venue: null` in the Mehndi event with:
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
    groom: { firstName: 'Junaid', fullName: 'Junaid Shaikh' },
  },
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  site: {
    title: 'Nida & Junaid | Nikah & Mehndi Invitation',
    description:
      'You are warmly invited to the Nikah of Nida Khatib and Junaid Shaikh on Friday, 30 April 2027, and their Mehndi (henna) evening on Thursday, 29 April 2027.',
    // Keeps the invitation out of search results; link previews on WhatsApp still work.
    allowSearchIndexing: false,
    // Stable identifier suffix for calendar entries (not a real web address).
    calendarUidDomain: 'nida-junaid.invitation',
  },
  copy: {
    // Al-Fatihah 1:1 in Uthmani orthography: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
    bismillahArabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    bismillah: 'Bismillahir Rahmanir Rahim',
    /* The site reads as one story, chapter by chapter. */
    heroTitle: 'Two Hearts, One Promise',
    heroLine: 'A journey of love, faith, and forever begins here.',
    scrollCue: 'Begin our story',
    letter: {
      kicker: 'A letter for you',
      openHint: 'Tap to open your invitation',
      greeting: 'Assalamu Alaikum',
      heading: 'A Sacred Promise',
      message: [
        'With the blessings of Allah, Nida Khatib and Junaid Shaikh will be joined in Nikah: two lives, and two families, brought together in one promise.',
        'A promise built on kindness and patience, held by faith, and filled with love and mercy.',
      ],
      storyHeading: 'Written by Qadr, Celebrated with Love',
      story: [
        'Long before we knew it, every step of our path was written. We are grateful for each one that led us here.',
        'Now we begin a shared journey, side by side, in mutual respect, faith, and companionship.',
      ],
    },
    presence: {
      heading: 'Your Presence Is Our Blessing',
      text: 'Come and witness our Nikah, and share the duas that will carry us through the years ahead.',
    },
    rsvp: {
      kicker: 'Kindly reply',
      heading: 'Will You Celebrate With Us?',
      intro:
        'Please let us know if you can join us, so we may welcome you with the care you deserve.',
    },
    closingHeading: 'May Allah Bless Our Union',
    closing: [
      'May He fill our home with barakah and peace, grant us patience in every season, and keep love and companionship between us, always.',
      'Please remember us in your duas.',
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
      heading: 'The Day Our Forever Begins',
      intro:
        "With Allah's blessings, and surrounded by family and friends, we invite you to witness our Nikah and to keep us in your duas.",
      subtitle: null,
      date: '2027-04-30',
      startTime: '17:30',
      // No end time was provided, so calendar entries assume 60 minutes.
      durationMinutes: 60,
      timingNote: 'After Asr Namaaz',
      hostedAt: null,
      venue: {
        name: 'Seawood Jama Masjid',
        address: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
        shortAddress: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai',
      },
      calendar: { fileName: 'nida-junaid-nikah.ics', sequence: 0, reminderMinutesBefore: 1440 },
      countdown: {
        heading: 'Our Forever Begins In',
        line: 'Every passing moment brings us closer to a day we will cherish for a lifetime.',
        reachedMessage: 'Alhamdulillah, the day has arrived. Today, our forever begins.',
        pastMessage: 'Alhamdulillah. Thank you for your duas.',
      },
    },
    mehndi: {
      id: 'mehndi',
      title: 'Mehndi Ceremony',
      shortTitle: 'Mehndi',
      heading: 'A Little Colour, A Lot of Love',
      intro:
        'An evening of henna and colour, cherished traditions, laughter, and family: the warm beginning of our celebrations.',
      subtitle: 'Henna evening',
      date: '2027-04-29',
      startTime: '16:00',
      // No end time was provided, so calendar entries assume 60 minutes.
      durationMinutes: 60,
      timingNote: null,
      // No address was given, so the page says "At our residence" and offers no directions.
      hostedAt: 'At our residence',
      venue: null, // See the note at the top of this file.
      calendar: { fileName: 'nida-junaid-mehndi.ics', sequence: 0, reminderMinutesBefore: 1440 },
      countdown: {
        heading: 'Until the Colours Begin',
        line: null,
        reachedMessage: 'The henna evening has begun. Come and celebrate with us.',
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
  /** The chapter heading shown on the page (the title stays in calendars and sharing). */
  heading: text,
  intro: text,
  subtitle: text.nullable(),
  date: isoDate,
  startTime: time24,
  durationMinutes: z.number().int().min(15, 'At least 15 minutes').max(720, 'At most 12 hours'),
  timingNote: text.nullable(),
  /** A place shown without an address (e.g. a family home); used only when `venue` is null. */
  hostedAt: text.nullable(),
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
    line: text.nullable(),
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
      heroTitle: text,
      heroLine: text,
      scrollCue: text,
      letter: z.strictObject({
        kicker: text,
        openHint: text,
        greeting: text,
        heading: text,
        message: z.array(text).min(1),
        storyHeading: text,
        story: z.array(text).min(1),
      }),
      presence: z.strictObject({ heading: text, text }),
      rsvp: z.strictObject({ kicker: text, heading: text, intro: text }),
      closingHeading: text,
      closing: z.array(text).min(1),
      venuePending: text,
      calendarNote: text,
    }),
    events: z.strictObject({ nikah: eventSchema, mehndi: eventSchema }),
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
