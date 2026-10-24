import { normaliseName, type Attending } from '@/lib/rsvp-shared';
import { StarMotif } from '../ornaments/StarMotif';

interface RsvpThanksProps {
  readonly name: string;
  readonly attending: Attending;
  readonly onChange: () => void;
}

/** Shown after a reply is saved; the star draws itself in gold. */
export function RsvpThanks({ name, attending, onChange }: RsvpThanksProps) {
  const cleanName = normaliseName(name);
  const firstName = cleanName.split(' ')[0] || cleanName;
  return (
    <div className="rsvp-thanks" role="status" aria-live="polite">
      <StarMotif className="rsvp-thanks__star" />
      <p className="rsvp-thanks__title">JazakAllah khair, {firstName}</p>
      <p className="rsvp-thanks__message">
        {attending === 'yes'
          ? 'Your reply has been received. We look forward to celebrating with you.'
          : 'Your reply has been received. Thank you for letting us know, and for your duas.'}
      </p>
      <button type="button" className="rsvp-thanks__change" onClick={onChange}>
        Change my reply
      </button>
    </div>
  );
}
