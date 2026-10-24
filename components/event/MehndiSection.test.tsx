// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildEventView } from '@/lib/events';
import { weddingConfig } from '@/lib/wedding-config';
import { MehndiSection } from './MehndiSection';

type MehndiConfig = (typeof weddingConfig)['events']['mehndi'];

const renderMehndi = (venue: MehndiConfig['venue'], hostedAt: MehndiConfig['hostedAt'] = null) =>
  render(
    <MehndiSection
      event={buildEventView(
        { ...weddingConfig.events.mehndi, venue, hostedAt },
        weddingConfig,
        null,
      )}
      calendarNote="Reminders depend on your calendar app."
      pendingMessage="Venue details will be announced soon."
    />,
  );

describe('MehndiSection', () => {
  it('shows "At our residence" for a home event, with no address or directions', () => {
    renderMehndi(null, 'At our residence');
    expect(screen.getByText('At our residence')).toBeInTheDocument();
    expect(screen.queryByText('To be announced')).not.toBeInTheDocument();
    expect(document.querySelector('address')).toBeNull();
    expect(screen.queryByRole('link', { name: /get directions/i })).not.toBeInTheDocument();
  });

  it('marks the venue as to be announced while it is unconfirmed', () => {
    renderMehndi(null);
    expect(screen.getByText('Venue details will be announced soon.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /get directions/i })).not.toBeInTheDocument();
  });

  it('shows the venue and directions automatically once a venue is configured', () => {
    renderMehndi({
      name: 'Example Hall',
      address: 'Example Road, Seawoods, Navi Mumbai, Maharashtra, India',
      shortAddress: 'Example Road, Navi Mumbai',
    });
    const region = screen.getByRole('region', { name: /a little colour/i });
    expect(within(region).getByText('Example Hall')).toBeInTheDocument();
    expect(
      within(region).queryByText('Venue details will be announced soon.'),
    ).not.toBeInTheDocument();

    const directions = within(region).getByRole('link', { name: /get directions/i });
    expect(new URL(directions.getAttribute('href') ?? '').searchParams.get('destination')).toBe(
      'Example Hall, Example Road, Seawoods, Navi Mumbai, Maharashtra, India',
    );
  });

  it('keeps address parts intact so lines only break between them', () => {
    renderMehndi({
      name: 'Example Hall',
      address: 'Plot No. 9, Sector New 50, Navi Mumbai',
      shortAddress: 'Navi Mumbai',
    });
    const parts = Array.from(document.querySelectorAll('.venue__address-part')).map(
      (part) => part.textContent,
    );
    expect(parts).toEqual(['Plot No. 9,', 'Sector New 50,', 'Navi Mumbai']);
    expect(document.querySelector('address')).toHaveTextContent(
      'Plot No. 9, Sector New 50, Navi Mumbai',
    );
  });
});
