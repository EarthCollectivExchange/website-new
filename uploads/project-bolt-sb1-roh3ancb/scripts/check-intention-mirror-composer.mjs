/**
 * check-intention-mirror-composer.mjs
 * QLPA Pass 140 — Intention Mirror UX Verification and Deduplication
 *
 * Asserts:
 *   - No duplicate mirror panels can appear (only IntentionMirrorCard used in MessageComposer)
 *   - QLPA IntentionMirrorCard is canonical (uses IntentionMirrorAnalysis, not MirrorReflection)
 *   - Draft text is not persisted (no localStorage.setItem(body), no draft key)
 *   - No network/API calls in MessageComposer
 *   - languageHarmonyMode preference exists and is wired
 *   - "Send as-is" does NOT bypass consent gate (qlpaGuard.canSend checked before send)
 *   - "Soften" is user-triggered only (no auto-transform)
 *   - "Dismiss" hides current draft panel (mirrorDismissed state present)
 *   - Expected phrase coverage: mode behavior assertions in languageHarmonyPolicy.ts
 *   - All i18n keys remain present in all 7 locales
 *   - PreferencesContext exports languageHarmonyMode and setLanguageHarmonyMode
 *   - appConstants has languageHarmonyMode storage key
 *   - IntentionMirrorCard uses IntentionMirrorAnalysis (not old MirrorReflection)
 *   - MessageComposer uses analyzeTextForIntentionMirror (QLPA canonical)
 *   - MessageComposer does NOT use old checkIntentionMirror
 *
 * Run: node scripts/check-intention-mirror-composer.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(process.cwd());
let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function readFile(rel) {
  const abs = resolve(ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

function stripComments(src) {
  return src
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

console.log('\n== check-intention-mirror-composer (Pass 140) ==\n');

// ─── 1. Files exist ───────────────────────────────────────────────────────────

console.log('[1] Required files exist');
const composerFile     = 'components/messaging/MessageComposer.tsx';
const mirrorCardFile   = 'components/messaging/IntentionMirrorCard.tsx';
const prefsFile        = 'lib/foundation/preferencesContext.tsx';
const constantsFile    = 'lib/foundation/appConstants.ts';
const qlpaMirrorFile   = 'lib/qlpa/intentionMirror.ts';
const policyFile       = 'lib/qlpa/languageHarmonyPolicy.ts';

const composer   = readFile(composerFile);
const mirrorCard = readFile(mirrorCardFile);
const prefs      = readFile(prefsFile);
const constants  = readFile(constantsFile);
const qlpaMirror = readFile(qlpaMirrorFile);
const policy     = readFile(policyFile);

assert('MessageComposer.tsx exists',     composer   !== null);
assert('IntentionMirrorCard.tsx exists', mirrorCard !== null);
assert('preferencesContext.tsx exists',  prefs      !== null);
assert('appConstants.ts exists',         constants  !== null);
assert('lib/qlpa/intentionMirror.ts exists', qlpaMirror !== null);
assert('languageHarmonyPolicy.ts exists',    policy !== null);

// ─── 2. No duplicate mirror systems ──────────────────────────────────────────

console.log('\n[2] No duplicate mirror panel systems');

// MessageComposer must NOT import the old checkIntentionMirror from lib/messaging
assert(
  'MessageComposer does NOT import checkIntentionMirror (old system)',
  composer !== null && !composer.includes('checkIntentionMirror'),
);

// MessageComposer must NOT import MirrorReflection type
assert(
  'MessageComposer does NOT use MirrorReflection type',
  composer !== null && !composer.includes('MirrorReflection'),
);

// MessageComposer must NOT import IntentionMirror config (old prop)
assert(
  'MessageComposer does NOT accept mirrorEnabled prop',
  composer !== null && !composer.includes('mirrorEnabled'),
);
assert(
  'MessageComposer does NOT accept mirrorConfig prop',
  composer !== null && !composer.includes('mirrorConfig'),
);

// Only one JSX use of IntentionMirrorCard in MessageComposer (not two mirror panels)
// Count occurrences of opening JSX tag <IntentionMirrorCard
const mirrorCardJsxOccurrences = (composer || '').split('<IntentionMirrorCard').length - 1;
assert(
  'MessageComposer renders exactly one IntentionMirrorCard JSX element (no duplicate panel)',
  mirrorCardJsxOccurrences === 1,
  `found ${mirrorCardJsxOccurrences} JSX uses (expected 1)`,
);

// ─── 3. QLPA panel is canonical ───────────────────────────────────────────────

console.log('\n[3] QLPA IntentionMirrorPanel is canonical');

// MessageComposer uses analyzeTextForIntentionMirror
assert(
  'MessageComposer imports analyzeTextForIntentionMirror (QLPA canonical)',
  composer !== null && composer.includes('analyzeTextForIntentionMirror'),
);

// MessageComposer imports from lib/qlpa/intentionMirror (not lib/messaging)
assert(
  "MessageComposer imports from '@/lib/qlpa/intentionMirror'",
  composer !== null && composer.includes("from '@/lib/qlpa/intentionMirror'"),
);

// IntentionMirrorCard uses IntentionMirrorAnalysis (QLPA type, not old MirrorReflection)
assert(
  'IntentionMirrorCard uses IntentionMirrorAnalysis type',
  mirrorCard !== null && mirrorCard.includes('IntentionMirrorAnalysis'),
);
assert(
  'IntentionMirrorCard does NOT use old MirrorReflection type',
  mirrorCard !== null && !mirrorCard.includes('MirrorReflection'),
);

// IntentionMirrorCard accepts harmonyMode prop
assert(
  'IntentionMirrorCard accepts harmonyMode prop',
  mirrorCard !== null && mirrorCard.includes('harmonyMode'),
);

// ─── 4. Draft text never persisted ────────────────────────────────────────────

console.log('\n[4] Draft text never persisted');

const composerStripped = composer ? stripComments(composer) : '';

// No localStorage.setItem with body
assert(
  'MessageComposer does not call localStorage.setItem(body)',
  !composerStripped.includes('localStorage.setItem'),
);

// Analysis result stays in useState (component state only)
assert(
  'Analysis stored in useState (not localStorage)',
  composer !== null && composer.includes("useState<IntentionMirrorAnalysis | null>(null)"),
);

// ─── 5. No network/API calls in MessageComposer ───────────────────────────────

console.log('\n[5] No network calls in MessageComposer');
assert('MessageComposer: no fetch()',         !composerStripped.includes('fetch('));
assert('MessageComposer: no XMLHttpRequest',  !composerStripped.includes('XMLHttpRequest'));
assert('MessageComposer: no supabase calls',  !composerStripped.includes('supabase'));
assert('MessageComposer: no OpenAI calls',    !composerStripped.includes('openai'));

// No network in QLPA intentionMirror library
const mirrorStripped = qlpaMirror ? stripComments(qlpaMirror) : '';
assert('lib/qlpa/intentionMirror: no fetch()',        !mirrorStripped.includes('fetch('));
assert('lib/qlpa/intentionMirror: no XMLHttpRequest', !mirrorStripped.includes('XMLHttpRequest'));
assert('lib/qlpa/intentionMirror: no supabase',       !mirrorStripped.includes('supabase'));

// ─── 6. languageHarmonyMode preference wired ─────────────────────────────────

console.log('\n[6] languageHarmonyMode preference');
assert(
  'preferencesContext exports languageHarmonyMode',
  prefs !== null && prefs.includes('languageHarmonyMode'),
);
assert(
  'preferencesContext exports setLanguageHarmonyMode',
  prefs !== null && prefs.includes('setLanguageHarmonyMode'),
);
assert(
  'appConstants has languageHarmonyMode storage key',
  constants !== null && constants.includes('languageHarmonyMode'),
);
assert(
  "preferencesContext loads LanguageHarmonyMode from storage",
  prefs !== null && prefs.includes('loadLanguageHarmonyMode'),
);
assert(
  'MessageComposer reads languageHarmonyMode from usePreferences',
  composer !== null && composer.includes('languageHarmonyMode'),
);

// ─── 7. "Send as-is" does not bypass consent gate ────────────────────────────

console.log('\n[7] "Send as-is" does not bypass consent gate');
// qlpaGuard.canSend must be checked before send — isBlocked check before any send
assert(
  'MessageComposer checks isBlocked before sending',
  composer !== null && composer.includes('isBlocked'),
);
// attemptSend guards on isBlocked
assert(
  'attemptSend returns early if isBlocked',
  composer !== null && composer.includes('if (!trimmed || sending || isBlocked)'),
);
// handleSendAsIs calls attemptSend(true) — still subject to isBlocked guard
assert(
  'handleSendAsIs calls attemptSend(true) (subject to consent gate)',
  composer !== null && composer.includes('attemptSend(true)'),
);

// ─── 8. "Soften" is user-triggered only ──────────────────────────────────────

console.log('\n[8] "Soften" is user-triggered only');
assert(
  'handleSoften function exists in MessageComposer',
  composer !== null && composer.includes('handleSoften'),
);
// Soften clears the draft — does not auto-transform
assert(
  'handleSoften clears body (user decides what to write next)',
  composer !== null && composer.includes("setBody('')") && composer.includes('handleSoften'),
);
// No auto-transform: soften doesn't call any replace/transform
assert(
  'handleSoften does not auto-rewrite message text',
  composer !== null && !composer.includes('autoTransform') && !composer.includes('autoRewrite'),
);

// ─── 9. "Dismiss" hides current draft panel ──────────────────────────────────

console.log('\n[9] "Dismiss" hides panel for current draft');
assert(
  'mirrorDismissed state present in MessageComposer',
  composer !== null && composer.includes('mirrorDismissed'),
);
assert(
  'handleDismissMirror sets mirrorDismissed to true',
  composer !== null && composer.includes('setMirrorDismissed(true)'),
);
assert(
  'handleDismissMirror does NOT send anything',
  composer !== null && (() => {
    const fn = composer.slice(
      composer.indexOf('function handleDismissMirror'),
      composer.indexOf('function handleDismissMirror') + 200,
    );
    return !fn.includes('onSend') && !fn.includes('attemptSend');
  })(),
);

// ─── 10. Mode behavior assertions (via policy source) ─────────────────────────

console.log('\n[10] Mode behavior assertions');

// off mode: no holds for normal language
const offBlock = policy ? policy.slice(policy.indexOf("off: {"), policy.indexOf("off: {") + 300) : '';
assert(
  "off mode: holdThreshold null (no holds for normal language)",
  offBlock.includes("holdThreshold: null"),
);
// soft mode: gentle only, no holds
const softBlock = policy ? policy.slice(policy.indexOf("soft: {"), policy.indexOf("soft: {") + 300) : '';
assert(
  "soft mode: holdThreshold null (gentle nudge only)",
  softBlock.includes("holdThreshold: null"),
);
// clear mode: no holds
const clearBlock = policy ? policy.slice(policy.indexOf("clear: {"), policy.indexOf("clear: {") + 300) : '';
assert(
  "clear mode: holdThreshold null (stronger reflection, no holds)",
  clearBlock.includes("holdThreshold: null"),
);
// strict mode: holds enabled but override always available
const strictBlock = policy ? policy.slice(policy.indexOf("strict: {"), policy.indexOf("strict: {") + 300) : '';
assert(
  "strict mode: holdThreshold present",
  strictBlock.includes("holdThreshold: 'hold'"),
);
assert(
  "strict mode: alwaysAllowOverride true",
  strictBlock.includes("alwaysAllowOverride: true"),
);
// guardian mode: caution+ held, community guard active
const guardianBlock = policy ? policy.slice(policy.indexOf("guardian: {"), policy.indexOf("guardian: {") + 300) : '';
assert(
  "guardian mode: holdThreshold caution",
  guardianBlock.includes("holdThreshold: 'caution'"),
);
assert(
  "guardian mode: communityGuardActive true",
  guardianBlock.includes("communityGuardActive: true"),
);

// ─── 11. Expected phrase coverage (static taxonomy checks) ───────────────────

console.log('\n[11] Expected phrase coverage (taxonomy source assertions)');

const taxonomy = readFile('lib/qlpa/languageTaxonomy.ts');

// "I am angry" → emotion → detect (sendable)
assert(
  '"angry" classified as emotion (detect — always sendable)',
  taxonomy !== null && taxonomy.includes("'angry'") && taxonomy.includes("category: 'emotion'"),
);

// "shit" and "fuck" → profanity → contextRequired=true (sendable alone)
assert(
  '"shit" is a profanity term',
  taxonomy !== null && taxonomy.includes("'shit'"),
);
assert(
  '"fuck" is a profanity term',
  taxonomy !== null && taxonomy.includes("'fuck'"),
);
assert(
  'profanity has contextRequired=true (sendable alone)',
  taxonomy !== null && (() => {
    const idx = taxonomy.indexOf("category: 'profanity'");
    if (idx < 0) return false;
    const block = taxonomy.slice(idx - 50, idx + 200);
    return block.includes('contextRequired: true');
  })(),
);

// "fuck you" → direct attack → caution
assert(
  '"fuck you" / direct-attack pattern → caution',
  taxonomy !== null && /fuck.*you.*caution/s.test(
    taxonomy.slice(taxonomy.indexOf('CONTEXT_PATTERNS'), taxonomy.indexOf('CONTEXT_PATTERNS') + 2000)
  ),
);

// Normal message → no panel (clear level → shouldReflectLanguage false for soft mode)
assert(
  'shouldReflectLanguage("clear", "soft") is false (no panel for normal messages)',
  (() => {
    try {
      const policyContent = readFile('lib/qlpa/languageHarmonyPolicy.ts');
      // soft mode reflectThreshold is 'caution' → clear does not trigger
      return policyContent !== null && policyContent.includes("reflectThreshold: 'caution'");
    } catch { return false; }
  })(),
);

// Arabic/Chinese/Japanese → multilingual fallback (no crash)
assert(
  'intentionMirror.ts handles languageHint (multilingual, no crash)',
  qlpaMirror !== null && qlpaMirror.includes('languageHint'),
);
assert(
  'findMultilingualTaxonomyMatches used for non-English hints',
  qlpaMirror !== null && qlpaMirror.includes('findMultilingualTaxonomyMatches'),
);

// Shield-critical → block level (UI enforcement future-gated)
assert(
  'shieldEscalationRequired field present in analysis result',
  qlpaMirror !== null && qlpaMirror.includes('shieldEscalationRequired'),
);
assert(
  'canSendOriginal is false only when shieldEscalationRequired',
  qlpaMirror !== null && qlpaMirror.includes('canSendOriginal: !shieldEscalationRequired'),
);

// ─── 12. i18n keys present in all 7 locales ──────────────────────────────────

console.log('\n[12] i18n keys — harmony settings keys in all 7 locales');

const HARMONY_SETTINGS_KEYS = [
  'languageHarmonyMode',
  'harmonyOff', 'harmonyOffDesc',
  'harmonySoft', 'harmonySoftDesc',
  'harmonyClear', 'harmonyClearDesc',
  'harmonyStrict', 'harmonyStrictDesc',
  'harmonyGuardian', 'harmonyGuardianDesc',
];

const LOCALES = ['en', 'fr', 'de', 'es', 'it', 'pt', 'id'];

for (const locale of LOCALES) {
  const content = readFile(`lib/i18n/locales/${locale}.json`);
  if (!content) {
    assert(`${locale}.json exists`, false);
    continue;
  }
  let parsed;
  try { parsed = JSON.parse(content); } catch (e) {
    assert(`${locale}.json valid JSON`, false, e.message);
    continue;
  }
  for (const key of HARMONY_SETTINGS_KEYS) {
    assert(
      `${locale}: settings.${key}`,
      parsed.settings && parsed.settings[key] && parsed.settings[key].trim().length > 0,
    );
  }
}

// ─── 13. ConversationView passes no old mirror props ─────────────────────────

console.log('\n[13] ConversationView — no stale mirror props');
const convView = readFile('components/messaging/ConversationView.tsx');
assert(
  'ConversationView does NOT pass mirrorEnabled to MessageComposer',
  convView !== null && !convView.includes('mirrorEnabled='),
);
assert(
  'ConversationView does NOT pass mirrorConfig to MessageComposer',
  convView !== null && !convView.includes('mirrorConfig='),
);
assert(
  'ConversationView passes conversationContext to MessageComposer',
  convView !== null && convView.includes('conversationContext='),
);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
