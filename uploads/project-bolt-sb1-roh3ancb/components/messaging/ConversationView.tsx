'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Info, Users, Settings2, UserPlus, X, Send, Lock, Database, ShieldCheck, Timer, HardDrive, Radio, Plus } from 'lucide-react';
import type { ConsentDecision } from '@/lib/qlpa/consentEngine';
import type {
  Conversation,
  Message,
  ConversationMember,
  IntentionMirrorState,
  ConversationSovereigntySettings,
  UserSovereigntySettings,
  LedgerEvent,
  FileTransfer,
  FileRetentionPolicy,
  FileLocalPermissions,
  VoiceMemo,
} from '@/lib/messaging/types';
import { MessageRetentionPanel, type RetentionSettings, computeExpiresAt } from './MessageRetentionPanel';
import type { SyncResult } from '@/lib/messaging/sync';
import type { AuthBridgeResult } from '@/lib/messaging/authBridge';
import { MessageBubble } from './MessageBubble';
import { FileMessageBubble } from './FileMessageBubble';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import { MessageComposer } from './MessageComposer';
import { TrustBadge } from './TrustBadge';
import { StorageBadge } from './StorageBadge';
import { MembersPanel, type SimulatedMemberInfo } from './MembersPanel';
import { ConversationInfoPanel } from './ConversationInfoPanel';
import { SovereigntyJourneyDrawer } from './SovereigntyJourneyDrawer';
import { JourneyStatusBar, derivePrivacyStatus, deriveDeliveryStatus, deriveConsentStatus } from './JourneyStatusBar';
import { PrivacyDrilldownPanel } from './PrivacyDrilldownPanel';
import { DeliveryDrilldownPanel } from './DeliveryDrilldownPanel';
import { ConsentDrilldownPanel } from './ConsentDrilldownPanel';
import { EmptyConversationJourney } from './EmptyConversationJourney';
import { placeholderIntegrityHash } from '@/lib/messaging/storage';
import { encryptMessageLocal, createIntegrityHash } from '@/lib/messaging/crypto';
import { createRelayEnvelope, resolveRecipientEarthIds } from '@/lib/messaging/relay';
import { evaluateQLPAGuard } from '@/lib/messaging/localPersistence';
// Consent functions from canonical consentEngine path.
// ConsentAction classification: send-message, invite-member (see handlers below).
import {
  evaluateMessageConsent,
  evaluateRelayConsent,
  checkActionPermission,
  type ConsentAction,
} from '@/lib/qlpa/consentEngine';
import { isLocalIdentity } from '@/lib/messaging/identity';
import { MOCK_MEMBERS } from '@/lib/messaging/mockData';
import { resolveIdentity } from '@/lib/messaging/identity';
import { InlineAvatar } from './IdentityCard';
import { useT } from '@/lib/i18n/useT';
import { type HumanMode, HUMAN_MODES } from '@/lib/foundation/modes';
import { usePreferences } from '@/lib/messaging/preferencesContext';
import { getHumanModeAtmosphere } from '@/lib/qlpa/tokens';
import { useActiveSheet } from '@/lib/qlpa/QLPARuntimeContext';
import type { ActiveSheet } from '@/lib/qlpa/appOrchestrator';
import { Z, SHEET_MAX_H_EXPR } from '@/lib/qlpa/layoutTokens';
import {
  lockMobileSheetScroll,
  applyVisualViewportHeight,
  getSheetMaxHeightStyle,
  getScrollDiagnostics,
} from '@/lib/qlpa/mobileScrollOrchestrator';

function retentionTimerLabel(settings: RetentionSettings): string {
  if (settings.timer === 'custom' && settings.customDurationMs) {
    const ms = settings.customDurationMs;
    if (ms >= 24 * 60 * 60_000 && ms % (24 * 60 * 60_000) === 0) return `${ms / (24 * 60 * 60_000)}d`;
    if (ms >= 60 * 60_000 && ms % (60 * 60_000) === 0) return `${ms / (60 * 60_000)}h`;
    if (ms >= 60_000 && ms % 60_000 === 0) return `${ms / 60_000}m`;
    return `${Math.round(ms / 1000)}s`;
  }
  const labels: Record<string, string> = { '30s': '30s', '1min': '1m', '1h': '1h', '24h': '24h', '7d': '7d' };
  return labels[settings.timer] ?? settings.timer;
}

interface ConversationViewProps {
  conversation: Conversation;
  viewerEarthId: string;
  allMessages: Message[];
  extraMembers?: ConversationMember[];
  convSettings: ConversationSovereigntySettings;
  userSettings: UserSovereigntySettings;
  ledgerEvents: LedgerEvent[];
  syncResult?: SyncResult;
  authResult?: AuthBridgeResult | null;
  onMessageSend: (message: Message) => void;
  onLedgerEvent: (event: Omit<LedgerEvent, 'id' | 'createdAt'>) => void;
  onUpdateConvSettings: (patch: Partial<ConversationSovereigntySettings> & { conversationId: string }) => void;
  onUpdateUserSettings: (patch: Partial<Pick<UserSovereigntySettings, 'intentionMirror'>>) => void;
  onExportData: () => void;
  onResetLocalData?: () => void;
  onDeleteConversation: () => void;
  onSyncNow?: () => Promise<void> | void;
  onRebuildBridge?: () => Promise<void> | void;
  onSignOut?: () => Promise<void> | void;
  onInviteMember?: (member: ConversationMember, displayName: string, handle: string) => void;
  simulatedMemberInfo?: SimulatedMemberInfo[];
  onBack?: () => void;
  onNewConversation?: () => void;
  advancedView?: boolean;
  developerMode?: boolean;
  visibleFeatures?: HumanMode['visibleFeatures'];
  initialRetentionSettings?: RetentionSettings;
  onRetentionChange?: (conversationId: string, settings: RetentionSettings) => void;
}

export function ConversationView({
  conversation,
  viewerEarthId,
  allMessages,
  extraMembers = [],
  convSettings,
  userSettings,
  ledgerEvents,
  syncResult,
  authResult,
  onMessageSend,
  onLedgerEvent,
  onUpdateConvSettings,
  onUpdateUserSettings,
  onExportData,
  onResetLocalData,
  onDeleteConversation,
  onSyncNow,
  onRebuildBridge,
  onSignOut,
  onInviteMember,
  simulatedMemberInfo = [],
  onBack,
  onNewConversation,
  advancedView = false,
  developerMode = false,
  visibleFeatures,
  initialRetentionSettings,
  onRetentionChange,
}: ConversationViewProps) {
  const { t, locale } = useT();
  const { humanMode, isDeveloper } = usePreferences();
  const modeAtmosphere = getHumanModeAtmosphere(humanMode);
  // activeSheet: QLPARuntimeContext is the single source of truth for panel state.
  const [activeSheet, setActiveSheet] = useActiveSheet();

  function openOverlay(panel: NonNullable<ActiveSheet>) {
    setActiveSheet(panel);
  }
  function closeOverlay() {
    setActiveSheet(null);
  }
  function toggleOverlay(panel: NonNullable<ActiveSheet>) {
    setActiveSheet(activeSheet === panel ? null : panel);
  }
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = allMessages
    .filter((m) => m.conversationId === conversation.id && !m.isDeleted)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const qlpaGuard = evaluateQLPAGuard(convSettings, conversation.type);

  const seenMemberIds = new Set<string>();
  const members = [
    ...MOCK_MEMBERS.filter((m) => m.conversationId === conversation.id),
    ...extraMembers.filter((m) => m.conversationId === conversation.id),
  ].filter((m) => {
    if (seenMemberIds.has(m.earthId)) return false;
    seenMemberIds.add(m.earthId);
    return true;
  });

  const recipientCount = members.filter((m) => m.earthId !== viewerEarthId).length;

  const [cryptoError, setCryptoError] = useState(false);
  const [fileTransfers, setFileTransfers] = useState<Map<string, FileTransfer>>(new Map());
  const [voiceMemos, setVoiceMemos] = useState<Map<string, VoiceMemo>>(new Map());

  const [retentionSettings, setRetentionSettings] = useState<RetentionSettings>(
    () => initialRetentionSettings ?? { timer: 'off', deleteScope: 'local_only' }
  );
  // Local overrides for message deleteStatus — keyed by messageId
  const [messageDeleteOverrides, setMessageDeleteOverrides] = useState<Map<string, Message['deleteStatus']>>(new Map());

  // ── Post-send animation ────────────────────────────────────────────────────
  const [sendOutcome, setSendOutcome] = useState<{
    messageId: string;
    consentDecision: ConsentDecision;
    relayCode: string;
    recipientCount: number;
  } | null>(null);
  const [sendStep, setSendStep] = useState(0);

  useEffect(() => {
    if (!sendOutcome) { setSendStep(0); return; }
    setSendStep(1);
    const t1 = setTimeout(() => setSendStep(2), 300);
    const t2 = setTimeout(() => setSendStep(3), 600);
    const t3 = setTimeout(() => setSendStep(4), 900);
    const t4 = setTimeout(() => { setSendOutcome(null); setSendStep(0); }, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [sendOutcome]);

  // ── Invite completion feedback ─────────────────────────────────────────────
  const [inviteFeedback, setInviteFeedback] = useState<{
    displayName: string;
    handle: string;
    isLocal: boolean;
  } | null>(null);

  useEffect(() => {
    if (!inviteFeedback) return;
    const t = setTimeout(() => setInviteFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [inviteFeedback]);

  // Always close any panel when the active conversation changes.
  useEffect(() => {
    setActiveSheet(null);
  }, [conversation.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ── Expiry enforcement engine ────────────────────────────────────────────────
  // Runs every second. Marks text messages 'expired' via the override map,
  // and marks file/voice transfers expired in their local state maps.
  // Logs message_expired ledger events exactly once per message.
  const expiredIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // Text messages — check allMessages for expiresAt
      allMessages
        .filter((m) =>
          m.conversationId === conversation.id &&
          !m.isDeleted &&
          m.expiresAt &&
          new Date(m.expiresAt).getTime() <= now
        )
        .forEach((m) => {
          if (expiredIdsRef.current.has(m.id)) return;
          expiredIdsRef.current.add(m.id);
          setMessageDeleteOverrides((prev) => {
            const cur = prev.get(m.id);
            if (cur === 'expired' || cur === 'local_deleted') return prev;
            return new Map(prev).set(m.id, 'expired');
          });
          onLedgerEvent({
            earthId: viewerEarthId,
            conversationId: conversation.id,
            messageId: m.id,
            eventType: 'message_expired',
            passed: true,
            detail: `Message expired after retention timer. expiresAt: ${m.expiresAt}. Metadata retained.`,
          });
        });

      // File transfers
      setFileTransfers((prev) => {
        let changed = false;
        const next = new Map(prev);
        next.forEach((t, id) => {
          if (t.expiresAt && t.status !== 'expired' && new Date(t.expiresAt).getTime() <= now) {
            next.set(id, { ...t, status: 'expired' });
            changed = true;
            if (!expiredIdsRef.current.has(id)) {
              expiredIdsRef.current.add(id);
              onLedgerEvent({
                earthId: viewerEarthId,
                conversationId: conversation.id,
                eventType: 'file_expired',
                passed: true,
                detail: `File transfer expired. transferId: ${id}. expiresAt: ${t.expiresAt}.`,
              });
            }
          }
        });
        return changed ? next : prev;
      });

      // Voice memos
      setVoiceMemos((prev) => {
        let changed = false;
        const next = new Map(prev);
        next.forEach((m, id) => {
          if (m.expiresAt && m.status !== 'expired' && new Date(m.expiresAt).getTime() <= now) {
            next.set(id, { ...m, status: 'expired' });
            changed = true;
            if (!expiredIdsRef.current.has(id)) {
              expiredIdsRef.current.add(id);
              onLedgerEvent({
                earthId: viewerEarthId,
                conversationId: conversation.id,
                eventType: 'voice_expired',
                passed: true,
                detail: `Voice memo expired. voiceMemoId: ${id}. expiresAt: ${m.expiresAt}.`,
              });
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMessages, conversation.id, viewerEarthId]);

  // ConsentAction: 'send-message'
  // First gate: checkActionPermission ensures the trust level meets the minimum
  // required for this action (ACTION_MIN_TRUST['send-message'] = 'known').
  // Second gate: evaluateMessageConsent checks sovereignty settings in full.
  // Exception: generated messages (contentKind === 'generated') are self-authored
  // local-only test messages and bypass both trust gates.
  function handleSend(
    body: string,
    mirrorState: IntentionMirrorState,
    isPending: boolean,
    meta?: { contentKind?: Message['contentKind']; translationKey?: string },
  ) {
    (async () => {
      setCryptoError(false);
      const now = new Date().toISOString();

      const isGeneratedMessage = meta?.contentKind === 'generated';

      let consentDecision: ConsentDecision;

      if (!isGeneratedMessage) {
        // ── Gate 1: action-level trust check ──────────────────────────────
        const permResult = checkActionPermission('send-message', convSettings.trustLevel);
        if (!permResult.allowed) {
          onLedgerEvent({
            earthId: viewerEarthId,
            conversationId: conversation.id,
            eventType: 'consent_denied',
            passed: false,
            detail: `action_permission_denied. action: send-message. ${permResult.reason}`,
          });
          onLedgerEvent({
            earthId: viewerEarthId,
            conversationId: conversation.id,
            eventType: 'message_blocked',
            passed: false,
            detail: permResult.reason,
          });
          return;
        }

        // ── Gate 2: full consent evaluation ───────────────────────────────
        consentDecision = evaluateMessageConsent({
          convSettings,
          conversationType: conversation.type,
          senderTrustLevel: convSettings.trustLevel,
          isSelf: true,
          isSenderLocal: isLocalIdentity(viewerEarthId),
        });

        onLedgerEvent({
          earthId: viewerEarthId,
          conversationId: conversation.id,
          eventType: 'consent_checked',
          passed: consentDecision.allowed || consentDecision.pending,
          detail: `consent_checked. code: ${consentDecision.code}. reason: ${consentDecision.reason}`,
        });

        if (consentDecision.blocked) {
          onLedgerEvent({
            earthId: viewerEarthId,
            conversationId: conversation.id,
            eventType: 'consent_denied',
            passed: false,
            detail: `consent_denied. code: ${consentDecision.code}. reason: ${consentDecision.reason}`,
          });
          onLedgerEvent({
            earthId: viewerEarthId,
            conversationId: conversation.id,
            eventType: 'message_blocked',
            passed: false,
            detail: consentDecision.reason,
          });
          return;
        }
      } else {
        consentDecision = { allowed: true, pending: false, blocked: false, code: 'allowed_local_prototype', reason: 'Generated local test message — self-authored, no trust gate.', localFallback: true };
        onLedgerEvent({
          earthId: viewerEarthId,
          conversationId: conversation.id,
          eventType: 'consent_granted',
          passed: true,
          detail: 'Generated local test message bypasses trust gates. Local-only, self-authored.',
        });
      }

      if (!qlpaGuard.canSend) {
        onLedgerEvent({
          earthId: viewerEarthId,
          conversationId: conversation.id,
          eventType: 'message_blocked',
          passed: false,
          detail: qlpaGuard.blockMessage ?? 'Send blocked by QLPA guard.',
        });
        return;
      }

      const effectivelyPending = isPending || consentDecision.pending;
      onLedgerEvent({
        earthId: viewerEarthId,
        conversationId: conversation.id,
        eventType: effectivelyPending ? 'consent_pending' : 'consent_granted',
        passed: true,
        detail: `code: ${consentDecision.code}. pending: ${effectivelyPending}. reason: ${consentDecision.reason}`,
      });

      if (mirrorState === 'user_overrode') {
        onLedgerEvent({
          earthId: viewerEarthId,
          conversationId: conversation.id,
          eventType: 'mirror_overrode',
          passed: true,
          detail: 'User acknowledged mirror reflection and chose to send.',
        });
      }

      let encryptedPayload: string | undefined;
      let integrityHash: string;
      let encryptionStatus: Message['encryptionStatus'];

      try {
        const encResult = await encryptMessageLocal(body);
        encryptedPayload = encResult.encryptedPayload;
        integrityHash = await createIntegrityHash(body, viewerEarthId, now);
        encryptionStatus = 'local_encrypted';
      } catch {
        setCryptoError(true);
        return;
      }

      const msgExpiresAt = computeExpiresAt(retentionSettings.timer, now, retentionSettings.customDurationMs);

      const newMsg: Message = {
        id: `msg-local-${Date.now()}`,
        conversationId: conversation.id,
        senderId: viewerEarthId,
        type: 'text',
        body,
        encryptedPayload,
        encryptionStatus,
        consentStatus: effectivelyPending ? 'pending' : 'allowed',
        storageMode: convSettings.storageMode,
        trustLevel: convSettings.trustLevel,
        actionState: 'none',
        intentionMirrorState: mirrorState,
        integrityHash,
        isDeleted: false,
        createdAt: now,
        // Stamp locale and kind so message content is never re-translated later
        createdLocale: locale,
        contentKind: meta?.contentKind ?? 'user',
        translationKey: meta?.translationKey,
        expiresAt: msgExpiresAt,
        deleteScope: retentionSettings.timer !== 'off' ? retentionSettings.deleteScope : undefined,
        deleteStatus: 'active',
      };

      const resolvedRecipients = resolveRecipientEarthIds(
        members,
        viewerEarthId,
        conversation.id
      );

      const relayDecision = evaluateRelayConsent({
        storageMode: convSettings.storageMode,
        recipientCount: resolvedRecipients.length,
        senderTrustLevel: convSettings.trustLevel,
        hasRecipients: resolvedRecipients.length > 0,
      });

      const envelope = createRelayEnvelope({
        message: newMsg,
        convSettings,
        recipientEarthIds: resolvedRecipients,
      });
      newMsg.relayEnvelope = envelope;

      onMessageSend(newMsg);

      onLedgerEvent({
        earthId: viewerEarthId,
        conversationId: conversation.id,
        messageId: newMsg.id,
        eventType: 'message_created',
        passed: true,
        detail: effectivelyPending
          ? `Message created with consent status 'pending'. Awaiting approval.`
          : `Message created. Storage: ${convSettings.storageMode}. Mirror: ${mirrorState}. Encryption: local_encrypted.`,
      });

      onLedgerEvent({
        earthId: viewerEarthId,
        conversationId: conversation.id,
        messageId: newMsg.id,
        eventType: 'relay_envelope_created',
        passed: true,
        detail: `Relay envelope created. deliveryStatus: ${envelope.deliveryStatus}. relayConsent: ${relayDecision.code}. encryptedPayloadAllowed: ${envelope.encryptedPayloadAllowed}. Plaintext never included.`,
      });

      if (retentionSettings.timer !== 'off' && msgExpiresAt) {
        onLedgerEvent({
          earthId: viewerEarthId,
          conversationId: conversation.id,
          messageId: newMsg.id,
          eventType: 'message_retention_set',
          passed: true,
          detail: `Retention timer: ${retentionSettings.timer}. deleteScope: ${retentionSettings.deleteScope}. expiresAt: ${msgExpiresAt}.`,
        });
      }

      setSendOutcome({
        messageId: newMsg.id,
        consentDecision: consentDecision,
        relayCode: relayDecision.code,
        recipientCount: resolvedRecipients.length,
      });
    })();
  }

  function handleFileSend(transfer: FileTransfer, fileBody: string, mirrorState: IntentionMirrorState, isPending: boolean) {
    const now = new Date().toISOString();
    const msgExpiresAt = computeExpiresAt(retentionSettings.timer, now, retentionSettings.customDurationMs);
    const newMsg: Message = {
      id: `msg-file-${Date.now()}`,
      conversationId: conversation.id,
      senderId: viewerEarthId,
      type: 'file',
      body: fileBody,
      encryptionStatus: 'local_encrypted',
      consentStatus: isPending ? 'pending' : 'allowed',
      storageMode: convSettings.storageMode,
      trustLevel: convSettings.trustLevel,
      actionState: 'none',
      intentionMirrorState: mirrorState,
      integrityHash: transfer.integrityHash,
      isDeleted: false,
      createdAt: now,
      fileTransferId: transfer.id,
      expiresAt: msgExpiresAt,
      deleteScope: retentionSettings.timer !== 'off' ? retentionSettings.deleteScope : undefined,
      deleteStatus: 'active',
    };
    setFileTransfers((prev) => new Map(prev).set(transfer.id, transfer));
    onMessageSend(newMsg);
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      messageId: newMsg.id,
      eventType: 'file_transfer_created',
      passed: true,
      detail: `storageMode: ${transfer.storageMode}. size: ${transfer.sizeBytes}. retention: ${transfer.retentionPolicy}. chunkCount: ${transfer.chunkCount}. Plaintext never stored server-side.`,
    });
  }

  async function handleFileDownload(transfer: FileTransfer) {
    // Only trigger a save when the user explicitly clicks the button.
    // encrypted_relay transfers have no localObjectUrl — no desktop download occurs.
    if (!transfer.localObjectUrl) return;
    const a = document.createElement('a');
    a.href = transfer.localObjectUrl;
    a.download = transfer.localFileName ?? 'file';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'file_downloaded',
      passed: true,
      detail: `User saved file locally. transferId: ${transfer.id}. storageMode: ${transfer.storageMode}.`,
    });
  }

  function handleFileDeleteLocally(transferId: string) {
    setFileTransfers((prev) => {
      const next = new Map(prev);
      const t = next.get(transferId);
      if (t) {
        // Revoke blob URL to free memory
        if (t.localObjectUrl) URL.revokeObjectURL(t.localObjectUrl);
        next.set(transferId, {
          ...t,
          deletedLocally: true,
          localObjectUrl: undefined,
        });
      }
      return next;
    });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'file_deleted_local',
      passed: true,
      detail: `Local file reference removed. transferId: ${transferId}. Relay/vault copy unaffected.`,
    });
  }

  function handleFileDeleteForEveryone(transferId: string) {
    setFileTransfers((prev) => {
      const next = new Map(prev);
      const t = next.get(transferId);
      if (t) next.set(transferId, { ...t, deleteRequestedRemote: true });
      return next;
    });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'file_delete_requested_remote',
      passed: true,
      detail: `Remote deletion requested. transferId: ${transferId}. Pending relay/vault confirmation.`,
    });
  }

  function handleFileUpdateRetention(transferId: string, policy: FileRetentionPolicy) {
    setFileTransfers((prev) => {
      const next = new Map(prev);
      const t = next.get(transferId);
      if (t) next.set(transferId, { ...t, retentionPolicy: policy });
      return next;
    });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'file_permission_set',
      passed: true,
      detail: `Retention policy updated. transferId: ${transferId}. policy: ${policy}.`,
    });
  }

  function handleFileUpdatePermissions(transferId: string, permissions: FileLocalPermissions) {
    setFileTransfers((prev) => {
      const next = new Map(prev);
      const t = next.get(transferId);
      if (t) next.set(transferId, { ...t, localPermissions: permissions });
      return next;
    });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'file_permission_set',
      passed: true,
      detail: `Local permissions updated. transferId: ${transferId}. downloadAllowed: ${permissions.downloadAllowed}. viewOnly: ${permissions.viewOnly}.`,
    });
  }

  function handleVoiceSend(memo: VoiceMemo, memoBody: string, _mirrorState: IntentionMirrorState, isPending: boolean) {
    const now = new Date().toISOString();
    const msgExpiresAt = computeExpiresAt(retentionSettings.timer, now, retentionSettings.customDurationMs);
    const newMsg: Message = {
      id: `msg-voice-${Date.now()}`,
      conversationId: conversation.id,
      senderId: viewerEarthId,
      type: 'voice',
      body: memoBody,
      encryptionStatus: 'local_encrypted',
      consentStatus: isPending ? 'pending' : 'allowed',
      storageMode: convSettings.storageMode,
      trustLevel: convSettings.trustLevel,
      actionState: 'none',
      intentionMirrorState: _mirrorState,
      integrityHash: memo.integrityHash,
      isDeleted: false,
      createdAt: now,
      voiceMemoId: memo.id,
      expiresAt: msgExpiresAt,
      deleteScope: retentionSettings.timer !== 'off' ? retentionSettings.deleteScope : undefined,
      deleteStatus: 'active',
    };
    setVoiceMemos((prev) => new Map(prev).set(memo.id, memo));
    onMessageSend(newMsg);
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      messageId: newMsg.id,
      eventType: 'voice_message_created',
      passed: true,
      detail: `storageMode: ${memo.storageMode}. durationMs: ${memo.durationMs}. size: ${memo.sizeBytes}. Plaintext audio never stored server-side.`,
    });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      messageId: newMsg.id,
      eventType: 'voice_message_encrypted',
      passed: true,
      detail: `integrityHash: ${memo.integrityHash.slice(0, 24)}…`,
    });
  }

  function handleVoicePlay(memo: VoiceMemo) {
    setVoiceMemos((prev) => {
      const next = new Map(prev);
      const m = next.get(memo.id);
      if (m) next.set(memo.id, { ...m, status: 'played', playedAt: new Date().toISOString() });
      return next;
    });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'voice_message_played',
      passed: true,
      detail: `voiceMemoId: ${memo.id}. durationMs: ${memo.durationMs}.`,
    });
  }

  function handleVoiceSave(memo: VoiceMemo) {
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'file_downloaded',
      passed: true,
      detail: `Voice memo saved locally by user. voiceMemoId: ${memo.id}.`,
    });
  }

  function handleVoiceDeleteLocally(memoId: string) {
    setVoiceMemos((prev) => {
      const next = new Map(prev);
      const m = next.get(memoId);
      if (m) {
        if (m.localObjectUrl) URL.revokeObjectURL(m.localObjectUrl);
        next.set(memoId, { ...m, deletedLocally: true, localObjectUrl: undefined, localBlob: undefined });
      }
      return next;
    });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'message_deleted_locally',
      passed: true,
      detail: `Voice memo removed from this device. Metadata retained for audit continuity. memoId: ${memoId}.`,
    });
  }

  function handleMessageDeleteLocally(messageId: string) {
    setMessageDeleteOverrides((prev) => new Map(prev).set(messageId, 'local_deleted'));
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      messageId,
      eventType: 'message_deleted_locally',
      passed: true,
      detail: `Message content removed from this device. Metadata retained for audit continuity. messageId: ${messageId}.`,
    });
  }

  // ConsentAction: 'change-retention'
  function handleRetentionChange(settings: RetentionSettings) {
    setRetentionSettings(settings);
    onRetentionChange?.(conversation.id, settings);
    closeOverlay();
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'disappearing_timer_updated',
      passed: true,
      detail: `Disappearing timer set to: ${settings.timer}${settings.customDurationMs ? ` (${settings.customDurationMs}ms)` : ''}. deleteScope: ${settings.deleteScope}. Local-only expiry. Applies to new messages only.`,
    });
  }

  function handleRequestRecipientDelete(messageId: string) {
    setMessageDeleteOverrides((prev) => new Map(prev).set(messageId, 'recipient_delete_requested'));
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      messageId,
      eventType: 'recipient_delete_requested',
      passed: true,
      detail: `Delete request logged locally. v0.1: not relayed or enforced on recipient device. messageId: ${messageId}.`,
    });
  }

  // ConsentAction: 'invite-member' — Gate 1: checkActionPermission (trust-level minimum)
  function handleInviteMember(member: ConversationMember, displayName: string, handle: string) {
    const permResult = checkActionPermission('invite-member', convSettings.trustLevel);
    if (!permResult.allowed) {
      onLedgerEvent({
        earthId: viewerEarthId,
        conversationId: conversation.id,
        eventType: 'consent_denied',
        passed: false,
        detail: `action_permission_denied. action: invite-member. ${permResult.reason}`,
      });
      return;
    }
    onInviteMember?.(member, displayName, handle);
    setInviteFeedback({ displayName, handle, isLocal: true });
    onLedgerEvent({
      earthId: viewerEarthId,
      conversationId: conversation.id,
      eventType: 'member_invited',
      passed: true,
      detail: `Member invited. role: ${member.role}. trust: ${member.trustSnapshot}. simulatedEarthId: ${member.earthId}. handle: ${handle}. No message body.`,
    });
  }

  function openDrill(panel: 'privacy' | 'delivery' | 'consent') {
    openOverlay(panel);
  }

  const otherMember = members.find((m) => m.earthId !== viewerEarthId);
  const otherEarthId = otherMember ? resolveIdentity(otherMember.earthId) : undefined;

  // Custom titles are preserved verbatim (user-authored); default titles follow the active locale.
  const title = (() => {
    if (conversation.title && (conversation.titleKind === 'custom' || conversation.titleKind === 'system' || !conversation.titleKind)) {
      return conversation.title;
    }
    if (conversation.type === 'direct') {
      return otherEarthId?.displayName ?? t('conversation.typeDirect');
    }
    const typeLabels: Record<string, string> = {
      group:          t('conversation.typeGroup'),
      project:        t('conversation.typeProject'),
      event:          t('conversation.typeEvent'),
      place:          t('conversation.typePlace'),
      cause:          t('conversation.typeCause'),
      council:        t('conversation.typeCouncil'),
      support_circle: t('conversation.typeSupportCircle'),
    };
    return typeLabels[conversation.type] ?? t('conversation.untitled');
  })();

  // Derived status for JourneyStatusBar
  const privacyStatus = derivePrivacyStatus(convSettings.storageMode, t);
  const deliveryStatus = deriveDeliveryStatus(recipientCount, convSettings.storageMode, t);
  const consentStatus = deriveConsentStatus(convSettings, t);

  // anyPanelOpen: derived from QLPARuntimeContext activeSheet (single source of truth).
  const anyPanelOpen = activeSheet !== null;

  return (
    <div className="flex h-full overflow-hidden bg-transparent relative">
      {/* ── Mode atmosphere aura — very low opacity wash behind all content ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-all duration-700"
        style={{ background: modeAtmosphere.panelGradient }}
        aria-hidden="true"
      />

      {/* ── Mobile backdrop — lives at root level so it covers the composer too.
          z-[48]: above all content (nav z-30, FAB z-30, composer unset) and
          below MobileSheet z-[50].
          touchmove preventDefault stops iOS Safari rubber-band bleed-through.
          ── */}
      {anyPanelOpen && (
        <div
          className="md:hidden fixed inset-0 z-[48] bg-black/50 backdrop-blur-[2px] animate-fade-in"
          onClick={closeOverlay}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />
      )}

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0 relative z-10">

        {/*
          ── MOBILE SCROLL STRATEGY ─────────────────────────────────────────
          On mobile: one single vertical scroll owner wraps everything above
          the composer — header, status bar, protection row, invite banner,
          messages, inline retention/error rows.

          On desktop (md+): this wrapper uses `display: contents` so it
          vanishes from layout and each child resumes its normal flex role.
          ────────────────────────────────────────────────────────────────── */}
        <div
          className={`md:contents flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain${anyPanelOpen ? ' overflow-hidden' : ''}`}
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >

        {/* Header */}
        <header className="flex items-center gap-phi-3 px-phi-5 border-b backdrop-blur-2xl flex-shrink-0"
          style={{
            background: 'hsl(212 48% 8% / 0.92)',
            borderColor: modeAtmosphere.border,
            boxShadow: `0 1px 0 ${modeAtmosphere.glow}`,
            minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
            paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              className="flex-shrink-0 w-[2.75rem] h-[2.75rem] flex items-center justify-center
                rounded-full hover:bg-muted transition-colors
                text-muted-foreground hover:text-foreground md:hidden
                touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="w-[1.0625rem] h-[1.0625rem]" />
            </button>
          )}

          {/* Avatar */}
          <div className="flex-shrink-0">
            {otherEarthId ? (
              <InlineAvatar identity={otherEarthId} size="md" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center
                text-[0.75rem] font-semibold text-secondary-foreground">
                {title.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0 py-phi-3">
            <h2 className="text-[0.9375rem] font-semibold text-foreground truncate leading-snug">
              {title}
            </h2>
            <div className="flex items-center gap-phi-3 mt-[0.1875rem] overflow-hidden">
              <span className="text-[0.75rem] text-muted-foreground/80 flex-shrink-0">
                {t(`conversation.type${conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1).replace('_c', 'C').replace('_', '')}`)}
              </span>
              <TrustBadge level={convSettings.trustLevel} showLabel size="sm" />
              {convSettings.isMuted && (
                <span className="text-[0.6875rem] text-muted-foreground bg-muted/80
                  px-phi-3 py-[0.1875rem] rounded-full flex-shrink-0">
                  {t('messages.muted')}
                </span>
              )}
              {convSettings.isBlocked && (
                <span className="text-[0.6875rem] text-destructive bg-destructive/8
                  px-phi-3 py-[0.1875rem] rounded-full flex-shrink-0">
                  {t('messages.blocked')}
                </span>
              )}
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-[0.25rem] flex-shrink-0">

            {/* Simple mode (advancedView=false): storage badge + single tools button */}
            {!advancedView ? (
              <>
                <StorageBadge mode={convSettings.storageMode} />
                <button
                  onClick={() => toggleOverlay('sovereignty')}
                  title={t('messages.panelSettings')}
                  aria-label={t('messages.panelSettings')}
                  aria-pressed={activeSheet === 'sovereignty'}
                  className={`w-[2.75rem] h-[2.75rem] flex items-center justify-center rounded-full
                    transition-all duration-150 touch-manipulation
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${activeSheet === 'sovereignty'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                    }`}
                >
                  <Settings2 className="w-[1.0625rem] h-[1.0625rem]" />
                </button>
              </>
            ) : (
              <>
                {/* Status group: storage + retention */}
                <StorageBadge mode={convSettings.storageMode} />
                {(visibleFeatures?.retentionTimer ?? true) && (
                <button
                  onClick={() => toggleOverlay('retention')}
                  title={t('conversation.disappearingMessages')}
                  aria-label={t('conversation.disappearingMessages')}
                  aria-pressed={activeSheet === 'retention'}
                  className={`w-[2.75rem] h-[2.75rem] flex items-center justify-center rounded-full relative
                    transition-all duration-150 touch-manipulation
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${activeSheet === 'retention'
                      ? 'bg-primary text-primary-foreground'
                      : retentionSettings.timer !== 'off'
                      ? 'text-amber-400 hover:bg-muted/70'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                    }`}
                >
                  <Timer className="w-[1.0625rem] h-[1.0625rem]" />
                  {retentionSettings.timer !== 'off' && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
                )}

                {/* Separator */}
                <div className="w-px h-5 mx-0.5" style={{ background: 'var(--qlpa-divider-soft)' }} />

                {/* Advanced mode: members + info + settings */}
                {([
                  { id: 'members'     as NonNullable<ActiveSheet>, Icon: Users,    labelKey: 'messages.panelMembers' },
                  { id: 'details'     as NonNullable<ActiveSheet>, Icon: Info,     labelKey: 'messages.panelDetails' },
                  { id: 'sovereignty' as NonNullable<ActiveSheet>, Icon: Settings2, labelKey: 'messages.panelSettings' },
                ] as const).map(({ id, Icon, labelKey }) => (
                  <button
                    key={id}
                    onClick={() => toggleOverlay(id)}
                    title={t(labelKey)}
                    aria-label={t(labelKey)}
                    aria-pressed={activeSheet === id}
                    className={`w-[2.75rem] h-[2.75rem] flex items-center justify-center rounded-full
                      transition-all duration-150 touch-manipulation
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                      ${activeSheet === id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                      }`}
                  >
                    <Icon className="w-[1.0625rem] h-[1.0625rem]" />
                  </button>
                ))}
              </>
            )}
          </div>
        </header>

        {/* Journey status bar */}
        <JourneyStatusBar
          privacyStatus={privacyStatus}
          deliveryStatus={deliveryStatus}
          consentStatus={consentStatus}
          onOpenPrivacy={() => openDrill('privacy')}
          onOpenDelivery={() => openDrill('delivery')}
          onOpenConsent={() => openDrill('consent')}
        />

        {/* Protection comprehension notice — simple mode only */}
        {!advancedView && (
          <ProtectionNotice storageMode={convSettings.storageMode} />
        )}

        {/* Invite feedback banner */}
        {inviteFeedback && (
          <div className="flex items-center gap-phi-3 px-phi-4 py-phi-3
            bg-sky-500/6 backdrop-blur-sm animate-slide-up flex-shrink-0 md:px-phi-5"
            style={{ borderBottom: '1px solid var(--qlpa-divider-soft)' }}>
            <UserPlus className="w-[0.875rem] h-[0.875rem] text-sky-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[0.8125rem] font-semibold text-sky-300">
                {inviteFeedback.displayName}
              </span>
              <span className="text-[0.8125rem] text-sky-400/80 ml-phi-2">
                {inviteFeedback.handle} {t('conversation.memberAdded')}
              </span>
              {members.filter((m) => m.earthId !== viewerEarthId).length > 0 && (
                <span className="text-[0.8125rem] text-emerald-400 font-medium ml-phi-3">
                  · {t('emptyState.relayReady')}
                </span>
              )}
            </div>
            <button
              onClick={() => setInviteFeedback(null)}
              className="w-6 h-6 flex items-center justify-center rounded-full
                text-sky-400 hover:text-sky-600 transition-colors flex-shrink-0"
            >
              <X className="w-[0.875rem] h-[0.875rem]" />
            </button>
          </div>
        )}

        {/* Message area — on desktop this is the sole scroll owner (flex-1 min-h-0)   */}
        {/* On mobile the outer wrapper above owns the scroll; this is just a container */}
        <div className="md:flex-1 md:min-h-0 md:overflow-hidden relative">


          {/* Desktop message scroller — on mobile this is display:block, height driven by content */}
          <div className="md:h-full md:overflow-y-auto overscroll-contain px-phi-4 py-phi-5 space-y-phi-4 md:px-phi-5"
            style={{ WebkitOverflowScrolling: 'touch' }}>
            {messages.length === 0 ? (
              <EmptyConversationJourney
                hasMembers={recipientCount > 0}
                hasMessages={false}
                testMessageSent={messages.some(m => m.contentKind === 'generated')}
                onOpenMembers={() => openOverlay('members')}
                onSendTestMessage={() => {
                  if (messages.some(m => m.contentKind === 'generated')) return;
                  handleSend(t('messages.localTestMessage'), 'not_checked', false, {
                    contentKind: 'generated',
                    translationKey: 'messages.localTestMessage',
                  });
                }}
                onOpenSovereignty={() => toggleOverlay('sovereignty')}
              />
            ) : (
              messages.map((msg) => {
                const transfer = msg.fileTransferId ? fileTransfers.get(msg.fileTransferId) : undefined;
                const voiceMemo = msg.voiceMemoId ? voiceMemos.get(msg.voiceMemoId) : undefined;

                if (msg.type === 'file' && transfer) {
                  return (
                    <div key={msg.id} className={`flex ${msg.senderId === viewerEarthId ? 'justify-end' : 'justify-start'}`}>
                      <FileMessageBubble
                        transfer={transfer}
                        isOwn={msg.senderId === viewerEarthId}
                        onDownload={handleFileDownload}
                        onDeleteLocally={handleFileDeleteLocally}
                        onDeleteForEveryone={msg.senderId === viewerEarthId ? handleFileDeleteForEveryone : undefined}
                        onUpdateRetention={handleFileUpdateRetention}
                        onUpdatePermissions={handleFileUpdatePermissions}
                      />
                    </div>
                  );
                }

                if (msg.type === 'voice' && voiceMemo) {
                  return (
                    <div key={msg.id} className={`flex ${msg.senderId === viewerEarthId ? 'justify-end' : 'justify-start'}`}>
                      <VoiceMessageBubble
                        memo={voiceMemo}
                        isOwn={msg.senderId === viewerEarthId}
                        onPlay={handleVoicePlay}
                        onSave={handleVoiceSave}
                        onDeleteLocally={msg.senderId === viewerEarthId ? handleVoiceDeleteLocally : undefined}
                      />
                    </div>
                  );
                }

                const deleteOverride = messageDeleteOverrides.get(msg.id);
                const effectiveMsg = deleteOverride ? { ...msg, deleteStatus: deleteOverride } : msg;

                return (
                  <div key={msg.id}>
                    <MessageBubble
                      message={effectiveMsg}
                      viewerEarthId={viewerEarthId}
                      ledgerEvents={ledgerEvents.filter((e) => e.messageId === msg.id)}
                      advancedView={advancedView}
                      onDeleteLocally={handleMessageDeleteLocally}
                      onRequestRecipientDelete={handleRequestRecipientDelete}
                    />
                    {msg.contentKind === 'generated' && (
                      <div className="flex justify-end pr-1 -mt-1 mb-1">
                        <span
                          className="text-[0.625rem] leading-none px-2 py-0.5 rounded-full"
                          style={{ color: 'rgba(120,200,170,0.65)', background: 'rgba(97,214,178,0.06)', border: '1px solid rgba(97,214,178,0.12)' }}
                        >
                          {t('conversation.testMessageCreated')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

        </div>

        {/* Crypto error */}
        {cryptoError && (
          <div className="flex items-center gap-phi-3 px-phi-5 py-phi-3
            bg-destructive/8 border-t border-destructive/20 flex-shrink-0">
            <span className="text-[0.8125rem] text-destructive font-medium flex-1">
              {t('messages.couldNotPrepare')}
            </span>
            <button
              onClick={() => setCryptoError(false)}
              className="text-[0.75rem] text-destructive/60 hover:text-destructive transition-colors"
            >
              {t('common.dismiss')}
            </button>
          </div>
        )}

        {/* Send progress */}
        {sendStep > 0 && (
          <SendProgressBar
            step={sendStep}
            blocked={sendOutcome?.consentDecision.blocked ?? false}
            pending={sendOutcome?.consentDecision.pending ?? false}
            onDismiss={() => { setSendOutcome(null); setSendStep(0); }}
          />
        )}

        {/* Retention timer indicator + toggle */}
        {(visibleFeatures?.retentionTimer ?? true) && retentionSettings.timer !== 'off' && activeSheet !== 'retention' && (
          <div className="flex items-center justify-between px-4 py-1.5 border-t"
            style={{ background: 'hsl(38 88% 62% / 0.07)', borderColor: 'hsl(38 88% 62% / 0.18)' }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'hsl(38 80% 74%)' }}>
              <Timer className="w-3.5 h-3.5" />
              <span>{t('messages.disappearAfter')} <strong>{retentionTimerLabel(retentionSettings)}</strong></span>
            </div>
            <button
              onClick={() => openOverlay('retention')}
              className="text-[10px] hover:underline"
              style={{ color: 'hsl(38 80% 68%)' }}
            >
              {t('messages.change')}
            </button>
          </div>
        )}

        {/* Bottom padding spacer — mobile only: clears composer + bottom nav + safe area */}
        <div className="md:hidden flex-shrink-0" style={{ height: 'calc(4.75rem + env(safe-area-inset-bottom, 0px) + 1rem)' }} />

        </div>{/* end mobile scroll wrapper */}

        {/* Send gate notice — shown when trust is unknown and real sending is blocked.
            Does not hide the composer or erase any draft. User can still type freely. */}
        {convSettings.trustLevel === 'unknown' && !anyPanelOpen && (
          <SendGateNotice onInviteMember={() => openOverlay('members')} />
        )}

        {/* Composer — pointer-events disabled on mobile when any sheet is open
            so the backdrop correctly captures all taps/swipes. */}
        <div className={anyPanelOpen ? 'md:contents pointer-events-none select-none' : 'md:contents'}>
          <MessageComposer
            conversationId={conversation.id}
            senderEarthId={viewerEarthId}
            onSend={handleSend}
            onFileSend={handleFileSend}
            onVoiceSend={handleVoiceSend}
            tier="free"
            qlpaGuard={qlpaGuard}
            isMuted={convSettings.isMuted}
            showVoiceButton={visibleFeatures?.voiceMemo ?? true}
            showFileButton={visibleFeatures?.fileTransfer ?? true}
            showRitualNote={visibleFeatures?.ritualNote ?? true}
            conversationContext={conversation.type === 'group' || conversation.type === 'council' || conversation.type === 'cause' ? 'group' : 'direct'}
          />
        </div>

        {/* Mobile New Conversation FAB — hidden when any sheet is open */}
        {onNewConversation && !anyPanelOpen && (
          <button
            onClick={onNewConversation}
            aria-label={t('commandBar.new')}
            title={t('commandBar.new')}
            className="md:hidden absolute right-4 bottom-[4.75rem] z-30 w-11 h-11
              flex items-center justify-center rounded-full
              active:scale-95 transition-all touch-manipulation
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
            style={{
              background: 'rgba(14,40,62,0.90)',
              border: '1px solid rgba(80,200,240,0.30)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.50), 0 0 0 1px rgba(80,200,240,0.08)',
              color: 'rgba(140,220,255,0.92)',
            }}
          >
            <Plus className="w-[1.0625rem] h-[1.0625rem]" />
          </button>
        )}
      </div>

      {/* ── Mobile bottom sheets ─────────────────────────────────────────────
          Rendered as direct siblings of the backdrop (z-[48]) so they sit in
          the same stacking context. MobileSheet is z-[50] and carries
          qlpa-sheet-clear to prevent any inherited blur from reaching content.
          ────────────────────────────────────────────────────────────────── */}
      {activeSheet === 'members' && (
        <MobileSheet onClose={closeOverlay} isDeveloper={isDeveloper}>
          <MembersPanel
            conversation={conversation}
            viewerEarthId={viewerEarthId}
            extraMembers={extraMembers}
            simulatedMemberInfo={simulatedMemberInfo}
            onClose={closeOverlay}
            onInviteMember={handleInviteMember}
          />
        </MobileSheet>
      )}
      {activeSheet === 'details' && (
        <MobileSheet onClose={closeOverlay} isDeveloper={isDeveloper}>
          <ConversationInfoPanel
            conversation={conversation}
            viewerEarthId={viewerEarthId}
            extraMembers={extraMembers}
            convSettings={convSettings}
            onClose={closeOverlay}
            advancedView={advancedView}
          />
        </MobileSheet>
      )}
      {activeSheet === 'sovereignty' && (
        <MobileSheet onClose={closeOverlay} isDeveloper={isDeveloper}>
          <SovereigntyJourneyDrawer
            conversation={conversation}
            convSettings={convSettings}
            userSettings={userSettings}
            ledgerEvents={ledgerEvents}
            allMessages={allMessages}
            members={members}
            viewerEarthId={viewerEarthId}
            syncResult={syncResult}
            authResult={authResult}
            onUpdateConvSettings={onUpdateConvSettings}
            onUpdateUserSettings={onUpdateUserSettings}
            onSyncNow={onSyncNow}
            onRebuildBridge={onRebuildBridge}
            onSignOut={onSignOut}
            onClose={closeOverlay}
            advancedView={advancedView}
            developerMode={developerMode}
            onOpenMembers={() => openOverlay('members')}
            onOpenRetention={() => openOverlay('retention')}
            onOpenDetails={() => openOverlay('details')}
            memberCount={members.length}
            retentionLabel={retentionSettings.timer !== 'off' ? retentionTimerLabel(retentionSettings) : undefined}
          />
        </MobileSheet>
      )}
      {activeSheet === 'privacy' && (
        <MobileSheet onClose={closeOverlay} isDeveloper={isDeveloper}>
          <PrivacyDrilldownPanel
            storageMode={convSettings.storageMode}
            advancedView={advancedView}
            onExportData={onExportData}
            onOpenAdvancedKeys={() => openOverlay('sovereignty')}
            onClose={closeOverlay}
          />
        </MobileSheet>
      )}
      {activeSheet === 'delivery' && (
        <MobileSheet onClose={closeOverlay} isDeveloper={isDeveloper}>
          <DeliveryDrilldownPanel
            storageMode={convSettings.storageMode}
            recipientCount={recipientCount}
            onInviteMember={() => openOverlay('members')}
            onClose={closeOverlay}
          />
        </MobileSheet>
      )}
      {activeSheet === 'consent' && (
        <MobileSheet onClose={closeOverlay} isDeveloper={isDeveloper}>
          <ConsentDrilldownPanel
            trustLevel={convSettings.trustLevel}
            conversationSettings={convSettings}
            onUpdateSettings={onUpdateConvSettings}
            onClose={closeOverlay}
          />
        </MobileSheet>
      )}
      {activeSheet === 'retention' && (
        <MobileSheet onClose={closeOverlay} isDeveloper={isDeveloper}>
          <MessageRetentionPanel
            current={retentionSettings}
            onChange={handleRetentionChange}
            onClose={closeOverlay}
          />
        </MobileSheet>
      )}

      {/* ── Desktop side panels (right-side drawers, md+ only) ─────────────── */}

      {activeSheet === 'members' && (
        <DesktopDrawer onClose={closeOverlay} borderColor={modeAtmosphere.border} glowColor={modeAtmosphere.glow}>
          <MembersPanel
            conversation={conversation}
            viewerEarthId={viewerEarthId}
            extraMembers={extraMembers}
            simulatedMemberInfo={simulatedMemberInfo}
            onClose={closeOverlay}
            onInviteMember={handleInviteMember}
          />
        </DesktopDrawer>
      )}

      {activeSheet === 'details' && (
        <DesktopDrawer onClose={closeOverlay} borderColor={modeAtmosphere.border} glowColor={modeAtmosphere.glow}>
          <ConversationInfoPanel
            conversation={conversation}
            viewerEarthId={viewerEarthId}
            extraMembers={extraMembers}
            convSettings={convSettings}
            onClose={closeOverlay}
            advancedView={advancedView}
          />
        </DesktopDrawer>
      )}

      {activeSheet === 'sovereignty' && (
        <DesktopDrawer onClose={closeOverlay} borderColor={modeAtmosphere.border} glowColor={modeAtmosphere.glow}>
          <SovereigntyJourneyDrawer
            conversation={conversation}
            convSettings={convSettings}
            userSettings={userSettings}
            ledgerEvents={ledgerEvents}
            allMessages={allMessages}
            members={members}
            viewerEarthId={viewerEarthId}
            syncResult={syncResult}
            authResult={authResult}
            onUpdateConvSettings={onUpdateConvSettings}
            onUpdateUserSettings={onUpdateUserSettings}
            onSyncNow={onSyncNow}
            onRebuildBridge={onRebuildBridge}
            onSignOut={onSignOut}
            onClose={closeOverlay}
            advancedView={advancedView}
            developerMode={developerMode}
            onOpenMembers={() => openOverlay('members')}
            onOpenRetention={() => openOverlay('retention')}
            onOpenDetails={() => openOverlay('details')}
            memberCount={members.length}
            retentionLabel={retentionSettings.timer !== 'off' ? retentionTimerLabel(retentionSettings) : undefined}
          />
        </DesktopDrawer>
      )}

      {activeSheet === 'privacy' && (
        <DesktopDrawer onClose={closeOverlay} borderColor={modeAtmosphere.border} glowColor={modeAtmosphere.glow}>
          <PrivacyDrilldownPanel
            storageMode={convSettings.storageMode}
            advancedView={advancedView}
            onExportData={onExportData}
            onOpenAdvancedKeys={() => openOverlay('sovereignty')}
            onClose={closeOverlay}
          />
        </DesktopDrawer>
      )}

      {activeSheet === 'delivery' && (
        <DesktopDrawer onClose={closeOverlay} borderColor={modeAtmosphere.border} glowColor={modeAtmosphere.glow}>
          <DeliveryDrilldownPanel
            storageMode={convSettings.storageMode}
            recipientCount={recipientCount}
            onInviteMember={() => openOverlay('members')}
            onClose={closeOverlay}
          />
        </DesktopDrawer>
      )}

      {activeSheet === 'consent' && (
        <DesktopDrawer onClose={closeOverlay} borderColor={modeAtmosphere.border} glowColor={modeAtmosphere.glow}>
          <ConsentDrilldownPanel
            trustLevel={convSettings.trustLevel}
            conversationSettings={convSettings}
            onUpdateSettings={onUpdateConvSettings}
            onClose={closeOverlay}
          />
        </DesktopDrawer>
      )}

      {/* Retention panel — desktop drawer (md+ only; mobile uses MobileSheet above) */}
      {activeSheet === 'retention' && (
        <DesktopDrawer onClose={closeOverlay} borderColor={modeAtmosphere.border} glowColor={modeAtmosphere.glow}>
          <MessageRetentionPanel
            current={retentionSettings}
            onChange={handleRetentionChange}
            onClose={closeOverlay}
          />
        </DesktopDrawer>
      )}
    </div>
  );
}

// ─── Protection comprehension notice (simple view) ───────────────────────────

function ProtectionNotice({ storageMode }: { storageMode: string }) {
  const { t } = useT();
  const isLocalOnly = storageMode === 'local_only';

  return (
    <div className="flex items-center gap-3 px-phi-4 py-1.5 md:px-phi-5 flex-shrink-0 overflow-x-auto scrollbar-none" style={{ borderBottom: '1px solid rgba(80,180,240,0.06)' }}>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <HardDrive className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">
          {t('protection.localFirstTitle')}
        </span>
      </div>
      <div className="w-px h-3 flex-shrink-0" style={{ background: 'var(--qlpa-divider-soft)' }} />
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Lock className="w-3 h-3 text-emerald-400/80 flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground/80 whitespace-nowrap">
          {t('protection.encryptedTitle')}
        </span>
      </div>
      {isLocalOnly && (
        <>
          <div className="w-px h-3 flex-shrink-0" style={{ background: 'var(--qlpa-divider-soft)' }} />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Radio className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
            <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap">
              {t('protection.relayNotActiveTitle')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Desktop drawer (md+ only) ───────────────────────────────────────────────

function DesktopDrawer({
  children,
  onClose,
  borderColor,
  glowColor,
}: {
  children: React.ReactNode;
  onClose: () => void;
  borderColor?: string;
  glowColor?: string;
}) {
  return (
    <div className="hidden md:flex flex-col h-full z-30 flex-shrink-0
      w-[min(40%,24rem)] min-w-[15rem] max-w-[24rem]
      backdrop-blur-2xl animate-slide-in-right overflow-hidden"
      style={{
        background: 'hsl(212 48% 9% / 0.70)',
        borderLeft: `1px solid var(--qlpa-divider-soft)`,
        boxShadow: `-4px 0 32px hsl(218 40% 4% / 0.28), 1px 0 0 rgba(125,220,255,0.05) inset`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Mobile bottom sheet (< md) ──────────────────────────────────────────────
//
// Layer stack (mobile):
//   page content      — z-10
//   FAB / bottom-nav  — z-30
//   MessageComposer   — pointer-events-none when anyPanelOpen
//   backdrop          — z-[48]  (root-level, preventDefault on touchmove)
//   MobileSheet       — z-[50]
//
// Scroll ownership is managed entirely by scrollOrchestrator.
// This component is purely declarative — no manual DOM style mutations,
// no body lock logic, no touch intercept logic in JSX.
//
// The scroll body (.qlpa-sheet-body) is the ONLY scroll owner.
// It uses stopPropagation (NOT preventDefault) so native scroll fires
// but the event never bubbles to the backdrop or body.

function MobileSheet({
  children,
  onClose,
  isDeveloper = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  isDeveloper?: boolean;
}) {
  // ── Lock body scroll via QLPA orchestrator on mount, restore on unmount ───
  useEffect(() => {
    return lockMobileSheetScroll('MobileSheet');
  }, []);

  // ── Track visual viewport height → --qlpa-vvh + --qlpa-sheet-max-h ───────
  useEffect(() => {
    return applyVisualViewportHeight();
  }, []);

  // ── Developer scroll diagnostic state ────────────────────────────────────
  const [scrollDiag, setScrollDiag] = useState<ReturnType<typeof getScrollDiagnostics> | null>(null);
  useEffect(() => {
    if (isDeveloper) {
      setScrollDiag(getScrollDiagnostics());
    }
  }, [isDeveloper]);

  return (
    <div
      className="qlpa-sheet-clear md:hidden fixed inset-x-0 bottom-0 z-[50]
        rounded-t-[1.5rem] flex flex-col animate-sheet-up"
      style={{
        ...getSheetMaxHeightStyle(),
        background: 'hsl(212 48% 9% / 0.94)',
        borderTop: '1px solid var(--qlpa-divider-soft)',
        boxShadow: '0 -4px 48px hsl(218 40% 4% / 0.55), 0 -1px 0 rgba(125,220,255,0.07) inset',
      }}
    >
      {/* Drag handle — tap to close */}
      <div
        className="flex-shrink-0 flex justify-center pt-3 pb-2 select-none cursor-pointer"
        role="button"
        aria-label="Close panel"
        onClick={onClose}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* ── Developer scroll diagnostic — gated on isDeveloper prop ─────── */}
      {isDeveloper && scrollDiag && (
        <div
          className="flex-shrink-0 flex items-center gap-2 px-3 pb-1 text-[0.5rem] font-mono select-none justify-center"
          style={{ color: 'rgba(97,214,178,0.35)' }}
          aria-hidden="true"
          data-qlpa-dev-scroll-diag="true"
        >
          <span>scroll:{scrollDiag.scrollOwner}</span>
          <span>·</span>
          <span>vvh:{scrollDiag.viewportHeight}px</span>
          <span>·</span>
          <span>lock:{scrollDiag.bodyLocked ? '✓' : '✗'}</span>
        </div>
      )}

      {/* ── Sole scroll owner ─────────────────────────────────────────────
          .qlpa-sheet-body applies:
            flex:1 1 0%  min-height:0  overflow-y:auto
            overscroll-behavior:contain  -webkit-overflow-scrolling:touch
            touch-action:pan-y

          flex-1 + min-h-0 on a flex child with a resolved parent height
          → scroll body gets (parent height − handle height) of space.
          overflow-y:auto activates because content is taller than the box.

          stopPropagation on touchstart/touchmove:
            Gesture is consumed here. Never reaches backdrop or body.
            We do NOT call preventDefault — that would cancel the browser's
            native scroll classification and freeze the sheet.
          ────────────────────────────────────────────────────────────────── */}
      <div
        data-qlpa-scroll-owner="mobile-sheet"
        className="qlpa-sheet-body"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
        }}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Send gate notice ─────────────────────────────────────────────────────────
// Shown inline (above the composer) when trust level is 'unknown'.
// Does not block typing — composer stays fully interactive.

function SendGateNotice({ onInviteMember }: { onInviteMember: () => void }) {
  const { t } = useT();
  return (
    <div
      className="flex items-center gap-3 px-phi-4 py-2 flex-shrink-0 md:px-phi-5"
      style={{
        background: 'hsl(38 72% 52% / 0.07)',
        borderTop: '1px solid hsl(38 72% 52% / 0.16)',
      }}
    >
      <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'hsl(38 80% 68%)' }} />
      <p className="text-[0.75rem] flex-1 leading-snug" style={{ color: 'hsl(38 70% 72%)' }}>
        {t('sendGate.trustRequiredBody')}
      </p>
      <button
        onClick={onInviteMember}
        className="flex items-center gap-1 text-[0.6875rem] font-semibold flex-shrink-0
          hover:opacity-80 transition-opacity touch-manipulation"
        style={{ color: 'hsl(38 80% 68%)' }}
      >
        <UserPlus className="w-3 h-3" />
        <span>{t('sendGate.inviteMember')}</span>
      </button>
    </div>
  );
}

// ─── Send micro-animation ─────────────────────────────────────────────────────

function SendProgressBar({
  step,
  blocked,
  pending,
  onDismiss,
}: {
  step: number;
  blocked: boolean;
  pending: boolean;
  onDismiss: () => void;
}) {
  const { t } = useT();
  const SEND_STEPS = [
    { key: 'consent', label: t('messages.sendConsent'), icon: <ShieldCheck className="w-3 h-3" /> },
    { key: 'encrypt', label: t('messages.sendEncrypt'), icon: <Lock className="w-3 h-3" /> },
    { key: 'store',   label: t('messages.sendStore'),   icon: <Database className="w-3 h-3" /> },
  ];
  const isDone = step === 4;
  const activeIdx = Math.min(step - 1, 2);

  const finalLabel = blocked
    ? t('messages.sendBlocked')
    : pending
    ? t('messages.sendPending')
    : t('messages.sendDone');

  return (
    <div className="px-phi-4 py-phi-3 border-t border-sky-500/10 backdrop-blur-xl
      animate-slide-in-up flex-shrink-0 md:px-phi-5"
      style={{ background: 'hsl(214 40% 8% / 0.60)' }}>
      {!isDone ? (
        <div className="flex items-center gap-phi-3">
          {SEND_STEPS.map((s, i) => {
            const isActive = i === activeIdx;
            const isPast   = i < activeIdx;
            return (
              <div key={s.key} className="flex items-center gap-phi-3">
                <div className={`flex items-center gap-phi-2 px-phi-4 h-[1.625rem] rounded-full
                  text-[0.6875rem] font-semibold transition-all duration-300 ease-in-out
                  ${isActive
                    ? 'bg-primary text-primary-foreground scale-[1.04]'
                    : isPast
                    ? 'text-emerald-400'
                    : 'bg-muted text-muted-foreground/40'}`}
                  style={isPast ? { background: 'hsl(158 58% 46% / 0.14)', border: '1px solid hsl(158 58% 46% / 0.22)' } : undefined}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </div>
                {i < SEND_STEPS.length - 1 && (
                  <div className={`h-[2px] rounded-full transition-all duration-300 ease-in-out
                    ${isPast ? 'w-phi-4 bg-emerald-300' : 'w-phi-3 bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-phi-3 text-[0.8125rem] font-medium"
          style={{ color: blocked ? 'hsl(4 60% 68%)' : pending ? 'hsl(38 80% 72%)' : 'hsl(158 58% 64%)' }}>
          <div className="w-[0.375rem] h-[0.375rem] rounded-full flex-shrink-0"
            style={{ background: blocked ? 'hsl(4 60% 55%)' : pending ? 'hsl(38 88% 62%)' : 'hsl(158 58% 50%)' }} />
          <span className="flex-1">{finalLabel}</span>
          <button
            onClick={onDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full
              opacity-40 hover:opacity-70 transition-opacity flex-shrink-0"
          >
            <X className="w-[0.875rem] h-[0.875rem]" />
          </button>
        </div>
      )}
    </div>
  );
}
