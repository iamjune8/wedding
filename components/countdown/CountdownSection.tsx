import type { EventView } from '@/lib/events';
import { revealDelay } from '@/lib/style';
import { Countdown } from './Countdown';
import { CountdownNoscript } from './CountdownNoscript';

interface CountdownSectionProps {
  readonly event: EventView;
}

/** Section C: the live countdown to the Nikah. */
export function CountdownSection({ event }: CountdownSectionProps) {
  return (
    <section id="countdown" className="section countdown-section" aria-labelledby="countdown-title">
      <div className="section__inner">
        <h2 id="countdown-title" className="section-subtitle" data-reveal>
          {event.countdown.heading}
        </h2>
        <p className="countdown-section__when" data-reveal style={revealDelay(120)}>
          <time dateTime={event.startIsoWithOffset}>{event.dateLabel}</time>
          <span aria-hidden="true"> · </span>
          <span className="sr-only">, </span>
          {event.timeLabel}
        </p>
        <div className="countdown-section__timer" data-reveal style={revealDelay(240)}>
          <Countdown
            targetMs={event.startsAtMs}
            dayEndMs={event.dayEndsAtMs}
            label={`Time remaining until the ${event.shortTitle}`}
            reachedMessage={event.countdown.reachedMessage}
            pastMessage={event.countdown.pastMessage}
          />
        </div>
        <CountdownNoscript
          eventName={event.shortTitle}
          dateLabel={event.dateLabel}
          timeLabel={event.timeLabel}
        />
      </div>
    </section>
  );
}
