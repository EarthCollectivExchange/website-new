/**
 * Delivery States
 * Canonical delivery state definitions for messages and files.
 * Each state has an honest label — no overclaiming delivery guarantees.
 */

export type DeliveryStateId =
  | 'local_only'
  | 'waiting_for_recipient'
  | 'ready_to_deliver'
  | 'delivery_paused'
  | 'delivered_future';

export interface DeliveryStateDefinition {
  id: DeliveryStateId;
  simpleLabelKey: string;
  advancedLabelKey: string;
  isTerminal: boolean;
  requiresRelay: boolean;
  maturity: 'active' | 'future';
}

export const DELIVERY_STATE_DEFINITIONS: DeliveryStateDefinition[] = [
  {
    id: 'local_only',
    simpleLabelKey: 'delivery.simple.localOnly',
    advancedLabelKey: 'delivery.advanced.localOnly',
    isTerminal: false,
    requiresRelay: false,
    maturity: 'active',
  },
  {
    id: 'waiting_for_recipient',
    simpleLabelKey: 'delivery.simple.waitingRecipient',
    advancedLabelKey: 'delivery.advanced.readyForRelay',
    isTerminal: false,
    requiresRelay: true,
    maturity: 'active',
  },
  {
    id: 'ready_to_deliver',
    simpleLabelKey: 'delivery.simple.readyToDeliver',
    advancedLabelKey: 'delivery.advanced.readyToRelay',
    isTerminal: false,
    requiresRelay: true,
    maturity: 'active',
  },
  {
    id: 'delivery_paused',
    simpleLabelKey: 'delivery.simple.blocked',
    advancedLabelKey: 'delivery.advanced.blocked',
    isTerminal: false,
    requiresRelay: false,
    maturity: 'active',
  },
  {
    id: 'delivered_future',
    simpleLabelKey: 'delivery.simple.readyToDeliver',
    advancedLabelKey: 'delivery.developer.readyForRelay',
    isTerminal: true,
    requiresRelay: true,
    maturity: 'future',
  },
];

const STATE_MAP = new Map(DELIVERY_STATE_DEFINITIONS.map((s) => [s.id, s]));

export function getDeliveryState(id: DeliveryStateId): DeliveryStateDefinition | undefined {
  return STATE_MAP.get(id);
}

export function getActiveDeliveryStates(): DeliveryStateDefinition[] {
  return DELIVERY_STATE_DEFINITIONS.filter((s) => s.maturity === 'active');
}
