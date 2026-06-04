'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  X, ShieldCheck, Lock, Radio, CircleCheck as CheckCircle2,
  Clock, TriangleAlert as AlertTriangle, Circle, ChevronDown,
  PenLine, Truck,
} from 'lucide-react';
import type { Message, LedgerEvent } from '@/lib/messaging/types';
import { DELIVERY_STATUS_LABELS } from '@/lib/messaging/relay';
import { useT } from '@/lib/i18n/useT';

// ─── Journey step types ───────────────────────────────────────────────────────

type StepState = 'done' | 'next' | 'locked' | 'blocked' | 'pending';

interface JourneyStep {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  state: StepState;
  summary: string;
  detail: string;
  technicalLines?: string[];
}

type TFn = (key: string) => string;

// ─── Derive the 5-step journey ────────────────────────────────────────────────

function deriveJourney(message: Message, ledgerEvents: LedgerEvent[], t: TFn): JourneyStep[] {
  const forMsg = ledgerEvents.filter((e) => e.messageId === message.id);

  const wordCount = message.body ? Math.ceil(message.body.length / 5) : 0;
  const wordLabel = wordCount === 1 ? t('messageJourney.word') : t('messageJourney.words');

  // ── Step 1: Written ────────────────────────────────────────────────────────
  const written: JourneyStep = {
    key: 'written',
    label: t('messageJourney.stepWritten'),
    sublabel: t('messageJourney.stepWrittenSub'),
    icon: <PenLine className="w-3.5 h-3.5" />,
    state: 'done',
    summary: `${message.body ? wordCount + ' ' + wordLabel : '—'} · ${format(new Date(message.createdAt), 'h:mm a')}`,
    detail: `Composed at ${format(new Date(message.createdAt), 'MMM d, h:mm:ss a')}. Message ID: ${message.id.slice(0, 18)}…`,
    technicalLines: [
      `id: ${message.id}`,
      `type: ${message.type}`,
      `storageMode: ${message.storageMode}`,
    ],
  };

  // ── Step 2: Consent ────────────────────────────────────────────────────────
  const consentGranted = forMsg.find((e) => e.eventType === 'consent_granted');
  const consentPending = forMsg.find((e) => e.eventType === 'consent_pending');
  const consentDenied  = forMsg.find((e) => e.eventType === 'consent_denied');
  const msgBlocked     = forMsg.find((e) => e.eventType === 'message_blocked');
  const consentChecked = forMsg.find((e) => e.eventType === 'consent_checked');

  let consentState: StepState;
  let consentSummary: string;
  let consentDetail: string;

  if (msgBlocked || consentDenied) {
    consentState   = 'blocked';
    consentSummary = t('messageJourney.consentBlocked');
    consentDetail  = consentDenied?.detail ?? msgBlocked?.detail ?? t('messageJourney.consentBlocked');
  } else if (consentPending) {
    consentState   = 'pending';
    consentSummary = t('messageJourney.consentHeld');
    consentDetail  = t('messageJourney.consentHeldDetail');
  } else if (consentGranted || message.consentStatus === 'allowed') {
    consentState   = 'done';
    consentSummary = t('messageJourney.consentGranted');
    consentDetail  = consentGranted?.detail ?? t('messageJourney.consentGranted');
  } else {
    consentState   = 'locked';
    consentSummary = t('messageJourney.consentNotChecked');
    consentDetail  = t('messageJourney.consentNotCheckedDetail');
  }

  const consent: JourneyStep = {
    key: 'consent',
    label: t('messageJourney.stepConsent'),
    sublabel: t('messageJourney.stepConsentSub'),
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    state: consentState,
    summary: consentSummary,
    detail: consentDetail,
    technicalLines: consentChecked ? [
      `code: ${consentChecked.detail?.match(/code: (\S+)/)?.[1] ?? '—'}`,
      `passed: ${consentChecked.passed}`,
      `reason: ${consentChecked.detail?.match(/reason: (.+)/)?.[1]?.slice(0, 60) ?? '—'}`,
    ] : undefined,
  };

  // ── Step 3: Encrypted locally ──────────────────────────────────────────────
  const encStatus = message.encryptionStatus;
  let encState: StepState;
  let encSummary: string;
  let encDetail: string;

  if (encStatus === 'local_encrypted') {
    encState   = 'done';
    encSummary = t('messageJourney.encOnDevice');
    encDetail  = t('messageJourney.encOnDeviceDetail');
  } else if (encStatus === 'prototype_key') {
    encState   = 'pending';
    encSummary = t('messageJourney.encPrototype');
    encDetail  = t('messageJourney.encPrototypeDetail');
  } else if (encStatus === 'integrity_failed') {
    encState   = 'blocked';
    encSummary = t('messageJourney.encIntegrityFailed');
    encDetail  = t('messageJourney.encIntegrityFailedDetail');
  } else if (encStatus === 'unencrypted') {
    encState   = 'locked';
    encSummary = t('messageJourney.encNone');
    encDetail  = t('messageJourney.encNoneDetail');
  } else {
    encState   = 'locked';
    encSummary = t('messageJourney.encUnknown');
    encDetail  = t('messageJourney.encUnknownDetail');
  }

  const encryption: JourneyStep = {
    key: 'encryption',
    label: t('messageJourney.stepEncrypted'),
    sublabel: t('messageJourney.stepEncryptedSub'),
    icon: <Lock className="w-3.5 h-3.5" />,
    state: encState,
    summary: encSummary,
    detail: encDetail,
    technicalLines: message.integrityHash ? [
      `algo: AES-GCM-256`,
      `hash: ${message.integrityHash.slice(0, 24)}…`,
      `encryptionStatus: ${encStatus}`,
    ] : [`encryptionStatus: ${encStatus ?? 'none'}`],
  };

  // ── Step 4: Ready for relay ────────────────────────────────────────────────
  const env = message.relayEnvelope;
  const relayCreated = forMsg.find((e) => e.eventType === 'relay_envelope_created');
  let relayState: StepState;
  let relaySummary: string;
  let relayDetail: string;

  if (!env) {
    relayState   = 'locked';
    relaySummary = t('messageJourney.relayNotPrepared');
    relayDetail  = t('messageJourney.relayNotPreparedDetail');
  } else if (env.deliveryStatus === 'ready_for_relay') {
    relayState   = 'done';
    const n = env.recipientEarthIds.length;
    const tplKey = n === 1 ? 'messageJourney.relayRecipients' : 'messageJourney.relayRecipientsPlural';
    relaySummary = t(tplKey).replace('{n}', String(n));
    relayDetail  = t('messageJourney.relayRecipientsDetail');
  } else if (env.deliveryStatus === 'no_recipient') {
    relayState   = 'next';
    relaySummary = t('messageJourney.relayNoRecipient');
    relayDetail  = t('messageJourney.relayNoRecipientDetail');
  } else if (env.deliveryStatus === 'local_only') {
    relayState   = 'done';
    relaySummary = t('messageJourney.relayLocalOnly');
    relayDetail  = t('messageJourney.relayLocalOnlyDetail');
  } else if (env.deliveryStatus === 'failed') {
    relayState   = 'blocked';
    relaySummary = t('messageJourney.relayFailed');
    relayDetail  = t('messageJourney.relayFailedDetail');
  } else {
    relayState   = 'done';
    relaySummary = DELIVERY_STATUS_LABELS[env.deliveryStatus] ?? env.deliveryStatus;
    relayDetail  = relayCreated?.detail ?? t('messageJourney.relayPrepared');
  }

  const relay: JourneyStep = {
    key: 'relay',
    label: t('messageJourney.stepReady'),
    sublabel: t('messageJourney.stepReadySub'),
    icon: <Radio className="w-3.5 h-3.5" />,
    state: relayState,
    summary: relaySummary,
    detail: relayDetail,
    technicalLines: env ? [
      `deliveryStatus: ${env.deliveryStatus}`,
      `encryptedPayloadAllowed: ${env.encryptedPayloadAllowed}`,
      `recipients: ${env.recipientEarthIds.length}`,
    ] : undefined,
  };

  // ── Step 5: Delivered (future-ready) ──────────────────────────────────────
  const delivered: JourneyStep = {
    key: 'delivered',
    label: t('messageJourney.stepDelivered'),
    sublabel: t('messageJourney.stepDeliveredSub'),
    icon: <Truck className="w-3.5 h-3.5" />,
    state: 'locked',
    summary: t('messageJourney.deliveredComingSoon'),
    detail: t('messageJourney.deliveredComingSoonDetail'),
    technicalLines: ['status: not_yet_implemented', 'target: v0.2 relay network'],
  };

  return [written, consent, encryption, relay, delivered];
}

// ─── State config ─────────────────────────────────────────────────────────────

function buildStateConfig(t: TFn) {
  return {
    done:    { dotCls: 'bg-emerald-500',          labelCls: 'text-foreground',         badgeCls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25', icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />, badge: t('messageJourney.stateDone') },
    next:    { dotCls: 'bg-primary animate-pulse', labelCls: 'text-foreground',         badgeCls: 'bg-primary/10 text-primary border-primary/20',             icon: <Clock        className="w-3 h-3 text-primary" />,       badge: t('messageJourney.stateNext') },
    pending: { dotCls: 'bg-amber-400 animate-pulse', labelCls: 'text-foreground',       badgeCls: 'bg-amber-500/10 text-amber-300 border-amber-500/25',        icon: <Clock        className="w-3 h-3 text-amber-400" />,    badge: t('messageJourney.statePending') },
    blocked: { dotCls: 'bg-destructive',           labelCls: 'text-destructive',        badgeCls: 'bg-destructive/10 text-destructive border-destructive/20',  icon: <AlertTriangle className="w-3 h-3 text-destructive" />, badge: t('messageJourney.stateBlocked') },
    locked:  { dotCls: 'bg-muted-foreground/20',   labelCls: 'text-muted-foreground/60', badgeCls: 'bg-muted text-muted-foreground/50 border-border',           icon: <Circle       className="w-3 h-3 text-muted-foreground/30" />, badge: t('messageJourney.stateLocked') },
  } as const;
}

type StateConfig = ReturnType<typeof buildStateConfig>;

// ─── Step row — collapsible ───────────────────────────────────────────────────

function StepRow({
  step,
  index,
  expanded,
  onToggle,
  showTechnical,
  stateConfig,
}: {
  step: JourneyStep;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  showTechnical: boolean;
  stateConfig: StateConfig;
}) {
  const cfg = stateConfig[step.state];
  const isInteractive = step.state !== 'locked';

  return (
    <div className="animate-step-enter" style={{ animationDelay: `${index * 55}ms` }}>
      <button
        onClick={isInteractive ? onToggle : undefined}
        className={`flex items-center gap-phi-2 w-full px-phi-2 py-phi-2 rounded-xl text-left
          transition-all duration-200
          ${isInteractive ? 'hover:bg-muted/30 active:scale-[0.99] cursor-pointer' : 'cursor-default opacity-60'}
        `}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="flex flex-col items-center gap-1 flex-shrink-0 w-phi-3">
          <div className={`w-2 h-2 rounded-full ${cfg.dotCls}`} />
          <span className="text-[8px] font-mono text-muted-foreground/40 leading-none">{index + 1}</span>
        </div>

        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0
          ${step.state === 'done'    ? 'bg-emerald-500/10 text-emerald-400' :
            step.state === 'blocked' ? 'bg-destructive/10 text-destructive' :
            step.state === 'pending' ? 'bg-amber-500/10 text-amber-400' :
            step.state === 'next'    ? 'bg-primary/10 text-primary' :
            'bg-muted/50 text-muted-foreground/40'}`}
        >
          {step.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-xs font-semibold leading-tight ${cfg.labelCls}`}>{step.label}</p>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.badgeCls}`}>
              {cfg.badge}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{step.summary}</p>
        </div>

        {isInteractive && (
          <ChevronDown className={`w-3 h-3 flex-shrink-0 text-muted-foreground/40 transition-transform duration-200
            ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {expanded && isInteractive && (
        <div className="mx-phi-2 mb-phi-2 px-phi-2 py-phi-2 rounded-xl bg-muted/20 border border-border
          animate-in slide-in-from-top-1 duration-150">
          <p className="text-[11px] text-foreground/80 leading-relaxed mb-phi-1">{step.detail}</p>
          {showTechnical && step.technicalLines && step.technicalLines.length > 0 && (
            <div className="mt-phi-1 pt-phi-1 border-t border-border/50 space-y-0.5">
              {step.technicalLines.map((line, i) => (
                <p key={i} className="text-[9px] font-mono text-muted-foreground/60 leading-tight">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Fibonacci connector line ─────────────────────────────────────────────────

function StepConnector({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-start pl-[calc(0.8125rem+4px)]">
      <div className={`w-0.5 h-phi-2 rounded-full transition-colors duration-300
        ${active ? 'bg-emerald-300' : 'bg-border'}`} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MessageJourneyPanelProps {
  message: Message;
  ledgerEvents: LedgerEvent[];
  viewerEarthId: string;
  advancedView?: boolean;
  onClose: () => void;
}

export function MessageJourneyPanel({
  message,
  ledgerEvents,
  viewerEarthId,
  advancedView = false,
  onClose,
}: MessageJourneyPanelProps) {
  const { t } = useT();
  const isOwn = message.senderId === viewerEarthId;
  const stateConfig = buildStateConfig(t);
  const steps = deriveJourney(message, ledgerEvents, t);

  const [expandedKey, setExpandedKey] = useState<string | null>(
    () => steps.find((s) => s.state === 'next' || s.state === 'pending' || s.state === 'blocked')?.key ?? null
  );

  const doneCount = steps.filter((s) => s.state === 'done').length;
  const hasIssue  = steps.some((s) => s.state === 'blocked');
  const ledgerForMsg = ledgerEvents.filter((e) => e.messageId === message.id);

  function toggleStep(key: string) {
    setExpandedKey((prev) => (prev === key ? null : key));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-[3px]
        animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-background rounded-t-[21px] shadow-2xl
          animate-in slide-in-from-bottom duration-300 flex flex-col
          border-t border-x border-border"
        style={{
          maxHeight: 'min(88dvh, calc(100dvh - env(safe-area-inset-top, 0px) - 1rem))',
          touchAction: 'none',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-phi-2 pb-phi-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-phi-2 px-phi-3 pt-phi-1 pb-phi-2 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{t('messageJourney.title')}</h3>
              {hasIssue ? (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                  {t('messageJourney.issue')}
                </span>
              ) : doneCount >= 4 ? (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  {t('messageJourney.steps').replace('{done}', String(doneCount))}
                </span>
              ) : (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {t('messageJourney.steps').replace('{done}', String(doneCount))}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {isOwn ? t('messageJourney.sent') : t('messageJourney.received')} · {format(new Date(message.createdAt), 'MMM d, h:mm a')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted
              transition-colors text-muted-foreground flex-shrink-0"
            style={{ touchAction: 'manipulation' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message preview */}
        <div className="mx-phi-3 mb-phi-2 px-phi-2 py-phi-2 rounded-[13px] bg-muted/20 border border-border flex-shrink-0">
          <p className="text-[11px] text-foreground/70 line-clamp-2 leading-relaxed">
            {message.body
              ? (message.body.length > 100 ? message.body.slice(0, 100) + '…' : message.body)
              : t('messageJourney.noContent')}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mx-phi-3 mb-phi-2 flex-shrink-0">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(doneCount / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps — sole scrollable region */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-phi-2 pb-phi-3"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {steps.map((step, i) => (
            <div key={step.key}>
              <StepRow
                step={step}
                index={i}
                expanded={expandedKey === step.key}
                onToggle={() => toggleStep(step.key)}
                showTechnical={advancedView}
                stateConfig={stateConfig}
              />
              {i < steps.length - 1 && (
                <StepConnector active={step.state === 'done' && steps[i + 1].state !== 'locked'} />
              )}
            </div>
          ))}

          {advancedView && ledgerForMsg.length > 0 && (
            <details className="mt-phi-2">
              <summary className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide
                cursor-pointer hover:text-foreground transition-colors px-phi-2 py-phi-1 select-none list-none
                flex items-center gap-1">
                <ChevronDown className="w-3 h-3 transition-transform [details[open]_&]:rotate-180" />
                {t('messageJourney.ledgerEvents')} ({ledgerForMsg.length})
              </summary>
              <div className="mt-phi-1 space-y-1 px-phi-1">
                {ledgerForMsg.map((e) => (
                  <div key={e.id} className="flex items-start gap-2 px-phi-2 py-1.5 rounded-lg bg-muted/20">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0
                      ${e.passed ? 'bg-emerald-400' : 'bg-destructive'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-semibold text-foreground font-mono">{e.eventType}</p>
                      <p className="text-[9px] text-muted-foreground leading-snug mt-0.5 break-words">{e.detail}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground/50 flex-shrink-0 font-mono">
                      {format(new Date(e.createdAt), 'h:mm:ss')}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {!advancedView && (
            <p className="text-[9px] text-muted-foreground/40 text-center mt-phi-2 pb-phi-1">
              {t('messageJourney.advancedHint')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
