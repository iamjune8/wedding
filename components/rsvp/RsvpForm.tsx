'use client';

import { Check, Send } from 'lucide-react';
import { useRef } from 'react';
import { RSVP_NAME_MAX, type Attending } from '@/lib/rsvp-shared';
import { RsvpThanks } from './RsvpThanks';
import { useRsvpForm } from './use-rsvp-form';

const CHOICES: ReadonlyArray<{ value: Attending; title: string; note: string }> = [
  { value: 'yes', title: 'Joyfully attending', note: 'Insha’Allah, I will be there' },
  { value: 'no', title: 'Regretfully unable', note: 'With duas from afar' },
];

/**
 * The reply card. Without JavaScript it is a normal form that posts to /api/rsvp; with
 * JavaScript it validates instantly and shows a thank-you in place.
 */
export function RsvpForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const attendingRef = useRef<HTMLInputElement>(null);
  const form = useRsvpForm({ nameRef, attendingRef });
  const { errors, status } = form;

  if (status === 'sent' && form.attending) {
    return <RsvpThanks name={form.name} attending={form.attending} onChange={form.startOver} />;
  }

  return (
    <form className="rsvp-form" method="post" action="/api/rsvp" noValidate onSubmit={form.submit}>
      <div className="rsvp-field">
        <label htmlFor="rsvp-name" className="rsvp-field__label">
          Your name
        </label>
        <input
          ref={nameRef}
          id="rsvp-name"
          name="name"
          className="rsvp-field__input"
          autoComplete="name"
          maxLength={RSVP_NAME_MAX + 10}
          value={form.name}
          onChange={(event) => form.setName(event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'rsvp-name-error' : undefined}
        />
        {errors.name ? (
          <p id="rsvp-name-error" className="rsvp-field__error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <fieldset
        className="rsvp-choices"
        aria-describedby={errors.attending ? 'rsvp-attending-error' : undefined}
      >
        <legend className="rsvp-field__label">Will you be joining us?</legend>
        <div className="rsvp-choices__grid">
          {CHOICES.map((choice, index) => (
            <label key={choice.value} className="rsvp-choice">
              <input
                ref={index === 0 ? attendingRef : undefined}
                type="radio"
                name="attending"
                value={choice.value}
                className="rsvp-choice__input"
                checked={form.attending === choice.value}
                onChange={() => form.setAttending(choice.value)}
              />
              <span className="rsvp-choice__card">
                <span className="rsvp-choice__tick" aria-hidden="true">
                  <Check strokeWidth={2} />
                </span>
                <span className="rsvp-choice__title">{choice.title}</span>
                <span className="rsvp-choice__note">{choice.note}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.attending ? (
          <p id="rsvp-attending-error" className="rsvp-field__error">
            {errors.attending}
          </p>
        ) : null}
      </fieldset>

      {/* Hidden from people; bots that fill it are ignored by the server. */}
      <div className="rsvp-honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary rsvp-form__send"
        disabled={status === 'sending'}
      >
        <Send strokeWidth={1.5} aria-hidden="true" />
        <span>{status === 'sending' ? 'Sending…' : 'Send my reply'}</span>
      </button>

      <p className="rsvp-form__status" role="status" aria-live="polite">
        {status === 'error' ? form.serverError : ''}
      </p>
    </form>
  );
}
