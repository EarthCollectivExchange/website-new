// ─── QLPA Message Lifecycle ───────────────────────────────────────────────────
//
// Canonical message state machine.
// Every message travels a defined path from composition to delivery/clearance.
//
// State diagram:
//
//   draft
//     → reflected          (intention mirror shown)
//     → consent_checked    (consent engine approved)
//     → encrypted_local    (AES-GCM applied locally — scaffold)
//     → stored_local       (written to local store)
//     → relay_ready        (ready to send to relay — scaffold)
//     → sent               (relay accepted the payload)
//     → delivered          (recipient device acknowledged)
//     → cleared            (auto-clear timer fired or user cleared)
//
//   Any state → blocked    (consent denied — message not created)
//   Any state → failed     (unrecoverable error)
//
// Transitions are one-directional except:
//   - reflected → draft    (user cancels the reflection)
//   - stored_local → draft (user edits an unsent draft)

export type MessageLifecycleState =
  | 'draft'
  | 'reflected'
  | 'consent_checked'
  | 'encrypted_local'
  | 'stored_local'
  | 'relay_ready'
  | 'sent'
  | 'delivered'
  | 'cleared'
  | 'blocked'
  | 'failed';

// ─── State metadata ───────────────────────────────────────────────────────────

export interface LifecycleStateMeta {
  state: MessageLifecycleState;
  labelKey: string;
  descKey: string;
  /** True when the message is still actionable by the user */
  isTerminal: boolean;
  /** True when the message content is accessible */
  isReadable: boolean;
  /** True when the state represents a failure or block */
  isError: boolean;
  /** Journey step index (0-based). null for terminal error states. */
  journeyStep: number | null;
}

export const LIFECYCLE_STATE_META: Record<MessageLifecycleState, LifecycleStateMeta> = {
  draft: {
    state:       'draft',
    labelKey:    'lifecycle.draft',
    descKey:     'lifecycle.draftDesc',
    isTerminal:  false,
    isReadable:  true,
    isError:     false,
    journeyStep: 0,
  },
  reflected: {
    state:       'reflected',
    labelKey:    'lifecycle.reflected',
    descKey:     'lifecycle.reflectedDesc',
    isTerminal:  false,
    isReadable:  true,
    isError:     false,
    journeyStep: 1,
  },
  consent_checked: {
    state:       'consent_checked',
    labelKey:    'lifecycle.consentChecked',
    descKey:     'lifecycle.consentCheckedDesc',
    isTerminal:  false,
    isReadable:  true,
    isError:     false,
    journeyStep: 2,
  },
  encrypted_local: {
    state:       'encrypted_local',
    labelKey:    'lifecycle.encryptedLocal',
    descKey:     'lifecycle.encryptedLocalDesc',
    isTerminal:  false,
    isReadable:  true,
    isError:     false,
    journeyStep: 3,
  },
  stored_local: {
    state:       'stored_local',
    labelKey:    'lifecycle.storedLocal',
    descKey:     'lifecycle.storedLocalDesc',
    isTerminal:  false,
    isReadable:  true,
    isError:     false,
    journeyStep: 4,
  },
  relay_ready: {
    state:       'relay_ready',
    labelKey:    'lifecycle.relayReady',
    descKey:     'lifecycle.relayReadyDesc',
    isTerminal:  false,
    isReadable:  true,
    isError:     false,
    journeyStep: 5,
  },
  sent: {
    state:       'sent',
    labelKey:    'lifecycle.sent',
    descKey:     'lifecycle.sentDesc',
    isTerminal:  false,
    isReadable:  true,
    isError:     false,
    journeyStep: 6,
  },
  delivered: {
    state:       'delivered',
    labelKey:    'lifecycle.delivered',
    descKey:     'lifecycle.deliveredDesc',
    isTerminal:  true,
    isReadable:  true,
    isError:     false,
    journeyStep: 7,
  },
  cleared: {
    state:       'cleared',
    labelKey:    'lifecycle.cleared',
    descKey:     'lifecycle.clearedDesc',
    isTerminal:  true,
    isReadable:  false,
    isError:     false,
    journeyStep: 8,
  },
  blocked: {
    state:       'blocked',
    labelKey:    'lifecycle.blocked',
    descKey:     'lifecycle.blockedDesc',
    isTerminal:  true,
    isReadable:  false,
    isError:     true,
    journeyStep: null,
  },
  failed: {
    state:       'failed',
    labelKey:    'lifecycle.failed',
    descKey:     'lifecycle.failedDesc',
    isTerminal:  true,
    isReadable:  false,
    isError:     true,
    journeyStep: null,
  },
};

// ─── Valid transitions ────────────────────────────────────────────────────────

export const LIFECYCLE_TRANSITIONS: Partial<Record<MessageLifecycleState, MessageLifecycleState[]>> = {
  draft:           ['reflected', 'consent_checked', 'blocked'],
  reflected:       ['draft', 'consent_checked', 'blocked'],
  consent_checked: ['encrypted_local', 'stored_local', 'blocked'],
  encrypted_local: ['stored_local', 'failed'],
  stored_local:    ['relay_ready', 'sent', 'cleared'],
  relay_ready:     ['sent', 'failed'],
  sent:            ['delivered', 'failed'],
  delivered:       ['cleared'],
};

export function canTransition(
  from: MessageLifecycleState,
  to: MessageLifecycleState
): boolean {
  return LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getStateMeta(state: MessageLifecycleState): LifecycleStateMeta {
  return LIFECYCLE_STATE_META[state];
}

// ─── Journey steps (for MessageJourneyPanel) ──────────────────────────────────
// The ordered list of states that appear as steps in the UI journey panel.
// Terminal error states (blocked, failed) are shown separately.

export const JOURNEY_STEPS: MessageLifecycleState[] = [
  'draft',
  'reflected',
  'consent_checked',
  'encrypted_local',
  'stored_local',
  'relay_ready',
  'sent',
  'delivered',
  'cleared',
];
