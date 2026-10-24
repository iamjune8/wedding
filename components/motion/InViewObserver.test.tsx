// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InViewObserver } from './InViewObserver';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('InViewObserver', () => {
  it('flags regions as on or off screen so their loops can rest', () => {
    let callback: Callback = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Callback) {
          callback = cb;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    const region = document.createElement('section');
    region.setAttribute('data-play-in-view', '');
    document.body.append(region);

    const { unmount } = render(<InViewObserver />);
    callback([{ target: region, isIntersecting: true }]);
    expect(region.dataset.inView).toBe('true');
    callback([{ target: region, isIntersecting: false }]);
    expect(region.dataset.inView).toBe('false');

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('does nothing where IntersectionObserver is unavailable', () => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
    const region = document.createElement('section');
    region.setAttribute('data-play-in-view', '');
    document.body.append(region);
    render(<InViewObserver />);
    expect(region.dataset.inView).toBeUndefined();
  });
});
