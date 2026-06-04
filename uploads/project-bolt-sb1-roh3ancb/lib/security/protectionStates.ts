/**
 * Protection States
 * Defines what protection states a message/conversation can be in.
 * Used for honest UI labeling — no overclaiming.
 */

export type ProtectionState =
  | 'local_only'
  | 'encrypted_locally'
  | 'sealed_for_relay'
  | 'delivered'
  | 'cleared_from_device'
  | 'clear_requested'
  | 'protection_unavailable';

export interface ProtectionStateDefinition {
  id: ProtectionState;
  simpleLabelKey: string;
  advancedLabelKey: string;
  honest: boolean;
  overclaims: boolean;
}

export const PROTECTION_STATE_DEFINITIONS: ProtectionStateDefinition[] = [
  {
    id: 'local_only',
    simpleLabelKey: 'privacy.localOnly',
    advancedLabelKey: 'delivery.advanced.localOnly',
    honest: true,
    overclaims: false,
  },
  {
    id: 'encrypted_locally',
    simpleLabelKey: 'privacy.encryption',
    advancedLabelKey: 'delivery.advanced.encryptedLocally',
    honest: true,
    overclaims: false,
  },
  {
    id: 'sealed_for_relay',
    simpleLabelKey: 'privacy.encryptedRelay',
    advancedLabelKey: 'delivery.advanced.protectedRelay',
    honest: true,
    overclaims: false,
  },
  {
    id: 'delivered',
    simpleLabelKey: 'delivery.simple.readyToDeliver',
    advancedLabelKey: 'delivery.developer.readyForRelay',
    honest: true,
    overclaims: false,
  },
  {
    id: 'cleared_from_device',
    simpleLabelKey: 'messages.removedFromDevice',
    advancedLabelKey: 'messages.contentRemovedLocally',
    honest: true,
    overclaims: false,
  },
  {
    id: 'clear_requested',
    simpleLabelKey: 'messages.remoteDeletionRequested',
    advancedLabelKey: 'messages.requestRecipientDelete',
    honest: true,
    overclaims: false,
  },
  {
    id: 'protection_unavailable',
    simpleLabelKey: 'errors.cryptoFailed',
    advancedLabelKey: 'errors.cryptoFailed',
    honest: true,
    overclaims: false,
  },
];
