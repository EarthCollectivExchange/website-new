/**
 * check-source-base-visual-identity.mjs
 *
 * Verifies the source base visual identity is correctly represented:
 * - sourceBaseIdentity has scopeBoundary, origin, purpose, legalBoundary
 * - Homepage contains required identity markers (canonical, clean — no defensive language)
 * - README identifies this as canonical source base
 * - Scope doc exists and has key sections
 * - qlpa:check includes this script
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

function readFile(relPath) {
  const abs = resolve(ROOT, relPath);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

console.log('\n== check-source-base-visual-identity ==\n');

// 1. sourceBaseIdentity.ts structure
const identity = readFile('lib/qlpa/sourceBaseIdentity.ts');
assert('sourceBaseIdentity.ts exists', identity !== null);

if (identity) {
  assert(
    'sourceBaseIdentity has scopeBoundary',
    identity.includes('scopeBoundary'),
  );
  assert(
    'scopeBoundary references foundation layer',
    identity.includes('foundation layer'),
  );
  assert(
    'sourceBaseIdentity has legalBoundary',
    identity.includes('legalBoundary'),
  );
  assert(
    'sourceBaseIdentity has origin field',
    identity.includes('origin:'),
  );
  assert(
    'origin references EarthOS Messaging build',
    identity.includes('duplicated from EarthOS Messaging'),
  );
  assert(
    'sourceBaseIdentity has purpose field',
    identity.includes('purpose:'),
  );
  assert(
    'purpose mentions reusable QLPA foundation',
    identity.includes('reusable QLPA foundation'),
  );
  assert(
    'sourceBaseStatus is visual-realignment',
    identity.includes('visual-realignment'),
  );
}

// 2. Homepage contains required canonical identity markers
const homepage = readFile('app/page.tsx');
assert('app/page.tsx exists', homepage !== null);

if (homepage) {
  assert(
    'homepage contains "EarthOS QLPA Matrix"',
    homepage.includes('EarthOS QLPA Matrix'),
  );
  assert(
    'homepage contains "Canonical Source Base v1"',
    homepage.includes('Canonical Source Base v1'),
  );
  assert(
    'homepage contains "CANONICAL SOURCE BASE"',
    homepage.includes('CANONICAL SOURCE BASE'),
  );
  assert(
    'homepage does NOT route to /messaging as primary CTA',
    !homepage.includes("router.push('/messaging')"),
  );
  assert(
    'homepage does NOT have defensive NOT THE MESSAGING APP text',
    !homepage.includes('NOT THE MESSAGING APP'),
  );
  assert(
    'homepage does NOT have warning triangle banner',
    !homepage.includes('SourceBaseBanner') || !homepage.includes('AlertTriangle'),
  );
}

// 3. README identifies this as canonical source base
const readme = readFile('README.md');
assert('README.md exists', readme !== null);

if (readme) {
  assert(
    'README identifies as EarthOS QLPA Matrix Source Code Base',
    readme.includes('EarthOS QLPA Matrix Source Code Base'),
  );
  assert(
    'README states Canonical v1',
    readme.includes('Canonical v1') || readme.includes('canonical-v1'),
  );
  assert(
    'README does not have What this is NOT section',
    !readme.includes('## What this is NOT'),
  );
  assert(
    'README mentions reusable QLPA foundation',
    readme.includes('reusable QLPA foundation') || readme.includes('reusable foundation'),
  );
}

// 4. QLPA_SOURCE_BASE_SCOPE.md exists with key sections
const scope = readFile('docs/QLPA_SOURCE_BASE_SCOPE.md');
assert('docs/QLPA_SOURCE_BASE_SCOPE.md exists', scope !== null);

if (scope) {
  assert(
    'scope doc has Foundation Layers section',
    scope.includes('Foundation Layers') || scope.includes('FOUNDATION LAYERS'),
  );
  assert(
    'scope doc has Scope Boundary section',
    scope.includes('Scope Boundary'),
  );
  assert(
    'scope doc has Adaptation Targets section',
    scope.includes('Adaptation Targets') || scope.includes('ADAPTATION TARGETS'),
  );
  assert(
    'scope doc has Differences table',
    scope.includes('Differences from EarthOS Messaging'),
  );
}

// 5. package.json wires check:source-base-visual-identity
const pkg = readFile('package.json');
assert('package.json exists', pkg !== null);

if (pkg) {
  assert(
    'package.json has check:source-base-visual-identity script',
    pkg.includes('check:source-base-visual-identity'),
  );
  assert(
    'qlpa:check pipeline includes this check',
    pkg.includes('check:source-base-visual-identity') &&
      pkg.includes('qlpa:check'),
  );
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
