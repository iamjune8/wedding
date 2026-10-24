import { ARCH_CROWN, ARCH_FINIAL, OG } from './palette';

/** "N & J" inside a small gold arch: the favicon and home-screen icon. */
export function Monogram({ size }: { readonly size: number }) {
  const unit = size / 64;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: OG.ivory,
        fontFamily: 'Cormorant',
      }}
    >
      <svg
        width={52 * unit}
        height={58 * unit}
        viewBox="0 0 300 335"
        style={{ position: 'absolute', top: 3 * unit, left: 6 * unit }}
      >
        <path d={ARCH_CROWN} fill="none" stroke={OG.gold} strokeWidth="9" />
        <path d="M0 180V335M300 180V335" stroke={OG.gold} strokeWidth="9" />
        <path d={ARCH_FINIAL} fill={OG.gold} transform="translate(-30 -28) scale(1.2)" />
      </svg>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          marginTop: 14 * unit,
          color: OG.charcoal,
        }}
      >
        <span style={{ fontSize: 30 * unit, fontWeight: 500 }}>N</span>
        <span
          style={{
            fontSize: 17 * unit,
            fontStyle: 'italic',
            color: OG.goldInk,
            margin: `0 ${unit}px`,
          }}
        >
          &amp;
        </span>
        <span style={{ fontSize: 30 * unit, fontWeight: 500 }}>J</span>
      </div>
    </div>
  );
}
