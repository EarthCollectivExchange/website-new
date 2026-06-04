'use client';

import type { TrustLevel } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

interface TrustBadgeProps {
  level: TrustLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const TRUST_DOT: Record<TrustLevel, string> = {
  self:      'bg-emerald-400',
  trusted:   'bg-sky-400',
  known:     'bg-teal-400',
  community: 'bg-amber-400',
  unknown:   'bg-slate-400',
  blocked:   'bg-red-400',
};

const TRUST_TEXT: Record<TrustLevel, string> = {
  self:      'text-emerald-400',
  trusted:   'text-sky-400',
  known:     'text-teal-400',
  community: 'text-amber-400',
  unknown:   'text-slate-400',
  blocked:   'text-red-400',
};

export function TrustBadge({ level, showLabel = false, size = 'sm' }: TrustBadgeProps) {
  const { t } = useT();
  const TRUST_LABEL: Record<TrustLevel, string> = {
    self:      t('badge.trust.self'),
    trusted:   t('badge.trust.trusted'),
    known:     t('badge.trust.known'),
    community: t('badge.trust.community'),
    unknown:   t('badge.trust.unknown'),
    blocked:   t('badge.trust.blocked'),
  };
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${showLabel ? `${textSize} ${TRUST_TEXT[level]} font-medium` : ''}`}>
      <span className={`${dotSize} rounded-full ${TRUST_DOT[level]} flex-shrink-0`} />
      {showLabel && TRUST_LABEL[level]}
    </span>
  );
}
