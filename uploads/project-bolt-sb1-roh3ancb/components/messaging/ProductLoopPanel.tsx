'use client';

import {
  MessageCircle, UserPlus, Send, Radio, Download,
  CircleCheck as CheckCircle2, Circle, ArrowRight,
} from 'lucide-react';
import type { LocalStore } from '@/lib/messaging/localPersistence';
import { useT } from '@/lib/i18n/useT';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductLoopStep {
  key: string;
  number: number;
  label: string;
  detail: string;
  ctaLabel: string;
  icon: React.ReactNode;
  done: boolean;
  /** Only shown as the active CTA when this is the first incomplete step */
  isNext: boolean;
}

interface ProductLoopPanelProps {
  store: LocalStore;
  viewerEarthId: string;
  onStartConversation: () => void;
  onExportData: () => void;
  /** compact = no card wrapper, used inside ReleaseReadinessPanel */
  compact?: boolean;
}

// ─── Progress ring ────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        className="text-border" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={pct === 1 ? 'oklch(0.74 0.15 155)' : 'oklch(0.64 0.12 155)'}
        strokeWidth={4} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

// ─── Step row ─────────────────────────────────────────────────────────────────

function StepRow({ step }: { step: ProductLoopStep }) {
  return (
    <div className={`flex items-start gap-3 py-2.5 border-b border-border last:border-0
      ${step.isNext ? 'opacity-100' : step.done ? 'opacity-100' : 'opacity-50'}`}>

      {/* Status dot */}
      <div className="flex-shrink-0 mt-0.5">
        {step.done ? (
          <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          </div>
        ) : step.isNext ? (
          <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-border bg-muted/30 flex items-center justify-center">
            <span className="text-[9px] font-semibold text-muted-foreground/60">{step.number}</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5
        ${step.done ? 'bg-emerald-500/10 text-emerald-400' : step.isNext ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground/40'}`}>
        {step.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-xs font-semibold ${step.done ? 'text-foreground' : step.isNext ? 'text-foreground' : 'text-muted-foreground/60'}`}>
            {step.label}
          </p>
          {step.done && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              done
            </span>
          )}
          {step.isNext && !step.done && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              next
            </span>
          )}
        </div>
        <p className={`text-[10px] leading-snug mt-0.5 ${step.done ? 'text-muted-foreground' : step.isNext ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
          {step.detail}
        </p>
      </div>
    </div>
  );
}

// ─── CTA banner ───────────────────────────────────────────────────────────────

function CTABanner({
  step,
  onStartConversation,
  onExportData,
}: {
  step: ProductLoopStep | null;
  onStartConversation: () => void;
  onExportData: () => void;
}) {
  if (!step) {
    // All done
    return (
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/22">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-300">EarthOS Messaging loop complete</p>
          <p className="text-[10px] text-emerald-400/80 mt-0.5">
            Identity, consent, encryption, and relay are all operational.
          </p>
        </div>
      </div>
    );
  }

  if (step.key === 'conversation') {
    return (
      <button
        onClick={onStartConversation}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl
          bg-primary text-primary-foreground
          hover:opacity-90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
      >
        <div className="text-left">
          <p className="text-sm font-semibold">Start your first sovereign conversation</p>
          <p className="text-[10px] opacity-75 mt-0.5">Encrypted, consent-governed, local-first.</p>
        </div>
        <ArrowRight className="w-4 h-4 flex-shrink-0 ml-3" />
      </button>
    );
  }

  if (step.key === 'member') {
    return (
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-sky-500/22 bg-sky-500/10">
        <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <UserPlus className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sky-300">Invite a trusted contact</p>
          <p className="text-[10px] text-sky-400/80 mt-0.5">
            Open the conversation, tap the members icon, and invite someone.
            A simulated EarthID will be generated locally.
          </p>
        </div>
      </div>
    );
  }

  if (step.key === 'message') {
    return (
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-amber-500/22 bg-amber-500/10">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Send className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-300">Send your first protected message</p>
          <p className="text-[10px] text-amber-400/80 mt-0.5">
            Open the conversation and type a message. It will be encrypted and enveloped before storage.
          </p>
        </div>
      </div>
    );
  }

  if (step.key === 'relay') {
    return (
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-teal-500/22 bg-teal-500/10">
        <div className="w-8 h-8 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Radio className="w-4 h-4 text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-300">Send a message to create a relay envelope</p>
          <p className="text-[10px] text-teal-400/80 mt-0.5">
            The relay envelope confirms plaintext never leaves your device — send any message to trigger it.
          </p>
        </div>
      </div>
    );
  }

  if (step.key === 'export') {
    return (
      <button
        onClick={onExportData}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl
          border border-border bg-card
          hover:bg-muted/30 active:scale-[0.98] transition-all"
      >
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">Export your local data</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Download all messages, ledger events, and settings as JSON.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 flex-shrink-0 ml-3 text-muted-foreground" />
      </button>
    );
  }

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductLoopPanel({
  store,
  viewerEarthId,
  onStartConversation,
  onExportData,
  compact = false,
}: ProductLoopPanelProps) {
  const { t } = useT();
  const hasConversation   = store.conversations.length > 0;
  const hasInvitedMember  = store.ledgerEvents.some((e) => e.eventType === 'member_invited')
    || store.members.some((m) => m.earthId !== viewerEarthId && m.conversationId !== undefined);
  const hasMessage        = store.messages.length > 0;
  const hasRelayEnvelope  = store.messages.some((m) => m.relayEnvelope !== undefined);
  const hasExport         = store.ledgerEvents.length > 0 || store.messages.length > 0;

  const rawSteps: Omit<ProductLoopStep, 'isNext'>[] = [
    {
      key: 'conversation',
      number: 1,
      label: 'Conversation created',
      detail: 'Create a new conversation — Direct, Group, or Project.',
      ctaLabel: 'Start your first sovereign conversation',
      icon: <MessageCircle className="w-3.5 h-3.5" />,
      done: hasConversation,
    },
    {
      key: 'member',
      number: 2,
      label: 'Member invited',
      detail: 'Invite a contact — a simulated EarthID is created locally.',
      ctaLabel: 'Invite a trusted contact',
      icon: <UserPlus className="w-3.5 h-3.5" />,
      done: hasInvitedMember,
    },
    {
      key: 'message',
      number: 3,
      label: 'Message sent',
      detail: 'Send a message — encrypted on-device before storage.',
      ctaLabel: 'Send your first protected message',
      icon: <Send className="w-3.5 h-3.5" />,
      done: hasMessage,
    },
    {
      key: 'relay',
      number: 4,
      label: 'Relay envelope created',
      detail: 'Relay envelope wraps the encrypted payload. Plaintext never crosses the boundary.',
      ctaLabel: 'See relay status',
      icon: <Radio className="w-3.5 h-3.5" />,
      done: hasRelayEnvelope,
    },
    {
      key: 'export',
      number: 5,
      label: 'Data export available',
      detail: 'Download all local messages and ledger events as JSON.',
      ctaLabel: 'Export your local data',
      icon: <Download className="w-3.5 h-3.5" />,
      done: hasExport,
    },
  ];

  // Tag the first incomplete step as "next"
  let foundNext = false;
  const steps: ProductLoopStep[] = rawSteps.map((s) => {
    if (!s.done && !foundNext) {
      foundNext = true;
      return { ...s, isNext: true };
    }
    return { ...s, isNext: false };
  });

  const doneCount = steps.filter((s) => s.done).length;
  const pct = doneCount / steps.length;
  const allDone = doneCount === steps.length;
  const nextStep = steps.find((s) => s.isNext) ?? null;

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Progress summary */}
        <div className="flex items-center gap-3">
          <ProgressRing pct={pct} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground">{t('dashboard.firstMission')}</p>
            <p className="text-[10px] text-muted-foreground">{doneCount}/{steps.length} steps complete</p>
          </div>
          {allDone && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              complete
            </span>
          )}
        </div>
        {/* CTA */}
        <CTABanner step={nextStep} onStartConversation={onStartConversation} onExportData={onExportData} />
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header with progress ring */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border bg-muted/5">
        <div className="relative flex-shrink-0">
          <ProgressRing pct={pct} size={52} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-bold text-foreground tabular-nums">
              {doneCount}/{steps.length}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{t('dashboard.firstMission')}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {allDone
              ? 'Loop complete — EarthOS Messaging is operational.'
              : `${steps.length - doneCount} step${steps.length - doneCount !== 1 ? 's' : ''} remaining to complete your first loop.`}
          </p>
        </div>
        {allDone && (
          <span className="text-[9px] font-semibold px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex-shrink-0">
            complete
          </span>
        )}
      </div>

      {/* Steps */}
      <div className="px-4">
        {steps.map((step) => (
          <StepRow key={step.key} step={step} />
        ))}
      </div>

      {/* CTA banner */}
      <div className="px-4 pb-4 pt-3 border-t border-border">
        <CTABanner step={nextStep} onStartConversation={onStartConversation} onExportData={onExportData} />
      </div>
    </div>
  );
}
