import { revealDelay } from '@/lib/style';
import { OrnamentDivider } from './ornaments/OrnamentDivider';
import { StarMotif } from './ornaments/StarMotif';

interface InvitationMessageProps {
  readonly paragraphs: readonly string[];
}

/** Section B: the invitation letter. */
export function InvitationMessage({ paragraphs }: InvitationMessageProps) {
  const [lead, ...rest] = paragraphs;

  return (
    <section id="invitation" className="section message-section" aria-labelledby="invitation-title">
      <h2 id="invitation-title" className="sr-only">
        Invitation
      </h2>
      <div className="message">
        <div data-reveal="ornament">
          <StarMotif className="message__star" />
        </div>
        {lead ? (
          <p className="message__lead" data-reveal style={revealDelay(80)}>
            {lead}
          </p>
        ) : null}
        {rest.map((paragraph, index) => (
          <p
            key={paragraph}
            className="message__close"
            data-reveal
            style={revealDelay(160 + index * 80)}
          >
            {paragraph}
          </p>
        ))}
        <OrnamentDivider reveal className="message__divider" />
      </div>
    </section>
  );
}
