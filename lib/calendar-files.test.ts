import { describe, expect, it } from 'vitest';
import { listCalendarFileNames, renderCalendarFile } from './calendar-files';

const generatedAt = new Date('2026-10-24T00:00:00Z');

describe('calendar files', () => {
  it('publishes one file per event with meaningful names', () => {
    expect(listCalendarFileNames()).toEqual(['nida-junaid-nikah.ics', 'nida-junaid-haldi.ics']);
  });

  it('renders the Nikah file', () => {
    const ics = renderCalendarFile(
      'nida-junaid-nikah.ics',
      'https://nida-junaid.example',
      generatedAt,
    );
    expect(ics).toContain('DTSTART;TZID=Asia/Kolkata:20270430T173000');
    expect(ics).toContain('UID:nikah@nida-junaid.invitation');
  });

  it('renders the Haldi file', () => {
    const ics = renderCalendarFile('nida-junaid-haldi.ics', null, generatedAt);
    expect(ics).toContain('DTSTART;TZID=Asia/Kolkata:20270428T160000');
    expect(ics).toContain('LOCATION:Venue to be announced');
  });

  it('returns null for unknown files', () => {
    expect(renderCalendarFile('something-else.ics', null, generatedAt)).toBeNull();
  });
});
