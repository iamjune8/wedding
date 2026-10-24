/** An eight-point star (two overlapping squares), the classic khatam of Islamic geometry. */

const STAR =
  'M10 0L7.07 2.93L7.07 7.07L2.93 7.07L0 10L-2.93 7.07L-7.07 7.07L-7.07 2.93L-10 0L-7.07 -2.93L-7.07 -7.07L-2.93 -7.07L0 -10L2.93 -7.07L7.07 -7.07L7.07 -2.93Z';
const CENTRE = 'M0 -2.4L2.4 0L0 2.4L-2.4 0Z';

interface StarMotifProps {
  readonly className?: string;
}

export function StarMotif({ className }: StarMotifProps) {
  return (
    <svg
      className={['star-motif', className].filter(Boolean).join(' ')}
      viewBox="-12 -12 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={STAR} className="star-motif__outline" />
      <path d={CENTRE} className="star-motif__centre" />
    </svg>
  );
}
