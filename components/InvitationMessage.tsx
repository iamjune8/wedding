import { SealedEnvelope } from './letter/SealedEnvelope';
import { OrnamentDivider } from './ornaments/OrnamentDivider';
import { StarMotif } from './ornaments/StarMotif';

interface LetterCopy {
  readonly kicker: string;
  readonly openHint: string;
  readonly greeting: string;
  readonly heading: string;
  readonly message: readonly string[];
  readonly storyHeading: string;
  readonly story: readonly string[];
}

interface InvitationMessageProps {
  readonly letter: LetterCopy;
  readonly initials: readonly [string, string];
  readonly signature: string;
}

/**
 * Section B: the invitation letter, delivered in a sealed envelope. Two chapters on one page:
 * "A Sacred Promise" (the Nikah invitation) and the couple's short reflection on their story.
 */
export function InvitationMessage({ letter, initials, signature }: InvitationMessageProps) {
  const [lead, ...rest] = letter.message;

  return (
    <section id="invitation" className="section message-section" aria-labelledby="invitation-title">
      <p className="letter-kicker" data-reveal>
        {letter.kicker}
      </p>
      <SealedEnvelope initials={initials} hint={letter.openHint}>
        <div className="message">
          <StarMotif className="message__star" />
          <p className="message__greeting">{letter.greeting}</p>
          <h2 id="invitation-title" className="message__heading">
            {letter.heading}
          </h2>
          {lead ? <p className="message__lead">{lead}</p> : null}
          {rest.map((paragraph) => (
            <p key={paragraph} className="message__close">
              {paragraph}
            </p>
          ))}
          <OrnamentDivider className="message__divider" />
          <h3 className="message__heading message__heading--story">{letter.storyHeading}</h3>
          {letter.story.map((paragraph) => (
            <p key={paragraph} className="message__story">
              {paragraph}
            </p>
          ))}
          <p className="message__signature">{signature}</p>
        </div>
      </SealedEnvelope>
    </section>
  );
}
