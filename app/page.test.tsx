// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InvitationPage from './page';

const SITE = 'https://nida-junaid.example';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', SITE);
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const section = (name: RegExp) => screen.getByRole('region', { name });

describe('Invitation page', () => {
  it('names the couple exactly in the main heading', () => {
    render(<InvitationPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Nida Khatib and Junaid Shaikh',
    );
  });

  it('opens with the agreed invitation wording', () => {
    render(<InvitationPage />);
    const hero = section(/nida khatib and junaid shaikh/i);
    for (const text of [
      'Bismillahir Rahmanir Rahim',
      'Together with our families',
      'Cordially invite you to celebrate their Nikah',
      'Friday, 30 April 2027',
      'After Asr Namaaz · 5:30 PM IST',
      'Discover the celebration',
    ]) {
      expect(within(hero).getByText(text)).toBeInTheDocument();
    }
  });

  it('presents the chapters in order, with the Mehndi as the final event', () => {
    render(<InvitationPage />);
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      'Invitation',
      'Counting down to the Nikah',
      'Nikah Ceremony',
      'Mehndi Ceremony',
      'RSVP',
    ]);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Keep us in your duas.');
  });

  it('gives the Nikah directions, calendar and share actions', () => {
    render(<InvitationPage />);
    const nikah = section(/nikah ceremony/i);
    expect(within(nikah).getByText('Seawood Jama Masjid')).toBeInTheDocument();
    expect(within(nikah).getByText('5:30 PM IST · After Asr Namaaz')).toBeInTheDocument();

    const directions = within(nikah).getByRole('link', { name: /get directions/i });
    expect(new URL(directions.getAttribute('href') ?? '').searchParams.get('destination')).toBe(
      'Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
    );
    expect(directions).toHaveAttribute('rel', 'noopener noreferrer');

    expect(within(nikah).getByRole('link', { name: /apple calendar/i })).toHaveAttribute(
      'href',
      '/calendar/nida-junaid-nikah.ics',
    );
    expect(within(nikah).getByRole('link', { name: /google calendar/i })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(within(nikah).getByRole('link', { name: /share on whatsapp/i })).toBeInTheDocument();
  });

  it('shows the Mehndi at our residence, with no invented address or directions', () => {
    render(<InvitationPage />);
    const mehndi = section(/mehndi ceremony/i);
    expect(within(mehndi).getByText('Henna evening')).toBeInTheDocument();
    expect(within(mehndi).getByText('Thursday, 29 April 2027')).toBeInTheDocument();
    expect(within(mehndi).getByText('4:00 PM IST')).toBeInTheDocument();
    expect(within(mehndi).getByText('At our residence')).toBeInTheDocument();
    expect(within(mehndi).queryByText('To be announced')).not.toBeInTheDocument();
    expect(mehndi.querySelector('address')).toBeNull();
    expect(within(mehndi).queryByRole('link', { name: /directions/i })).not.toBeInTheDocument();
    expect(within(mehndi).getByRole('link', { name: /apple calendar/i })).toHaveAttribute(
      'href',
      '/calendar/nida-junaid-mehndi.ics',
    );
  });

  it('shares the public address, never localhost', () => {
    render(<InvitationPage />);
    const href = screen.getByRole('link', { name: /share on whatsapp/i }).getAttribute('href');
    const text = new URL(href ?? '').searchParams.get('text') ?? '';
    expect(text.endsWith(`\n\n${SITE}`)).toBe(true);
    expect(text).not.toContain('localhost');
  });

  it('closes with the dua and the couple’s names', () => {
    render(<InvitationPage />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent(
      'May Allah bless this beautiful journey with love, barakah, understanding, and lifelong happiness.',
    );
    expect(footer).toHaveTextContent(/Nida Khatib.*Junaid Shaikh/);
  });
});
