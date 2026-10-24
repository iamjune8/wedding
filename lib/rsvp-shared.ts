/** RSVP rules shared by the browser form and the server (no dependencies, safe to bundle). */

export const RSVP_NAME_MIN = 2;
export const RSVP_NAME_MAX = 80;

export type Attending = 'yes' | 'no';

export interface RsvpReply {
  readonly name: string;
  readonly attending: Attending;
}

export type RsvpField = 'name' | 'attending';
export type RsvpFieldErrors = Partial<Record<RsvpField, string>>;

export const RSVP_MESSAGES = {
  nameMissing: 'Please tell us your name.',
  nameShort: `Please enter at least ${RSVP_NAME_MIN} letters.`,
  nameLong: `Please keep your name under ${RSVP_NAME_MAX} characters.`,
  attendingMissing: 'Please let us know if you can attend.',
} as const;

/** Trims and collapses whitespace, as the server will. */
export const normaliseName = (name: string) => name.replace(/\s+/g, ' ').trim();

/** Quick client-side check mirroring the server rules, for instant, friendly feedback. */
export function checkRsvp(name: string, attending: Attending | null): RsvpFieldErrors {
  const clean = normaliseName(name);
  const nameError =
    clean.length === 0
      ? RSVP_MESSAGES.nameMissing
      : clean.length < RSVP_NAME_MIN
        ? RSVP_MESSAGES.nameShort
        : clean.length > RSVP_NAME_MAX
          ? RSVP_MESSAGES.nameLong
          : undefined;
  return {
    ...(nameError ? { name: nameError } : {}),
    ...(attending ? {} : { attending: RSVP_MESSAGES.attendingMissing }),
  };
}
