/**
 * EarthOS Auth Bridge (Layer 5)
 *
 * Supabase auth.users is used purely as a technical session key.
 * EarthID is the sovereign identity layer — it is never replaced by auth.uid().
 *
 * Flow on sign-in:
 *   1. Detect the authenticated Supabase session.
 *   2. Look up the earth_ids row whose auth_user_id matches auth.uid().
 *   3. If none exists, create a new EarthID row linked to this auth user.
 *   4. Return the EarthID. The UI always displays EarthID data, never auth.uid().
 */

import { supabase } from '../supabase';
import type { EarthID } from './types';

export interface AuthBridgeResult {
  earthId: EarthID | null;
  authUserId: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

function generateHandle(): string {
  const adjectives = ['river', 'cedar', 'ember', 'stone', 'willow', 'moss', 'coral', 'dusk', 'dawn', 'rain'];
  const nouns = ['nova', 'light', 'path', 'grove', 'wave', 'bloom', 'field', 'crest', 'vale', 'wind'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `@${adj}.${noun}.${num}`;
}

function generateDisplayName(handle: string): string {
  // Convert @river.nova.123 → River Nova
  const parts = handle.replace('@', '').split('.');
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export async function resolveEarthId(): Promise<AuthBridgeResult> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      return { earthId: null, authUserId: null, isAuthenticated: false, error: null };
    }

    const authUserId = sessionData.session.user.id;

    // Look up existing EarthID for this auth user
    const { data: existing, error: lookupError } = await supabase
      .from('earth_ids')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (lookupError) {
      return { earthId: null, authUserId, isAuthenticated: true, error: lookupError.message };
    }

    if (existing) {
      return {
        earthId: dbRowToEarthId(existing),
        authUserId,
        isAuthenticated: true,
        error: null,
      };
    }

    // No EarthID yet — create one linked to this auth user
    const handle = generateHandle();
    const displayName = generateDisplayName(handle);
    const now = new Date().toISOString();

    const newRow = {
      auth_user_id: authUserId,
      handle,
      display_name: displayName,
      sovereign_since: now,
      is_active: true,
      storage_preference: 'encrypted_relay',
      intention_mirror_config: {
        enabled: true,
        checkBeforeSending: true,
        toneReflection: true,
        harmfulPatternWarning: true,
        userCanOverride: true,
        reflectionMode: 'soft',
      },
    };

    const { data: created, error: createError } = await supabase
      .from('earth_ids')
      .insert(newRow)
      .select('*')
      .single();

    if (createError) {
      return { earthId: null, authUserId, isAuthenticated: true, error: createError.message };
    }

    return {
      earthId: dbRowToEarthId(created),
      authUserId,
      isAuthenticated: true,
      error: null,
    };
  } catch (err) {
    return {
      earthId: null,
      authUserId: null,
      isAuthenticated: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// Map snake_case DB row → camelCase EarthID type
function dbRowToEarthId(row: Record<string, unknown>): EarthID {
  return {
    id: row.id as string,
    authUserId: row.auth_user_id as string,
    handle: row.handle as string,
    displayName: row.display_name as string,
    avatarUrl: (row.avatar_url as string | null) ?? undefined,
    bio: (row.bio as string | null) ?? undefined,
    sovereignSince: row.sovereign_since as string,
    isActive: row.is_active as boolean,
    storagePreference: row.storage_preference as EarthID['storagePreference'],
    intentionMirrorConfig: row.intention_mirror_config as EarthID['intentionMirrorConfig'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    isLocal: false,
  };
}

export async function getAuthSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session;
  } catch {
    return null;
  }
}

export interface OtpResult {
  sent: boolean;
  error: string | null;
}

export async function signInWithOtp(email: string): Promise<OtpResult> {
  try {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true, emailRedirectTo: redirectTo },
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export interface EmailAuthResult {
  error: string | null;
}

export async function signInWithPassword(email: string, password: string): Promise<EmailAuthResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Sign in failed' };
  }
}

export async function signUp(email: string, password: string): Promise<EmailAuthResult> {
  try {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Account creation failed' };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export type AuthStateChangeCallback = (result: AuthBridgeResult) => void;

export function subscribeToAuthChanges(callback: AuthStateChangeCallback): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    // Avoid async callback directly — run async work in a detached block
    (async () => {
      if (event === 'SIGNED_OUT') {
        callback({ earthId: null, authUserId: null, isAuthenticated: false, error: null });
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const result = await resolveEarthId();
        callback(result);
      }
    })();
  });
  return () => subscription.unsubscribe();
}
