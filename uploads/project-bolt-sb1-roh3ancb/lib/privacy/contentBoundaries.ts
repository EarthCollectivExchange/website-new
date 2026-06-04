/**
 * Content Boundaries
 * Rules defining what data may cross which boundaries.
 * These are architectural rules, not runtime enforcement code.
 *
 * They serve as a decision guide when building features that touch data.
 */

export interface ContentBoundaryRule {
  id: string;
  description: string;
  allowed: boolean;
  requires?: string;
  caveats?: string;
}

export const CONTENT_BOUNDARY_RULES: ContentBoundaryRule[] = [
  {
    id: 'plaintext_stays_local',
    description: 'Plaintext message content must never leave the device.',
    allowed: false, // crossing this boundary is not allowed
  },
  {
    id: 'files_encrypted_before_relay',
    description: 'File content must be AES-GCM encrypted before any network transfer.',
    allowed: true,
    requires: 'Encryption must complete before upload begins.',
  },
  {
    id: 'voice_encrypted_before_relay',
    description: 'Voice memo audio must be encrypted before any network transfer.',
    allowed: true,
    requires: 'Encryption must complete before upload begins.',
  },
  {
    id: 'relay_encrypted_envelope_only',
    description: 'Backend relay receives only encrypted envelopes — no plaintext.',
    allowed: true,
    requires: 'Future relay transport only. Not active in v0.1.',
  },
  {
    id: 'stats_no_content',
    description: 'Stats system must never receive message body, file content, or voice content.',
    allowed: false,
  },
  {
    id: 'exports_user_initiated',
    description: 'Data export is always an explicit user action — no silent export.',
    allowed: true,
    requires: 'Must be triggered by user action only.',
  },
  {
    id: 'no_silent_upload',
    description: 'No data may be uploaded without explicit user awareness.',
    allowed: false,
  },
  {
    id: 'no_silent_download',
    description: 'No content may be downloaded without explicit user action.',
    allowed: false,
  },
  {
    id: 'metadata_sync_aggregate_only',
    description: 'Metadata sync (future Supabase) may only sync aggregate/routing metadata — never message content.',
    allowed: true,
    requires: 'Supabase sync layer — not active in v0.1.',
    caveats: 'Content fields must be stripped before sync payload is built.',
  },
  {
    id: 'private_keys_local_only',
    description: 'Private cryptographic keys must never leave the device.',
    allowed: false,
  },
];

export function getBoundaryRule(id: string): ContentBoundaryRule | undefined {
  return CONTENT_BOUNDARY_RULES.find((r) => r.id === id);
}

export function getProhibitedCrossings(): ContentBoundaryRule[] {
  return CONTENT_BOUNDARY_RULES.filter((r) => !r.allowed);
}
