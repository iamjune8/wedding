// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ENVELOPE_OPEN_MS, SealedEnvelope } from './SealedEnvelope';

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

const renderEnvelope = () =>
  render(
    <SealedEnvelope initials={['N', 'J']} hint="Tap to open your invitation">
      <p>The letter</p>
    </SealedEnvelope>,
  );

beforeEach(() => mockReducedMotion(false));
afterEach(() => vi.useRealTimers());

describe('SealedEnvelope', () => {
  it('arrives sealed, with the letter kept out of reach until opened', () => {
    const { container } = renderEnvelope();
    const button = screen.getByRole('button', { name: 'Tap to open your invitation' });
    expect(button).toHaveAttribute('aria-controls', 'invitation-letter');
    expect(container.querySelector('.envelope-stage')).toHaveAttribute('data-state', 'sealed');
    expect(container.querySelector('#invitation-letter')).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens on a tap, then hands focus to the letter', () => {
    vi.useFakeTimers();
    const { container } = renderEnvelope();
    act(() => screen.getByRole('button', { name: /tap to open/i }).click());
    expect(container.querySelector('.envelope-stage')).toHaveAttribute('data-state', 'opening');
    act(() => {
      vi.advanceTimersByTime(ENVELOPE_OPEN_MS + 50);
    });
    expect(container.querySelector('.envelope-stage')).toHaveAttribute('data-state', 'open');
    expect(screen.queryByRole('button', { name: /tap to open/i })).not.toBeInTheDocument();
    expect(screen.getByText('The letter')).toBeVisible();
    expect(container.querySelector('#invitation-letter')).not.toHaveAttribute('aria-hidden');
  });

  it('opens at once for visitors who prefer reduced motion', () => {
    mockReducedMotion(true);
    const { container } = renderEnvelope();
    act(() => screen.getByRole('button', { name: /tap to open/i }).click());
    expect(container.querySelector('.envelope-stage')).toHaveAttribute('data-state', 'open');
  });
});
