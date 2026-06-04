'use client';

import { useState } from 'react';
import {
  Radio,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  Ban,
  Info,
  Users,
  ArrowRight,
} from 'lucide-react';
import type { ConversationSovereigntySettings, ConversationMember } from '@/lib/messaging/types';
import type { MessageEncryptionStatus } from '@/lib/messaging/types';
import {
  createRelayEnvelope,
  validateRelayEnvelope,
  resolveRecipientEarthIds,
  evaluateMembersQA,
  DELIVERY_STATUS_LABELS,
  DELIVERY_STATUS_COLORS,
  DELIVERY_STATUS_BG,
  type EnvelopeQAResult,
  type MembersQAResult,
} from '@/lib/messaging/relay';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RelayQAPanelProps {
  convSettings: ConversationSovereigntySettings;
  members: ConversationMember[];
  viewerEarthId: string;
}

// ─── QA test result row ───────────────────────────────────────────────────────

function QARow({ label, passed, detail }: { label: string; passed: boolean; detail: string }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border last:border-0">
      {passed
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
        : <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{detail}</p>
      </div>
      <span className={`flex-shrink-0 text-[10px] font-semibold ${passed ? 'text-emerald-600' : 'text-destructive'}`}>
        {passed ? 'PASS' : 'FAIL'}
      </span>
    </div>
  );
}

// ─── Members summary card ─────────────────────────────────────────────────────

function MembersSummary({
  qa,
  viewerEarthId,
}: {
  qa: MembersQAResult;
  viewerEarthId: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/10 overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/20">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Conversation members
        </p>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        {/* Viewer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Viewer (you)</span>
          <span className="text-[11px] font-mono font-medium text-foreground">{viewerEarthId}</span>
        </div>
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Total members</span>
          <span className="text-[11px] font-medium text-foreground">{qa.totalMembers}</span>
        </div>
        {/* Recipient count */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">External recipients</span>
          <span className={`text-[11px] font-medium ${qa.hasRecipients ? 'text-emerald-600' : 'text-amber-500'}`}>
            {qa.recipientCount === 0 ? 'None' : qa.recipientCount}
          </span>
        </div>
        {/* Delivery readiness */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-[10px] text-muted-foreground">Delivery readiness</span>
          <span className={`text-[11px] font-semibold ${
            qa.deliveryReadiness === 'ready'       ? 'text-emerald-400' :
            qa.deliveryReadiness === 'local_only'  ? 'text-sky-400' :
                                                     'text-amber-400'
          }`}>
            {qa.deliveryReadiness === 'ready'      ? 'Ready' :
             qa.deliveryReadiness === 'local_only' ? 'Local only' :
                                                     'No recipient'}
          </span>
        </div>
        {/* Warning */}
        {qa.warning && (
          <div className="flex items-start gap-2 mt-1 px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25">
            <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300 leading-relaxed">{qa.warning}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RelayQAPanel({ convSettings, members, viewerEarthId }: RelayQAPanelProps) {
  const [qaResult, setQaResult] = useState<EnvelopeQAResult | null>(null);
  const [membersQA, setMembersQA] = useState<MembersQAResult | null>(null);
  const [envelopeSummary, setEnvelopeSummary] = useState<{
    deliveryStatus: string;
    encryptedPayloadAllowed: boolean;
    storageMode: string;
    recipientCount: number;
  } | null>(null);
  const [running, setRunning] = useState(false);

  function runQA() {
    if (running) return;
    setRunning(true);

    // Evaluate members
    const mQA = evaluateMembersQA(
      members,
      viewerEarthId,
      convSettings.conversationId,
      convSettings.storageMode as 'local_only' | 'encrypted_relay' | 'encrypted_backup'
    );
    setMembersQA(mQA);

    // Resolve recipients
    const recipients = resolveRecipientEarthIds(
      members,
      viewerEarthId,
      convSettings.conversationId
    );

    // Build test message stub — no body field
    const testMessage = {
      id: `relay-qa-test-${Date.now()}`,
      conversationId: convSettings.conversationId,
      senderId: viewerEarthId || 'qa-test-sender',
      type: 'text' as const,
      encryptedPayload: undefined,
      encryptionStatus: 'local_encrypted' as MessageEncryptionStatus,
      consentStatus: 'allowed' as const,
      storageMode: convSettings.storageMode,
      trustLevel: convSettings.trustLevel,
      actionState: 'none' as const,
      intentionMirrorState: 'not_checked' as const,
      integrityHash: 'sha256::qa-test-hash-placeholder-0000000000',
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    const envelope = createRelayEnvelope({
      message: testMessage,
      convSettings,
      recipientEarthIds: recipients,
    });

    const result = validateRelayEnvelope(envelope, testMessage);

    setEnvelopeSummary({
      deliveryStatus: envelope.deliveryStatus,
      encryptedPayloadAllowed: envelope.encryptedPayloadAllowed,
      storageMode: envelope.storageMode,
      recipientCount: envelope.recipientEarthIds.length,
    });
    setQaResult(result);
    setRunning(false);
  }

  const overallPassed = qaResult?.passed && membersQA !== null;

  return (
    <div className="space-y-3">

      {/* Info */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border">
        <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Verifies recipient resolution, relay envelope boundary, and storage mode rules.
          Confirms plaintext never leaves this device.
        </p>
      </div>

      {/* Run button */}
      <button
        onClick={runQA}
        disabled={running}
        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl
          border border-border bg-background text-xs font-medium text-muted-foreground
          hover:bg-muted hover:text-foreground transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {running
          ? <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          : qaResult
          ? overallPassed
            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            : <AlertCircle className="w-3.5 h-3.5 text-destructive" />
          : <Radio className="w-3.5 h-3.5" />
        }
        {running ? 'Running…' : qaResult ? 'Re-run QA' : 'Run relay QA'}
      </button>

      {/* Members summary */}
      {membersQA && (
        <MembersSummary qa={membersQA} viewerEarthId={viewerEarthId} />
      )}

      {/* Envelope summary */}
      {envelopeSummary && (
        <div className="rounded-xl border border-border bg-muted/10 overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/20">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Test envelope — mode: {envelopeSummary.storageMode}
            </p>
          </div>
          <div className="px-3 py-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Radio className="w-3 h-3" /> Delivery status
              </span>
              <span className={`text-[11px] font-medium ${DELIVERY_STATUS_COLORS[envelopeSummary.deliveryStatus as keyof typeof DELIVERY_STATUS_COLORS]}`}>
                {DELIVERY_STATUS_LABELS[envelopeSummary.deliveryStatus as keyof typeof DELIVERY_STATUS_LABELS]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Recipients resolved
              </span>
              <span className={`text-[11px] font-medium ${envelopeSummary.recipientCount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {envelopeSummary.recipientCount === 0 ? 'None' : envelopeSummary.recipientCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Encrypted payload allowed</span>
              <span className={`text-[11px] font-medium ${envelopeSummary.encryptedPayloadAllowed ? 'text-emerald-400' : 'text-sky-400'}`}>
                {envelopeSummary.encryptedPayloadAllowed ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <Ban className="w-3 h-3 text-sky-400 flex-shrink-0" />
              <p className="text-[10px] text-sky-400 font-medium">Plaintext never leaves this device</p>
            </div>
          </div>
        </div>
      )}

      {/* QA checks */}
      {qaResult && (
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className={`px-3 py-2 border-b ${qaResult.passed ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-destructive/20 bg-destructive/5'}`}>
            <div className="flex items-center gap-2">
              {qaResult.passed
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                : <AlertCircle className="w-3.5 h-3.5 text-destructive" />
              }
              <p className={`text-[11px] font-semibold ${qaResult.passed ? 'text-emerald-400' : 'text-destructive'}`}>
                {qaResult.passed
                  ? 'All relay boundary checks passed'
                  : `${qaResult.checks.filter(c => !c.passed).length} check${qaResult.checks.filter(c => !c.passed).length !== 1 ? 's' : ''} failed`
                }
              </p>
            </div>
          </div>
          <div className="px-3 py-1">
            {qaResult.checks.map((check, i) => (
              <QARow key={i} label={check.label} passed={check.passed} detail={check.detail} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
