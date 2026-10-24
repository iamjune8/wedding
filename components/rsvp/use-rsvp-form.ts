import { useState, type FormEvent, type RefObject } from 'react';
import { checkRsvp, normaliseName, type Attending, type RsvpFieldErrors } from '@/lib/rsvp-shared';

export type RsvpStatus = 'idle' | 'sending' | 'sent' | 'error';

const SERVER_ERRORS: Readonly<Record<string, string>> = {
  'not-configured': 'Replies are not open just yet. Please try again a little later.',
  'too-many': 'We received several replies from you just now. Please try again shortly.',
};
const GENERIC_ERROR = 'Your reply could not be sent. Please check your connection and try again.';

interface ServerReply {
  readonly success?: boolean;
  readonly error?: string;
  readonly fields?: RsvpFieldErrors;
}

async function sendReply(name: string, attending: Attending): Promise<ServerReply> {
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, attending }),
    });
    return ((await response.json().catch(() => null)) as ServerReply | null) ?? {};
  } catch {
    return {};
  }
}

interface FieldRefs {
  readonly nameRef: RefObject<HTMLInputElement | null>;
  readonly attendingRef: RefObject<HTMLInputElement | null>;
}

/** State and submission for the RSVP card: instant validation, then a JSON post. */
export function useRsvpForm({ nameRef, attendingRef }: FieldRefs) {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<Attending | null>(null);
  const [errors, setErrors] = useState<RsvpFieldErrors>({});
  const [status, setStatus] = useState<RsvpStatus>('idle');
  const [serverError, setServerError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = checkRsvp(name, attending);
    setErrors(found);
    if (found.name) return nameRef.current?.focus();
    if (found.attending || !attending) return attendingRef.current?.focus();

    setStatus('sending');
    setServerError('');
    const reply = await sendReply(normaliseName(name), attending);
    if (reply.success) {
      setStatus('sent');
      return;
    }
    setErrors(reply.fields ?? {});
    setServerError(SERVER_ERRORS[reply.error ?? ''] ?? GENERIC_ERROR);
    setStatus('error');
  };

  const startOver = () => {
    setStatus('idle');
    setServerError('');
  };

  return {
    name,
    setName,
    attending,
    setAttending,
    errors,
    status,
    serverError,
    submit,
    startOver,
  } as const;
}
