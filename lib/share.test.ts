import { describe, expect, it } from 'vitest';
import {
  buildInvitationMessage,
  buildWhatsAppShareUrl,
  withInvitationUrl,
  type ShareEventSummary,
} from './share';

const nikah: ShareEventSummary = {
  label: 'Nikah',
  dateLabel: 'Friday, 30 April 2027',
  timeLabel: '5:30 PM IST',
  timingNote: 'After Asr Namaaz',
  venue: {
    name: 'Seawood Jama Masjid',
    shortAddress: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai',
  },
};

const mehndi: ShareEventSummary = {
  label: 'Mehndi',
  dateLabel: 'Thursday, 29 April 2027',
  timeLabel: '4:00 PM IST',
  venue: null,
  hostedAt: 'At our residence',
};

const expectedMessage = [
  'Assalamu Alaikum,',
  '',
  'With the blessings of Allah, you are warmly invited to the Nikah of Nida Khatib & Junaid Shaikh.',
  '',
  'Nikah:',
  'Friday, 30 April 2027',
  '5:30 PM IST · After Asr Namaaz',
  '',
  'Venue:',
  'Seawood Jama Masjid',
  'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai.',
  '',
  'Mehndi:',
  'Thursday, 29 April 2027',
  '4:00 PM IST',
  'At our residence.',
  '',
  'We would be honoured by your presence and duas.',
].join('\n');

describe('buildInvitationMessage', () => {
  it('produces the agreed invitation wording', () => {
    expect(
      buildInvitationMessage({ coupleNames: 'Nida Khatib & Junaid Shaikh', nikah, mehndi }),
    ).toBe(expectedMessage);
  });

  it('includes the Mehndi venue automatically once it is confirmed', () => {
    const message = buildInvitationMessage({
      coupleNames: 'Nida Khatib & Junaid Shaikh',
      nikah,
      mehndi: { ...mehndi, venue: { name: 'Example Hall', shortAddress: 'Example Road, Mumbai' } },
    });
    expect(message).toContain(
      'Mehndi:\nThursday, 29 April 2027\n4:00 PM IST\nVenue: Example Hall, Example Road, Mumbai.',
    );
    expect(message).not.toContain('At our residence');
  });

  it('says the venue is to be announced when neither a venue nor a home is given', () => {
    const message = buildInvitationMessage({
      coupleNames: 'Nida Khatib & Junaid Shaikh',
      nikah,
      mehndi: { ...mehndi, hostedAt: null },
    });
    expect(message).toContain('4:00 PM IST\nVenue to be announced.');
  });
});

describe('withInvitationUrl', () => {
  it('appends the public link on its own paragraph', () => {
    expect(withInvitationUrl('Hello', 'https://nida-junaid.example')).toBe(
      'Hello\n\nhttps://nida-junaid.example',
    );
  });

  it('leaves the message alone when no link is known yet', () => {
    expect(withInvitationUrl('Hello', null)).toBe('Hello');
  });
});

describe('buildWhatsAppShareUrl', () => {
  it('encodes the full message for wa.me', () => {
    const text = withInvitationUrl(expectedMessage, 'https://nida-junaid.example');
    const url = buildWhatsAppShareUrl(text);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(url).not.toMatch(/\s/);
    expect(url).toContain('%0A');
    expect(url).toContain('%26');
    expect(new URL(url).searchParams.get('text')).toBe(text);
  });
});
