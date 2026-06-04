/**
 * QLPA Language Protocol
 * Quantum Love Protection Architecture — QLPA Matrix Source
 *
 * Every word shown to a user must help them feel:
 *   protected, calm, informed, sovereign, and able to choose clearly.
 *
 * Avoid fear-based, military, police, punitive, or destructive language.
 * Use protective, empowering, and consent-forward framing instead.
 */

// ─── Forbidden / Discouraged Terms ───────────────────────────────────────────
//
// These terms must NOT appear in user-facing UI strings, button labels,
// panel headers, status messages, or notification copy.
//
// They may still appear in:
//   - Internal code identifiers (types, function names, variable names)
//   - Developer-only panels (QA, diagnostics) when clearly labelled as dev
//   - Console logs / error reporting not visible to end users

export const DISCOURAGED_TERMS: string[] = [
  'Panic Mode',
  'Panic password',
  'Kill switch',
  'Emergency wipe',
  'Danger Zone',
  'Danger zone',
  'Threat detected',
  'Failed delivery',
  'Delete forever',
  'Block user',
  'Report abuse',
  'Self-destruct',
  'Disappearing messages',
  'Disappear',
  'Gone after',
  'Suspicious login',
  'Erase everything',
  'Permanently erase',
  'Cannot be undone',
  'Remote deletion',
  'Delete for everyone',
  'Wipe',
];

// ─── Approved Replacement Terms ──────────────────────────────────────────────
//
// Use these terms instead. Each maps a discouraged concept to a
// sovereign, calm, protective equivalent.

export const TERM_REPLACEMENTS: Record<string, string> = {
  // Modes
  'Panic Mode':             'Shield Mode',
  'Panic password':         'Shield Phrase',
  'Kill switch':            'Seal Access',
  'Emergency wipe':         'Source Clear',

  // Sections & zones
  'Danger Zone':            'Reset & Restore',
  'Danger zone':            'Reset & Restore',

  // Access & threat
  'Threat detected':        'New access attempt noticed',
  'Suspicious login':       'New access attempt',

  // Delivery
  'Failed delivery':        'Delivery paused',
  'Failed':                 'Paused',

  // Content clearing
  'Delete forever':         'Clear from this device',
  'Delete from this device':'Clear from this device',
  'Delete for everyone':    'Request clear everywhere',
  'Erase everything':       'Clear everything',
  'Permanently erase':      'Clear all local content',
  'Cannot be undone':       'This cannot be recovered',

  // Auto-clear (replaces "disappearing messages")
  'Disappearing messages':  'Auto-clear messages',
  'Messages will disappear after': 'Messages auto-clear after',
  'Messages disappear after':      'Messages auto-clear after',
  'New messages will disappear after': 'New messages will auto-clear after',
  'Gone after':             'Auto-clears after',

  // Social / safety
  'Block user':             'Close connection',
  'Report abuse':           'Send safety report',

  // Remote deletion — IMPORTANT: never overclaim
  'Remote deletion requested':       'Clear request sent',
  'Deletion requested from recipient': 'Clear request sent to recipient',

  // Tone
  'Self-destruct':          'Auto-clear',
  'Warning':                'Important note',
  'Invalid':                'Not ready',
  'Error':                  'Needs attention',

  // Timer descriptions
  '30sSublabel':            'Auto-clears after 30 seconds',
  '1minSublabel':           'Auto-clears after 1 minute',
  '1hSublabel':             'Auto-clears after 1 hour',
  '24hSublabel':            'Auto-clears after 24 hours',
  '7dSublabel':             'Auto-clears after 7 days',

  // Scope labels
  'scopeLocal':             'Clear from this device',
  'scopeRequest':           'Request clear from recipient',
  'scopeBoth':              'Request clear everywhere (when supported)',
};

// ─── Remote Deletion Honesty Rules ───────────────────────────────────────────
//
// The host application cannot confirm that content is deleted on other devices.
// Use these levels of certainty:

export const REMOTE_DELETION_COPY: Record<string, string> = {
  localOnly:              'Cleared from this device',
  requestSent:            'Clear request sent',
  requestPending:         'Waiting for recipient to confirm',
  confirmedOnDevice:      'Cleared on this device',
  confirmedEverywhere:    'Cleared on all confirmed devices',
  // NEVER use: "Deleted everywhere", "Permanently deleted", "Gone forever"
};

// ─── Human Modes ─────────────────────────────────────────────────────────────

export const HUMAN_MODES = [
  {
    key: 'calm',
    label: 'Calm',
    description: 'Peaceful, grounded communication. Nature-paced, low friction.',
  },
  {
    key: 'sovereign',
    label: 'Sovereign',
    description: 'Full control over privacy, storage, and consent settings.',
  },
  {
    key: 'focus',
    label: 'Focus',
    description: 'Minimal distractions. Only essential actions visible.',
  },
  {
    key: 'care',
    label: 'Care',
    description: 'Warm, supportive tone. Ideal for support circles and close connections.',
  },
  {
    key: 'creator',
    label: 'Creator',
    description: 'Expressive, collaborative. Full composer and file tools visible.',
  },
  {
    key: 'shield',
    label: 'Shield',
    description: 'Elevated privacy. Extra consent checks, minimal metadata, relay-sealed.',
  },
] as const;

export type HumanMode = (typeof HUMAN_MODES)[number]['key'];

// ─── Interface Depth Levels ───────────────────────────────────────────────────

export const INTERFACE_DEPTHS = [
  {
    key: 'simple',
    label: 'Simple',
    description: 'Clean, peaceful interface. Dev panels and diagnostics hidden.',
    badge: 'Simple',
  },
  {
    key: 'advanced',
    label: 'Advanced',
    description: 'Shows privacy, delivery, consent, and trust panels.',
    badge: 'Advanced',
  },
  {
    key: 'developer',
    label: 'Developer',
    description: 'Full QA panels, relay boundary, integrity hashes, and diagnostics.',
    badge: 'Dev',
  },
] as const;

export type InterfaceDepth = (typeof INTERFACE_DEPTHS)[number]['key'];

// ─── Component Naming Guidance ────────────────────────────────────────────────

export const COMPONENT_NAMING = {
  approvedPrefixes: [
    'Shield',    // security/privacy features
    'Consent',   // consent-related flows
    'Trust',     // trust and relationship features
    'Sovereign', // sovereignty and data control
    'Restore',   // data recovery / undo flows
    'Clear',     // content removal (honest, not violent)
    'Seal',      // cryptographic sealing
    'Journey',   // onboarding / progress flows
    'Relay',     // message transport
    'Ledger',    // audit trail
  ],
} as const;

// ─── QLPA Language Properties ────────────────────────────────────────────────

export const QLPA_LANGUAGE_PROPERTIES = [
  'calm',
  'truthful',
  'consent-aware',
  'sovereignty-preserving',
  'clear',
  'non-extractive',
  'non-overclaiming',
  'care-centered',
  'locally honest',
  'maturity-aware',
] as const;

export type QlpaLanguageProperty = (typeof QLPA_LANGUAGE_PROPERTIES)[number];

// ─── Preferred QLPA Vocabulary ────────────────────────────────────────────────

export const PREFERRED_VOCABULARY: string[] = [
  'shield',
  'protect',
  'clear',
  'seal',
  'pause',
  'restore',
  'review',
  'confirm',
  'trust',
  'guardian',
  'source',
  'auto-clear',
  'protection response',
  'new access noticed',
  'delivery paused',
  'request clear',
  'held locally',
  'verified',
  'ready',
  'needs review',
];

// ─── TODO: Internal Renaming ──────────────────────────────────────────────────
//
// These are internal identifiers that use discouraged language.
// They do NOT need immediate renaming (they are not user-facing),
// but should be updated in a future refactor pass for code coherence.
//
// Priority: Low — only rename when touching those files for other reasons.

/*
  host message types:
    - ConversationMember.deleteStatus → clearStatus
    - Message.deleteStatus → clearStatus
    - FileTransfer.deletedLocally → clearedLocally
    - FileTransfer.deleteRequestedRemote → clearRequestedRemote
    - VoiceMemo.deletedLocally → clearedLocally
    - MessageDeleteScope type → MessageClearScope

  host action handlers:
    - handleDeleteLocally → handleClearLocally
    - handleRequestRecipientDelete → handleRequestClear

  host conversation view:
    - handleDeleteMessage → handleClearMessage

  host settings panel:
    - showResetConfirm → showRestoreConfirm

  Note: the `humanMode: 'emergency'` value in existing stored preferences
  should be migrated to 'shield' in a future data migration pass.
*/
