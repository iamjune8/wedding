// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Countdown } from './Countdown';

const NIKAH = Date.parse('2027-04-30T12:00:00Z');
const NIKAH_DAY_END = Date.parse('2027-04-30T18:30:00Z');

const props = {
  targetMs: NIKAH,
  dayEndMs: NIKAH_DAY_END,
  label: 'Time remaining until the Nikah',
  reachedMessage: 'Alhamdulillah, the day has arrived. Today, our forever begins.',
  pastMessage: 'Alhamdulillah. Thank you for your duas.',
};

const valueOf = (label: RegExp) =>
  screen.getByText(label).parentElement?.querySelector('.countdown__value')?.textContent;

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('never puts invented numbers in the server-rendered HTML', () => {
    vi.setSystemTime(new Date('2026-10-24T00:00:00Z'));
    const html = renderToString(<Countdown {...props} />);
    expect(html).toContain('countdown__placeholder');
    expect(html).not.toMatch(/countdown__value">\d/);
  });

  it('shows the live time remaining once running in the browser', () => {
    vi.setSystemTime(new Date('2026-10-24T00:00:00Z'));
    render(<Countdown {...props} />);
    expect(
      screen.getByRole('timer', { name: 'Time remaining until the Nikah' }),
    ).toBeInTheDocument();
    expect(valueOf(/^Days$/)).toBe('188');
    expect(valueOf(/^Hours$/)).toBe('12');
    expect(valueOf(/^Minutes$/)).toBe('00');
    expect(valueOf(/^Seconds$/)).toBe('00');
  });

  it('ticks every second and settles on the event message at zero', () => {
    vi.setSystemTime(new Date('2027-04-30T11:59:58Z'));
    render(<Countdown {...props} />);
    expect(valueOf(/^Seconds$/)).toBe('02');

    // The shared clock ticks just after each whole second.
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(valueOf(/^Second$/)).toBe('01');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByText('Alhamdulillah, the day has arrived. Today, our forever begins.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('catches up immediately when the guest returns to the tab', () => {
    vi.setSystemTime(new Date('2027-04-30T11:00:00Z'));
    render(<Countdown {...props} />);
    expect(valueOf(/^Hour$/)).toBe('01');

    // A background tab may not have ticked for a while.
    vi.setSystemTime(new Date('2027-04-30T11:30:00Z'));
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(valueOf(/^Minutes$/)).toBe('30');
    expect(valueOf(/^Hours$/)).toBe('00');
  });

  it('uses singular labels for a value of one', () => {
    vi.setSystemTime(new Date(NIKAH - (24 * 3600 + 3600 + 60 + 1) * 1000));
    render(<Countdown {...props} />);
    for (const label of [/^Day$/, /^Hour$/, /^Minute$/, /^Second$/]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('shows a graceful message once the event day has passed', () => {
    vi.setSystemTime(new Date('2027-05-02T00:00:00Z'));
    render(<Countdown {...props} />);
    expect(screen.getByText(props.pastMessage)).toBeInTheDocument();
  });

  it('falls back to placeholders instead of crashing on invalid input', () => {
    vi.setSystemTime(new Date('2026-10-24T00:00:00Z'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Countdown {...props} targetMs={Number.NaN} />);
    expect(screen.getByRole('timer')).toHaveAttribute('aria-busy', 'true');
    expect(consoleError).toHaveBeenCalled();
  });
});
