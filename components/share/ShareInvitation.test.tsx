// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShareInvitation } from './ShareInvitation';

const message =
  'Assalamu Alaikum,\n\nYou are warmly invited to the Nikah of Nida Khatib & Juned Shaikh.';
const props = { message, siteUrl: 'https://nida-juned.example', shareTitle: 'Nida & Juned' };

function stubNavigator(overrides: Partial<Navigator>) {
  for (const [key, value] of Object.entries(overrides)) {
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true });
  }
}

afterEach(() => {
  stubNavigator({ share: undefined, clipboard: undefined } as unknown as Partial<Navigator>);
});

describe('ShareInvitation', () => {
  it('links to WhatsApp with the full, encoded message and the public link', () => {
    render(<ShareInvitation {...props} />);
    const link = screen.getByRole('link', { name: /share on whatsapp/i });
    const url = new URL(link.getAttribute('href') ?? '');
    expect(url.origin).toBe('https://wa.me');
    expect(url.searchParams.get('text')).toBe(`${message}\n\nhttps://nida-juned.example`);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('falls back to the current address when no public URL was configured', () => {
    render(<ShareInvitation {...props} siteUrl={null} />);
    const href = screen.getByRole('link', { name: /share on whatsapp/i }).getAttribute('href');
    expect(new URL(href ?? '').searchParams.get('text')).toContain(window.location.origin);
  });

  it('opens the device share menu when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share });
    render(<ShareInvitation {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /more ways to share/i }));
    expect(share).toHaveBeenCalledWith({
      title: 'Nida & Juned',
      text: message,
      url: 'https://nida-juned.example',
    });
  });

  it('does nothing further when the guest cancels the share menu', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share, clipboard: { writeText } as unknown as Clipboard });
    render(<ShareInvitation {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /more ways to share/i }));
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the link when sharing fails for another reason', async () => {
    const share = vi.fn().mockRejectedValue(new Error('not allowed'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share, clipboard: { writeText } as unknown as Clipboard });
    render(<ShareInvitation {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /more ways to share/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('https://nida-juned.example'));
  });

  it('offers copy-link where the share menu is unavailable and confirms success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ clipboard: { writeText } as unknown as Clipboard });
    render(<ShareInvitation {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /copy invitation link/i }));
    expect(writeText).toHaveBeenCalledWith('https://nida-juned.example');
    expect(await screen.findByRole('status')).toHaveTextContent('Invitation link copied.');
  });

  it('explains what to do when copying is not possible', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    stubNavigator({ clipboard: { writeText } as unknown as Clipboard });
    document.execCommand = vi.fn().mockReturnValue(false);
    render(<ShareInvitation {...props} />);
    await userEvent.click(screen.getByRole('button', { name: /copy invitation link/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/could not copy/i);
  });
});
