/**
 * EarthOS Messaging — Local-First Persistence (Layer 2 + Layer 3)
 *
 * Stores conversations, messages, members, message actions, and sovereignty
 * settings in localStorage. All reads/writes are wrapped in try/catch and
 * guarded against SSR.
 *
 * Storage key: earthos.messaging.local
 */

import type {
  Conversation,
  ConversationMember,
  ConversationType,
  Message,
  MessageAction,
  LedgerEvent,
  ConversationSovereigntySettings,
  UserSovereigntySettings,
  StorageMode,
  TrustLevel,
  IntentionMirror,
  MessageRetentionTimer,
  MessageDeleteScope,
} from './types';

const STORAGE_KEY = 'earthos.messaging.local';
const RETENTION_STORAGE_KEY = 'earthos.messaging.retention.v1';
const SELECTED_ID_KEY = 'earthos.messaging.selected_id';

export interface LocalStore {
  conversations: Conversation[];
  messages: Message[];
  members: ConversationMember[];
  messageActions: MessageAction[];
  conversationSettings: ConversationSovereigntySettings[];
  userSettings: UserSovereigntySettings[];
  ledgerEvents: LedgerEvent[];
  version: number;
}

const CURRENT_VERSION = 2;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadLocalStore(): LocalStore | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    if (typeof parsed !== 'object' || parsed === null) return null;
    return {
      conversations:        Array.isArray(parsed.conversations)        ? parsed.conversations        : [],
      messages:             Array.isArray(parsed.messages)             ? parsed.messages             : [],
      members:              Array.isArray(parsed.members)              ? parsed.members              : [],
      messageActions:       Array.isArray(parsed.messageActions)       ? parsed.messageActions       : [],
      conversationSettings: Array.isArray(parsed.conversationSettings) ? parsed.conversationSettings : [],
      userSettings:         Array.isArray(parsed.userSettings)         ? parsed.userSettings         : [],
      ledgerEvents:         Array.isArray(parsed.ledgerEvents)         ? parsed.ledgerEvents         : [],
      version: parsed.version ?? CURRENT_VERSION,
    };
  } catch {
    return null;
  }
}

export function saveLocalStore(store: LocalStore): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, version: CURRENT_VERSION }));
  } catch {
    // Storage quota or private browsing — fail silently
  }
}

export function clearLocalStore(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SELECTED_ID_KEY);
  } catch {
    // ignore
  }
}

// ─── Selected conversation ID ─────────────────────────────────────────────────

export function saveSelectedId(id: string | null): void {
  if (!isBrowser()) return;
  try {
    if (id === null) {
      localStorage.removeItem(SELECTED_ID_KEY);
    } else {
      localStorage.setItem(SELECTED_ID_KEY, id);
    }
  } catch {
    // Private browsing or quota — non-critical, selection simply won't restore
  }
}

export function loadSelectedId(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(SELECTED_ID_KEY);
  } catch {
    return null;
  }
}

// ─── Quota-safe save with error return ───────────────────────────────────────

/** Returns null on success, or a QLPA-truthful error message string on failure. */
export function saveLocalStoreSafe(store: LocalStore): string | null {
  if (!isBrowser()) return null;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, version: CURRENT_VERSION }));
    return null;
  } catch (e) {
    if (e instanceof DOMException && (
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      return 'Your device storage is full. Clear some space to keep your messages safe locally.';
    }
    return 'Your messages could not be saved locally. This device may be in private browsing mode.';
  }
}

/**
 * Merges seed data with stored data. Stored records win (they may be newer).
 * Seed records fill in any gaps.
 */
export function mergeWithSeed(
  seed: Omit<LocalStore, 'version'>,
  stored: LocalStore
): LocalStore {
  function mergeById<T extends { id: string }>(seedItems: T[], storedItems: T[]): T[] {
    const map = new Map<string, T>();
    for (const item of seedItems) map.set(item.id, item);
    for (const item of storedItems) map.set(item.id, item);
    return Array.from(map.values());
  }

  function mergeByKey<T>(seedItems: T[], storedItems: T[], key: keyof T): T[] {
    const map = new Map<unknown, T>();
    for (const item of seedItems) map.set(item[key], item);
    for (const item of storedItems) map.set(item[key], item);
    return Array.from(map.values());
  }

  return {
    conversations:        mergeById(seed.conversations,        stored.conversations),
    messages:             mergeById(seed.messages,             stored.messages),
    members:              mergeById(seed.members,              stored.members),
    messageActions:       mergeById(seed.messageActions,       stored.messageActions),
    conversationSettings: mergeByKey(seed.conversationSettings, stored.conversationSettings, 'conversationId'),
    userSettings:         mergeByKey(seed.userSettings,         stored.userSettings,         'earthId'),
    ledgerEvents:         mergeById(seed.ledgerEvents ?? [],    stored.ledgerEvents),
    version: CURRENT_VERSION,
  };
}

// ─── Conversation mutators ────────────────────────────────────────────────────

export function persistNewConversation(
  store: LocalStore,
  conversation: Conversation,
  creatorMember: ConversationMember,
  settingsOverrides?: Partial<Pick<ConversationSovereigntySettings, 'trustLevel' | 'storageMode' | 'requireApproval'>>
): LocalStore {
  const defaultSettings = buildDefaultConversationSettings(conversation, settingsOverrides);
  const next: LocalStore = {
    ...store,
    conversations: [conversation, ...store.conversations.filter((c) => c.id !== conversation.id)],
    members: [...store.members.filter((m) => m.id !== creatorMember.id), creatorMember],
    conversationSettings: [
      ...store.conversationSettings.filter((s) => s.conversationId !== conversation.id),
      defaultSettings,
    ],
  };
  saveLocalStore(next);
  return next;
}

export function persistMember(store: LocalStore, member: ConversationMember): LocalStore {
  const next: LocalStore = {
    ...store,
    members: [...store.members.filter((m) => m.id !== member.id), member],
  };
  saveLocalStore(next);
  return next;
}

export function persistMessage(store: LocalStore, message: Message): LocalStore {
  const next: LocalStore = {
    ...store,
    messages: [...store.messages.filter((m) => m.id !== message.id), message],
  };
  saveLocalStore(next);
  return next;
}

export function touchConversation(store: LocalStore, conversationId: string, at: string): LocalStore {
  const next: LocalStore = {
    ...store,
    conversations: store.conversations.map((c) =>
      c.id === conversationId ? { ...c, updatedAt: at } : c
    ),
  };
  saveLocalStore(next);
  return next;
}

export function deleteConversationLocally(store: LocalStore, conversationId: string): LocalStore {
  const next: LocalStore = {
    ...store,
    conversations:        store.conversations.filter((c) => c.id !== conversationId),
    messages:             store.messages.filter((m) => m.conversationId !== conversationId),
    members:              store.members.filter((m) => m.conversationId !== conversationId),
    messageActions:       store.messageActions.filter((a) => a.conversationId !== conversationId),
    conversationSettings: store.conversationSettings.filter((s) => s.conversationId !== conversationId),
  };
  saveLocalStore(next);
  return next;
}

// ─── Sovereignty settings mutators ───────────────────────────────────────────

export function buildDefaultConversationSettings(
  conversation: Conversation,
  overrides?: Partial<Pick<ConversationSovereigntySettings, 'trustLevel' | 'storageMode' | 'requireApproval'>>
): ConversationSovereigntySettings {
  return {
    conversationId: conversation.id,
    storageMode: overrides?.storageMode ?? conversation.storageMode,
    trustLevel: overrides?.trustLevel ?? 'unknown',
    allowDirectMessages: true,
    requireApproval: overrides?.requireApproval ?? false,
    allowProjectInvites: true,
    allowEventInvites: true,
    allowLocationMessages: conversation.type === 'place',
    isMuted: false,
    isBlocked: false,
    updatedAt: new Date().toISOString(),
  };
}

export function getConversationSettings(
  store: LocalStore,
  conversationId: string
): ConversationSovereigntySettings {
  return (
    store.conversationSettings.find((s) => s.conversationId === conversationId) ??
    buildDefaultConversationSettings(
      store.conversations.find((c) => c.id === conversationId) ?? {
        id: conversationId,
        type: 'direct',
        createdByEarthId: '',
        storageMode: 'encrypted_relay',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    )
  );
}

export function updateConversationSettings(
  store: LocalStore,
  patch: Partial<ConversationSovereigntySettings> & { conversationId: string }
): LocalStore {
  const existing = getConversationSettings(store, patch.conversationId);
  const updated: ConversationSovereigntySettings = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const next: LocalStore = {
    ...store,
    conversationSettings: [
      ...store.conversationSettings.filter((s) => s.conversationId !== patch.conversationId),
      updated,
    ],
    // Also sync storageMode on the conversation record if changed
    conversations: patch.storageMode
      ? store.conversations.map((c) =>
          c.id === patch.conversationId ? { ...c, storageMode: patch.storageMode as StorageMode, updatedAt: updated.updatedAt } : c
        )
      : store.conversations,
    // Sync trustSnapshot on the viewer's member record if trust changed
    members: patch.trustLevel
      ? store.members.map((m) =>
          m.conversationId === patch.conversationId
            ? { ...m, trustSnapshot: patch.trustLevel as TrustLevel }
            : m
        )
      : store.members,
  };
  saveLocalStore(next);
  return next;
}

export function buildDefaultUserSettings(earthId: string): UserSovereigntySettings {
  return {
    earthId,
    intentionMirror: {
      enabled: true,
      checkBeforeSending: true,
      toneReflection: true,
      harmfulPatternWarning: true,
      userCanOverride: true,
      reflectionMode: 'soft',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function getUserSettings(store: LocalStore, earthId: string): UserSovereigntySettings {
  return store.userSettings.find((s) => s.earthId === earthId) ?? buildDefaultUserSettings(earthId);
}

export function updateUserSettings(
  store: LocalStore,
  earthId: string,
  patch: Partial<Pick<UserSovereigntySettings, 'intentionMirror'>>
): LocalStore {
  const existing = getUserSettings(store, earthId);
  const updated: UserSovereigntySettings = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const next: LocalStore = {
    ...store,
    userSettings: [
      ...store.userSettings.filter((s) => s.earthId !== earthId),
      updated,
    ],
  };
  saveLocalStore(next);
  return next;
}

// ─── Local ledger ─────────────────────────────────────────────────────────────

export function appendLedgerEvent(
  store: LocalStore,
  event: Omit<LedgerEvent, 'id' | 'createdAt'>
): LocalStore {
  const full: LedgerEvent = {
    ...event,
    id: `le-local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const next: LocalStore = {
    ...store,
    ledgerEvents: [...store.ledgerEvents, full],
  };
  saveLocalStore(next);
  return next;
}

// ─── QLPA local enforcement ───────────────────────────────────────────────────

export type QLPABlockReason =
  | 'blocked_conversation'
  | 'blocked_trust'
  | 'direct_messages_disabled'
  | 'project_invites_disabled'
  | 'event_invites_disabled'
  | 'location_messages_disabled'
  | null;

export interface QLPAGuardResult {
  canSend: boolean;
  isPending: boolean;
  blockReason: QLPABlockReason;
  blockMessage: string | null;
  /** Non-blocking context notice shown near the composer */
  contextNotice: string | null;
}

export function evaluateQLPAGuard(
  settings: ConversationSovereigntySettings,
  conversationType: ConversationType
): QLPAGuardResult {
  // Hard block: conversation explicitly blocked
  if (settings.isBlocked) {
    return {
      canSend: false, isPending: false,
      blockReason: 'blocked_conversation',
      blockMessage: 'This conversation is blocked. No new messages can be sent.',
      contextNotice: null,
    };
  }

  // Hard block: trust level is blocked
  if (settings.trustLevel === 'blocked') {
    return {
      canSend: false, isPending: false,
      blockReason: 'blocked_trust',
      blockMessage: 'Trust level is blocked. Messaging is paused.',
      contextNotice: null,
    };
  }

  // Hard block: direct messages disabled for a direct conversation
  if (!settings.allowDirectMessages && conversationType === 'direct') {
    return {
      canSend: false, isPending: false,
      blockReason: 'direct_messages_disabled',
      blockMessage: 'Direct messages are not allowed for this conversation.',
      contextNotice: null,
    };
  }

  // Hard block: project invites disabled for a project conversation
  if (!settings.allowProjectInvites && conversationType === 'project') {
    return {
      canSend: false, isPending: false,
      blockReason: 'project_invites_disabled',
      blockMessage: 'Project invites are not allowed. Enable them in consent settings to participate.',
      contextNotice: null,
    };
  }

  // Hard block: event invites disabled for an event conversation
  if (!settings.allowEventInvites && conversationType === 'event') {
    return {
      canSend: false, isPending: false,
      blockReason: 'event_invites_disabled',
      blockMessage: 'Event invites are not allowed. Enable them in consent settings to participate.',
      contextNotice: null,
    };
  }

  // Hard block: location messages disabled for a place conversation
  if (!settings.allowLocationMessages && conversationType === 'place') {
    return {
      canSend: false, isPending: false,
      blockReason: 'location_messages_disabled',
      blockMessage: 'Location-based messages are not allowed for this conversation. Enable them in consent settings.',
      contextNotice: null,
    };
  }

  // Resolve context notice for special conversation types
  const contextNotice = resolveContextNotice(conversationType);

  // Soft gate: require approval — message created as pending
  if (settings.requireApproval) {
    return { canSend: true, isPending: true, blockReason: null, blockMessage: null, contextNotice };
  }

  return { canSend: true, isPending: false, blockReason: null, blockMessage: null, contextNotice };
}

function resolveContextNotice(type: ConversationType): string | null {
  switch (type) {
    case 'council':
      return 'Council space — governance principles apply. Messages are recorded for the circle.';
    case 'support_circle':
      return 'Support circle — held with care. All participation is voluntary and consensual.';
    case 'cause':
      return 'Cause space — aligned around shared purpose. Contributions are welcome.';
    default:
      return null;
  }
}

// ─── Per-conversation retention settings ─────────────────────────────────────

export interface PersistedRetentionSettings {
  timer: MessageRetentionTimer;
  customDurationMs?: number;
  deleteScope: MessageDeleteScope;
}

type RetentionStore = Record<string, PersistedRetentionSettings>;

const DEFAULT_RETENTION: PersistedRetentionSettings = {
  timer: 'off',
  deleteScope: 'local_only',
};

export function loadRetentionStore(): RetentionStore {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(RETENTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as RetentionStore;
  } catch {
    return {};
  }
}

function saveRetentionStore(store: RetentionStore): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(RETENTION_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage quota or private browsing — fail silently
  }
}

export function getRetentionSettings(conversationId: string): PersistedRetentionSettings {
  const store = loadRetentionStore();
  return store[conversationId] ?? { ...DEFAULT_RETENTION };
}

export function persistRetentionSettings(
  conversationId: string,
  settings: PersistedRetentionSettings
): void {
  const store = loadRetentionStore();
  store[conversationId] = settings;
  saveRetentionStore(store);
}

export function clearRetentionSettingsForConversation(conversationId: string): void {
  const store = loadRetentionStore();
  delete store[conversationId];
  saveRetentionStore(store);
}

// ─── Data portability ─────────────────────────────────────────────────────────

export function exportLocalDataAsJson(store: LocalStore): void {
  if (!isBrowser()) return;
  try {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earthos-messaging-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}
