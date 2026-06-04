'use client';

import { format } from 'date-fns';
import { X, Lock, LockOpen, ShieldCheck, Database, Clock, Eye, TriangleAlert as AlertTriangle, Radio, Ban, CircleCheck as CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import type { Message, MessageEncryptionStatus } from '@/lib/messaging/types';
import {
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  DELIVERY_STATUS_BG,
} from '@/lib/messaging/relay';
import { useT } from '@/lib/i18n/useT';

// Label map color configs (non-translatable visual states)
const ENCRYPTION_COLORS: Record<MessageEncryptionStatus, string> = {
  local_encrypted:  'text-emerald-600',
  prototype_key:    'text-amber-500',
  unencrypted:      'text-muted-foreground',
  integrity_failed: 'text-destructive',
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface MessageDetailDrawerProps {
  message: Message;
  onClose: () => void;
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
  valueColor,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex-shrink-0 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-xs leading-snug break-words ${mono ? 'font-mono' : ''} ${valueColor ?? 'text-foreground'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Delivery timeline ────────────────────────────────────────────────────────

interface TimelineStep {
  label: string;
  detail: string;
  done: boolean;
  active?: boolean;
}

function DeliveryTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          {/* Spine */}
          <div className="flex flex-col items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
              ${step.done
                ? step.active
                  ? 'bg-emerald-100 border-2 border-emerald-400'
                  : 'bg-emerald-100 border border-emerald-300'
                : 'bg-muted border border-border'
              }`}
            >
              {step.done
                ? <CheckCircle2 className={`w-2.5 h-2.5 ${step.active ? 'text-emerald-600' : 'text-emerald-500'}`} />
                : <Circle className="w-2.5 h-2.5 text-muted-foreground/40" />
              }
            </div>
            {i < steps.length - 1 && (
              <div className={`w-px flex-1 my-0.5 ${step.done ? 'bg-emerald-200' : 'bg-border'}`} style={{ minHeight: 16 }} />
            )}
          </div>
          {/* Content */}
          <div className={`pb-3 flex-1 min-w-0 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
            <p className={`text-xs font-medium leading-snug ${step.done ? (step.active ? 'text-emerald-700' : 'text-foreground') : 'text-muted-foreground/50'}`}>
              {step.label}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
              {step.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MessageDetailDrawer({ message, onClose }: MessageDetailDrawerProps) {
  const { t } = useT();
  const shortHash = message.integrityHash.startsWith('sha256::')
    ? `sha256::${message.integrityHash.slice(8, 20)}…`
    : message.integrityHash.slice(0, 20) + '…';

  const isRealHash = message.integrityHash.startsWith('sha256::');
  const encStatus = message.encryptionStatus ?? 'unencrypted';
  const encColor = ENCRYPTION_COLORS[encStatus];
  const envelope = message.relayEnvelope;

  const encLabelKey: Record<MessageEncryptionStatus, string> = {
    local_encrypted:  'messageDetail.encLocalEncrypted',
    prototype_key:    'messageDetail.encPrototypeKey',
    unencrypted:      'messageDetail.encUnencrypted',
    integrity_failed: 'messageDetail.encIntegrityFailed',
  };

  const storageLabelKey: Record<string, string> = {
    local_only:       'messageDetail.storageLocalOnly',
    encrypted_relay:  'messageDetail.storageEncryptedRelay',
    encrypted_backup: 'messageDetail.storageEncryptedBackup',
  };

  const consentLabelKey: Record<string, string> = {
    allowed:   'messageDetail.consentAllowed',
    pending:   'messageDetail.consentPending',
    blocked:   'messageDetail.consentBlocked',
    emergency: 'messageDetail.consentEmergency',
  };

  const mirrorLabelKey: Record<string, string> = {
    not_checked:   'messageDetail.mirrorNotChecked',
    clear:         'messageDetail.mirrorClear',
    reflected:     'messageDetail.mirrorReflected',
    user_overrode: 'messageDetail.mirrorUserOverrode',
  };

  // Build delivery timeline steps
  const isEncrypted = encStatus === 'local_encrypted';
  const hasEnvelope = Boolean(envelope);
  const deliveryStatus = envelope?.deliveryStatus;
  const isReadyOrQueued = deliveryStatus === 'ready_for_relay' || deliveryStatus === 'queued';
  const isLocalOnly = deliveryStatus === 'local_only';
  const noRecipient = deliveryStatus === 'no_recipient';

  const timelineSteps: TimelineStep[] = [
    {
      label: t('messageDetail.timelineCreated'),
      detail: format(new Date(message.createdAt), 'h:mm:ss a'),
      done: true,
    },
    {
      label: t('messageDetail.timelineEncrypted'),
      detail: isEncrypted
        ? t('messageDetail.timelineEncryptedDetail')
        : t('messageDetail.timelineNotEncrypted'),
      done: isEncrypted,
    },
    {
      label: t('messageDetail.timelineEnvelopeCreated'),
      detail: hasEnvelope
        ? t('messageDetail.timelineEnvelopeDetail')
        : t('messageDetail.timelineNoEnvelope'),
      done: hasEnvelope,
    },
    isLocalOnly
      ? {
          label: t('messageDetail.timelineLocalOnly'),
          detail: t('messageDetail.timelineLocalOnlyDetail'),
          done: true,
          active: true,
        }
      : noRecipient
      ? {
          label: t('messageDetail.timelineNoRecipient'),
          detail: t('messageDetail.timelineNoRecipientDetail'),
          done: false,
          active: false,
        }
      : isReadyOrQueued
      ? {
          label: deliveryStatus === 'ready_for_relay' ? t('messageDetail.timelineReadyForRelay') : t('messageDetail.timelineQueuedForBackup'),
          detail: t('messageDetail.timelineRelayPending'),
          done: true,
          active: true,
        }
      : {
          label: t('messageDetail.timelineWaitingRelay'),
          detail: t('messageDetail.timelineWaitingRelayDetail'),
          done: false,
        },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg
        rounded-t-2xl border border-border bg-background shadow-2xl
        animate-in slide-in-from-bottom-4 duration-200"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{t('messageDetail.title')}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-6 pt-1 overflow-y-auto max-h-[70vh]">

          {/* ── Delivery timeline ──────────────────────────────────────────── */}
          <div className="py-3 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {t('messageDetail.deliveryTimeline')}
            </p>
            <DeliveryTimeline steps={timelineSteps} />
          </div>

          {/* ── Core metadata ─────────────────────────────────────────────── */}
          <DetailRow
            icon={<Clock className="w-3.5 h-3.5" />}
            label={t('messageDetail.sentAt')}
            value={format(new Date(message.createdAt), 'MMM d, yyyy · h:mm:ss a')}
          />

          <DetailRow
            icon={
              encStatus === 'local_encrypted' ? <Lock className="w-3.5 h-3.5" /> :
              encStatus === 'integrity_failed' ? <AlertTriangle className="w-3.5 h-3.5" /> :
              <LockOpen className="w-3.5 h-3.5" />
            }
            label={t('messageDetail.encryption')}
            value={t(encLabelKey[encStatus])}
            valueColor={encColor}
          />

          <DetailRow
            icon={<Database className="w-3.5 h-3.5" />}
            label={t('messageDetail.storageMode')}
            value={storageLabelKey[message.storageMode] ? t(storageLabelKey[message.storageMode]) : message.storageMode}
          />

          <DetailRow
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            label={t('consent.title')}
            value={consentLabelKey[message.consentStatus] ? t(consentLabelKey[message.consentStatus]) : message.consentStatus}
            valueColor={
              message.consentStatus === 'allowed'   ? 'text-emerald-600' :
              message.consentStatus === 'pending'   ? 'text-amber-500' :
              message.consentStatus === 'blocked'   ? 'text-destructive' :
              undefined
            }
          />

          <DetailRow
            icon={<Eye className="w-3.5 h-3.5" />}
            label={t('messageDetail.intentionMirror')}
            value={mirrorLabelKey[message.intentionMirrorState] ? t(mirrorLabelKey[message.intentionMirrorState]) : message.intentionMirrorState}
            valueColor={
              message.intentionMirrorState === 'user_overrode' ? 'text-amber-500' :
              message.intentionMirrorState === 'clear' ? 'text-emerald-600' :
              undefined
            }
          />

          {/* Integrity hash */}
          <div className="flex items-start gap-3 py-2.5 border-b border-border">
            <div className={`flex-shrink-0 mt-0.5 ${isRealHash ? 'text-emerald-600' : 'text-muted-foreground/50'}`}>
              {isRealHash ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {t('messageDetail.integrityHash')}
              </p>
              <p className={`text-[11px] font-mono leading-snug break-all ${isRealHash ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {shortHash}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isRealHash ? t('messageDetail.integrityVerified') : t('messageDetail.integrityPlaceholder')}
              </p>
            </div>
          </div>

          {/* ── Relay boundary ──────────────────────────────────────────────── */}
          {envelope ? (
            <div className="pt-1">
              <div className="flex items-center gap-2 py-2.5 border-b border-border">
                <Radio className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">
                  {t('messageDetail.relayBoundary')}
                </p>
                <span className="text-[10px] font-medium text-amber-300 bg-amber-500/12 border border-amber-500/25 px-1.5 py-0.5 rounded-full">
                  {t('messageDetail.relayPrototype')}
                </span>
              </div>

              {/* Delivery status badge */}
              <div className="py-2.5 border-b border-border">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${DELIVERY_STATUS_BG[envelope.deliveryStatus]}`}>
                  <Radio className="w-3 h-3" />
                  {DELIVERY_STATUS_LABELS[envelope.deliveryStatus]}
                </span>
              </div>

              {/* Recipients */}
              <div className="flex items-start gap-3 py-2.5 border-b border-border">
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('messageDetail.recipients')}</p>
                  {envelope.recipientEarthIds.length === 0 ? (
                    <p className="text-xs text-amber-400 font-medium">{t('messageDetail.noExternalRecipient')}</p>
                  ) : (
                    <p className="text-xs text-foreground">
                      {envelope.recipientEarthIds.length} recipient{envelope.recipientEarthIds.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Payload allowed */}
              <div className="flex items-start gap-3 py-2.5 border-b border-border">
                {envelope.encryptedPayloadAllowed
                  ? <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <Ban className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('messageDetail.encryptedPayload')}</p>
                  <p className={`text-xs font-medium ${envelope.encryptedPayloadAllowed ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {envelope.encryptedPayloadAllowed
                      ? t('messageDetail.payloadAllowed')
                      : t('messageDetail.payloadNotAllowed')}
                  </p>
                </div>
              </div>

              {/* Plaintext guarantee */}
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-500/10 border border-sky-500/25">
                <Ban className="w-3 h-3 text-sky-400 flex-shrink-0" />
                <p className="text-[10px] text-sky-300 font-medium">{t('messageDetail.plaintextGuarantee')}</p>
              </div>
            </div>
          ) : (
            <div className="py-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-muted-foreground/40" />
                <p className="text-[10px] text-muted-foreground/60">{t('messageDetail.noRelayEnvelope')}</p>
              </div>
            </div>
          )}

          {/* Message ID */}
          <div className="mt-3 px-3 py-2 rounded-xl bg-muted/30 border border-border">
            <p className="text-[10px] text-muted-foreground font-mono break-all leading-relaxed">
              {message.id}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
