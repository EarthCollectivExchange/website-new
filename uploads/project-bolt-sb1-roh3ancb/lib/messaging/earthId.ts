import { supabase } from '../supabase';
import type { EarthID } from './types';
import { buildDefaultSafetyPolicy } from './safety';
import { buildDefaultConsentMatrix } from './consent';

export async function getEarthIdByAuthUser(authUserId: string): Promise<EarthID | null> {
  const { data, error } = await supabase
    .from('earth_ids')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) {
    console.error('[EarthID] Failed to fetch EarthID:', error.message);
    return null;
  }

  return data ? mapRowToEarthID(data) : null;
}

export async function createEarthId(
  authUserId: string,
  handle: string,
  displayName: string
): Promise<EarthID | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('earth_ids')
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    console.error('[EarthID] Failed to create EarthID:', error.message);
    return null;
  }

  const earthId = mapRowToEarthID(data);

  // Seed default consent matrix and safety policy
  await Promise.all([
    supabase.from('consent_matrices').insert(
      buildDefaultConsentMatrix(earthId.id)
    ),
    supabase.from('safety_policies').insert(
      buildDefaultSafetyPolicy(earthId.id)
    ),
  ]);

  return earthId;
}

// Map snake_case DB row to camelCase EarthID type
function mapRowToEarthID(row: Record<string, unknown>): EarthID {
  return {
    id: row.id as string,
    authUserId: row.auth_user_id as string,
    handle: row.handle as string,
    displayName: row.display_name as string,
    avatarUrl: row.avatar_url as string | undefined,
    bio: row.bio as string | undefined,
    sovereignSince: row.sovereign_since as string,
    isActive: row.is_active as boolean,
    storagePreference: row.storage_preference as EarthID['storagePreference'],
    intentionMirrorConfig: row.intention_mirror_config as EarthID['intentionMirrorConfig'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    isLocal: false,
  };
}
