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

const haldi: ShareEventSummary = {
  label: 'Haldi',
  dateLabel: 'Wednesday, 28 April 2027',
  timeLabel: '4:00 PM IST',
  venue: null,
};

const expectedMessage = [
  'Assalamu Alaikum,',
  '',
  'With the blessings of Allah, you are warmly invited to the Nikah of Nida Khatib & Juned Shaikh.',
  '',
  'Nikah:',
  'Friday, 30 April 2027',
  '5:30 PM IST · After Asr Namaaz',
  '',
  'Venue:',
  'Seawood Jama Masjid',
  'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai.',
  '',
  'Haldi:',
  'Wednesday, 28 April 2027',
  '4:00 PM IST',
  'Venue to be announced.',
  '',
  'We would be honoured by your presence and duas.',
].join('\n');

describe('buildInvitationMessage', () => {
  it('produces the agreed invitation wording', () => {
    expect(
      buildInvitationMessage({ coupleNames: 'Nida Khatib & Juned Shaikh', nikah, haldi }),
    ).toBe(expectedMessage);
  });

  it('includes the Haldi venue automatically once it is confirmed', () => {
    const message = buildInvitationMessage({
      coupleNames: 'Nida Khatib & Juned Shaikh',
      nikah,
      haldi: { ...haldi, venue: { name: 'Example Hall', shortAddress: 'Example Road, Mumbai' } },
    });
    expect(message).toContain(
      'Haldi:\nWednesday, 28 April 2027\n4:00 PM IST\nVenue: Example Hall, Example Road, Mumbai.',
    );
    expect(message).not.toContain('Venue to be announced');
  });
});

describe('withInvitationUrl', () => {
  it('appends the public link on its own paragraph', () => {
    expect(withInvitationUrl('Hello', 'https://nida-juned.example')).toBe(
      'Hello\n\nhttps://nida-juned.example',
    );
  });

  it('leaves the message alone when no link is known yet', () => {
    expect(withInvitationUrl('Hello', null)).toBe('Hello');
  });
});

describe('buildWhatsAppShareUrl', () => {
  it('encodes the full message for wa.me', () => {
    const text = withInvitationUrl(expectedMessage, 'https://nida-juned.example');
    const url = buildWhatsAppShareUrl(text);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(url).not.toMatch(/\s/);
    expect(url).toContain('%0A');
    expect(url).toContain('%26');
    expect(new URL(url).searchParams.get('text')).toBe(text);
  });
});
