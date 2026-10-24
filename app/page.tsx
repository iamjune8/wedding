import { ClosingMessage } from '@/components/ClosingMessage';
import { CountdownSection } from '@/components/countdown/CountdownSection';
import { EventDetails } from '@/components/event/EventDetails';
import { HaldiSection } from '@/components/event/HaldiSection';
import { Envelope } from '@/components/hero/Envelope';
import { IntroController } from '@/components/hero/IntroController';
import { InvitationHero } from '@/components/hero/InvitationHero';
import { InvitationMessage } from '@/components/InvitationMessage';
import { InViewObserver } from '@/components/motion/InViewObserver';
import { RevealObserver } from '@/components/motion/RevealObserver';
import { RsvpSection } from '@/components/rsvp/RsvpSection';
import { ShareActions } from '@/components/share/ShareActions';
import { buildEventViews, coupleNames, toShareSummary } from '@/lib/events';
import { buildInvitationMessage } from '@/lib/share';
import { resolveSiteUrl } from '@/lib/site-url';
import { weddingConfig } from '@/lib/wedding-config';

export const dynamic = 'force-static';

export default function InvitationPage() {
  const siteUrl = resolveSiteUrl(process.env);
  const { nikah, haldi } = buildEventViews(weddingConfig, siteUrl);
  const { copy, couple, site } = weddingConfig;
  const shareMessage = buildInvitationMessage({
    coupleNames: coupleNames(weddingConfig),
    nikah: toShareSummary(nikah),
    haldi: toShareSummary(haldi),
  });

  return (
    <>
      <a className="skip-link" href={`#${nikah.id}`}>
        Skip to the event details
      </a>
      <Envelope
        brideFirstName={couple.bride.firstName}
        groomFirstName={couple.groom.firstName}
        dateLabel={nikah.dateLabel}
      />
      <main id="main">
        <InvitationHero
          copy={copy}
          brideName={couple.bride.fullName}
          groomName={couple.groom.fullName}
          nikah={nikah}
        />
        <InvitationMessage paragraphs={copy.message} />
        <CountdownSection event={nikah} />
        <EventDetails
          event={nikah}
          calendarNote={copy.calendarNote}
          pendingMessage={copy.venuePending}
          share={<ShareActions message={shareMessage} siteUrl={siteUrl} shareTitle={site.title} />}
        />
        <HaldiSection
          event={haldi}
          calendarNote={copy.calendarNote}
          pendingMessage={copy.venuePending}
        />
        <RsvpSection />
      </main>
      <ClosingMessage
        lines={copy.closing}
        brideName={couple.bride.fullName}
        groomName={couple.groom.fullName}
      />
      <IntroController />
      <RevealObserver />
      <InViewObserver />
    </>
  );
}
