import Image from 'next/image';

const LOGO_SRC = '/assets/earthos/logo/earthos-symbol-primary-normalized-1024.png';

// ─── Symbol-only ──────────────────────────────────────────────────────────────
// Renders the transparent PNG exactly.
// No shadow, blur, filter, rotation, background, or padding compensation.

interface EarthOSLogoProps {
  size?: number;
  className?: string;
}

export function EarthOSLogo({ size = 48, className = '' }: EarthOSLogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="EarthOS"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}

// ─── Tile wrapper ─────────────────────────────────────────────────────────────
// Canonical glass rounded-square tile. Centers symbol with grid/place-items.
// No shadow, blur, filter, or rotation applied to the PNG inside.

interface EarthOSLogoTileProps {
  /** Outer tile dimension in px. */
  tileSize?: number;
  /** Symbol dimension in px. */
  symbolSize?: number;
  /** Show the green local-first badge dot in the bottom-right corner. */
  badge?: boolean;
  className?: string;
}

export function EarthOSLogoTile({
  tileSize = 89,
  symbolSize = 72,
  badge = false,
  className = '',
}: EarthOSLogoTileProps) {
  return (
    <div className={`relative inline-flex ${className}`} style={{ width: tileSize, height: tileSize }}>
      <div
        style={{
          width: tileSize,
          height: tileSize,
          borderRadius: Math.round(tileSize * 0.28),
          display: 'grid',
          placeItems: 'center',
          background: 'hsl(212 48% 11% / 0.70)',
          border: '1px solid hsl(194 55% 70% / 0.18)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 1px 0 hsl(192 70% 80% / 0.10) inset, 0 8px 32px hsl(192 65% 40% / 0.20)',
        }}
      >
        <Image
          src={LOGO_SRC}
          alt="EarthOS"
          width={symbolSize}
          height={symbolSize}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      {badge && (
        <div
          className="absolute -bottom-1 -right-1 rounded-full border-2 grid place-items-center"
          style={{
            width: 20,
            height: 20,
            background: 'hsl(158 58% 46%)',
            borderColor: 'hsl(218 40% 4%)',
          }}
        >
          <div className="w-2 h-2 rounded-full bg-white/90" />
        </div>
      )}
    </div>
  );
}
