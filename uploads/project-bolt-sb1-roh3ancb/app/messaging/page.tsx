'use client';

import { GitBranch, ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';

export default function MessagingPlaceholder() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
      `}</style>

      {/* Blueprint grid background */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: 'hsl(216 28% 5%)',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(hsl(192 50% 50% / 0.035) 1px, transparent 1px),
            linear-gradient(90deg, hsl(192 50% 50% / 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100svh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: 480, width: '100%',
          background: 'hsl(216 28% 8% / 0.90)',
          border: '1px solid hsl(192 50% 50% / 0.12)',
          borderRadius: 16,
          padding: '40px 36px',
          textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            width: 52, height: 52,
            borderRadius: 12,
            background: 'hsl(192 78% 58% / 0.10)',
            border: '1px solid hsl(192 78% 58% / 0.20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <GitBranch size={22} style={{ color: 'hsl(192 78% 62%)' }} />
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px',
            background: 'hsl(192 60% 50% / 0.10)',
            border: '1px solid hsl(192 60% 50% / 0.18)',
            borderRadius: 99,
            marginBottom: 16,
          }}>
            <Layers size={10} style={{ color: 'hsl(192 70% 60%)' }} />
            <span style={{
              fontSize: 10, fontFamily: 'monospace',
              letterSpacing: '0.10em', color: 'hsl(192 70% 62%)',
              fontWeight: 600,
            }}>
              QLPA MATRIX · SOURCE BASE
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 20, fontWeight: 700,
            color: 'hsl(210 20% 90%)',
            letterSpacing: '-0.02em',
            marginBottom: 10,
            lineHeight: 1.25,
          }}>
            Messaging Product UI
          </h1>

          {/* Body */}
          <p style={{
            fontSize: 13,
            color: 'hsl(210 15% 52%)',
            lineHeight: 1.70,
            marginBottom: 28,
          }}>
            The Messaging product UI has been isolated from this Source Base.
            This route is a placeholder. The active EarthOS Messaging product
            is maintained in the product branch.
          </p>

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'hsl(192 50% 50% / 0.08)',
            marginBottom: 24,
          }} />

          {/* Detail */}
          <div style={{
            background: 'hsl(216 28% 10% / 0.70)',
            border: '1px solid hsl(192 50% 50% / 0.09)',
            borderRadius: 8,
            padding: '14px 16px',
            textAlign: 'left',
            marginBottom: 28,
          }}>
            <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'hsl(192 60% 50%)', letterSpacing: '0.08em', marginBottom: 8 }}>
              ISOLATION STATUS
            </p>
            {[
              { label: 'Pass', value: 'Source Base Pass 003' },
              { label: 'Route', value: 'app/messaging — stub' },
              { label: 'UI', value: 'components/messaging — pending archive' },
              { label: 'Runtime', value: 'lib/messaging — pending archive' },
              { label: 'Foundation', value: 'lib/qlpa — preserved canonical' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'hsl(210 15% 38%)', flexShrink: 0, minWidth: 80 }}>{label}</span>
                <span style={{ fontSize: 11, color: 'hsl(210 15% 54%)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Back link */}
          <Link
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: 'hsl(192 60% 50% / 0.10)',
              border: '1px solid hsl(192 60% 50% / 0.22)',
              borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              color: 'hsl(192 70% 68%)',
              textDecoration: 'none',
              transition: 'opacity 180ms ease',
            }}
          >
            <ArrowLeft size={14} />
            Source Base Index
          </Link>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: 32, fontSize: 10, fontFamily: 'monospace',
          letterSpacing: '0.09em', color: 'hsl(210 15% 26%)',
        }}>
          EarthOS QLPA Matrix Source Code Base · canonical-v1
        </p>
      </div>
    </>
  );
}
