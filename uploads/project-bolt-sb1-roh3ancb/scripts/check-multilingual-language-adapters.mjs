/**
 * QLPA Pass 138 — Multilingual Language Adapter Foundation Checker
 *
 * Verifies:
 *   1. New module files exist
 *   2. languageScriptDetection.ts exports required functions and LanguageScript type
 *   3. unicodeLanguageNormalize.ts exports normalizeLanguageInput with options
 *   4. multilingualTaxonomy.ts exports SupportedAnalysisLanguage, LanguageTaxonomyAdapter,
 *      getLanguageAdapter, inferAdapterFromText, ADAPTER_REGISTRY
 *   5. languageTaxonomy.ts has findMultilingualTaxonomyMatches
 *   6. intentionMirror.ts uses findMultilingualTaxonomyMatches + languageHint
 *   7. lib/qlpa/index.ts exports all three new modules
 *   8. No network calls in any new module
 *   9. Shield categories structurally present in ar/zh/ja adapters (no phrase examples)
 *  10. i18n keys languageHarmony.multilingual.* present in all 7 locales
 *  11. package.json check:multilingual script registered
 *
 * Run: node scripts/check-multilingual-language-adapters.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

let errors = 0;
let warnings = 0;

function pass(msg)  { console.log(`  ✓ ${msg}`); }
function warn(msg)  { console.warn(`  ⚠ ${msg}`); warnings++; }
function fail(msg)  { console.error(`  ✗ ${msg}`); errors++; }

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
  else fail(`${file}: MUST NOT contain — ${label}`);
}

console.log('\n[check-multilingual-language-adapters] Pass 138 Multilingual Adapter Foundation Audit\n');

// ─── 1. Module files exist ────────────────────────────────────────────────────
console.log('── Module files');
const scriptDetection  = readOrFail('lib/qlpa/languageScriptDetection.ts');
const unicodeNorm      = readOrFail('lib/qlpa/unicodeLanguageNormalize.ts');
const multilingualTax  = readOrFail('lib/qlpa/multilingualTaxonomy.ts');

// ─── 2. languageScriptDetection.ts ───────────────────────────────────────────
console.log('\n── languageScriptDetection.ts: exports');
if (scriptDetection) {
  check(scriptDetection, 'languageScriptDetection.ts', "export type LanguageScript",           'LanguageScript type exported');
  check(scriptDetection, 'languageScriptDetection.ts', "'latin'",                               "LanguageScript includes 'latin'");
  check(scriptDetection, 'languageScriptDetection.ts', "'arabic'",                              "LanguageScript includes 'arabic'");
  check(scriptDetection, 'languageScriptDetection.ts', "'han'",                                 "LanguageScript includes 'han'");
  check(scriptDetection, 'languageScriptDetection.ts', "'kana'",                                "LanguageScript includes 'kana'");
  check(scriptDetection, 'languageScriptDetection.ts', "'mixed'",                               "LanguageScript includes 'mixed'");
  check(scriptDetection, 'languageScriptDetection.ts', "'unknown'",                             "LanguageScript includes 'unknown'");
  check(scriptDetection, 'languageScriptDetection.ts', 'export function detectPrimaryScript',   'detectPrimaryScript exported');
  check(scriptDetection, 'languageScriptDetection.ts', 'export function containsArabicScript',  'containsArabicScript exported');
  check(scriptDetection, 'languageScriptDetection.ts', 'export function containsHanScript',     'containsHanScript exported');
  check(scriptDetection, 'languageScriptDetection.ts', 'export function containsKanaScript',    'containsKanaScript exported');
  check(scriptDetection, 'languageScriptDetection.ts', 'export function containsLatinScript',   'containsLatinScript exported');
  check(scriptDetection, 'languageScriptDetection.ts', 'export function isMixedScript',         'isMixedScript exported');

  // No network calls
  console.log('\n── languageScriptDetection.ts: no network calls');
  checkAbsent(scriptDetection, 'languageScriptDetection.ts', 'fetch(',         'No fetch()');
  checkAbsent(scriptDetection, 'languageScriptDetection.ts', 'XMLHttpRequest', 'No XMLHttpRequest');
  checkAbsent(scriptDetection, 'languageScriptDetection.ts', 'supabase',       'No supabase');
}

// ─── 3. unicodeLanguageNormalize.ts ──────────────────────────────────────────
console.log('\n── unicodeLanguageNormalize.ts: exports and options');
if (unicodeNorm) {
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', 'export interface NormalizeOptions', 'NormalizeOptions interface exported');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', 'stripArabicDiacritics',             'stripArabicDiacritics option present');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', 'foldFullWidthLatin',                'foldFullWidthLatin option present');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', 'stripZeroWidth',                    'stripZeroWidth option present');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', 'collapseWhitespace',                'collapseWhitespace option present');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', 'export function normalizeLanguageInput', 'normalizeLanguageInput exported');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', "normalize('NFKC')",                 'NFKC normalization applied');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', '\\u0640',                           'Arabic tatweel removed');
  check(unicodeNorm, 'unicodeLanguageNormalize.ts', '\\uFF01',                           'Full-width Latin folding present');

  // No network calls
  console.log('\n── unicodeLanguageNormalize.ts: no network calls');
  checkAbsent(unicodeNorm, 'unicodeLanguageNormalize.ts', 'fetch(',         'No fetch()');
  checkAbsent(unicodeNorm, 'unicodeLanguageNormalize.ts', 'XMLHttpRequest', 'No XMLHttpRequest');
  checkAbsent(unicodeNorm, 'unicodeLanguageNormalize.ts', 'supabase',       'No supabase');
}

// ─── 4. multilingualTaxonomy.ts ───────────────────────────────────────────────
console.log('\n── multilingualTaxonomy.ts: SupportedAnalysisLanguage');
if (multilingualTax) {
  check(multilingualTax, 'multilingualTaxonomy.ts', "export type SupportedAnalysisLanguage", 'SupportedAnalysisLanguage type exported');
  for (const lang of ['en', 'fr', 'de', 'es', 'it', 'pt', 'id', 'ar', 'zh', 'ja', 'multilingual']) {
    check(multilingualTax, 'multilingualTaxonomy.ts', `'${lang}'`, `SupportedAnalysisLanguage includes '${lang}'`);
  }

  console.log('\n── multilingualTaxonomy.ts: LanguageTaxonomyAdapter interface');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'export interface LanguageTaxonomyAdapter', 'LanguageTaxonomyAdapter interface exported');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'language: SupportedAnalysisLanguage',      'language field present');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'primaryScripts: LanguageScript[]',          'primaryScripts field present');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'normalize: (text: string) => string',       'normalize fn field present');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'entries: readonly TaxonomyEntry[]',         'entries field present');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'phraseHooks:',                              'phraseHooks field present');

  console.log('\n── multilingualTaxonomy.ts: adapter API');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'export function getLanguageAdapter',     'getLanguageAdapter exported');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'export function inferAdapterFromText',   'inferAdapterFromText exported');
  check(multilingualTax, 'multilingualTaxonomy.ts', 'export { ADAPTER_REGISTRY }',            'ADAPTER_REGISTRY exported');

  console.log('\n── multilingualTaxonomy.ts: ar/zh/ja adapters exist');
  check(multilingualTax, 'multilingualTaxonomy.ts', "language: 'ar'",           'Arabic adapter present');
  check(multilingualTax, 'multilingualTaxonomy.ts', "language: 'zh'",           'Chinese adapter present');
  check(multilingualTax, 'multilingualTaxonomy.ts', "language: 'ja'",           'Japanese adapter present');
  check(multilingualTax, 'multilingualTaxonomy.ts', "language: 'multilingual'", 'Multilingual fallback adapter present');

  console.log('\n── multilingualTaxonomy.ts: Shield categories structurally wired (no phrase examples)');
  check(multilingualTax, 'multilingualTaxonomy.ts', "childSafety: []",         'childSafety hook is empty array (no phrase examples)');
  check(multilingualTax, 'multilingualTaxonomy.ts', "nonConsensualSexual: []", 'nonConsensualSexual hook is empty array (no phrase examples)');

  // No network calls
  console.log('\n── multilingualTaxonomy.ts: no network calls');
  checkAbsent(multilingualTax, 'multilingualTaxonomy.ts', 'fetch(',         'No fetch()');
  checkAbsent(multilingualTax, 'multilingualTaxonomy.ts', 'XMLHttpRequest', 'No XMLHttpRequest');
  checkAbsent(multilingualTax, 'multilingualTaxonomy.ts', 'supabase',       'No supabase');
}

// ─── 5. languageTaxonomy.ts: findMultilingualTaxonomyMatches ─────────────────
console.log('\n── languageTaxonomy.ts: multilingual routing');
const langTax = readOrFail('lib/qlpa/languageTaxonomy.ts');
if (langTax) {
  check(langTax, 'languageTaxonomy.ts', 'export function findMultilingualTaxonomyMatches', 'findMultilingualTaxonomyMatches exported');
  check(langTax, 'languageTaxonomy.ts', 'SupportedAnalysisLanguage',                       'SupportedAnalysisLanguage imported');
  check(langTax, 'languageTaxonomy.ts', 'getLanguageAdapter',                              'getLanguageAdapter imported');
  check(langTax, 'languageTaxonomy.ts', 'inferAdapterFromText',                            'inferAdapterFromText imported');
  // English taxonomy still intact
  check(langTax, 'languageTaxonomy.ts', 'export function findTaxonomyMatches',              'findTaxonomyMatches still exported (English unchanged)');
  check(langTax, 'languageTaxonomy.ts', 'export const TAXONOMY_TERMS',                     'TAXONOMY_TERMS still exported (English unchanged)');
}

// ─── 6. intentionMirror.ts: languageHint wiring ──────────────────────────────
console.log('\n── intentionMirror.ts: languageHint wiring');
const mirror = readOrFail('lib/qlpa/intentionMirror.ts');
if (mirror) {
  check(mirror, 'intentionMirror.ts', 'findMultilingualTaxonomyMatches', 'findMultilingualTaxonomyMatches imported');
  check(mirror, 'intentionMirror.ts', 'SupportedAnalysisLanguage',       'SupportedAnalysisLanguage imported');
  check(mirror, 'intentionMirror.ts', 'languageHint',                    'languageHint field on IntentionMirrorContext');
  check(mirror, 'intentionMirror.ts', "context.languageHint",            'context.languageHint used in analysis');
}

// ─── 7. lib/qlpa/index.ts: new exports ───────────────────────────────────────
console.log('\n── lib/qlpa/index.ts: new module exports');
const qlpaIndex = readOrFail('lib/qlpa/index.ts');
if (qlpaIndex) {
  check(qlpaIndex, 'index.ts', "'./languageScriptDetection'", 'languageScriptDetection re-exported');
  check(qlpaIndex, 'index.ts', "'./unicodeLanguageNormalize'", 'unicodeLanguageNormalize re-exported');
  check(qlpaIndex, 'index.ts', "'./multilingualTaxonomy'",    'multilingualTaxonomy re-exported');
}

// ─── 8. i18n: languageHarmony.multilingual.* keys in all 7 locales ───────────
console.log('\n── i18n locales: languageHarmony.multilingual.* keys');
const LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'id'];
const REQUIRED_MULTILINGUAL_KEYS = [
  '"analysisLanguage"',
  '"detectedScript"',
  '"multilingualFallback"',
  '"localOnlyAnalysis"',
  '"unsupportedLanguageSafeMode"',
  '"arabicSupported"',
  '"chineseSupported"',
  '"japaneseSupported"',
  '"sameRootCategories"',
];
for (const lang of LOCALES) {
  const p = resolve(root, `lib/i18n/locales/${lang}.json`);
  if (!existsSync(p)) { fail(`Locale file missing: ${lang}.json`); continue; }
  const content = readFileSync(p, 'utf8');
  for (const key of REQUIRED_MULTILINGUAL_KEYS) {
    if (content.includes(key)) pass(`${lang}.json: multilingual.${key} present`);
    else fail(`${lang}.json: multilingual.${key} MISSING`);
  }
  // Verify the keys are inside a "multilingual" block
  if (content.includes('"multilingual"')) pass(`${lang}.json: "multilingual" block present`);
  else fail(`${lang}.json: "multilingual" block MISSING`);
}

// ─── 9. package.json: check:multilingual script ──────────────────────────────
console.log('\n── package.json: check:multilingual script');
const pkg = readOrFail('package.json');
if (pkg) {
  check(pkg, 'package.json', 'check-multilingual-language-adapters', 'check:multilingual script registered');
  check(pkg, 'package.json', 'check:multilingual',                   'check:multilingual in scripts');
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n[check-multilingual-language-adapters] Complete. Errors: ${errors}, Warnings: ${warnings}`);
if (errors > 0) {
  console.error('[check-multilingual-language-adapters] FAILED — Pass 138 checks did not pass.');
  process.exit(1);
} else if (warnings > 0) {
  console.warn('[check-multilingual-language-adapters] Passed with warnings.');
} else {
  console.log('[check-multilingual-language-adapters] All Pass 138 multilingual adapter checks passed.');
}
