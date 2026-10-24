// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INTRO_STORAGE_KEY } from '@/lib/intro';
import { IntroController } from './IntroController';

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  mockReducedMotion(false);
  delete document.documentElement.dataset.intro;
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('IntroController', () => {
  it('offers a visible way to skip the opening', async () => {
    render(<IntroController />);
    const skip = await screen.findByRole('button', { name: 'Skip intro' });
    await userEvent.click(skip);
    expect(document.documentElement.dataset.intro).toBe('done');
    expect(window.sessionStorage.getItem(INTRO_STORAGE_KEY)).toBe('1');
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
  });

  it('fast-forwards when the guest presses a key', async () => {
    render(<IntroController />);
    await screen.findByRole('button', { name: 'Skip intro' });
    await userEvent.keyboard('{Tab}');
    expect(document.documentElement.dataset.intro).toBe('done');
  });

  it('removes itself once the opening has finished playing', () => {
    vi.useFakeTimers();
    render(<IntroController />);
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(7500);
    });
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(INTRO_STORAGE_KEY)).toBe('1');
  });

  it('stays out of the way when the opening was already skipped', () => {
    vi.useFakeTimers();
    document.documentElement.dataset.intro = 'skip';
    render(<IntroController />);
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
  });

  it('stays out of the way for visitors who prefer reduced motion', () => {
    vi.useFakeTimers();
    mockReducedMotion(true);
    render(<IntroController />);
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
  });
});
