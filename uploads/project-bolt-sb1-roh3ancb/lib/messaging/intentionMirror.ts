import type {
  IntentionMirror,
  IntentionMirrorState,
  MirrorReflection,
  MessageType,
} from './types';

// Patterns observed — never judgments, always plain-language observations.
// No censorship. No punishment. User can always override.
const SOFT_CONCERN_PATTERNS = [
  {
    pattern: /\b(angry|anger|furious|fury|rage|raging|hate|hatred|destroy|kill|killing|attack|attacking|revenge|blame|blaming|corrupt|liar|lying|stupid|idiot|loser|worthless)\b/i,
    concern: 'This message contains strong emotional or reactive words.',
  },
  { pattern: /\b(always|never|everyone|nobody|no one)\b/i, concern: 'Absolute language may close dialogue.' },
  { pattern: /[!?]{3,}/,                                    concern: 'High punctuation intensity detected.' },
];

export interface MirrorCheckInput {
  body: string;
  messageType: MessageType;
  config: IntentionMirror;
  currentState: IntentionMirrorState;
}

// Validates mirror state — does NOT block; only records state
export function validateIntentionMirrorState(
  state: IntentionMirrorState
): { passed: true; state: IntentionMirrorState } {
  // The Intention Mirror never blocks a message.
  // Its state is recorded for transparency and self-awareness only.
  return { passed: true, state };
}

export function checkIntentionMirror(input: MirrorCheckInput): MirrorReflection {
  const { body, messageType, config, currentState } = input;

  // Mirror disabled
  if (!config.enabled || !config.checkBeforeSending) {
    return { triggered: false, concerns: [], state: 'not_checked' };
  }

  // User already made a conscious decision this send cycle — respect it
  if (currentState === 'user_overrode') {
    return { triggered: false, concerns: [], state: 'user_overrode' };
  }

  // Emergency signals bypass mirror entirely
  if (messageType === 'emergency_signal') {
    return { triggered: false, concerns: [], state: 'clear' };
  }

  if (!body || body.trim().length === 0) {
    return { triggered: false, concerns: [], state: 'clear' };
  }

  const concerns: string[] = [];

  for (const { pattern, concern } of SOFT_CONCERN_PATTERNS) {
    if (pattern.test(body)) {
      // Deduplicate concern strings
      if (!concerns.includes(concern)) concerns.push(concern);
    }
  }

  if (concerns.length === 0) {
    return { triggered: false, concerns: [], state: 'clear' };
  }

  const suggestedTransform = buildTransformSuggestion(body);

  return {
    triggered: true,
    concerns,
    suggestedTransform,
    state: 'reflected',
  };
}

function buildTransformSuggestion(body: string): string {
  // Lightweight placeholder — replace with actual NLP transform later
  return `Could you express this as a clear request or observation? Original: "${body.slice(0, 60)}..."`;
}

// The four non-coercive actions the user can take when reflection is shown
export type MirrorAction =
  | 'send_anyway'         // user overrides and sends
  | 'edit'                // user wants to revise
  | 'pause_33'            // user takes 33 seconds to reflect
  | 'transform_request';  // user transforms into a clear request

export function applyMirrorAction(
  action: MirrorAction,
  currentState: IntentionMirrorState
): IntentionMirrorState {
  switch (action) {
    case 'send_anyway':
      return 'user_overrode';
    case 'edit':
      return 'not_checked'; // reset so new message can be re-checked
    case 'pause_33':
      return 'reflected'; // stays reflected — user is pausing
    case 'transform_request':
      return 'not_checked'; // reset after transform for re-check
    default:
      return currentState;
  }
}
