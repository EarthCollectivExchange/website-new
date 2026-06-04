/**
 * EarthOS Metadata Sync Engine (Layer 5)
 *
 * Syncs non-private metadata to Supabase when the user is authenticated.
 *
 * NEVER syncs:
 *   - message body
 *   - encryptedPayload
 *   - files, voice notes, or any private content
 *
 * Syncs only:
 *   - earth_ids (profile metadata)
 *   - conversations (type, title, description, storageMode — no body)
 *   - conversation_members (role, trustSnapshot, joinedAt)
 *   - conversation_sovereignty_settings
 *   - user_sovereignty_settings
 *   - ledger_events (eventType, passed, detail — no message body)
 *
 * Local-first guarantee:
 *   Any sync failure is swallowed — local messaging continues uninterrupted.
 *   Failed sync updates the SyncStatus so the UI can show "Sync error" + Retry.
 */

import { supabase } from '../supabase';
import type {
  Conversation,
  ConversationMember,
  LedgerEvent,
  ConversationSovereigntySettings,
  UserSovereigntySettings,
} from './types';
import type { LocalStore } from './localPersistence';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus =
  | 'idle'            // no auth, never attempted
  | 'syncing'         // in-flight
  | 'synced'          // last sync succeeded
  | 'error'           // last sync failed (DB or network error)
  | 'offline'         // navigator.onLine === false
  | 'unauthenticated'; // session resolved but no EarthID yet

export type TableSyncStatus = 'pending' | 'synced' | 'skipped' | 'error';

export interface TableSyncResult {
  status: TableSyncStatus;
  rowsSynced: number;
  error: string | null;
}

export interface SyncTableMap {
  earth_ids: TableSyncResult;
  conversations: TableSyncResult;
  conversation_members: TableSyncResult;
  conversation_sovereignty_settings: TableSyncResult;
  user_sovereignty_settings: TableSyncResult;
  ledger_events: TableSyncResult;
}

export interface SyncResult {
  status: SyncStatus;
  syncedAt: string | null;
  error: string | null;
  tables: SyncTableMap | null;
}

const PENDING_TABLE: TableSyncResult = { status: 'pending', rowsSynced: 0, error: null };
const SKIPPED_TABLE: TableSyncResult = { status: 'skipped', rowsSynced: 0, error: null };

export const DEFAULT_SYNC_RESULT: SyncResult = {
  status: 'idle',
  syncedAt: null,
  error: null,
  tables: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
}

async function getAuthUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

/** Only sync rows whose IDs are real Supabase UUIDs, not local mock keys like "eid-001". */
function isUUID(val: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

// ─── Individual sync operations ───────────────────────────────────────────────

export async function syncEarthIdProfile(earthId: {
  id: string;
  authUserId: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  storagePreference: string;
  intentionMirrorConfig: object;
}): Promise<TableSyncResult> {
  if (!isUUID(earthId.id)) return SKIPPED_TABLE;
  try {
    const { error } = await supabase.from('earth_ids').upsert(
      {
        id: earthId.id,
        auth_user_id: earthId.authUserId,
        handle: earthId.handle,
        display_name: earthId.displayName,
        avatar_url: earthId.avatarUrl ?? null,
        bio: earthId.bio ?? null,
        storage_preference: earthId.storagePreference,
        intention_mirror_config: earthId.intentionMirrorConfig,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('[Sync] earth_ids upsert:', error.message);
      return { status: 'error', rowsSynced: 0, error: error.message };
    }
    return { status: 'synced', rowsSynced: 1, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Sync] earth_ids upsert threw:', msg);
    return { status: 'error', rowsSynced: 0, error: msg };
  }
}

async function syncConversations(conversations: Conversation[]): Promise<TableSyncResult> {
  const rows = conversations.filter(
    (c) => isUUID(c.id) && isUUID(c.createdByEarthId)
  );
  if (rows.length === 0) return SKIPPED_TABLE;

  try {
    const { error } = await supabase.from('conversations').upsert(
      rows.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title ?? null,
        description: c.description ?? null,
        created_by_earth_id: c.createdByEarthId,
        context_entity_id: c.contextEntityId ?? null,
        storage_mode: c.storageMode,
        is_archived: c.isArchived,
        created_at: c.createdAt,
        updated_at: c.updatedAt,
      })),
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('[Sync] conversations upsert:', error.message);
      return { status: 'error', rowsSynced: 0, error: error.message };
    }
    return { status: 'synced', rowsSynced: rows.length, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Sync] conversations upsert threw:', msg);
    return { status: 'error', rowsSynced: 0, error: msg };
  }
}

async function syncConversationMembers(members: ConversationMember[]): Promise<TableSyncResult> {
  const rows = members.filter(
    (m) => isUUID(m.id) && isUUID(m.conversationId) && isUUID(m.earthId)
  );
  if (rows.length === 0) return SKIPPED_TABLE;

  try {
    const { error } = await supabase.from('conversation_members').upsert(
      rows.map((m) => ({
        id: m.id,
        conversation_id: m.conversationId,
        earth_id: m.earthId,
        role: m.role,
        trust_snapshot: m.trustSnapshot,
        joined_at: m.joinedAt,
        last_read_at: m.lastReadAt ?? null,
      })),
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('[Sync] conversation_members upsert:', error.message);
      return { status: 'error', rowsSynced: 0, error: error.message };
    }
    return { status: 'synced', rowsSynced: rows.length, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Sync] conversation_members upsert threw:', msg);
    return { status: 'error', rowsSynced: 0, error: msg };
  }
}

async function syncConversationSettings(
  settings: ConversationSovereigntySettings[],
  earthIdUUID: string
): Promise<TableSyncResult> {
  const rows = settings.filter((s) => isUUID(s.conversationId));
  if (rows.length === 0) return SKIPPED_TABLE;

  try {
    const { error } = await supabase.from('conversation_sovereignty_settings').upsert(
      rows.map((s) => ({
        conversation_id: s.conversationId,
        earth_id: earthIdUUID,
        storage_mode: s.storageMode,
        trust_level: s.trustLevel,
        allow_direct_messages: s.allowDirectMessages,
        require_approval: s.requireApproval,
        allow_project_invites: s.allowProjectInvites,
        allow_event_invites: s.allowEventInvites,
        allow_location_messages: s.allowLocationMessages,
        is_muted: s.isMuted,
        is_blocked: s.isBlocked,
        updated_at: s.updatedAt,
      })),
      { onConflict: 'conversation_id,earth_id' }
    );
    if (error) {
      console.warn('[Sync] conversation_sovereignty_settings upsert:', error.message);
      return { status: 'error', rowsSynced: 0, error: error.message };
    }
    return { status: 'synced', rowsSynced: rows.length, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Sync] conversation_sovereignty_settings upsert threw:', msg);
    return { status: 'error', rowsSynced: 0, error: msg };
  }
}

async function syncUserSettings(
  settings: UserSovereigntySettings[],
  earthIdUUID: string
): Promise<TableSyncResult> {
  const mine = settings.find((s) => s.earthId === earthIdUUID);
  if (!mine) return SKIPPED_TABLE;

  try {
    const { error } = await supabase.from('user_sovereignty_settings').upsert(
      {
        earth_id: earthIdUUID,
        intention_mirror: mine.intentionMirror,
        updated_at: mine.updatedAt,
      },
      { onConflict: 'earth_id' }
    );
    if (error) {
      console.warn('[Sync] user_sovereignty_settings upsert:', error.message);
      return { status: 'error', rowsSynced: 0, error: error.message };
    }
    return { status: 'synced', rowsSynced: 1, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Sync] user_sovereignty_settings upsert threw:', msg);
    return { status: 'error', rowsSynced: 0, error: msg };
  }
}

async function syncLedgerEvents(
  events: LedgerEvent[],
  earthIdUUID: string
): Promise<TableSyncResult> {
  // Only sync events with real UUID IDs belonging to this EarthID.
  // Never includes message body — only governance metadata fields.
  const rows = events.filter(
    (e) => isUUID(e.id) && e.earthId === earthIdUUID
  );
  if (rows.length === 0) return SKIPPED_TABLE;

  try {
    const { error } = await supabase.from('ledger_events').upsert(
      rows.map((e) => ({
        id: e.id,
        earth_id: e.earthId,
        related_earth_id: e.relatedEarthId && isUUID(e.relatedEarthId) ? e.relatedEarthId : null,
        conversation_id: e.conversationId && isUUID(e.conversationId) ? e.conversationId : null,
        message_id: e.messageId && isUUID(e.messageId) ? e.messageId : null,
        event_type: e.eventType,
        passed: e.passed,
        detail: e.detail ?? null,
        created_at: e.createdAt,
      })),
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('[Sync] ledger_events upsert:', error.message);
      return { status: 'error', rowsSynced: 0, error: error.message };
    }
    return { status: 'synced', rowsSynced: rows.length, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Sync] ledger_events upsert threw:', msg);
    return { status: 'error', rowsSynced: 0, error: msg };
  }
}

// ─── Full metadata sync ───────────────────────────────────────────────────────

export async function syncMetadata(
  store: LocalStore,
  earthIdUUID: string
): Promise<SyncResult> {
  if (!isOnline()) {
    return { status: 'offline', syncedAt: null, error: 'Device appears to be offline.', tables: null };
  }

  const authUserId = await getAuthUserId();
  if (!authUserId) {
    return { status: 'unauthenticated', syncedAt: null, error: null, tables: null };
  }

  try {
    const [convResult, membersResult, convSettingsResult, userSettingsResult, ledgerResult] =
      await Promise.all([
        syncConversations(store.conversations),
        syncConversationMembers(store.members),
        syncConversationSettings(store.conversationSettings, earthIdUUID),
        syncUserSettings(store.userSettings, earthIdUUID),
        syncLedgerEvents(store.ledgerEvents, earthIdUUID),
      ]);

    const tables: SyncTableMap = {
      earth_ids: PENDING_TABLE, // synced separately via syncEarthIdProfile
      conversations: convResult,
      conversation_members: membersResult,
      conversation_sovereignty_settings: convSettingsResult,
      user_sovereignty_settings: userSettingsResult,
      ledger_events: ledgerResult,
    };

    const anyError = Object.values(tables).some((t) => t.status === 'error');

    return {
      status: anyError ? 'error' : 'synced',
      syncedAt: new Date().toISOString(),
      error: anyError ? 'One or more tables failed to sync. Local data is safe.' : null,
      tables,
    };
  } catch (err) {
    return {
      status: 'error',
      syncedAt: null,
      error: err instanceof Error ? err.message : 'Unexpected sync error.',
      tables: null,
    };
  }
}

// ─── Remote fetch helpers (used on first sign-in to hydrate local store) ──────

export async function fetchRemoteConversationSettings(
  earthIdUUID: string
): Promise<ConversationSovereigntySettings[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_sovereignty_settings')
      .select('*')
      .eq('earth_id', earthIdUUID);

    if (error || !data) return [];

    return data.map((row) => ({
      conversationId:       row.conversation_id as string,
      storageMode:          row.storage_mode as ConversationSovereigntySettings['storageMode'],
      trustLevel:           row.trust_level as ConversationSovereigntySettings['trustLevel'],
      allowDirectMessages:  row.allow_direct_messages as boolean,
      requireApproval:      row.require_approval as boolean,
      allowProjectInvites:  row.allow_project_invites as boolean,
      allowEventInvites:    row.allow_event_invites as boolean,
      allowLocationMessages: row.allow_location_messages as boolean,
      isMuted:              row.is_muted as boolean,
      isBlocked:            row.is_blocked as boolean,
      updatedAt:            row.updated_at as string,
    }));
  } catch {
    return [];
  }
}

export async function fetchRemoteUserSettings(
  earthIdUUID: string
): Promise<UserSovereigntySettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_sovereignty_settings')
      .select('*')
      .eq('earth_id', earthIdUUID)
      .maybeSingle();

    if (error || !data) return null;

    return {
      earthId:         earthIdUUID,
      intentionMirror: data.intention_mirror as UserSovereigntySettings['intentionMirror'],
      updatedAt:       data.updated_at as string,
    };
  } catch {
    return null;
  }
}
