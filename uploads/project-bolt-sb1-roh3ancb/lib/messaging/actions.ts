import { supabase } from '../supabase';
import type {
  Message,
  MessageType,
  ConversationType,
  StorageMode,
  TrustLevel,
  IntentionMirrorState,
  ConsentMatrix,
  SafetyPolicy,
  TrustRelationship,
  IntentionMirror,
  QLPAValidationResult,
  ActionState,
} from './types';
import { validateConsent } from './consent';
import { validateTrustLevel } from './trust';
import { validateSafetyPolicy, validateRateLimit } from './safety';
import { validateStorageMode, placeholderIntegrityHash } from './storage';
import { checkIntentionMirror, validateIntentionMirrorState } from './intentionMirror';
import { writeLedgerEvent, buildLedgerDetail } from './ledger';

export interface SendMessageInput {
  senderId: string; // EarthID
  conversationId: string;
  conversationType: ConversationType;
  recipientId: string; // EarthID of primary recipient or conversation owner
  type: MessageType;
  body?: string;
  replyToMessageId?: string;
  actionState?: ActionState;
  storageMode?: StorageMode;

  // QLPA context
  consentMatrix: ConsentMatrix;
  recipientSafetyPolicy: SafetyPolicy;
  trustRelationships: TrustRelationship[];
  senderStoragePreference: StorageMode;
  conversationStorageMode: StorageMode;
  senderIntentionMirrorConfig: IntentionMirror;
  recentMessageCountThisHour: number;
  intentionMirrorState: IntentionMirrorState;
  isSelf?: boolean;
}

// Runs all six QLPA validations in sequence.
// Validations 1-5 are hard gates — failure stops message creation.
// Validation 6 (Intention Mirror) records state but never blocks.
export async function runQLPAValidations(
  input: SendMessageInput
): Promise<QLPAValidationResult> {
  const { senderId, conversationType, recipientId, body, type } = input;

  // 1. Consent
  const trustResult = validateTrustLevel({
    fromEarthId: senderId,
    toEarthId: recipientId,
    relationships: input.trustRelationships,
  });

  await writeLedgerEvent({
    earthId: senderId,
    relatedEarthId: recipientId,
    conversationId: input.conversationId,
    eventType: trustResult.passed ? 'trust_checked' : 'trust_denied',
    passed: trustResult.passed,
    detail: buildLedgerDetail(trustResult.passed, trustResult.reason),
  });

  if (!trustResult.passed) {
    return {
      passed: false,
      failedAt: 'trust',
      reason: trustResult.reason,
      intentionMirrorState: 'not_checked',
    };
  }

  // 2. Consent
  const consentResult = validateConsent({
    senderTrustLevel: trustResult.effectiveLevel,
    conversationType,
    consentMatrix: input.consentMatrix,
    isSelf: input.isSelf ?? false,
  });

  await writeLedgerEvent({
    earthId: senderId,
    relatedEarthId: recipientId,
    conversationId: input.conversationId,
    eventType: consentResult.passed ? 'consent_validated' : 'consent_denied',
    passed: consentResult.passed,
    detail: buildLedgerDetail(consentResult.passed, consentResult.reason),
  });

  if (!consentResult.passed) {
    return {
      passed: false,
      failedAt: 'consent',
      reason: consentResult.reason,
      intentionMirrorState: 'not_checked',
    };
  }

  // 3. Safety policy
  const safetyResult = validateSafetyPolicy({
    senderEarthId: senderId,
    recipientPolicy: input.recipientSafetyPolicy,
    trustLevel: trustResult.effectiveLevel,
    recentMessageCount: input.recentMessageCountThisHour,
  });

  await writeLedgerEvent({
    earthId: senderId,
    relatedEarthId: recipientId,
    conversationId: input.conversationId,
    eventType: safetyResult.passed ? 'safety_checked' : 'safety_denied',
    passed: safetyResult.passed,
    detail: buildLedgerDetail(safetyResult.passed, safetyResult.reason),
  });

  if (!safetyResult.passed) {
    return {
      passed: false,
      failedAt: 'safety',
      reason: safetyResult.reason,
      intentionMirrorState: 'not_checked',
    };
  }

  // 4. Rate limit
  const rateLimitResult = validateRateLimit({
    senderEarthId: senderId,
    trustLevel: trustResult.effectiveLevel,
    recentMessageCount: input.recentMessageCountThisHour,
    policy: input.recipientSafetyPolicy,
  });

  await writeLedgerEvent({
    earthId: senderId,
    relatedEarthId: recipientId,
    conversationId: input.conversationId,
    eventType: rateLimitResult.passed ? 'rate_limit_checked' : 'rate_limit_exceeded',
    passed: rateLimitResult.passed,
    detail: buildLedgerDetail(rateLimitResult.passed, rateLimitResult.reason),
  });

  if (!rateLimitResult.passed) {
    return {
      passed: false,
      failedAt: 'rateLimit',
      reason: rateLimitResult.reason,
      intentionMirrorState: 'not_checked',
    };
  }

  // 5. Storage sovereignty
  const storageResult = validateStorageMode({
    requestedMode: input.storageMode ?? 'encrypted_relay',
    userPreference: input.senderStoragePreference,
    conversationMode: input.conversationStorageMode,
  });

  await writeLedgerEvent({
    earthId: senderId,
    conversationId: input.conversationId,
    eventType: 'storage_validated',
    passed: storageResult.passed,
    detail: `Resolved storage mode: ${storageResult.resolvedMode}`,
  });

  // 6. Intention Mirror — records state, never blocks
  const mirrorReflection = checkIntentionMirror({
    body: body ?? '',
    messageType: type,
    config: input.senderIntentionMirrorConfig,
    currentState: input.intentionMirrorState,
  });

  const mirrorValidation = validateIntentionMirrorState(mirrorReflection.state);

  if (mirrorReflection.triggered) {
    await writeLedgerEvent({
      earthId: senderId,
      conversationId: input.conversationId,
      eventType: input.intentionMirrorState === 'user_overrode'
        ? 'mirror_overrode'
        : 'mirror_reflected',
      passed: true,
      detail: mirrorReflection.concerns.join(' | '),
    });
  }

  return {
    passed: true,
    intentionMirrorState: mirrorValidation.state,
  };
}

export async function sendMessage(input: SendMessageInput): Promise<Message | null> {
  const validationResult = await runQLPAValidations(input);

  if (!validationResult.passed) {
    return null;
  }

  const storageResult = validateStorageMode({
    requestedMode: input.storageMode ?? 'encrypted_relay',
    userPreference: input.senderStoragePreference,
    conversationMode: input.conversationStorageMode,
  });

  const trustResult = validateTrustLevel({
    fromEarthId: input.senderId,
    toEarthId: input.recipientId,
    relationships: input.trustRelationships,
  });

  const now = new Date().toISOString();
  const integrityHash = placeholderIntegrityHash(
    input.body ?? '',
    input.senderId,
    now
  );

  const newMessage: Omit<Message, 'id'> = {
    conversationId: input.conversationId,
    senderId: input.senderId,
    type: input.type,
    body: storageResult.resolvedMode === 'local_only' ? undefined : input.body,
    consentStatus: 'allowed',
    storageMode: storageResult.resolvedMode,
    trustLevel: trustResult.effectiveLevel,
    actionState: input.actionState ?? 'none',
    intentionMirrorState: validationResult.intentionMirrorState,
    integrityHash,
    replyToMessageId: input.replyToMessageId,
    isDeleted: false,
    createdAt: now,
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(newMessage)
    .select()
    .single();

  if (error) {
    console.error('[Actions] Failed to insert message:', error.message);
    return null;
  }

  await writeLedgerEvent({
    earthId: input.senderId,
    relatedEarthId: input.recipientId,
    conversationId: input.conversationId,
    messageId: data.id,
    eventType: 'message_created',
    passed: true,
    detail: `Message of type '${input.type}' created with storage mode '${storageResult.resolvedMode}'.`,
  });

  return data as Message;
}
