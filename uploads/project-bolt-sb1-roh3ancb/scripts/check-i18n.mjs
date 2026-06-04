/**
 * i18n checker (warning only — does not block build).
 *
 * 1. Missing-key check: every key in en.json must exist in all other locales.
 * 2. Hardcoded-string scan: warns when common visible English strings appear
 *    as JSX text/attributes in components/messaging and app/messaging.
 *
 * Run: node scripts/check-i18n.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const localesDir = resolve(__dirname, '../lib/i18n/locales');
const en = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8'));

// ─── Flatten helpers ──────────────────────────────────────────────────────────

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
}

// ─── 1. Missing-key check ─────────────────────────────────────────────────────

const enFlat = flatten(en);
const enKeys = Object.keys(enFlat);

let totalWarnings = 0;

const localeFiles = readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

for (const file of localeFiles) {
  const locale = file.replace('.json', '');
  const dict = JSON.parse(readFileSync(join(localesDir, file), 'utf8'));
  const flat = flatten(dict);
  const missing = enKeys.filter(k => !(k in flat));
  if (missing.length > 0) {
    console.warn(`\n[i18n] ${locale} — ${missing.length} missing key(s):`);
    for (const k of missing) {
      console.warn(`  ⚠ ${k}  (en: "${enFlat[k]}")`);
    }
    totalWarnings += missing.length;
  } else {
    console.log(`[i18n] ${locale} — ✓ complete`);
  }
}

if (totalWarnings > 0) {
  console.warn(`\n[i18n] Total missing-key warnings: ${totalWarnings}. Add missing keys to keep translations in sync.`);
  console.warn('[i18n] Missing keys fall back to English — app still works.');
} else {
  console.log('\n[i18n] All locales complete.');
}

// ─── 2. Hardcoded visible-string scan ────────────────────────────────────────
//
// These strings commonly appear hardcoded in English when they should be t() calls.
// Patterns are matched as whole words / phrases in JSX text content and string literals.
// Protected terms (EarthOS, EarthID, QLPA, AES-GCM, MVP) are intentionally omitted.

const HARDCODED_PATTERNS = [
  // Delivery / status chips
  />\s*Delivery\s*</,
  />\s*Waiting\s*</,
  />\s*Allowed\s*</,
  />\s*Protected\s*</,
  />\s*Blocked\s*</,
  />\s*No recipient\s*</,
  // Privacy / storage
  />\s*Local only\s*</,
  />\s*Encrypted relay\s*</,
  />\s*Privacy\s*</,
  // Consent
  />\s*Consent\s*</,
  />\s*Require approval\s*</,
  // Conversation meta
  />\s*Conversation details\s*</,
  />\s*No name set\s*</,
  />\s*QLPA STATUS\s*</,
  />\s*QLPA Status\s*</,
  />\s*Created\s*</,
  />\s*Last activity\s*</,
  />\s*Settings updated\s*</,
  // Members / people
  />\s*Members\s*</,
  />\s*Owner\s*</,
  />\s*Invite member\s*</,
  // Navigation / UI chrome
  />\s*New conversation\s*</,
  />\s*Dashboard\s*</,
  />\s*Settings\s*</,
  // Trust
  />\s*Trust\s*</,
  // Journey / release
  />\s*First Mission\s*</,
  />\s*Release readiness\s*</,
  // Crypto / integrity panel
  />\s*Prototype encryption\s*</,
  />\s*Device key\s*</,
  />\s*Message integrity check\s*</,
  />\s*Crypto QA\s*</,
  />\s*Run check\s*</,
  />\s*Regenerate device key\s*</,
  // Sync / identity panel
  />\s*Unauthenticated\s*</,
  />\s*Local mode only\s*</,
  />\s*Connect EarthID\s*</,
  />\s*Metadata sync checklist\s*</,
  />\s*No sync errors\s*</,
  />\s*Sign in to use bridge\s*</,
  // Consent QA panel
  />\s*Current conversation decision\s*</,
  />\s*Test trust level across types\s*</,
  />\s*Expand\s*</,
  // MessageDetail drawer strings (object literal labels)
  />\s*Message details\s*</,
  />\s*Delivery timeline\s*</,
  />\s*Sent at\s*</,
  />\s*Encryption\s*</,
  />\s*Storage mode\s*</,
  />\s*Intention mirror\s*</,
  />\s*Integrity hash\s*</,
  />\s*Relay boundary\s*</,
  />\s*Recipients\s*</,
  />\s*No external recipient yet\s*</,
  />\s*Encrypted payload\s*</,
  />\s*Plaintext never leaves this device\s*</,
  />\s*No relay envelope\s*</,
  /label:\s*'Local encrypted/,
  /label:\s*'Prototype key/,
  /label:\s*'Unencrypted/,
  /label:\s*'Integrity check failed/,
  /'Local only — content never leaves/,
  /'Encrypted relay — server relays/,
  /'Encrypted backup — user-opted/,
  /'Allowed'\s*,/,
  /'Pending approval'\s*,/,
  /'Emergency signal'\s*,/,
  /'Not checked'\s*,/,
  /'Checked — clear'\s*,/,
  /'Mirror reflected'\s*,/,
  /'Sent with awareness/,
  // Search panel strings
  /placeholder="Search messages and contacts/,
  />\s*Cancel\s*</,
  />\s*Recent searches\s*</,
  />\s*Search your messages\s*</,
  /All search is fully local/,
  /No results for/,
  /Try different keywords/,
  /Search is fully local — indexed/,
  // Contacts tab strings
  />\s*Contacts\s*</,
  /placeholder="Search contacts/,
  />\s*No contacts yet\s*</,
  /Invite someone to a conversation to add them/,
  /No contacts match/,
  />\s*Clear search\s*</,
  // Intention mirror strings
  />\s*Intention Mirror\s*</,
  />\s*Pausing for/,
  />\s*Send anyway\s*</,
  />\s*Edit message\s*</,
  />\s*Pause 33s\s*</,
  />\s*Clear request\s*</,
  /This is a reflection, not a judgment/,
  // Hardcoded string literals in JSX props (common offenders)
  /"(?:Protected|Waiting|Allowed|Blocked|Delivery|Privacy|Consent|Members|Owner|Local only|Encrypted relay|Trust)"/,
  // Placeholder attributes with hardcoded English
  /placeholder="(?!.*\{t\()(?:Search|Enter|Type|Write|Add)\s[A-Z]/,
  // Test/demo message strings that must be i18n'd
  /Hello\s*[—–-]+\s*this is a local test message/i,
  /['"`]local test message['"`]/i,
  /['"`][^'"]*\btest message\b[^'"]*['"`]/i,
];

// Directories to scan
const SCAN_DIRS = [
  resolve(root, 'components/messaging'),
  resolve(root, 'app/messaging'),
];

// Collect .tsx files recursively
function collectTsx(dir) {
  const files = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectTsx(full));
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        files.push(full);
      }
    }
  } catch {
    // directory may not exist
  }
  return files;
}

const tsxFiles = SCAN_DIRS.flatMap(collectTsx);

let hardcodedWarnings = 0;

console.log('\n[i18n] Scanning for hardcoded visible strings…');

for (const file of tsxFiles) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const relPath = file.replace(root + '/', '');
  const fileHits = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip lines that are already using t() or are inside comments
    if (line.includes('t(') || line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
    // Skip import/export lines and type annotations
    if (line.trim().startsWith('import ') || line.trim().startsWith('export type')) continue;

    for (const pattern of HARDCODED_PATTERNS) {
      if (pattern.test(line)) {
        fileHits.push({ lineNo: i + 1, text: line.trim() });
        break;
      }
    }
  }

  if (fileHits.length > 0) {
    console.warn(`\n[i18n-scan] ${relPath} — ${fileHits.length} potential hardcoded string(s):`);
    for (const { lineNo, text } of fileHits) {
      console.warn(`  ⚠ line ${lineNo}: ${text.slice(0, 120)}`);
    }
    hardcodedWarnings += fileHits.length;
  }
}

if (hardcodedWarnings === 0) {
  console.log('[i18n-scan] No hardcoded visible strings detected.');
} else {
  console.warn(`\n[i18n-scan] Total hardcoded string warnings: ${hardcodedWarnings}. Replace with t() calls.`);
  console.warn('[i18n-scan] These are warnings only — build is not blocked.');
}

// ─── 3. Raw-key usage scan ────────────────────────────────────────────────────
//
// Detects t('some.key') calls where the key does NOT exist in en.json.
// When a key is missing, the t() hook returns the raw key string, which is
// visible to users as e.g. "trust.tabTitle". This scan catches those before
// they reach production.
//
// Also warns for any string literal that looks like a raw i18n key being
// used directly in JSX text (e.g. the key leaked into JSX output).

const RAW_KEY_NAMESPACES = [
  'trust\\.', 'conversation\\.', 'settings\\.', 'privacy\\.', 'delivery\\.',
  'common\\.', 'messages\\.', 'consent\\.', 'sovereignty\\.', 'sovereigntyDrawer\\.',
  'nav\\.', 'modes\\.', 'onboarding\\.', 'retention\\.', 'files\\.', 'voice\\.',
  'invite\\.', 'newConversation\\.', 'mvp\\.', 'chips\\.', 'badge\\.', 'syncStatus\\.',
  'banner\\.', 'emptyState\\.', 'msgType\\.', 'errors\\.', 'dashboard\\.',
  'messageDetail\\.', 'search\\.', 'contacts\\.', 'mirror\\.', 'timeUnits\\.',
];

// Match t('some.key') calls and extract the key
// Template literals with ${...} are dynamic lookups — skip them
const T_CALL_RE = /\bt\(['"`]([^'"`]+)['"`]\)/g;

let rawKeyWarnings = 0;

console.log('\n[i18n] Scanning for t() calls with missing keys…');

for (const file of tsxFiles) {
  const src = readFileSync(file, 'utf8');
  const relPath = file.replace(root + '/', '');
  const fileHits = [];
  let match;

  T_CALL_RE.lastIndex = 0;
  while ((match = T_CALL_RE.exec(src)) !== null) {
    const key = match[1];
    // Skip template literals — they're dynamic lookups, not static keys
    if (key.includes('${')) continue;
    if (!(key in enFlat)) {
      // Find line number
      const upTo = src.slice(0, match.index);
      const lineNo = upTo.split('\n').length;
      fileHits.push({ lineNo, key });
    }
  }

  if (fileHits.length > 0) {
    console.warn(`\n[i18n-keys] ${relPath} — ${fileHits.length} t() call(s) with missing keys:`);
    for (const { lineNo, key } of fileHits) {
      console.warn(`  ⚠ line ${lineNo}: t('${key}')  — key not in en.json`);
    }
    rawKeyWarnings += fileHits.length;
  }
}

// Also scan for JSX text that looks like a raw key leak (e.g. >trust.tabTitle<)
const RAW_KEY_LEAK_RE = new RegExp(`>\\s*((?:${RAW_KEY_NAMESPACES.join('|')})[A-Za-z.]+)\\s*<`, 'g');

for (const file of tsxFiles) {
  const src = readFileSync(file, 'utf8');
  const relPath = file.replace(root + '/', '');
  const lines = src.split('\n');
  const fileHits = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
    RAW_KEY_LEAK_RE.lastIndex = 0;
    if (RAW_KEY_LEAK_RE.test(line)) {
      fileHits.push({ lineNo: i + 1, text: line.trim().slice(0, 120) });
    }
  }

  if (fileHits.length > 0) {
    console.warn(`\n[i18n-leak] ${relPath} — possible raw key leak in JSX:`);
    for (const { lineNo, text } of fileHits) {
      console.warn(`  ⚠ line ${lineNo}: ${text}`);
    }
    rawKeyWarnings += fileHits.length;
  }
}

if (rawKeyWarnings === 0) {
  console.log('[i18n-keys] No missing t() keys or raw key leaks detected.');
} else {
  console.warn(`\n[i18n-keys] Total raw key warnings: ${rawKeyWarnings}. Add missing keys or fix t() call names.`);
  console.warn('[i18n-keys] These are warnings only — build is not blocked.');
}

// ─── Exit summary ─────────────────────────────────────────────────────────────

const total = totalWarnings + hardcodedWarnings + rawKeyWarnings;
if (total === 0) {
  console.log('\n[i18n] All checks passed.');
} else {
  console.warn(`\n[i18n] ${total} total warning(s). See above for details.`);
}
