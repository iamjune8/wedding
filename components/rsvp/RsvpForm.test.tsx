// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RsvpForm } from './RsvpForm';

const respond = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RsvpForm', () => {
  it('is a real form that also works without JavaScript', () => {
    const { container } = render(<RsvpForm />);
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('action', '/api/rsvp');
    expect(form).toHaveAttribute('method', 'post');
    expect(screen.getByLabelText('Your name')).toHaveAttribute('name', 'name');
    expect(screen.getByRole('radio', { name: /joyfully attending/i })).toHaveAttribute(
      'value',
      'yes',
    );
  });

  it('asks for a name and an answer before sending, and focuses the problem', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<RsvpForm />);

    await userEvent.click(screen.getByRole('button', { name: /send my reply/i }));
    expect(screen.getByText('Please tell us your name.')).toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toHaveFocus();
    expect(screen.getByLabelText('Your name')).toHaveAttribute('aria-invalid', 'true');

    await userEvent.type(screen.getByLabelText('Your name'), 'Ayesha Khan');
    await userEvent.click(screen.getByRole('button', { name: /send my reply/i }));
    expect(screen.getByText('Please let us know if you can attend.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the reply and thanks the guest by first name', async () => {
    const fetchMock = respond(200, { success: true });
    vi.stubGlobal('fetch', fetchMock);
    render(<RsvpForm />);

    await userEvent.type(screen.getByLabelText('Your name'), '  Ayesha   Khan ');
    await userEvent.click(screen.getByRole('radio', { name: /joyfully attending/i }));
    await userEvent.click(screen.getByRole('button', { name: /send my reply/i }));

    expect(await screen.findByText('JazakAllah khair, Ayesha')).toBeInTheDocument();
    expect(screen.getByText(/We look forward to celebrating with you/)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/rsvp');
    expect(JSON.parse(String(init.body))).toEqual({ name: 'Ayesha Khan', attending: 'yes' });
  });

  it('acknowledges a guest who cannot attend, and lets them change the reply', async () => {
    vi.stubGlobal('fetch', respond(200, { success: true }));
    render(<RsvpForm />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Imran');
    await userEvent.click(screen.getByRole('radio', { name: /regretfully unable/i }));
    await userEvent.click(screen.getByRole('button', { name: /send my reply/i }));

    expect(await screen.findByText(/Thank you for letting us know/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /change my reply/i }));
    expect(screen.getByLabelText('Your name')).toHaveValue('Imran');
  });

  it('explains gracefully when replies are not open yet', async () => {
    vi.stubGlobal('fetch', respond(503, { success: false, error: 'not-configured' }));
    render(<RsvpForm />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Ayesha');
    await userEvent.click(screen.getByRole('radio', { name: /joyfully attending/i }));
    await userEvent.click(screen.getByRole('button', { name: /send my reply/i }));
    expect(await screen.findByText(/Replies are not open just yet/)).toBeInTheDocument();
  });

  it('shows field messages returned by the server', async () => {
    vi.stubGlobal(
      'fetch',
      respond(400, {
        success: false,
        error: 'invalid',
        fields: { name: 'Please tell us your name.' },
      }),
    );
    render(<RsvpForm />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Ayesha');
    await userEvent.click(screen.getByRole('radio', { name: /joyfully attending/i }));
    await userEvent.click(screen.getByRole('button', { name: /send my reply/i }));
    expect(await screen.findByText('Please tell us your name.')).toBeInTheDocument();
  });

  it('offers a retry when the connection fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<RsvpForm />);
    await userEvent.type(screen.getByLabelText('Your name'), 'Ayesha');
    await userEvent.click(screen.getByRole('radio', { name: /joyfully attending/i }));
    await userEvent.click(screen.getByRole('button', { name: /send my reply/i }));
    expect(await screen.findByText(/could not be sent/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send my reply/i })).toBeEnabled();
  });
});
