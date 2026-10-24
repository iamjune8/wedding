import { z } from 'zod';
import {
  normaliseName,
  RSVP_MESSAGES,
  RSVP_NAME_MAX,
  RSVP_NAME_MIN,
  type RsvpField,
  type RsvpFieldErrors,
  type RsvpReply,
} from './rsvp-shared';

/** Server-side validation for an RSVP. Unknown fields are ignored, never stored. */
const rsvpSchema = z.object({
  name: z
    .string({ error: RSVP_MESSAGES.nameMissing })
    .transform(normaliseName)
    .pipe(
      z
        .string()
        .min(1, RSVP_MESSAGES.nameMissing)
        .min(RSVP_NAME_MIN, RSVP_MESSAGES.nameShort)
        .max(RSVP_NAME_MAX, RSVP_MESSAGES.nameLong),
    ),
  attending: z.enum(['yes', 'no'], { error: RSVP_MESSAGES.attendingMissing }),
  // Hidden field real guests never see or fill; bots usually do.
  website: z.string().optional(),
});

export type RsvpParseResult =
  | { readonly success: true; readonly data: RsvpReply }
  | { readonly success: false; readonly spam?: true; readonly errors: RsvpFieldErrors };

export function parseRsvp(input: unknown): RsvpParseResult {
  const candidate = input !== null && typeof input === 'object' ? input : {};
  const result = rsvpSchema.safeParse(candidate);
  if (!result.success) {
    const errors = result.error.issues.reduce<RsvpFieldErrors>((found, issue) => {
      const field = issue.path[0] as RsvpField | undefined;
      return field && !found[field] ? { ...found, [field]: issue.message } : found;
    }, {});
    return { success: false, errors };
  }
  if (result.data.website) return { success: false, spam: true, errors: {} };
  return { success: true, data: { name: result.data.name, attending: result.data.attending } };
}

/** Stops a name like "=HYPERLINK(...)" from running as a spreadsheet formula. */
export function toSheetCell(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}
