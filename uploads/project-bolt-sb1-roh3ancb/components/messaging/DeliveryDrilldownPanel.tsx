'use client';

import { X, Radio, UserPlus, CircleCheck as Check } from 'lucide-react';
import type { StorageMode } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

interface DeliveryDrilldownPanelProps {
  storageMode: StorageMode;
  recipientCount: number;
  relayDeliveryStatus?: string;
  onInviteMember?: () => void;
  onClose: () => void;
}

type DeliveryStage = 'local' | 'no_recipient' | 'ready' | 'queued' | 'failed';

function deriveStage(
  storageMode: StorageMode,
  recipientCount: number,
  relayStatus?: string,
): DeliveryStage {
  if (storageMode === 'local_only') return 'local';
  if (recipientCount === 0) return 'no_recipient';
  if (relayStatus === 'failed') return 'failed';
  if (relayStatus === 'queued') return 'queued';
  return 'ready';
}

function StageStep({ done, label, prototype }: { done: boolean; label: string; prototype?: boolean }) {
  return (
    <div className="flex items-center gap-phi-2">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={done
          ? { background: 'rgba(97,214,178,0.12)', border: '1px solid rgba(97,214,178,0.22)' }
          : prototype
            ? { background: 'rgba(5,24,38,0.40)', border: '1px dashed rgba(120,180,220,0.14)' }
            : { background: 'rgba(5,24,38,0.52)', border: '1px solid var(--qlpa-divider-hairline)' }
        }
      >
        {done
          ? <Check className="w-3 h-3" style={{ color: 'rgba(97,214,178,0.88)' }} />
          : <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(140,180,220,0.22)' }} />
        }
      </div>
      <p className="text-xs" style={{
        color: done ? 'rgba(210,240,255,0.88)' : prototype ? 'rgba(120,160,200,0.36)' : 'rgba(140,180,220,0.50)',
        fontWeight: done ? 500 : 400,
        fontStyle: prototype ? 'italic' : undefined,
      }}>
        {label}
      </p>
    </div>
  );
}

export function DeliveryDrilldownPanel({
  storageMode,
  recipientCount,
  relayDeliveryStatus,
  onInviteMember,
  onClose,
}: DeliveryDrilldownPanelProps) {
  const { t } = useT();
  const stage = deriveStage(storageMode, recipientCount, relayDeliveryStatus);
  const isLocal = stage === 'local';
  const needsRecipient = stage === 'no_recipient';

  // Muted gold for transport/queued states (not warning-orange)
  const STAGE_COPY: Record<DeliveryStage, { headline: string; body: string; color: string }> = {
    local:        { headline: t('delivery.storedPrivately'),   body: t('delivery.localMessages'),        color: 'rgba(80,200,240,0.88)' },
    no_recipient: { headline: t('delivery.waitingJoin'),       body: t('delivery.inviteTrustedUnlock'),  color: 'rgba(218,190,108,0.88)' },
    ready:        { headline: t('delivery.readyForDelivery'),  body: t('delivery.envelopeSealed'),       color: 'rgba(97,214,178,0.88)' },
    queued:       { headline: t('delivery.queued'),            body: t('delivery.queuedDesc'),           color: 'rgba(218,190,108,0.88)' },
    failed:       { headline: t('delivery.deliveryFailed'),    body: t('delivery.failedDesc'),           color: 'rgba(255,130,130,0.88)' },
  };

  const copy = STAGE_COPY[stage];

  const recipientLabel = recipientCount === 1
    ? t('delivery.recipientsAddressed').replace('{n}', '1')
    : t('delivery.recipientsAddressedPlural').replace('{n}', String(recipientCount));

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-phi-3 py-phi-2"
        style={{ borderBottom: '1px solid var(--qlpa-divider-soft)' }}
      >
        <div className="flex items-center gap-phi-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(80,200,240,0.08)', border: '1px solid var(--qlpa-divider-hairline)' }}
          >
            <Radio className="w-4 h-4" style={{ color: 'rgba(80,200,240,0.80)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('delivery.panelTitle')}</h3>
            <p className="text-[10px] text-muted-foreground">{t('delivery.whereGoing')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          aria-label={t('common.close')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-phi-3 py-phi-3 space-y-phi-3" style={{ touchAction: 'pan-y' }}>
        {/* Stage card */}
        <div className="glass-card rounded-2xl p-phi-3">
          <p className="text-sm font-semibold leading-snug" style={{ color: copy.color }}>{copy.headline}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{copy.body}</p>
          {recipientCount > 0 && (
            <p className="text-[11px] text-muted-foreground mt-2">{recipientLabel}</p>
          )}
        </div>

        {/* Journey steps */}
        <div className="glass-card rounded-2xl p-phi-3 space-y-phi-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-phi-2">
            {t('delivery.journey')}
          </p>
          <StageStep done label={t('delivery.writtenEncrypted')} />
          <div className="ml-2.5 w-0.5 h-3 bg-border rounded-full" />
          <StageStep done={recipientCount > 0} label={t('delivery.recipientAddressed')} />
          <div className="ml-2.5 w-0.5 h-3 bg-border rounded-full" />
          <StageStep done={stage === 'ready'} label={t('delivery.envelopeSealedStep')} />
          <div className="ml-2.5 w-0.5 h-3 bg-border rounded-full" />
          <StageStep done={false} prototype label={t('delivery.deliveredFuture')} />
        </div>

        {/* CTA — invite member if no recipient */}
        {needsRecipient && onInviteMember && (
          <button
            onClick={onInviteMember}
            className="w-full flex items-center justify-center gap-phi-2 py-phi-2 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] touch-manipulation"
            style={{
              background: 'linear-gradient(180deg, rgba(80,200,240,0.22), rgba(24,108,138,0.22))',
              border: '1px solid var(--qlpa-surface-border-medium)',
              color: 'rgba(232,250,255,0.92)',
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('delivery.inviteSomeoneTrusted')}</span>
          </button>
        )}

        {/* Local-only explanation */}
        {isLocal && (
          <div
            className="px-phi-2 py-phi-2 rounded-2xl"
            style={{ background: 'rgba(80,200,240,0.05)', border: '1px solid var(--qlpa-divider-soft)' }}
          >
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(140,210,240,0.85)' }}>
              <strong>{t('delivery.localOnlyLabel')}</strong> {t('delivery.localOnlyExplain')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
