interface EnvelopeProps {
  readonly brideFirstName: string;
  readonly groomFirstName: string;
  readonly dateLabel: string;
}

/**
 * The opening envelope: the wax seal lifts, the flap opens, the card rises and the envelope
 * fades away into the invitation. Pure CSS (styles/envelope.css), so it plays and clears even
 * without JavaScript. It never takes clicks, is skippable at any moment, and is not shown on a
 * repeat visit or to visitors who prefer reduced motion.
 */
export function Envelope({ brideFirstName, groomFirstName, dateLabel }: EnvelopeProps) {
  return (
    <div className="envelope" aria-hidden="true" data-intro-root>
      <div className="envelope__stage">
        <div className="envelope__body">
          <div className="envelope__back" />
          <div className="envelope__card">
            <p className="envelope__card-kicker">You are invited</p>
            <p className="envelope__card-names">
              {brideFirstName}
              <span className="envelope__card-amp">&amp;</span>
              {groomFirstName}
            </p>
            <p className="envelope__card-date">{dateLabel}</p>
          </div>
          <svg
            className="envelope__front"
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path d="M0 0L50 38L100 0V70H0Z" className="envelope__pocket" />
            <path
              d="M0 70L42 33M100 70L58 33"
              className="envelope__fold"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M0 0L50 38L100 0"
              className="envelope__edge"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="envelope__flap">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              <path d="M0 0H100L50 100Z" className="envelope__flap-face" />
              <path
                d="M0 0L50 100L100 0"
                className="envelope__edge"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="envelope__seal">
            <span>N</span>
            <span className="envelope__seal-amp">&amp;</span>
            <span>J</span>
          </div>
        </div>
        <p className="envelope__caption">An invitation for you</p>
      </div>
    </div>
  );
}
