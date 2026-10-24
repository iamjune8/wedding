interface CountdownNoscriptProps {
  readonly eventName: string;
  readonly dateLabel: string;
  readonly timeLabel: string;
}

/** Shown only when JavaScript is off: the date stays clear even without a live countdown. */
export function CountdownNoscript({ eventName, dateLabel, timeLabel }: CountdownNoscriptProps) {
  return (
    <noscript>
      <p className="countdown-section__noscript">
        The live countdown needs JavaScript. The {eventName} begins on {dateLabel} at {timeLabel}.
      </p>
    </noscript>
  );
}
