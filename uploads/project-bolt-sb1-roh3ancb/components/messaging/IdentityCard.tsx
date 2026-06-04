'use client';

import { ShieldCheck, Radio, KeyRound } from 'lucide-react';
import type { EarthID } from '@/lib/messaging/types';
import { TrustBadge } from './TrustBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

type IdentityCardSize = 'sm' | 'md' | 'lg';

interface IdentityCardProps {
  identity: EarthID;
  /** Trust level from the viewer's perspective — overrides identity.trustLevel */
  viewerTrustLevel?: EarthID['trustLevel'];
  size?: IdentityCardSize;
  /** Show extra fields: bio, storage preference, keypair placeholder */
  expanded?: boolean;
  /** Highlight ring on the card */
  highlighted?: boolean;
  className?: string;
}

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: { avatar: 'w-7 h-7', name: 'text-xs', handle: 'text-[10px]', initials: 'text-[10px]' },
  md: { avatar: 'w-9 h-9', name: 'text-sm', handle: 'text-xs',    initials: 'text-xs' },
  lg: { avatar: 'w-12 h-12', name: 'text-base', handle: 'text-xs', initials: 'text-sm' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function IdentityCard({
  identity,
  viewerTrustLevel,
  size = 'md',
  expanded = false,
  highlighted = false,
  className = '',
}: IdentityCardProps) {
  const sc = SIZE_CONFIG[size];
  const trust = viewerTrustLevel ?? identity.trustLevel;
  const initials = identity.displayName.slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex items-start gap-3 ${highlighted ? 'ring-1 ring-primary/30 rounded-xl p-2 -m-2' : ''} ${className}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        {identity.avatarUrl ? (
          <img
            src={identity.avatarUrl}
            alt={identity.displayName}
            className={`${sc.avatar} rounded-full object-cover ring-2 ring-border`}
          />
        ) : (
          <div className={`${sc.avatar} rounded-full flex items-center justify-center font-semibold
            ${identity.isLocal
              ? 'bg-primary/10 text-primary border border-dashed border-primary/30'
              : 'bg-secondary text-secondary-foreground'
            }`}
          >
            <span className={sc.initials}>{initials}</span>
          </div>
        )}
        {/* Local indicator dot */}
        {identity.isLocal && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
              bg-amber-500/15 border border-amber-500/30 flex items-center justify-center"
            title="Simulated local identity"
          >
            <Radio className="w-2 h-2 text-amber-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`${sc.name} font-semibold text-foreground truncate`}>
            {identity.displayName}
          </span>
          {identity.isLocal && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full
              bg-amber-500/12 text-amber-300 border border-amber-500/25 flex-shrink-0">
              simulated
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`${sc.handle} text-muted-foreground`}>{identity.handle}</span>
          {trust && trust !== 'self' && (
            <>
              <span className="text-muted-foreground/40 text-[10px]">·</span>
              <TrustBadge level={trust} showLabel size="sm" />
            </>
          )}
        </div>

        {expanded && (
          <div className="mt-2 space-y-1.5">
            {identity.bio && (
              <p className="text-[11px] text-muted-foreground leading-snug">{identity.bio}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck className="w-3 h-3" />
                <span>Storage: {identity.storagePreference}</span>
              </div>
              {identity.keypairPlaceholder && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <KeyRound className="w-3 h-3" />
                  <span>Keypair: pending</span>
                </div>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground/50 font-mono break-all leading-snug">
              {identity.id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Inline avatar (smallest unit — used in message rows, etc.) ───────────────

interface InlineAvatarProps {
  identity: EarthID;
  size?: 'xs' | 'sm' | 'md';
}

const INLINE_SIZES = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
};

export function InlineAvatar({ identity, size = 'sm' }: InlineAvatarProps) {
  const sz = INLINE_SIZES[size];
  const initials = identity.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative flex-shrink-0">
      {identity.avatarUrl ? (
        <img
          src={identity.avatarUrl}
          alt={identity.displayName}
          className={`${sz} rounded-full object-cover ring-2 ring-border`}
        />
      ) : (
        <div className={`${sz} rounded-full flex items-center justify-center font-semibold
          ${identity.isLocal
            ? 'bg-primary/10 text-primary border border-dashed border-primary/30'
            : 'bg-muted text-muted-foreground'
          }`}
        >
          {initials}
        </div>
      )}
      {identity.isLocal && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full
          bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Radio className="w-1.5 h-1.5 text-amber-400" />
        </div>
      )}
    </div>
  );
}
