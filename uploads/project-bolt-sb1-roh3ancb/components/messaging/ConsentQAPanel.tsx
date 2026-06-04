'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  Clock,
  Ban,
  Info,
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';
import type {
  ConversationSovereigntySettings,
  ConversationType,
  TrustLevel,
} from '@/lib/messaging/types';
import {
  evaluateMessageConsent,
  evaluateRelayConsent,
  evaluateConsentAcrossTypes,
  type ConsentDecision,
  type ConsentDecisionCode,
} from '@/lib/messaging/consent';
import { useT } from '@/lib/i18n/useT';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConsentQAPanelProps {
  convSettings: ConversationSovereigntySettings;
  viewerEarthId: string;
  recipientCount: number;
}

// ─── Code → i18n key map ──────────────────────────────────────────────────────

const CODE_KEY: Record<ConsentDecisionCode, string> = {
  self:                     'consentPanel.codeSelf',
  allowed:                  'consentPanel.codeAllowed',
  allowed_local_prototype:  'consentPanel.codeAllowedLocalProto',
  pending_approval:         'consentPanel.codePendingApproval',
  pending_trust:            'consentPanel.codePendingTrust',
  blocked_conversation:     'consentPanel.codeBlockedConversation',
  blocked_trust:            'consentPanel.codeBlockedTrust',
  blocked_direct_disabled:  'consentPanel.codeBlockedDirectDisabled',
  blocked_project_disabled: 'consentPanel.codeBlockedProjectDisabled',
  blocked_event_disabled:   'consentPanel.codeBlockedEventDisabled',
  blocked_place_disabled:   'consentPanel.codeBlockedPlaceDisabled',
  blocked_no_consent:       'consentPanel.codeBlockedNoConsent',
  relay_no_recipient:       'consentPanel.codeRelayNoRecipient',
  relay_local_only:         'consentPanel.codeRelayLocalOnly',
  invite_blocked:           'consentPanel.codeInviteBlocked',
  invite_pending:           'consentPanel.codeInvitePending',
};

const CONV_TYPE_KEY: Record<ConversationType, string> = {
  direct:         'consentPanel.convTypeDirect',
  group:          'consentPanel.convTypeGroup',
  project:        'consentPanel.convTypeProject',
  event:          'consentPanel.convTypeEvent',
  place:          'consentPanel.convTypePlace',
  council:        'consentPanel.convTypeCouncil',
  cause:          'consentPanel.convTypeCause',
  support_circle: 'consentPanel.convTypeSupportCircle',
};

const TRUST_VALUES: TrustLevel[] = ['trusted', 'known', 'community', 'unknown', 'blocked'];

// ─── Icon / color helpers ─────────────────────────────────────────────────────

const CODE_ICON: Record<string, React.ReactNode> = {
  allowed:   <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  allowed_local_prototype: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />,
  self:      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  pending:   <Clock className="w-3.5 h-3.5 text-amber-400" />,
  blocked:   <Ban className="w-3.5 h-3.5 text-destructive" />,
  relay:     <Radio className="w-3.5 h-3.5 text-sky-400" />,
};

function iconFor(d: ConsentDecision): React.ReactNode {
  if (d.blocked) return CODE_ICON.blocked;
  if (d.pending) return CODE_ICON.pending;
  if (d.code === 'relay_local_only' || d.code === 'relay_no_recipient') return CODE_ICON.relay;
  if (d.code === 'allowed_local_prototype') return CODE_ICON.allowed_local_prototype;
  return CODE_ICON.allowed;
}

function colorFor(d: ConsentDecision): string {
  if (d.blocked) return 'text-destructive';
  if (d.pending) return 'text-amber-400';
  if (d.code === 'relay_local_only' || d.code === 'relay_no_recipient') return 'text-sky-400';
  return 'text-emerald-400';
}

// ─── Current decision card ────────────────────────────────────────────────────

function CurrentDecisionCard({
  decision,
  relayDecision,
  convSettings,
}: {
  decision: ConsentDecision;
  relayDecision: ConsentDecision;
  convSettings: ConversationSovereigntySettings;
}) {
  const { t } = useT();

  const flags = [
    { labelKey: 'consentPanel.flagDirectMsgs',      value: convSettings.allowDirectMessages },
    { labelKey: 'consentPanel.flagRequireApproval',  value: convSettings.requireApproval },
    { labelKey: 'consentPanel.flagProjectInvites',   value: convSettings.allowProjectInvites },
    { labelKey: 'consentPanel.flagEventInvites',     value: convSettings.allowEventInvites },
    { labelKey: 'consentPanel.flagLocationMsgs',     value: convSettings.allowLocationMessages },
    { labelKey: 'consentPanel.flagBlocked',          value: convSettings.isBlocked, invert: true },
  ];

  return (
    <div className="rounded-xl border border-border bg-muted/10 overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/20">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {t('consentPanel.currentDecision')}
        </p>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        {/* Message consent */}
        <div className="flex items-start gap-2">
          {iconFor(decision)}
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-semibold ${colorFor(decision)}`}>
              {t(CODE_KEY[decision.code])}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{decision.reason}</p>
          </div>
        </div>

        {/* Relay consent */}
        <div className="flex items-start gap-2 pt-1 border-t border-border">
          {iconFor(relayDecision)}
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-semibold ${colorFor(relayDecision)}`}>
              {t('consentPanel.relayPrefix')}{t(CODE_KEY[relayDecision.code])}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{relayDecision.reason}</p>
          </div>
        </div>

        {/* Key flags */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
          {flags.map(({ labelKey, value, invert }) => (
            <span
              key={labelKey}
              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border
                ${(invert ? !value : value)
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-muted/50 border-border text-muted-foreground/60'
                }`}
            >
              {t(labelKey)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Cross-type matrix ────────────────────────────────────────────────────────

function CrossTypeMatrix({
  convSettings,
  trustLevel,
}: {
  convSettings: ConversationSovereigntySettings;
  trustLevel: TrustLevel;
}) {
  const { t } = useT();
  const scenarios = evaluateConsentAcrossTypes(convSettings, trustLevel);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/20">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {t('consentPanel.trustLevelAcrossTypes').replace('{level}', trustLevel)}
        </p>
      </div>
      <div className="divide-y divide-border">
        {scenarios.map(({ conversationType, decision }) => (
          <div key={conversationType} className="flex items-center gap-2.5 px-3 py-1.5">
            <span className="w-24 text-[10px] font-medium text-muted-foreground flex-shrink-0">
              {t(CONV_TYPE_KEY[conversationType])}
            </span>
            {iconFor(decision)}
            <span className={`text-[10px] font-medium flex-1 ${colorFor(decision)}`}>
              {t(CODE_KEY[decision.code])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConsentQAPanel({
  convSettings,
  viewerEarthId: _viewerEarthId,
  recipientCount,
}: ConsentQAPanelProps) {
  const { t } = useT();
  const [testTrust, setTestTrust] = useState<TrustLevel>('known');
  const [showMatrix, setShowMatrix] = useState(false);

  const currentDecision = evaluateMessageConsent({
    convSettings,
    conversationType: convSettings.conversationId ? 'direct' : 'direct',
    senderTrustLevel: convSettings.trustLevel,
    isSelf: true,
    isSenderLocal: false,
  });

  const relayDecision = evaluateRelayConsent({
    storageMode: convSettings.storageMode,
    recipientCount,
    senderTrustLevel: convSettings.trustLevel,
    hasRecipients: recipientCount > 0,
  });

  return (
    <div className="space-y-3">

      {/* Info */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border">
        <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t('consentPanel.infoText')}
        </p>
      </div>

      {/* Current conversation decision */}
      <CurrentDecisionCard
        decision={currentDecision}
        relayDecision={relayDecision}
        convSettings={convSettings}
      />

      {/* Cross-type test */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('consentPanel.testMatrixTitle')}
          </p>
          <button
            onClick={() => setShowMatrix((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showMatrix ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showMatrix ? t('consentPanel.collapse') : t('consentPanel.expand')}
          </button>
        </div>

        {/* Trust selector */}
        <div className="flex flex-wrap gap-1.5">
          {TRUST_VALUES.map((value) => (
            <button
              key={value}
              onClick={() => setTestTrust(value)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors
                ${testTrust === value
                  ? value === 'blocked'
                    ? 'bg-destructive/10 border-destructive/30 text-destructive'
                    : 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted/40'
                }`}
            >
              {t(`trust.level${value.charAt(0).toUpperCase() + value.slice(1)}Label`)}
            </button>
          ))}
        </div>

        {showMatrix && (
          <CrossTypeMatrix convSettings={convSettings} trustLevel={testTrust} />
        )}

        {!showMatrix && (
          <div className="rounded-xl border border-border overflow-hidden">
            {(() => {
              const d = evaluateMessageConsent({
                convSettings,
                conversationType: 'direct',
                senderTrustLevel: testTrust,
                isSelf: false,
                isSenderLocal: false,
              });
              return (
                <div className="flex items-start gap-2 px-3 py-2.5">
                  {iconFor(d)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold ${colorFor(d)}`}>
                      {t('consentPanel.directPrefix')}{t(CODE_KEY[d.code])}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{d.reason}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {[
          { icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />, labelKey: 'consentPanel.legendAllowed' },
          { icon: <Clock className="w-3 h-3 text-amber-400" />,          labelKey: 'consentPanel.legendPending' },
          { icon: <Ban className="w-3 h-3 text-destructive" />,          labelKey: 'consentPanel.legendBlocked' },
          { icon: <Radio className="w-3 h-3 text-sky-400" />,            labelKey: 'consentPanel.legendLocalRelay' },
        ].map(({ icon, labelKey }) => (
          <div key={labelKey} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {icon}
            <span>{t(labelKey)}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
