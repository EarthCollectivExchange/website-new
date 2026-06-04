'use client';

import { Lock, Radio, ShieldCheck } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import { ACCESS_STATE_META, type ConversationAccessState } from '@/lib/qlpa/trustGraph';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrivacyStatus {
  label: string;
  detail: string;
  level: 'strong' | 'partial' | 'none';
}

export interface DeliveryStatus {
  label: string;
  detail: string;
  level: 'ready' | 'waiting' | 'local' | 'failed';
}

export interface ConsentStatusInfo {
  label: string;
  detail: string;
  level: 'allowed' | 'pending' | 'blocked';
}

interface JourneyStatusBarProps {
  privacyStatus: PrivacyStatus;
  deliveryStatus: DeliveryStatus;
  consentStatus: ConsentStatusInfo;
  onOpenPrivacy: () => void;
  onOpenDelivery: () => void;
  onOpenConsent: () => void;
}

// ─── Level → ConversationAccessState mapping ──────────────────────────────────
// Maps component pill level variants to canonical access states.
// All color classes are sourced from ACCESS_STATE_META — no inline HSL.

function privacyLevelToState(level: PrivacyStatus['level']): ConversationAccessState {
  if (level === 'strong') return 'protected';
  if (level === 'partial') return 'pending';
  return 'blocked';
}

function deliveryLevelToState(level: DeliveryStatus['level']): ConversationAccessState {
  if (level === 'ready') return 'ready';
  if (level === 'waiting') return 'pending';
  if (level === 'local') return 'allowed';
  return 'blocked';
}

function consentLevelToState(level: ConsentStatusInfo['level']): ConversationAccessState {
  if (level === 'allowed') return 'allowed';
  if (level === 'pending') return 'pending';
  return 'blocked';
}

// ─── Single pill ──────────────────────────────────────────────────────────────

function StatusPill({
  icon,
  label,
  accessState,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  accessState: ConversationAccessState;
  onClick: () => void;
}) {
  const { colorClass } = ACCESS_STATE_META[accessState];

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1 px-2 h-[1.875rem] md:h-8
        rounded-full border text-[9px] md:text-[10px] font-semibold
        whitespace-nowrap backdrop-blur-sm min-w-0
        transition-all duration-150 ease-in-out active:scale-95 touch-manipulation pill-enter
        hover:opacity-85 ${colorClass}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate max-w-[4.5rem] md:max-w-[6rem]">{label}</span>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function JourneyStatusBar({
  privacyStatus,
  deliveryStatus,
  consentStatus,
  onOpenPrivacy,
  onOpenDelivery,
  onOpenConsent,
}: JourneyStatusBarProps) {
  return (
    <div className="flex items-center justify-between gap-1.5 px-phi-4 backdrop-blur-xl flex-shrink-0"
      style={{ minHeight: '2.75rem', background: 'hsl(212 48% 7% / 0.28)', borderBottom: '1px solid rgba(80,200,240,0.06)' }}>
      <StatusPill
        icon={<Lock className="w-2.5 h-2.5" />}
        label={privacyStatus.label}
        accessState={privacyLevelToState(privacyStatus.level)}
        onClick={onOpenPrivacy}
      />
      <StatusPill
        icon={<Radio className="w-2.5 h-2.5" />}
        label={deliveryStatus.label}
        accessState={deliveryLevelToState(deliveryStatus.level)}
        onClick={onOpenDelivery}
      />
      <StatusPill
        icon={<ShieldCheck className="w-2.5 h-2.5" />}
        label={consentStatus.label}
        accessState={consentLevelToState(consentStatus.level)}
        onClick={onOpenConsent}
      />
    </div>
  );
}

// ─── Status derivation helpers ────────────────────────────────────────────────

import type { ConversationSovereigntySettings, StorageMode } from '@/lib/messaging/types';

export function derivePrivacyStatus(storageMode: StorageMode, t: (key: string) => string): PrivacyStatus {
  switch (storageMode) {
    case 'local_only':
      return { label: t('chips.protected'), detail: t('delivery.advanced.privateDetail'), level: 'strong' };
    case 'encrypted_relay':
      return { label: t('chips.protected'), detail: t('delivery.advanced.encryptedDetail'), level: 'strong' };
    case 'encrypted_backup':
      return { label: t('chips.backedUp'), detail: t('delivery.advanced.backedUpDetail'), level: 'partial' };
    default:
      return { label: t('delivery.advanced.unknown'), detail: t('delivery.advanced.unknownDetail'), level: 'none' };
  }
}

export function deriveDeliveryStatus(
  recipientCount: number,
  storageMode: StorageMode,
  t: (key: string) => string,
  relayDeliveryStatus?: string,
): DeliveryStatus {
  if (storageMode === 'local_only') {
    return { label: t('chips.local'), detail: t('delivery.advanced.localOnlyDetail'), level: 'local' };
  }
  if (recipientCount === 0) {
    return { label: t('chips.waiting'), detail: t('delivery.advanced.noRecipientDetail'), level: 'waiting' };
  }
  if (relayDeliveryStatus === 'ready_for_relay') {
    return { label: t('chips.ready'), detail: t('delivery.advanced.readyToRelay'), level: 'ready' };
  }
  return { label: t('chips.ready'), detail: t('delivery.advanced.recipientsAddressed'), level: 'ready' };
}

export function deriveConsentStatus(settings: ConversationSovereigntySettings, t: (key: string) => string): ConsentStatusInfo {
  if (settings.isBlocked) {
    return { label: t('chips.blocked'), detail: t('delivery.simple.blockedDetail'), level: 'blocked' };
  }
  if (settings.requireApproval) {
    return { label: t('chips.waiting'), detail: t('delivery.simple.waitingDetail'), level: 'pending' };
  }
  return { label: t('chips.allowed'), detail: t('delivery.simple.readyDetail'), level: 'allowed' };
}
