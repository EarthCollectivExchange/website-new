/**
 * QLPA Net Shield Types
 * Core type definitions for the Net Shield protection architecture.
 * These types define the vocabulary for future intelligent protection flows.
 *
 * STATUS: FOUNDATION — types only, no runtime behavior yet.
 */

/** How strongly a conversation or context is shielded. */
export type NetShieldLevel =
  | 'open'       // No extra protection; default trust rules apply
  | 'protected'  // Local safeguards active; encrypted local storage
  | 'private'    // Content stays on device; no relay without explicit consent
  | 'sealed'     // Full local sealing; no sync, no preview outside app
  | 'guardian';  // Guardian-assisted protection; future relay enforcement required

/** Actions the Net Shield can prepare (not yet execute). */
export type NetShieldAction =
  | 'none'                  // No action required
  | 'local_lock'            // Pause local access until identity confirmed
  | 'hide_content'          // Conceal message previews and notification content
  | 'request_recovery'      // Begin a calm recovery flow (identity re-confirm)
  | 'notify_sender'         // Prepare a source-sender notice (future relay required)
  | 'prepare_remote_delete'; // Stage a remote delete for when relay is available

/** Policy for handling an unrecognized or wrong-access attempt. */
export type WrongAccessPolicy =
  | 'ignore'          // Take no action; log event only
  | 'pause_access'    // Pause access to sensitive content gracefully
  | 'notify_source'   // Prepare a calm notice to the source sender (future)
  | 'guardian_review'; // Escalate to guardian contact for review (future)

/** Scope of what a shield policy applies to. */
export type ProtectionScope =
  | 'conversation'
  | 'message'
  | 'file'
  | 'voice'
  | 'identity';

/** Overall readiness of the Net Shield for a given context. */
export type NetShieldStatus =
  | 'ready'                   // All required capabilities are in place
  | 'needs_identity'          // An identity (EarthID) is required to activate
  | 'local_only'              // Operating in local-safeguard mode; no relay
  | 'future_relay_required';  // Full protection needs relay; foundation is set

/** A complete Net Shield policy object. */
export interface NetShieldPolicy {
  level: NetShieldLevel;
  allowedActions: NetShieldAction[];
  wrongAccessPolicy: WrongAccessPolicy;
  canNotifySourceSender: boolean;
  canPrepareRemoteDelete: boolean;
  requiresIdentity: boolean;
  requiresRelay: boolean;
  keepsContentLocal: boolean;
}
