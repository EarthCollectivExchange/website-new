#!/usr/bin/env node
/**
 * export-qlpa-matrix-source.mjs
 * Creates a clean, portable QLPA Matrix Source export package.
 *
 * What this does:
 * - Creates exports/qlpa-matrix-source/ folder structure
 * - Copies reusable foundation roots (lib, components, scripts, docs)
 * - Keeps product-specific app files outside the export
 * - Generates package.json and tsconfig.json
 * - Writes the manifest with file list
 * - Prints export summary
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXPORT_DIR = path.join(ROOT, 'exports', 'qlpa-matrix-source');

// ─── Source paths to include ──────────────────────────────────────────────────

const INCLUDE_PATHS = [
  // Foundation
  { src: 'lib/foundation', dest: 'lib/foundation' },
  { src: 'lib/qlpa', dest: 'lib/qlpa' },
  { src: 'lib/design', dest: 'lib/design' },
  { src: 'lib/i18n', dest: 'lib/i18n' },
  { src: 'lib/privacy', dest: 'lib/privacy' },
  { src: 'lib/security', dest: 'lib/security' },
  { src: 'lib/stats', dest: 'lib/stats' },
  // Components
  { src: 'components/foundation', dest: 'components/foundation' },
  { src: 'components/stats', dest: 'components/stats' },
  // Scripts
  { src: 'scripts/check-foundation.mjs', dest: 'scripts/check-foundation.mjs' },
  { src: 'scripts/check-i18n.mjs', dest: 'scripts/check-i18n.mjs' },
  { src: 'scripts/check-qlpa-language.mjs', dest: 'scripts/check-qlpa-language.mjs' },
  { src: 'scripts/check-stats-privacy.mjs', dest: 'scripts/check-stats-privacy.mjs' },
  { src: 'scripts/check-portability.mjs', dest: 'scripts/check-portability.mjs' },
  // Docs
  { src: 'docs/architecture', dest: 'docs/architecture' },
  { src: 'QLPA-ETHICAL-USE.md', dest: 'QLPA-ETHICAL-USE.md' },
  { src: 'PROJECT-ADAPTATION.md', dest: 'PROJECT-ADAPTATION.md' },
  { src: 'QLPA-MATRIX-SOURCE.md', dest: 'QLPA-MATRIX-SOURCE.md', optional: true },
  { src: 'INTEGRATION-GUIDE.md', dest: 'INTEGRATION-GUIDE.md', optional: true },
];

// ─── Excluded patterns (never export these) ───────────────────────────────────

const EXCLUDED_PATTERNS = [
  /lib\/messaging\//,
  /components\/messaging\//,
  /app\/messaging\//,
  /lib\/supabase/,
  /supabase\//,
  /app\/auth\//,
  /node_modules\//,
  /\.next\//,
  /\.git\//,
];

function shouldExclude(filePath) {
  return EXCLUDED_PATTERNS.some((p) => p.test(filePath));
}

// ─── Copy helpers ─────────────────────────────────────────────────────────────

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  const copiedFiles = [];
  if (!fs.existsSync(srcDir)) return copiedFiles;

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcFull = path.join(srcDir, entry.name);
    const destFull = path.join(destDir, entry.name);
    const relPath = path.relative(ROOT, srcFull).replace(/\\/g, '/');

    if (shouldExclude(relPath)) continue;

    if (entry.isDirectory()) {
      copiedFiles.push(...copyDir(srcFull, destFull));
    } else {
      copyFile(srcFull, destFull);
      copiedFiles.push(relPath);
    }
  }
  return copiedFiles;
}

// ─── Generate package.json ────────────────────────────────────────────────────

function writePackageJson() {
  const pkg = {
    name: 'qlpa-matrix-source',
    version: '1.0.0',
    description: 'QLPA Matrix Source — portable consent-first, local-first, Phi-aligned foundation for EarthOS family systems.',
    private: true,
    type: 'module',
    scripts: {
      'check:foundation': 'node scripts/check-foundation.mjs',
      'check:i18n': 'node scripts/check-i18n.mjs',
      'check:qlpa': 'node scripts/check-qlpa-language.mjs',
      'check:stats-privacy': 'node scripts/check-stats-privacy.mjs',
      'check:portability': 'node scripts/check-portability.mjs',
    },
    peerDependencies: {
      react: '>=18.0.0',
      'react-dom': '>=18.0.0',
      typescript: '>=5.0.0',
    },
    devDependencies: {
      typescript: '5.2.2',
      '@types/react': '18.2.22',
      '@types/react-dom': '18.2.7',
    },
    keywords: [
      'qlpa',
      'consent-first',
      'local-first',
      'privacy',
      'sovereignty',
      'phi-design',
      'i18n',
      'earthos',
    ],
    license: 'SEE QLPA-ETHICAL-USE.md',
  };

  fs.writeFileSync(
    path.join(EXPORT_DIR, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
  );
}

// ─── Generate tsconfig.json ───────────────────────────────────────────────────

function writeTsConfig() {
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      paths: {
        '@/*': ['./*'],
      },
    },
    include: ['**/*.ts', '**/*.tsx'],
    exclude: ['node_modules'],
  };

  fs.writeFileSync(
    path.join(EXPORT_DIR, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2) + '\n',
  );
}

// ─── Update manifest with file list ──────────────────────────────────────────

function updateManifest(fileList) {
  const manifestPath = path.join(EXPORT_DIR, 'qlpa-matrix-source.manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  manifest.exportTimestamp = new Date().toISOString();
  manifest.fileList = fileList.sort();
  manifest.portabilityCheckResult = 'run: node exports/qlpa-matrix-source/scripts/check-portability.mjs';
  manifest.i18nCheckResult = 'run: node exports/qlpa-matrix-source/scripts/check-i18n.mjs';
  manifest.qlpaLanguageCheckResult = 'run: node exports/qlpa-matrix-source/scripts/check-qlpa-language.mjs';
  manifest.statsPrivacyCheckResult = 'run: node exports/qlpa-matrix-source/scripts/check-stats-privacy.mjs';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function run() {
  console.log('');
  console.log('QLPA Matrix Source — Export');
  console.log('============================');
  console.log(`Exporting to: exports/qlpa-matrix-source/`);
  console.log('');

  fs.mkdirSync(EXPORT_DIR, { recursive: true });

  const allCopied = [];
  const skipped = [];

  for (const entry of INCLUDE_PATHS) {
    const srcFull = path.join(ROOT, entry.src);
    const destFull = path.join(EXPORT_DIR, entry.dest);

    if (!fs.existsSync(srcFull)) {
      if (!entry.optional) {
        skipped.push(entry.src);
      }
      continue;
    }

    const stat = fs.statSync(srcFull);
    if (stat.isDirectory()) {
      const files = copyDir(srcFull, destFull);
      allCopied.push(...files);
    } else {
      const relPath = path.relative(ROOT, srcFull).replace(/\\/g, '/');
      if (!shouldExclude(relPath)) {
        copyFile(srcFull, destFull);
        allCopied.push(relPath);
      }
    }
  }

  writePackageJson();
  writeTsConfig();
  updateManifest(allCopied);

  console.log(`FILES EXPORTED: ${allCopied.length}`);
  console.log('');

  const groups = {
    foundation: allCopied.filter((f) => f.startsWith('lib/foundation')),
    qlpa: allCopied.filter((f) => f.startsWith('lib/qlpa')),
    design: allCopied.filter((f) => f.startsWith('lib/design')),
    i18n: allCopied.filter((f) => f.startsWith('lib/i18n')),
    privacy: allCopied.filter((f) => f.startsWith('lib/privacy')),
    security: allCopied.filter((f) => f.startsWith('lib/security')),
    stats: allCopied.filter((f) => f.startsWith('lib/stats')),
    components: allCopied.filter((f) => f.startsWith('components/')),
    scripts: allCopied.filter((f) => f.startsWith('scripts/')),
    docs: allCopied.filter((f) => f.startsWith('docs/') || f.endsWith('.md')),
  };

  for (const [group, files] of Object.entries(groups)) {
    if (files.length > 0) {
      console.log(`  ${group.padEnd(12)}: ${files.length} files`);
    }
  }

  if (skipped.length > 0) {
    console.log('');
    console.log(`SKIPPED (not found): ${skipped.join(', ')}`);
  }

  console.log('');
  console.log('Generated: package.json, tsconfig.json, qlpa-matrix-source.manifest.json');
  console.log('');
  console.log('Next steps:');
  console.log('  node exports/qlpa-matrix-source/scripts/check-portability.mjs');
  console.log('  node exports/qlpa-matrix-source/scripts/check-foundation.mjs');
  console.log('  node exports/qlpa-matrix-source/scripts/check-i18n.mjs');
  console.log('  node exports/qlpa-matrix-source/scripts/check-qlpa-language.mjs');
  console.log('  node exports/qlpa-matrix-source/scripts/check-stats-privacy.mjs');
  console.log('');
  console.log('Export complete. QLPA Matrix Source is ready.');
}

run();
