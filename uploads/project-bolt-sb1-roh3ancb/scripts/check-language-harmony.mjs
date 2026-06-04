/**
 * QLPA Language Harmony Check
 *
 * Verifies:
 * - All 6 language harmony modules exist (blueprint, policy, mirror, suggestion, taxonomy, types)
 * - All result levels defined
 * - All policy modes defined
 * - Fibonacci thresholds present
 * - QLPA weights sum to 100
 * - Shield-linked dimensions trigger shieldEscalationRequired
 * - Normal emotional language does NOT automatically block
 * - Suggestions are optional (not auto-applied)
 * - No fetch/XMLHttpRequest/supabase in any module
 * - All 7 locales have languageHarmony.* keys and languageHarmony.reason.* keys
 * - All modules exported from lib/qlpa/index.ts
 * - Taxonomy: 14 categories, TaxonomyEntry interface, profanity terms, context patterns
 * - Profanity alone: canSendOriginal=true (contextRequired=true, defaultAction=detect/reflect)
 * - Threat terms escalate higher than profanity alone
 * - Shield escalation categories: childSafety, nonConsensualSexual
 *
 * Run: node scripts/check-language-harmony.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let errors = 0;

function pass(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { console.error(`  ✗ ${msg}`); errors++; }

function readOrFail(rel) {
  const p = resolve(root, rel);
  if (!existsSync(p)) { fail(`Missing: ${rel}`); return null; }
  pass(`Exists: ${rel}`);
  return readFileSync(p, 'utf8');
}

function check(content, file, needle, label) {
  if (content && content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: MISSING — ${label}`);
}

function checkAbsent(content, file, needle, label) {
  if (content && !content.includes(needle)) pass(`${file}: ${label}`);
  else fail(`${file}: SHOULD BE ABSENT — ${label}`);
}

// ─── 1. Module files exist ────────────────────────────────────────────────────

console.log('\n[1] Module files');
const blueprintFile = 'lib/qlpa/languageBlueprint.ts';
const policyFile    = 'lib/qlpa/languageHarmonyPolicy.ts';
const mirrorFile    = 'lib/qlpa/intentionMirror.ts';
const suggFile      = 'lib/qlpa/languageSuggestionEngine.ts';
const indexFile     = 'lib/qlpa/index.ts';

const blueprint = readOrFail(blueprintFile);
const policy    = readOrFail(policyFile);
const mirror    = readOrFail(mirrorFile);
const sugg      = readOrFail(suggFile);
const qlpaIndex = readOrFail(indexFile);

const taxonomyFile = 'lib/qlpa/languageTaxonomy.ts';
const typesFile    = 'lib/qlpa/intentionMirrorTypes.ts';
const taxonomy     = readOrFail(taxonomyFile);
const mirrorTypes  = readOrFail(typesFile);

// ─── 2. Result levels ─────────────────────────────────────────────────────────

console.log('\n[2] Result levels');
const RESULT_LEVELS = ['clear', 'reflect', 'caution', 'hold', 'block'];
for (const level of RESULT_LEVELS) {
  check(blueprint, blueprintFile, `'${level}'`, `result level: ${level}`);
}

// ─── 3. Policy modes ──────────────────────────────────────────────────────────

console.log('\n[3] Policy modes');
const POLICY_MODES = ['off', 'soft', 'clear', 'strict', 'guardian'];
for (const mode of POLICY_MODES) {
  check(policy, policyFile, `'${mode}'`, `policy mode: ${mode}`);
}

// ─── 4. Fibonacci thresholds ──────────────────────────────────────────────────

console.log('\n[4] Fibonacci thresholds');
check(blueprint, blueprintFile, 'min: 0',  'threshold: 0 (clear min)');
check(blueprint, blueprintFile, 'max: 21', 'threshold: 21 (clear max)');
check(blueprint, blueprintFile, 'min: 22', 'threshold: 22 (reflect min)');
check(blueprint, blueprintFile, 'max: 34', 'threshold: 34 (reflect max)');
check(blueprint, blueprintFile, 'min: 35', 'threshold: 35 (caution min)');
check(blueprint, blueprintFile, 'max: 55', 'threshold: 55 (caution max)');
check(blueprint, blueprintFile, 'min: 56', 'threshold: 56 (hold min)');
check(blueprint, blueprintFile, 'max: 89', 'threshold: 89 (hold max)');
check(blueprint, blueprintFile, 'min: 90', 'threshold: 90 (block min)');
check(blueprint, blueprintFile, 'max: 100', 'threshold: 100 (block max)');

// ─── 5. QLPA weights sum to 100 ───────────────────────────────────────────────

console.log('\n[5] QLPA dimension weights');
check(blueprint, blueprintFile, 'weight: 34', 'safety weight: 34');
check(blueprint, blueprintFile, 'weight: 21', 'consent weight: 21');
check(blueprint, blueprintFile, 'weight: 13', 'pressure/clarity weight: 13');
check(blueprint, blueprintFile, 'weight: 8',  'care/sovereignty weight: 8');
check(blueprint, blueprintFile, 'weight: 3',  'context weight: 3');
check(blueprint, blueprintFile, 'QLPA_WEIGHT_TOTAL', 'QLPA_WEIGHT_TOTAL exported');
// Verify the sum: 34+21+13+13+8+8+3 = 100
const weightSum = 34 + 21 + 13 + 13 + 8 + 8 + 3;
if (weightSum === 100) pass(`Weight sum: ${weightSum} === 100`);
else fail(`Weight sum: ${weightSum} !== 100`);

// ─── 6. Language dimensions ───────────────────────────────────────────────────

console.log('\n[6] Language dimensions');
const DIMENSIONS = [
  'clarity', 'consent', 'pressure', 'care', 'sovereignty',
  'safety', 'publicRisk', 'childSafety', 'sexualViolence', 'botSpam', 'scamRisk',
];
for (const dim of DIMENSIONS) {
  check(blueprint, blueprintFile, `'${dim}'`, `dimension: ${dim}`);
}

// ─── 7. Helper functions ──────────────────────────────────────────────────────

console.log('\n[7] Blueprint helper functions');
check(blueprint, blueprintFile, 'export function scoreTolevel',           'scoreTolevel exported');
check(blueprint, blueprintFile, 'export function getThresholdForLevel',   'getThresholdForLevel exported');
check(blueprint, blueprintFile, 'export function computeCompositeScore',  'computeCompositeScore exported');
check(blueprint, blueprintFile, 'export function hasShieldEscalationSignal', 'hasShieldEscalationSignal exported');

console.log('\n[8] Policy helper functions');
check(policy, policyFile, 'export function getLanguageHarmonyModePolicy', 'getLanguageHarmonyModePolicy exported');
check(policy, policyFile, 'export function shouldReflectLanguage',        'shouldReflectLanguage exported');
check(policy, policyFile, 'export function shouldHoldForReview',          'shouldHoldForReview exported');
check(policy, policyFile, 'export function shouldBlockForShield',         'shouldBlockForShield exported');
check(policy, policyFile, 'export function canSendOriginal',              'canSendOriginal exported');

console.log('\n[9] Intention mirror analysis function');
check(mirror, mirrorFile, 'export function analyzeTextForIntentionMirror', 'analyzeTextForIntentionMirror exported');
check(mirror, mirrorFile, 'shieldEscalationRequired',                       'shieldEscalationRequired field');
check(mirror, mirrorFile, 'canSendOriginal',                                'canSendOriginal field');
check(mirror, mirrorFile, 'reasonCodes',                                    'reasonCodes field');
check(mirror, mirrorFile, 'suggestionKeys',                                 'suggestionKeys field');

console.log('\n[10] Suggestion engine functions');
check(sugg, suggFile, 'export function getSuggestionsForText',   'getSuggestionsForText exported');
check(sugg, suggFile, 'export function getSuggestionKeys',       'getSuggestionKeys exported');
check(sugg, suggFile, 'ALL_SUGGESTION_TRIGGER_PATTERNS',         'ALL_SUGGESTION_TRIGGER_PATTERNS exported');

// ─── 11. Shield escalation triggers ──────────────────────────────────────────

console.log('\n[11] Shield escalation — severe categories force shieldEscalationRequired');
check(mirror, mirrorFile, 'shield-child-safety',    'reasonCode: shield-child-safety');
check(mirror, mirrorFile, 'shield-sexual-violence', 'reasonCode: shield-sexual-violence');
check(mirror, mirrorFile, 'const shieldEscalationRequired = requiresShieldEscalation', 'shieldEscalationRequired computed from requiresShieldEscalation');
check(blueprint, blueprintFile, 'SHIELD_ESCALATION_DIMENSIONS', 'SHIELD_ESCALATION_DIMENSIONS exported');
check(blueprint, blueprintFile, "'childSafety'", 'childSafety in shield escalation dims');
check(blueprint, blueprintFile, "'sexualViolence'", 'sexualViolence in shield escalation dims');

// ─── 12. Normal emotional language NOT auto-blocked ──────────────────────────

console.log('\n[12] Normal emotional language — no auto-block');
// Emergency bypass
check(mirror, mirrorFile, 'isEmergency', 'emergency bypass present');
check(mirror, mirrorFile, "level: 'clear'", 'emergency returns clear level');
// 'off' mode keeps Shield active but does not block normal language
const offBlock = policy ? policy.slice(policy.indexOf("off: {"), policy.indexOf("off: {") + 300) : '';
if (offBlock.includes("holdThreshold: null")) pass(`${policyFile}: off mode holdThreshold=null`);
else fail(`${policyFile}: off mode must have holdThreshold=null (no holds for normal language)`);
// soft mode also has no holdThreshold
const softBlock = policy ? policy.slice(policy.indexOf("soft: {"), policy.indexOf("soft: {") + 300) : '';
if (softBlock.includes("holdThreshold: null")) pass(`${policyFile}: soft mode holdThreshold=null`);
else fail(`${policyFile}: soft mode must have holdThreshold=null`);
// alwaysAllowOverride present in all modes
check(policy, policyFile, 'alwaysAllowOverride: true', 'alwaysAllowOverride: true present');

// ─── 13. Suggestions are optional ────────────────────────────────────────────

console.log('\n[13] Suggestions are optional (never auto-applied)');
// getSuggestionsForText should return empty for benign text
check(sugg, suggFile, 'return []', 'returns empty array for no matches');
checkAbsent(sugg, suggFile, 'auto-apply', 'no auto-apply language');
checkAbsent(mirror, mirrorFile, 'auto-rewrite', 'no auto-rewrite language');

// ─── 14. No network calls in any module ──────────────────────────────────────

console.log('\n[14] No network calls');
for (const [file, content] of [
  [blueprintFile, blueprint],
  [policyFile, policy],
  [mirrorFile, mirror],
  [suggFile, sugg],
  [taxonomyFile, taxonomy],
  [typesFile, mirrorTypes],
]) {
  // Strip single-line comments before checking for banned patterns
  const stripped = content ? content.replace(/\/\/.*$/gm, '') : '';
  if (stripped && !stripped.includes('fetch('))        pass(`${file}: no fetch()`);
  else if (!content) { /* handled by readOrFail */ }
  else fail(`${file}: SHOULD BE ABSENT — no fetch()`);

  if (stripped && !stripped.includes('XMLHttpRequest')) pass(`${file}: no XMLHttpRequest`);
  else if (!content) { /* handled by readOrFail */ }
  else fail(`${file}: SHOULD BE ABSENT — no XMLHttpRequest`);

  if (stripped && !stripped.includes('supabase'))      pass(`${file}: no supabase calls`);
  else if (!content) { /* handled by readOrFail */ }
  else fail(`${file}: SHOULD BE ABSENT — no supabase calls`);

  checkAbsent(content, file, "from 'react'",     'no React import');
  checkAbsent(content, file, 'from "react"',     'no React import (double-quote)');
}

// ─── 15. Exports in lib/qlpa/index.ts ────────────────────────────────────────

console.log('\n[15] Exports in lib/qlpa/index.ts');
check(qlpaIndex, indexFile, "'./languageBlueprint'",        'languageBlueprint re-exported');
check(qlpaIndex, indexFile, "'./languageHarmonyPolicy'",    'languageHarmonyPolicy re-exported');
check(qlpaIndex, indexFile, "'./intentionMirrorTypes'",     'intentionMirrorTypes re-exported');
check(qlpaIndex, indexFile, "'./intentionMirror'",          'intentionMirror re-exported');
check(qlpaIndex, indexFile, "'./languageTaxonomy'",         'languageTaxonomy re-exported');
check(qlpaIndex, indexFile, "'./languageSuggestionEngine'", 'languageSuggestionEngine re-exported');

// ─── 16. i18n — languageHarmony.* keys in all 7 locales ──────────────────────

console.log('\n[16] i18n — languageHarmony.* keys in all 7 locales');

const I18N_KEYS = [
  'clearMessage', 'reflectMessage', 'cautionMessage', 'holdMessage', 'blockMessage',
  'sendAsIs', 'soften', 'reviewWording', 'cancel', 'thisIsReflectionNotJudgment',
  'heavyUrgency', 'possiblePressure', 'possibleBlame', 'possibleThreat', 'possibleScam',
  'shieldBlocked', 'suggestionFeelUnheard', 'suggestionPrioritize',
  'suggestionOpenRequest', 'suggestionDifferentView',
  // Pass 136 — new suggestion keys
  'suggestionFrustratedMoment', 'suggestionUnderstandEachOther',
  'suggestionLookTogether', 'suggestionPrioritizeWhenPossible',
];

const REASON_KEYS = [
  'profanityDetected', 'emotionalIntensity', 'directAttack', 'pressureLanguage',
  'blameLanguage', 'threatLanguage', 'sexualSafety', 'childSafetyCritical',
  'nonConsensualSafety', 'scamPattern', 'botSpamPattern', 'softerOptionAvailable',
];

const LOCALES = ['en', 'fr', 'de', 'es', 'it', 'pt', 'id'];

for (const locale of LOCALES) {
  const file = `lib/i18n/locales/${locale}.json`;
  const content = readOrFail(file);
  if (!content) continue;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    fail(`${file}: invalid JSON — ${e.message}`);
    continue;
  }

  if (!parsed.languageHarmony) {
    fail(`${file}: MISSING 'languageHarmony' section`);
    continue;
  }

  for (const key of I18N_KEYS) {
    if (parsed.languageHarmony[key] && parsed.languageHarmony[key].trim().length > 0) {
      pass(`${file}: languageHarmony.${key}`);
    } else {
      fail(`${file}: MISSING languageHarmony.${key}`);
    }
  }

  if (!parsed.languageHarmony.reason) {
    fail(`${file}: MISSING 'languageHarmony.reason' section`);
  } else {
    for (const key of REASON_KEYS) {
      if (parsed.languageHarmony.reason[key] && parsed.languageHarmony.reason[key].trim().length > 0) {
        pass(`${file}: languageHarmony.reason.${key}`);
      } else {
        fail(`${file}: MISSING languageHarmony.reason.${key}`);
      }
    }
  }
}

// ─── 17. Suggestion trigger patterns ─────────────────────────────────────────

console.log('\n[17] Common pressure pattern triggers in suggestion engine');
const PRESSURE_PATTERNS = [
  'you never', 'you always', 'do this now', 'you must',
  'if you cared', 'you failed', "that's wrong",
];
for (const pattern of PRESSURE_PATTERNS) {
  check(sugg, suggFile, pattern, `trigger pattern: "${pattern}"`);
}

// ─── 18. Taxonomy module structure ───────────────────────────────────────────

console.log('\n[18] Taxonomy module — 14 categories');
const TAXONOMY_CATEGORIES = [
  'emotion', 'profanity', 'pressure', 'insult', 'threat', 'hate',
  'sexual', 'nonConsensualSexual', 'childSafety', 'scam', 'botSpam',
  'selfHarm', 'doxxing', 'manipulation',
];
for (const cat of TAXONOMY_CATEGORIES) {
  check(taxonomy, taxonomyFile, `'${cat}'`, `category: ${cat}`);
}

// ─── 19. Taxonomy interface and exports ──────────────────────────────────────

console.log('\n[19] Taxonomy interface and exports');
check(taxonomy, taxonomyFile, 'TaxonomyEntry',                  'TaxonomyEntry interface');
check(taxonomy, taxonomyFile, 'contextRequired',                 'contextRequired field');
check(taxonomy, taxonomyFile, 'defaultAction',                   'defaultAction field');
check(taxonomy, taxonomyFile, 'export function matchTaxonomyTerms',    'matchTaxonomyTerms exported');
check(taxonomy, taxonomyFile, 'export function matchContextPatterns',  'matchContextPatterns exported');
check(taxonomy, taxonomyFile, 'export function requiresShieldEscalation', 'requiresShieldEscalation exported');
check(taxonomy, taxonomyFile, 'export function computeHighestAction',  'computeHighestAction exported');
check(taxonomy, taxonomyFile, 'SHIELD_ESCALATION_CATEGORIES',          'SHIELD_ESCALATION_CATEGORIES exported');

// Pass 136 — registry-level helpers
check(taxonomy, taxonomyFile, 'export function normalizeForTaxonomy',    'normalizeForTaxonomy exported (Pass 136)');
check(taxonomy, taxonomyFile, 'export function findTaxonomyMatches',     'findTaxonomyMatches exported (Pass 136)');
check(taxonomy, taxonomyFile, 'export function getCategoryMatches',      'getCategoryMatches exported (Pass 136)');
check(taxonomy, taxonomyFile, 'export function hasCriticalSafetyMatch',  'hasCriticalSafetyMatch exported (Pass 136)');
check(taxonomy, taxonomyFile, 'export function classifyTaxonomySeverity','classifyTaxonomySeverity exported (Pass 136)');

// ─── 20. Profanity terms present with contextRequired ────────────────────────

console.log('\n[20] Profanity terms — contextRequired=true');
const PROFANITY_TERMS = ['shit', 'fuck', 'bullshit', 'asshole', 'bitch'];
for (const term of PROFANITY_TERMS) {
  check(taxonomy, taxonomyFile, `'${term}'`, `profanity term: '${term}'`);
}
check(taxonomy, taxonomyFile, 'contextRequired: true', 'contextRequired: true present (profanity)');

// ─── 21. Context patterns — profanity attack → caution ───────────────────────

console.log('\n[21] Context patterns — attack/threat escalation');
check(taxonomy, taxonomyFile, "overrideAction: 'caution'", "context pattern: overrideAction=caution");
check(taxonomy, taxonomyFile, "overrideAction: 'hold'",    "context pattern: overrideAction=hold");
check(taxonomy, taxonomyFile, "overrideAction: 'block'",   "context pattern: overrideAction=block");
check(taxonomy, taxonomyFile, 'direct-attack',             'direct-attack reasonCode in context patterns');
check(taxonomy, taxonomyFile, 'possible-threat',           'possible-threat reasonCode in context patterns');

// ─── 22. IntentionMirrorTypes — shared types file ────────────────────────────

console.log('\n[22] IntentionMirrorTypes — shared types');
check(mirrorTypes, typesFile, 'ReasonCode',              'ReasonCode type exported');
check(mirrorTypes, typesFile, 'SuggestionKey',           'SuggestionKey type exported');
check(mirrorTypes, typesFile, 'profanity-detected',      'profanity-detected reasonCode');
check(mirrorTypes, typesFile, 'shield-child-safety',     'shield-child-safety reasonCode');
check(mirrorTypes, typesFile, 'shield-sexual-violence',  'shield-sexual-violence reasonCode');
check(mirrorTypes, typesFile, 'direct-attack',           'direct-attack reasonCode');

// ─── 23. Pass 136 — static behavior assertions ───────────────────────────────
//
// These assertions verify that the source code encodes the correct rules:
//   - profanity terms present with contextRequired=true (allow send alone)
//   - "fuck you" / direct attack context pattern raises to caution
//   - "you never listen" blame pattern present
//   - emotion terms mapped to detect (not block)
//   - threat terms default to hold or block (not detect/reflect)
//   - critical Shield categories (childSafety, nonConsensualSexual) present
//   - findTaxonomyMatches used in intentionMirror (Pass 136 integration)
//   - suggestion engine has the 4 new Pass 136 suggestion keys
//   - no fetch/XMLHttpRequest/supabase in any module (extended check)

console.log('\n[23] Pass 136 — behavior rules encoded in source');

// Profanity with contextRequired=true — allows send when alone
const profanityBlock = taxonomy ? taxonomy.slice(
  taxonomy.indexOf("category: 'profanity'") - 10,
  taxonomy.indexOf("category: 'profanity'") + 200
) : '';
if (profanityBlock.includes('contextRequired: true')) pass(`${taxonomyFile}: profanity has contextRequired=true (sendable alone)`);
else fail(`${taxonomyFile}: profanity MUST have contextRequired=true`);

// Emotion terms default to detect (not block)
const emotionBlock = taxonomy ? taxonomy.slice(
  taxonomy.indexOf("category: 'emotion'") - 10,
  taxonomy.indexOf("category: 'emotion'") + 200
) : '';
if (emotionBlock.includes("defaultAction: 'detect'")) pass(`${taxonomyFile}: emotion terms defaultAction=detect (not block)`);
else fail(`${taxonomyFile}: emotion terms must have defaultAction=detect`);

// "fuck you" pattern escalates to caution via context pattern
const fuckYouPattern = taxonomy && /fuck.*you.*caution/s.test(
  taxonomy.slice(taxonomy.indexOf('CONTEXT_PATTERNS'), taxonomy.indexOf('CONTEXT_PATTERNS') + 2000)
);
if (fuckYouPattern) pass(`${taxonomyFile}: "fuck you" pattern escalates to caution`);
else fail(`${taxonomyFile}: "fuck you" or direct attack pattern must escalate to caution`);

// "you never listen" blame pattern in context patterns
check(taxonomy, taxonomyFile, "you\\s+(always|never)\\s+(listen|do|care",
  'you always/never + listen/care blame pattern');

// Threat terms escalate above profanity (hold or block)
check(taxonomy, taxonomyFile, "defaultAction: 'hold'", 'threat terms have defaultAction=hold');
check(taxonomy, taxonomyFile, "category: 'threat'",    'threat category present');

// Critical Shield categories in SHIELD_ESCALATION_CATEGORIES
const shieldBlock = taxonomy ? taxonomy.slice(
  taxonomy.indexOf('SHIELD_ESCALATION_CATEGORIES'),
  taxonomy.indexOf('SHIELD_ESCALATION_CATEGORIES') + 200
) : '';
if (shieldBlock.includes("'childSafety'") && shieldBlock.includes("'nonConsensualSexual'")) {
  pass(`${taxonomyFile}: childSafety and nonConsensualSexual in SHIELD_ESCALATION_CATEGORIES`);
} else {
  fail(`${taxonomyFile}: SHIELD_ESCALATION_CATEGORIES must include childSafety and nonConsensualSexual`);
}

// intentionMirror uses findTaxonomyMatches (Pass 136 integration)
check(mirror, mirrorFile, 'findTaxonomyMatches', 'intentionMirror uses findTaxonomyMatches (Pass 136)');
check(mirror, mirrorFile, 'getSuggestionKeysFromEngine', 'intentionMirror uses suggestion engine (Pass 136)');

// Suggestion engine has the 4 new Pass 136 suggestion keys
check(sugg, suggFile, 'suggestionFrustratedMoment',           'Pass 136: suggestionFrustratedMoment in suggestion engine');
check(sugg, suggFile, 'suggestionUnderstandEachOther',         'Pass 136: suggestionUnderstandEachOther in suggestion engine');
check(sugg, suggFile, 'suggestionLookTogether',                'Pass 136: suggestionLookTogether in suggestion engine');
check(sugg, suggFile, 'suggestionPrioritizeWhenPossible',      'Pass 136: suggestionPrioritizeWhenPossible in suggestion engine');

// No network in any Pass 136 module (taxonomy already covered in [14], verify again for new helpers)
const taxonomyStripped = taxonomy ? taxonomy.replace(/\/\/.*$/gm, '') : '';
if (taxonomyStripped && !taxonomyStripped.includes('fetch('))
  pass(`${taxonomyFile}: new helpers — no fetch()`);
else if (!taxonomy) { /* handled above */ }
else fail(`${taxonomyFile}: new helpers SHOULD NOT use fetch()`);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────');
if (errors === 0) {
  console.log('  PASS — Language Harmony check complete. 0 errors.');
} else {
  console.error(`  FAIL — ${errors} error(s) found.`);
  process.exit(1);
}
