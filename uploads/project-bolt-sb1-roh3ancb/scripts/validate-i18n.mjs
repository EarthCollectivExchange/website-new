/**
 * i18n locale validator — fails build on missing keys.
 *
 * Implements the logic from lib/i18n/validateLocales.ts as a plain ESM
 * script so it can run without a TypeScript transpiler.
 *
 * Exit 0: all locales valid.
 * Exit 1: one or more missing keys detected.
 *
 * Run: node scripts/validate-i18n.mjs
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, '../lib/i18n/locales');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatten(obj, prefix = '') {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = String(v);
    }
  }
  return result;
}

// ─── Load locales ─────────────────────────────────────────────────────────────

const en = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf8'));
const enFlat = flatten(en);
const enKeys = Object.keys(enFlat);

const localeFiles = readdirSync(localesDir)
  .filter((f) => f.endsWith('.json') && f !== 'en.json');

// ─── Validate ─────────────────────────────────────────────────────────────────

let totalMissing = 0;
const failures = [];

for (const file of localeFiles.sort()) {
  const code = file.replace('.json', '');
  const json = JSON.parse(readFileSync(join(localesDir, file), 'utf8'));
  const flat = flatten(json);
  const missing = enKeys.filter((k) => !(k in flat));

  if (missing.length > 0) {
    totalMissing += missing.length;
    failures.push({ code, missing });
  }
}

// ─── Report ───────────────────────────────────────────────────────────────────

if (totalMissing === 0) {
  console.log(`✓ i18n valid — all ${localeFiles.length} locale(s) complete (${enKeys.length} keys).`);
  process.exit(0);
}

console.error(`\n✗ i18n validation FAILED — ${totalMissing} missing key(s) across ${failures.length} locale(s).\n`);

for (const { code, missing } of failures) {
  console.error(`  ${code}: ${missing.length} missing key(s)`);
  const show = missing.slice(0, 20);
  for (const key of show) {
    console.error(`    - ${key}`);
  }
  if (missing.length > 20) {
    console.error(`    ... and ${missing.length - 20} more`);
  }
  console.error('');
}

console.error('Add the missing keys to each locale file, or copy the English fallback values.\n');
process.exit(1);
