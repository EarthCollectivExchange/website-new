/**
 * QLPA Language Checker
 * Scans locale values for discouraged QLPA terms.
 * Reports terms and suggested replacements.
 * Run: node scripts/check-qlpa-language.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const localesDir = resolve(root, 'lib/i18n/locales');

// Discouraged terms map: term -> replacement
const REPLACEMENTS = {
  'Panic Mode':              'Shield Mode',
  'Panic password':          'Shield Phrase',
  'Kill switch':             'Seal Access',
  'Emergency wipe':          'Source Clear',
  'Danger Zone':             'Reset & Restore',
  'Threat detected':         'New access attempt noticed',
  'Suspicious login':        'New access attempt',
  'Failed delivery':         'Delivery paused',
  'Delete forever':          'Clear from this device',
  'Delete for everyone':     'Request clear everywhere',
  'Erase everything':        'Clear everything',
  'Permanently erase':       'Clear all local content',
  'Cannot be undone':        'This cannot be recovered',
  'Disappearing messages':   'Auto-clear messages',
  'Gone after':              'Auto-clears after',
  'Block user':              'Close connection',
  'Report abuse':            'Send safety report',
  'Self-destruct':           'Auto-clear',
  'self-destruct':           'auto-clear',
  'Wipe':                    'Clear',
  'wipe':                    'clear',
  'kill':                    'seal',
  'panic':                   'shield',
};

// Terms that are severe enough to fail the check
const SEVERE_TERMS = ['kill', 'wipe', 'self-destruct', 'panic', 'Emergency wipe', 'Delete forever'];

// Technical docs / keys to skip (not user-facing)
const SKIP_KEY_PREFIXES = ['developer.', 'delivery.developer.'];

function flattenLocale(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') {
      Object.assign(result, flattenLocale(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
}

function shouldSkip(key) {
  return SKIP_KEY_PREFIXES.some(prefix => key.startsWith(prefix));
}

console.log('\n[qlpa-language] Scanning locale files for discouraged terms...\n');

// Only check en.json (it's the source of truth — other locales inherit issues)
const enPath = join(localesDir, 'en.json');
const en = JSON.parse(readFileSync(enPath, 'utf8'));
const flat = flattenLocale(en);

let totalMatches = 0;
let severeMatches = 0;
const findings = [];

for (const [key, value] of Object.entries(flat)) {
  if (shouldSkip(key)) continue;
  if (typeof value !== 'string') continue;

  for (const [term, replacement] of Object.entries(REPLACEMENTS)) {
    if (value.toLowerCase().includes(term.toLowerCase())) {
      const isSevere = SEVERE_TERMS.some(t => t.toLowerCase() === term.toLowerCase());
      findings.push({ key, value, term, replacement, isSevere });
      totalMatches++;
      if (isSevere) severeMatches++;
    }
  }
}

if (findings.length === 0) {
  console.log('[qlpa-language] ✓ No discouraged terms found in en.json user-facing values.');
} else {
  for (const { key, value, term, replacement, isSevere } of findings) {
    const prefix = isSevere ? '  ✗ SEVERE' : '  ⚠ mild';
    console.warn(`${prefix} [${key}]`);
    console.warn(`     Found:    "${term}"`);
    console.warn(`     Suggest:  "${replacement}"`);
    console.warn(`     Value:    "${value.slice(0, 80)}${value.length > 80 ? '...' : ''}"`);
    console.warn('');
  }
}

console.log(`[qlpa-language] Complete. Found ${totalMatches} match(es), ${severeMatches} severe.`);

if (severeMatches > 0) {
  console.error('[qlpa-language] FAILED — severe terms found in user-facing en.json values. Please replace before shipping.');
  process.exit(1);
} else if (totalMatches > 0) {
  console.warn('[qlpa-language] Passed with warnings. Review mild terms above.');
} else {
  console.log('[qlpa-language] All clear.');
}
