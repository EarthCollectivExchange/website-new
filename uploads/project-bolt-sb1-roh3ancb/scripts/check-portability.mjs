#!/usr/bin/env node
/**
 * check-portability.mjs
 * Scans the exported QLPA Matrix Source package for project-specific coupling.
 * Reports file path, matched reference, suggested replacement, and portability status.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// The export path to scan — fall back to scanning the full lib if export not yet generated
const EXPORT_PATH = path.join(ROOT, 'exports', 'qlpa-matrix-source');
const SCAN_PATH = fs.existsSync(EXPORT_PATH) ? EXPORT_PATH : path.join(ROOT, 'lib');

const COUPLING_PATTERNS = [
  {
    pattern: /@\/lib\/messaging/g,
    label: '@/lib/messaging import',
    suggestion: 'Move logic to lib/foundation or lib/qlpa and import from there.',
  },
  {
    pattern: /from ['"]\.\.\/messaging/g,
    label: '../messaging relative import',
    suggestion: 'Move logic to lib/foundation or lib/qlpa and import from there.',
  },
  {
    pattern: /from ['"]\.\/messaging/g,
    label: './messaging relative import',
    suggestion: 'Move logic to lib/foundation or lib/qlpa and import from there.',
  },
  {
    pattern: /components\/messaging/g,
    label: 'components/messaging reference',
    suggestion: 'Move reusable components to components/foundation or components/stats.',
  },
  {
    pattern: /app\/messaging/g,
    label: 'app/messaging reference',
    suggestion: 'Remove app-layer references from foundation source.',
  },
  {
    pattern: /from ['"]@\/lib\/supabase/g,
    label: '@/lib/supabase import',
    suggestion: 'Foundation source should not depend on Supabase directly. Use an abstract data interface.',
  },
  {
    pattern: /from ['"]\.\.\/supabase/g,
    label: '../supabase relative import',
    suggestion: 'Foundation source should not depend on Supabase directly.',
  },
  {
    pattern: /EarthOS Messaging/g,
    label: 'EarthOS Messaging product reference',
    suggestion: 'Replace with a generic reference or move to product-specific layer.',
  },
  {
    pattern: /APP_NAME\s*=\s*['"]EarthOS Messaging['"]/g,
    label: 'Hardcoded APP_NAME = EarthOS Messaging',
    suggestion: 'APP_NAME should be customized per project in appConstants.ts.',
  },
];

const EXTENSIONS = ['.ts', '.tsx', '.mjs'];
// JSON files (manifests, locale files) are excluded from coupling scan

function scanDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue;
      results.push(...scanDir(full));
    } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function checkFile(filePath) {
  const rel = path.relative(ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];

  for (const { pattern, label, suggestion } of COUPLING_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      findings.push({ label, suggestion, count: matches.length });
    }
  }

  return findings.length > 0 ? { file: rel, findings } : null;
}

function run() {
  console.log('');
  console.log('QLPA Matrix Source — Portability Check');
  console.log('========================================');
  console.log(`Scanning: ${path.relative(ROOT, SCAN_PATH)}`);
  console.log('');

  const files = scanDir(SCAN_PATH);
  const issues = [];

  for (const f of files) {
    const result = checkFile(f);
    if (result) issues.push(result);
  }

  if (issues.length === 0) {
    console.log('PASS  No project-specific coupling found.');
    console.log('');
    console.log('The QLPA Matrix Source is portable and clean.');
    process.exit(0);
  }

  console.log(`ISSUES FOUND in ${issues.length} file(s):`);
  console.log('');

  for (const issue of issues) {
    console.log(`FILE: ${issue.file}`);
    for (const f of issue.findings) {
      console.log(`  COUPLING  : ${f.label}`);
      console.log(`  SUGGESTION: ${f.suggestion}`);
    }
    console.log('');
  }

  console.log('Portability status: NEEDS REVIEW');
  console.log('Address the above before distributing as a universal source package.');
  process.exit(1);
}

run();
