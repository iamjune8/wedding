// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RevealObserver } from './RevealObserver';

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

let observerCallback: ObserverCallback | undefined;
const observed: Element[] = [];

class FakeIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback;
  }
  observe = (element: Element) => observed.push(element);
  unobserve = vi.fn();
  disconnect = vi.fn();
}

function addRevealElement(id: string, top: number) {
  const element = document.createElement('div');
  element.id = id;
  element.dataset.reveal = '';
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
  document.body.append(element);
  return element;
}

beforeEach(() => {
  observed.length = 0;
  observerCallback = undefined;
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('data-reveal-ready');
});

describe('RevealObserver', () => {
  it('reveals what is already on screen and watches the rest', () => {
    const onScreen = addRevealElement('on-screen', 100);
    const below = addRevealElement('below', 2000);
    render(<RevealObserver />);

    expect(document.documentElement.hasAttribute('data-reveal-ready')).toBe(true);
    expect(onScreen.dataset.revealed).toBe('true');
    expect(below.dataset.revealed).toBeUndefined();
    expect(observed).toEqual([below]);
  });

  it('also reveals anything scrolled past, so fast scrolling never leaves gaps', () => {
    const skipped = addRevealElement('skipped', 2000);
    const current = addRevealElement('current', 2600);
    render(<RevealObserver />);

    skipped.getBoundingClientRect = () => ({ top: -900 }) as DOMRect;
    current.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
    observerCallback?.([]);

    expect(skipped.dataset.revealed).toBe('true');
    expect(current.dataset.revealed).toBe('true');
  });

  it('never hides anything for visitors who prefer reduced motion', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    addRevealElement('below', 2000);
    render(<RevealObserver />);
    expect(document.documentElement.hasAttribute('data-reveal-ready')).toBe(false);
  });

  it('leaves content visible where IntersectionObserver is unavailable', () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('IntersectionObserver', undefined);
    Reflect.deleteProperty(window, 'IntersectionObserver');
    addRevealElement('below', 2000);
    render(<RevealObserver />);
    expect(document.documentElement.hasAttribute('data-reveal-ready')).toBe(false);
  });
});
