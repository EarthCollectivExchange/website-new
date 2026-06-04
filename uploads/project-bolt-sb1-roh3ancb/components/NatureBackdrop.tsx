'use client';

import { useEffect, useRef } from 'react';

interface NatureBackdropProps {
  intensity?: 'light' | 'medium' | 'deep';
  onReady?: () => void;
}

export function NatureBackdrop({ intensity = 'medium', onReady }: NatureBackdropProps) {
  const sunriseOpacity = intensity === 'light' ? 0.07 : intensity === 'medium' ? 0.09 : 0.11;
  const glowOpacity    = intensity === 'light' ? 0.03 : intensity === 'medium' ? 0.04 : 0.05;
  const warmOpacity    = intensity === 'light' ? 0.04 : intensity === 'medium' ? 0.06 : 0.08;

  // Ref so parent re-renders never silently swap the handler between load-start
  // and load-end — the ref always points to the latest callback.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    // Image may already be in browser cache and complete before React attached
    // the onLoad handler. Check on mount and fire immediately if so.
    if (img.complete && img.naturalWidth > 0) {
      onReadyRef.current?.();
    }
  }, []);

  return (
    <div aria-hidden className="earthos-backdrop">

      {/* ── 1. Solid void base — shows while image loads ── */}
      <div className="absolute inset-0 earthos-backdrop__void" />

      {/* ── 2. Real photo layer — responsive picture with WebP/PNG sources ── */}
      <picture
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          overflow: 'hidden',
        }}
      >
        {/* Desktop landscape — WebP */}
        <source
          media="(orientation: landscape)"
          type="image/webp"
          srcSet="/earthos/bg/earth-space-desktop-1672.webp"
        />
        {/* Desktop landscape — PNG fallback */}
        <source
          media="(orientation: landscape)"
          srcSet="/assets/earthos/visuals/earthos-space-sunrise-landscape.png"
        />
        {/* Mobile portrait — WebP */}
        <source
          type="image/webp"
          srcSet="/earthos/bg/earth-space-mobile-941.webp"
        />
        {/* Mobile portrait — PNG fallback (also default img src) */}
        <img
          ref={imgRef}
          src="/assets/earthos/visuals/earthos-space-sunrise-portrait.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          onLoad={() => onReadyRef.current?.()}
          onError={() => onReadyRef.current?.()}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center bottom',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </picture>

      {/* ── 3. Gentle top vignette — edge framing only ── */}
      <div className="absolute inset-0 earthos-vignette-top" />

      {/* ── 4. Gentle bottom vignette — minimal, 0.06, 12% extent ── */}
      <div className="absolute inset-0 earthos-vignette-bottom" />

      {/* ── 5. Sunrise gold breath — anchored to Earth horizon zone ── */}
      {/*    Landscape: horizon sits ~55-65% from top. Portrait: ~68%.   */}
      <div
        className="absolute animate-breathe-glow pointer-events-none"
        style={{
          bottom: '28%',
          right: '8%',
          width: '50%',
          height: '40%',
          background: `radial-gradient(ellipse 90% 70% at 80% 60%, hsl(36 88% 54% / ${sunriseOpacity}) 0%, transparent 65%)`,
        }}
      />

      {/* ── 6. Atmosphere rim glow — soft aqua along horizon edge ── */}
      <div
        className="absolute animate-breathe pointer-events-none"
        style={{
          left: '61.8%',
          top: '38.2%',
          width: '1px',
          height: '1px',
          boxShadow: `0 0 140px 70px hsl(194 72% 52% / ${glowOpacity})`,
          borderRadius: '50%',
        }}
      />

      {/* ── 7. Warm lower-center glow — counteracts void darkness at bottom ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '35%',
          background: `radial-gradient(ellipse 100% 80% at 50% 100%, hsl(194 60% 24% / ${warmOpacity}) 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}
