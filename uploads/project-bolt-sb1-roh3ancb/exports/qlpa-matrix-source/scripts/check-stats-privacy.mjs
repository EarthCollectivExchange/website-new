/**
 * Stats Privacy Checker
 * Scans stats files for prohibited personal/content field names.
 * Run: node scripts/check-stats-privacy.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const statsDir = resolve(root, 'lib/stats');

// Prohibited field name patterns in stats interfaces/types
// These match field NAMES — not string VALUES (documentation strings are excluded)
const PROHIBITED_PATTERNS = [
  /\bbody\b/i,
  /\bcontent\b/i,
  /\bplaintext\b/i,
  /\bprivateKey\b/i,
  /\bsecretKey\b/i,
  /\bpassword\b/i,
  /\bphone\b/i,
  /\bemail\b/i,
  /\bcontactName\b/i,
  /\bfileName\b/i,
  /\bdisplayName\b/i,
  /\bearth[Ii]d\b/i,
  /\bmessageBody\b/i,
  /\bvoiceContent\b/i,
  /\bfileContent\b/i,
];

// Fields that are allowed even if they match pattern (documented exceptions)
const ALLOWED_EXCEPTIONS = [
  'encryptedPayload',
  'encryptedMetadata',
  'PROHIBITED_FIELD_PATTERNS', // guard definition itself
  'validateStatsEvent',        // the guard function
  'STATS_PRIVACY_NOTICE',      // documentation constant
  'neverCollects',             // privacy notice
];

function isAllowedException(line) {
  return ALLOWED_EXCEPTIONS.some(exc => line.includes(exc));
}

console.log('\n[stats-privacy] Scanning stats files for prohibited fields...\n');

let totalViolations = 0;
const files = readdirSync(statsDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = join(statsDir, file);
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments (lines starting with * or //)
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
    if (isAllowedException(line)) continue;

    // Check for prohibited patterns only in type/interface field name declarations
    // We match lines like "  fieldName:" or "  fieldName?:" in interface bodies
    // Skip string literal assignments (lines containing = '...' or : '...' string values)
    const isFieldDeclaration = /^\s+(readonly\s+)?[a-zA-Z_][a-zA-Z0-9_]*[?]?\s*:/.test(line);
    const isStringLiteralAssignment = /:\s*['"`]/.test(line) || /=\s*['"`]/.test(line);

    if (isFieldDeclaration && !isStringLiteralAssignment) {
      for (const pattern of PROHIBITED_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({ line: i + 1, content: line.trim(), pattern: pattern.toString() });
          break;
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`  ✗ ${file} — ${violations.length} violation(s):`);
    for (const v of violations) {
      console.error(`    Line ${v.line}: ${v.content}`);
    }
    totalViolations += violations.length;
  } else {
    console.log(`  ✓ ${file}`);
  }
}

// Also check StatsEvent interface specifically
const typesFile = resolve(statsDir, 'statsTypes.ts');
const typesContent = readFileSync(typesFile, 'utf8');
const interfaceMatch = typesContent.match(/interface StatsEvent \{([^}]+)\}/);
if (interfaceMatch) {
  const interfaceBody = interfaceMatch[1];
  const prohibitedFound = PROHIBITED_PATTERNS.some(p => {
    const test = p.test(interfaceBody);
    return test && !ALLOWED_EXCEPTIONS.some(e => interfaceBody.includes(e));
  });
  if (prohibitedFound) {
    console.error('  ✗ StatsEvent interface contains prohibited fields');
    totalViolations++;
  } else {
    console.log('  ✓ StatsEvent interface — no prohibited fields');
  }
}

console.log(`\n[stats-privacy] Complete. Violations: ${totalViolations}`);
if (totalViolations > 0) {
  console.error('[stats-privacy] FAILED — remove prohibited personal/content fields from stats.');
  process.exit(1);
} else {
  console.log('[stats-privacy] All checks passed.');
}
