import { cssVars } from '@/lib/style';

/* A Mughal fanoos: domed cap, a six-sided body with a pierced window, and a tassel. */
const CAP = 'M14 30C14 22 20 16 24 12C28 16 34 22 34 30Z';
const BODY = 'M10 34H38L42 46V72L38 84H10L6 72V46Z';
const WINDOW = 'M24 40C30 46 34 52 34 60C34 70 29 76 24 78C19 76 14 70 14 60C14 52 18 46 24 40Z';
const BASE = 'M12 86H36L30 94H18Z';
const TASSEL = 'M24 94V100M21 100H27L25.5 112H22.5Z';

interface LanternProps {
  /** Chain length above the lantern, in rem. */
  readonly drop: number;
  /** Seconds of offset so the pair never swings in step. */
  readonly delay: number;
  readonly side: 'start' | 'end';
}

/** A hanging lantern that sways gently while the opening is on screen. Decorative only. */
export function Lantern({ drop, delay, side }: LanternProps) {
  return (
    <div
      className={`lantern lantern--${side}`}
      style={cssVars({ '--drop': `${drop}rem`, '--sway-delay': `${delay}s` })}
      aria-hidden="true"
    >
      <span className="lantern__chain" />
      <svg className="lantern__body" viewBox="0 0 48 112" focusable="false">
        <circle cx="24" cy="6" r="4" className="lantern__ring" />
        <path d={CAP} className="lantern__metal" />
        <path d="M24 2V12" className="lantern__wire" />
        <path d="M8 30H40V34H8Z" className="lantern__metal" />
        <path d={BODY} className="lantern__glass" />
        <path d={WINDOW} className="lantern__flame" />
        <path d="M24 34V84M6 46H42M6 72H42" className="lantern__wire" />
        <path d={BODY} className="lantern__frame" />
        <path d={BASE} className="lantern__metal" />
        <path d={TASSEL} className="lantern__metal" />
      </svg>
    </div>
  );
}
