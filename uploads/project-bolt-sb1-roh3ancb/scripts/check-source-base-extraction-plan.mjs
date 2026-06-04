/**
 * check-source-base-extraction-plan.mjs
 *
 * Verifies the QLPA Source Base Extraction Plan and source base identity are
 * correctly in place. Does NOT verify any deletions — this is a preservation check.
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

console.log('\n== check-source-base-extraction-plan ==\n');

// 1. sourceBaseIdentity.ts exists
const identityPath = 'lib/qlpa/sourceBaseIdentity.ts';
const identityContent = readFile(identityPath);
assert('sourceBaseIdentity.ts exists', identityContent !== null);

if (identityContent) {
  assert(
    'sourceBaseName is EarthOS QLPA Matrix Source Code Base',
    identityContent.includes('EarthOS QLPA Matrix Source Code Base'),
  );
  assert(
    'sourceBaseVersion is canonical-v1',
    identityContent.includes('canonical-v1'),
  );
  assert(
    'sourceBaseStatus is a valid source base status',
    identityContent.includes('extraction-planning') ||
      identityContent.includes('visual-realignment') ||
      identityContent.includes('isolation-pass') ||
      identityContent.includes('canonical-clean'),
  );
  assert(
    'intendedUse mentions reusable foundation',
    identityContent.includes('reusable foundation'),
  );
  assert(
    'legalBoundary or forbiddenUse present',
    identityContent.includes('legalBoundary') || identityContent.includes('forbiddenUse'),
  );
  assert(
    'adaptationTargets present',
    identityContent.includes('adaptationTargets'),
  );
  assert(
    'production crypto/wallet boundary declared',
    identityContent.includes('not a production crypto/wallet system') ||
      identityContent.includes('not a production crypto'),
  );
  assert(
    'scopeBoundary or purpose defines foundation scope',
    identityContent.includes('scopeBoundary') || identityContent.includes('purpose:'),
  );
}

// 2. Extraction plan doc exists
const planPath = 'docs/QLPA_SOURCE_BASE_EXTRACTION_PLAN.md';
const planContent = readFile(planPath);
assert('QLPA_SOURCE_BASE_EXTRACTION_PLAN.md exists', planContent !== null);

if (planContent) {
  // 3. Doc says this is a duplicated project
  assert(
    'plan doc states this is a duplicated project',
    planContent.toLowerCase().includes('duplicated project') ||
      planContent.toLowerCase().includes('this is a duplicated'),
  );

  // 4. Contains preserve list
  assert(
    'plan doc contains PRESERVE list',
    planContent.includes('PRESERVE') || planContent.includes('Preserve'),
  );

  // 5. Contains remove/isolate list
  assert(
    'plan doc contains REMOVE / ISOLATE list',
    planContent.includes('REMOVE') || planContent.includes('Remove'),
  );

  // 6. Does NOT contain instructions to delete the active Messaging app
  const mentionsActiveDelete =
    planContent.includes('delete the active EarthOS Messaging') ||
    planContent.includes('rm -rf') ||
    planContent.includes('delete from the active');
  assert(
    'plan doc contains no instruction to delete the active Messaging app',
    !mentionsActiveDelete,
  );

  // 7. Extraction plan references canonical-v1
  assert(
    'plan doc references canonical-v1',
    planContent.includes('canonical-v1'),
  );

  // 8. Extraction plan has risks section
  assert(
    'plan doc has RISKS section',
    planContent.includes('RISKS') || planContent.includes('Risks'),
  );

  // 9. Extraction plan has next-pass section
  assert(
    'plan doc has next cleanup pass section',
    planContent.includes('NEXT') || planContent.includes('Pass 2'),
  );
}

// 10. sourceBaseIdentity is exported from lib/qlpa/index.ts
const indexContent = readFile('lib/qlpa/index.ts');
assert(
  'sourceBaseIdentity exported from lib/qlpa/index.ts',
  indexContent !== null && indexContent.includes('./sourceBaseIdentity'),
);

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
