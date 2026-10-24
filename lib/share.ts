export interface ShareVenue {
  readonly name: string;
  readonly shortAddress: string;
}

export interface ShareEventSummary {
  readonly label: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
  readonly timingNote?: string | null;
  readonly venue: ShareVenue | null;
  readonly hostedAt?: string | null;
}

export interface InvitationMessageInput {
  readonly coupleNames: string;
  readonly nikah: ShareEventSummary;
  readonly mehndi: ShareEventSummary;
}

const withFullStop = (text: string) => `${text.replace(/[.\s]+$/, '')}.`;

const timeLine = (event: ShareEventSummary) =>
  event.timingNote ? `${event.timeLabel} · ${event.timingNote}` : event.timeLabel;

/** The invitation text shared on WhatsApp and through the device share sheet (without link). */
export function buildInvitationMessage({
  coupleNames,
  nikah,
  mehndi,
}: InvitationMessageInput): string {
  const nikahVenue = nikah.venue
    ? ['Venue:', nikah.venue.name, withFullStop(nikah.venue.shortAddress)]
    : ['Venue to be announced.'];
  const mehndiVenue = mehndi.venue
    ? [`Venue: ${mehndi.venue.name}, ${withFullStop(mehndi.venue.shortAddress)}`]
    : [mehndi.hostedAt ? withFullStop(mehndi.hostedAt) : 'Venue to be announced.'];

  return [
    'Assalamu Alaikum,',
    '',
    `With the blessings of Allah, you are warmly invited to the Nikah of ${coupleNames}.`,
    '',
    `${nikah.label}:`,
    nikah.dateLabel,
    timeLine(nikah),
    '',
    ...nikahVenue,
    '',
    `${mehndi.label}:`,
    mehndi.dateLabel,
    timeLine(mehndi),
    ...mehndiVenue,
    '',
    'We would be honoured by your presence and duas.',
  ].join('\n');
}

export function withInvitationUrl(message: string, url: string | null): string {
  return url ? `${message}\n\n${url}` : message;
}

/** wa.me works on phones (opens the app) and desktops (opens WhatsApp Web). */
export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
