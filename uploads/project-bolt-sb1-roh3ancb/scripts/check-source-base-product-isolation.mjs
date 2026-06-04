/**
 * check-source-base-product-isolation.mjs
 *
 * Verifies the source base product UI isolation is correctly documented and staged.
 * Does NOT assert that files are deleted — this is a structural isolation check.
 *
 * Assertions:
 * - source base homepage exists and does not route to /messaging
 * - app/messaging is a stub (no product imports — ConversationList, AppDashboard, etc.)
 * - docs/QLPA_SOURCE_BASE_PRODUCT_UI_AUDIT.md exists
 * - docs/QLPA_SOURCE_BASE_ISOLATION_MANIFEST.md exists
 * - docs/archive/messaging-origin/ exists
 * - audit doc lists MessageComposer as product-specific (archive)
 * - audit doc lists ConversationView as product-specific (archive)
 * - audit doc lists PhoneQAPanel as product-specific (archive)
 * - audit doc lists lib/qlpa as canonical foundation (preserve)
 * - qlpa:check pipeline includes this script
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

function dirExists(relPath) {
  return existsSync(resolve(ROOT, relPath));
}

console.log('\n== check-source-base-product-isolation ==\n');

// 1. Source base homepage exists and is not a routing stub to /messaging
const homepage = readFile('app/page.tsx');
assert('app/page.tsx exists (source base index)', homepage !== null);

if (homepage) {
  assert(
    'homepage contains EarthOS QLPA Matrix identity',
    homepage.includes('EarthOS QLPA Matrix') || homepage.includes('CANONICAL SOURCE BASE'),
  );
  assert(
    'homepage does not route to /messaging as primary CTA',
    !homepage.includes("router.push('/messaging')") &&
      !homepage.includes('handleEnterMessaging'),
  );
}

// 2. app/messaging is a placeholder (no product component imports)
const messagingPage = readFile('app/messaging/page.tsx');
assert('app/messaging/page.tsx exists (stub)', messagingPage !== null);

if (messagingPage) {
  assert(
    'app/messaging/page.tsx does not import ConversationList',
    !messagingPage.includes('ConversationList'),
  );
  assert(
    'app/messaging/page.tsx does not import AppDashboard',
    !messagingPage.includes('AppDashboard'),
  );
  assert(
    'app/messaging/page.tsx does not import ConversationView',
    !messagingPage.includes('ConversationView'),
  );
  assert(
    'app/messaging/page.tsx does not import MessageComposer',
    !messagingPage.includes('MessageComposer'),
  );
  assert(
    'app/messaging/page.tsx is a source-base stub (contains QLPA or isolation text)',
    messagingPage.includes('QLPA') ||
      messagingPage.includes('Source Base') ||
      messagingPage.includes('isolated') ||
      messagingPage.includes('placeholder'),
  );
}

// 3. app/messaging/layout.tsx does not import messaging product providers
const messagingLayout = readFile('app/messaging/layout.tsx');
assert('app/messaging/layout.tsx exists', messagingLayout !== null);

if (messagingLayout) {
  assert(
    'messaging layout does not import lib/messaging/preferencesContext',
    !messagingLayout.includes('lib/messaging/preferencesContext'),
  );
}

// 4. Audit doc exists
const audit = readFile('docs/QLPA_SOURCE_BASE_PRODUCT_UI_AUDIT.md');
assert('docs/QLPA_SOURCE_BASE_PRODUCT_UI_AUDIT.md exists', audit !== null);

if (audit) {
  assert(
    'audit doc lists MessageComposer as product-specific',
    audit.includes('MessageComposer'),
  );
  assert(
    'audit doc lists ConversationView as product-specific',
    audit.includes('ConversationView'),
  );
  assert(
    'audit doc lists PhoneQAPanel as product-specific',
    audit.includes('PhoneQAPanel'),
  );
  assert(
    'audit doc lists lib/qlpa as canonical foundation (PRESERVE)',
    audit.includes('lib/qlpa') && (audit.includes('PRESERVE') || audit.includes('Preserve')),
  );
  assert(
    'audit doc has Archive Now section',
    audit.includes('Archive Now') || audit.includes('A. Archive'),
  );
  assert(
    'audit doc has Preserve section',
    audit.includes('Preserve as canonical') || audit.includes('B. Preserve'),
  );
}

// 5. Isolation manifest exists
const manifest = readFile('docs/QLPA_SOURCE_BASE_ISOLATION_MANIFEST.md');
assert('docs/QLPA_SOURCE_BASE_ISOLATION_MANIFEST.md exists', manifest !== null);

if (manifest) {
  assert(
    'manifest lists app/messaging/page.tsx as replace-with-stub',
    manifest.includes('replace-with-stub') || manifest.includes('replace with stub'),
  );
  assert(
    'manifest lists lib/messaging as archive',
    manifest.includes('lib/messaging') && manifest.includes('archive'),
  );
  assert(
    'manifest lists lib/qlpa as keep',
    manifest.includes('lib/qlpa') && manifest.includes('keep'),
  );
}

// 6. Archive directory exists
assert(
  'docs/archive/messaging-origin/ directory exists',
  dirExists('docs/archive/messaging-origin'),
);

// 7. package.json wires this script
const pkg = readFile('package.json');
assert('package.json exists', pkg !== null);

if (pkg) {
  assert(
    'package.json has check:source-base-product-isolation script',
    pkg.includes('check:source-base-product-isolation'),
  );
  assert(
    'qlpa:check pipeline includes this check',
    pkg.includes('check:source-base-product-isolation') &&
      pkg.includes('qlpa:check'),
  );
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
