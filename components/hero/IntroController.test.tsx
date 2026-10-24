// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INTRO_DURATION_MS, INTRO_STORAGE_KEY } from '@/lib/intro';
import { IntroController } from './IntroController';

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  mockReducedMotion(false);
  delete document.documentElement.dataset.intro;
  window.sessionStorage.clear();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  vi.spyOn(performance, 'now').mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const settle = () =>
  act(() => {
    vi.advanceTimersByTime(1);
  });

describe('IntroController', () => {
  it('offers a visible way to skip the opening', async () => {
    render(<IntroController />);
    const skip = await screen.findByRole('button', { name: 'Skip intro' });
    await userEvent.click(skip);
    expect(document.documentElement.dataset.intro).toBe('done');
    expect(window.sessionStorage.getItem(INTRO_STORAGE_KEY)).toBe('1');
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
    // The replay control waits a moment, so the skipping tap cannot press it.
    expect(screen.queryByRole('button', { name: 'Replay invitation' })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Replay invitation' })).toBeInTheDocument();
  });

  it('fast-forwards when the guest presses a key', async () => {
    render(<IntroController />);
    await screen.findByRole('button', { name: 'Skip intro' });
    await userEvent.keyboard('{Tab}');
    expect(document.documentElement.dataset.intro).toBe('done');
  });

  it('offers a replay once the opening has finished playing', () => {
    vi.useFakeTimers();
    render(<IntroController />);
    settle();
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS + 100);
    });
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replay invitation' })).toBeInTheDocument();
    expect(window.sessionStorage.getItem(INTRO_STORAGE_KEY)).toBe('1');
  });

  it('replays from the top and can be skipped again', () => {
    vi.useFakeTimers();
    document.documentElement.dataset.intro = 'skip';
    render(<IntroController />);
    settle();
    act(() => {
      screen.getByRole('button', { name: 'Replay invitation' }).click();
    });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(document.documentElement.dataset.intro).toBe('replay');
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(INTRO_DURATION_MS + 100);
    });
    expect(screen.getByRole('button', { name: 'Replay invitation' })).toBeInTheDocument();
  });

  it('starts at the replay button when the opening was already seen', () => {
    vi.useFakeTimers();
    document.documentElement.dataset.intro = 'skip';
    render(<IntroController />);
    settle();
    expect(screen.queryByRole('button', { name: 'Skip intro' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replay invitation' })).toBeInTheDocument();
  });

  it('stays out of the way for visitors who prefer reduced motion', () => {
    vi.useFakeTimers();
    mockReducedMotion(true);
    render(<IntroController />);
    settle();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
