'use client';

import { useState, useEffect } from 'react';
import {
  Shield, Globe, Layers, GitBranch, Lock,
  SquareCheck as CheckSquare, Activity, BookOpen,
  Code as Code2, Network, Cpu, ChevronRight,
  FileText, Archive, Terminal, Zap,
} from 'lucide-react';
import { attachVisualViewportListeners } from '@/lib/foundation/scrollOrchestrator';

// ─── Scroll position preservation (HMR / back-nav) ───────────────────────────

const SCROLL_KEY = 'qlpa-source-scroll';

function useScrollPreservation() {
  useEffect(() => {
    // Restore scroll position saved before HMR or back-navigation.
    try {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
    } catch {}
    function onScroll() {
      try { sessionStorage.setItem(SCROLL_KEY, String(window.scrollY)); } catch {}
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

// ─── QLPA visual viewport — canonical attachment ──────────────────────────────
// Writes --qlpa-vvh and --qlpa-sheet-max-h to :root so the rest of the QLPA
// system has consistent viewport measurements, even on this source base page.

function useQLPAViewport() {
  useEffect(() => {
    return attachVisualViewportListeners();
  }, []);
}

// ─── Tab type ────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'modules' | 'checks' | 'docs' | 'adaptation' | 'archive';

// ─── Data ────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    id: 'qlpa-core',
    icon: Layers,
    title: 'QLPA Core',
    path: 'lib/qlpa/',
    fileCount: 38,
    description: 'Principles, terminology, guards, tokens, consent engine, trust graph, message lifecycle, device runtime, abuse taxonomy.',
    tag: 'foundation module',
    accent: 'hsl(192 78% 58%)',
    accentBg: 'hsl(192 78% 58% / 0.07)',
    accentBorder: 'hsl(192 78% 58% / 0.18)',
    keyFiles: [
      'qlpaPrinciples.ts',
      'qlpaGuards.ts',
      'consentEngine.ts',
      'trustGraph.ts',
      'messageLifecycle.ts',
      'abuseTaxonomy.ts',
      'intentionMirror.ts',
      'tokens.ts',
      'layoutTokens.ts',
      'QLPARuntimeContext.tsx',
    ],
    exports: [
      'QLPA_PRINCIPLES',
      'QLPAGuard',
      'ConsentEngine',
      'TrustGraph',
      'MessageLifecycle',
      'AbuseTaxonomy',
    ],
  },
  {
    id: 'shield-foundation',
    icon: Shield,
    title: 'Shield Foundation',
    path: 'lib/qlpa/netShield*',
    fileCount: 6,
    description: 'NetShield policy engine, event taxonomy, readiness checks, vocabulary, and shield policy enforcement.',
    tag: 'foundation module',
    accent: 'hsl(220 80% 65%)',
    accentBg: 'hsl(220 80% 65% / 0.07)',
    accentBorder: 'hsl(220 80% 65% / 0.18)',
    keyFiles: [
      'netShield.ts',
      'netShieldEvents.ts',
      'netShieldPolicies.ts',
      'netShieldReadiness.ts',
      'netShieldTypes.ts',
      'netShieldVocabulary.ts',
    ],
    exports: [
      'NetShieldPolicy',
      'NetShieldEvent',
      'NetShieldReadiness',
      'NetShieldVocabulary',
    ],
  },
  {
    id: 'language-harmony',
    icon: Globe,
    title: 'Language Harmony',
    path: 'lib/qlpa/language*',
    fileCount: 8,
    description: 'Language protocol, harmony policy (5 modes), script detection, suggestion engine, multilingual taxonomy, unicode normalization.',
    tag: 'foundation module',
    accent: 'hsl(160 65% 52%)',
    accentBg: 'hsl(160 65% 52% / 0.07)',
    accentBorder: 'hsl(160 65% 52% / 0.18)',
    keyFiles: [
      'languageProtocol.ts',
      'languageHarmonyPolicy.ts',
      'languageScriptDetection.ts',
      'languageSuggestionEngine.ts',
      'languageBlueprint.ts',
      'languageTaxonomy.ts',
      'multilingualTaxonomy.ts',
      'unicodeLanguageNormalize.ts',
    ],
    exports: [
      'HarmonyMode (off|soft|clear|strict|guardian)',
      'LanguageProtocol',
      'detectScript()',
      'suggestLanguage()',
    ],
  },
  {
    id: 'comm-capability-matrix',
    icon: Network,
    title: 'Communication Capability Matrix',
    path: 'lib/qlpa/communicationCapabilityMatrix.ts',
    fileCount: 2,
    description: 'Communication envelope definitions and capability matrix — transport primitives for EarthOS-aligned apps.',
    tag: 'foundation module',
    accent: 'hsl(38 88% 62%)',
    accentBg: 'hsl(38 88% 62% / 0.07)',
    accentBorder: 'hsl(38 88% 62% / 0.18)',
    keyFiles: [
      'communicationCapabilityMatrix.ts',
      'communicationEnvelope.ts',
    ],
    exports: [
      'CommunicationCapabilityMatrix',
      'CommunicationEnvelope',
      'TransportPrimitive',
    ],
  },
  {
    id: 'earthos-bridge',
    icon: GitBranch,
    title: 'EarthOS Bridge',
    path: 'lib/foundation/ + lib/qlpa/appOrchestrator.ts',
    fileCount: 11,
    description: 'Foundation layer — app constants, capabilities, layers, readiness gates, feature flags, mode system, scroll orchestrator.',
    tag: 'foundation module',
    accent: 'hsl(192 65% 62%)',
    accentBg: 'hsl(192 65% 62% / 0.07)',
    accentBorder: 'hsl(192 65% 62% / 0.18)',
    keyFiles: [
      'appConstants.ts',
      'appCapabilities.ts',
      'appLayers.ts',
      'appReadiness.ts',
      'featureFlags.ts',
      'modes.ts',
      'scrollOrchestrator.ts',
      'sourceIdentity.ts',
      'preferencesContext.tsx',
      'appOrchestrator.ts',
    ],
    exports: [
      'AppCapabilities',
      'AppReadiness',
      'FeatureFlags',
      'scrollOrchestrator',
      'AppMode',
      'ActiveView',
    ],
  },
  {
    id: 'earthcoin-governance',
    icon: Lock,
    title: 'EarthCoin / Governance Boundary',
    path: 'lib/qlpa/releaseContract.ts + shieldPolicy.ts',
    fileCount: 3,
    description: 'Release contract, reporting engine, and shield policy — governance boundary layer for EarthOS-aligned financial systems.',
    tag: 'foundation module',
    accent: 'hsl(30 80% 58%)',
    accentBg: 'hsl(30 80% 58% / 0.07)',
    accentBorder: 'hsl(30 80% 58% / 0.18)',
    keyFiles: [
      'releaseContract.ts',
      'reportingEngine.ts',
      'shieldPolicy.ts',
    ],
    exports: [
      'CURRENT_RELEASE_STAGE',
      'QLPACapability',
      'ReleaseStage',
      'ShieldPolicy',
    ],
  },
  {
    id: 'qlpa-check',
    icon: CheckSquare,
    title: 'qlpa:check Pipeline',
    path: 'scripts/check-*.mjs',
    fileCount: 26,
    description: '26-step automated integrity pipeline: i18n validation, shield checks, envelope verification, system invariants, release claims, diagnostics, and build.',
    tag: 'foundation module',
    accent: 'hsl(145 60% 50%)',
    accentBg: 'hsl(145 60% 50% / 0.07)',
    accentBorder: 'hsl(145 60% 50% / 0.18)',
    keyFiles: [
      'validate-i18n.mjs',
      'check-shield.mjs',
      'check-envelope.mjs',
      'check-system-invariants.mjs',
      'check-release-claims.mjs',
      'check-source-base-product-isolation.mjs',
    ],
    exports: [
      'npm run qlpa:check',
      'npm run validate:i18n',
      'npm run export:qlpa-matrix-source',
    ],
  },
];

const CHECKS = [
  { step: 1,  script: 'validate-i18n',                    category: 'i18n',         label: 'i18n locale completeness across 7 languages' },
  { step: 2,  script: 'check-shield',                     category: 'shield',       label: 'NetShield policy engine integrity' },
  { step: 3,  script: 'check-envelope',                   category: 'transport',    label: 'Communication envelope schema' },
  { step: 4,  script: 'check-earthos-bridge',             category: 'foundation',   label: 'EarthOS Bridge module structure' },
  { step: 5,  script: 'check-earthcoin-governance',       category: 'governance',   label: 'EarthCoin governance boundary' },
  { step: 6,  script: 'check-system-invariants',          category: 'integrity',    label: 'System-level invariants and contracts' },
  { step: 7,  script: 'check-release-claims',             category: 'integrity',    label: 'Release contract claim accuracy' },
  { step: 8,  script: 'check-docs-release',               category: 'docs',         label: 'Docs release readiness' },
  { step: 9,  script: 'check-test-diagnostics',           category: 'diagnostics',  label: 'Internal test diagnostics format' },
  { step: 10, script: 'check-mobile-sheet-layers',        category: 'mobile',       label: 'Mobile sheet layer architecture' },
  { step: 11, script: 'check-first-mission-actions',      category: 'ux',           label: 'First-mission action flow' },
  { step: 12, script: 'check-first-user-flow',            category: 'ux',           label: 'First-user onboarding flow' },
  { step: 13, script: 'check-mobile-scroll-orchestrator', category: 'mobile',       label: 'Mobile scroll orchestrator' },
  { step: 14, script: 'check-pass128',                    category: 'diagnostics',  label: 'Pass 128 acceptance criteria' },
  { step: 15, script: 'check-phone-test-doc',             category: 'docs',         label: 'Phone test documentation' },
  { step: 16, script: 'check-phone-qa-panel',             category: 'diagnostics',  label: 'Phone QA panel structure' },
  { step: 17, script: 'check-first-use-layout',           category: 'ux',           label: 'First-use layout constraints' },
  { step: 18, script: 'check-pass134',                    category: 'diagnostics',  label: 'Pass 134 phone verification' },
  { step: 19, script: 'check-communication-capability-matrix', category: 'transport', label: 'Communication capability matrix' },
  { step: 20, script: 'check-language-harmony',           category: 'language',     label: 'Language harmony policy (5 modes)' },
  { step: 21, script: 'check-local-test-message-flow',    category: 'diagnostics',  label: 'Local test message flow' },
  { step: 22, script: 'check-multilingual',               category: 'language',     label: 'Multilingual language adapters' },
  { step: 23, script: 'check-source-base-extraction-plan',category: 'isolation',    label: 'Source base extraction plan' },
  { step: 24, script: 'check-intention-mirror-composer',  category: 'ux',           label: 'Intention mirror composer' },
  { step: 25, script: 'check-source-base-visual-identity',category: 'isolation',    label: 'Source base visual identity isolation' },
  { step: 26, script: 'check-source-base-product-isolation', category: 'isolation', label: 'Product layer isolation from foundation' },
];

const CATEGORY_COLORS: Record<string, string> = {
  i18n:        'hsl(160 65% 52%)',
  shield:      'hsl(220 80% 65%)',
  transport:   'hsl(38 88% 62%)',
  foundation:  'hsl(192 65% 62%)',
  governance:  'hsl(30 80% 58%)',
  integrity:   'hsl(192 78% 58%)',
  docs:        'hsl(210 60% 60%)',
  diagnostics: 'hsl(280 55% 62%)',
  mobile:      'hsl(195 70% 55%)',
  ux:          'hsl(145 60% 50%)',
  language:    'hsl(160 65% 52%)',
  isolation:   'hsl(38 80% 58%)',
};

const DOCS = [
  { path: 'docs/QLPA_SOURCE_BASE_SCOPE.md',          title: 'Source Base Scope',              desc: 'Branch purpose, foundation layers, what is in scope' },
  { path: 'docs/SOURCE_BASE_STATUS.md',              title: 'Source Base Status',             desc: 'Isolation progress, pass status, pending work' },
  { path: 'docs/QLPA_ARCHITECTURE_MAP.md',           title: 'Architecture Map',               desc: 'Complete module dependency and layer map' },
  { path: 'docs/QLPA_SHIELD_FOUNDATION.md',          title: 'Shield Foundation',              desc: 'NetShield engine design, policy taxonomy' },
  { path: 'docs/QLPA_COMMUNICATION_ENVELOPE.md',     title: 'Communication Envelope',         desc: 'Envelope schema and transport primitive contracts' },
  { path: 'docs/QLPA_COMMUNICATION_CAPABILITY_MATRIX.md', title: 'Capability Matrix',        desc: 'Transport capability definitions and matrix spec' },
  { path: 'docs/QLPA_LANGUAGE_HARMONY_BLUEPRINT.md', title: 'Language Harmony Blueprint',     desc: 'The 5 harmony modes, policy design, cultural intent' },
  { path: 'docs/QLPA_MULTILINGUAL_LANGUAGE_ROOT.md', title: 'Multilingual Language Root',     desc: 'Root language taxonomy and adaptation guide' },
  { path: 'docs/QLPA_MODE_PROTOCOL.md',              title: 'Mode Protocol',                  desc: 'Human mode, interface depth, app mode protocol' },
  { path: 'docs/QLPA_SOURCE_BASE_EXTRACTION_PLAN.md',title: 'Extraction Plan',                desc: 'Step-by-step plan for isolating source base from product' },
  { path: 'docs/QLPA_SOURCE_BASE_ISOLATION_MANIFEST.md', title: 'Isolation Manifest',        desc: 'What is isolated, what is pending, what ships' },
  { path: 'docs/QLPA_SOURCE_BASE_PRODUCT_UI_AUDIT.md', title: 'Product UI Audit',            desc: 'Audit of product UI components present in source base' },
  { path: 'docs/QLPA_INTERNAL_TEST_DIAGNOSTICS.md',  title: 'Internal Test Diagnostics',      desc: 'Pass logs and test diagnostic records' },
  { path: 'docs/QLPA_TODO.md',                       title: 'QLPA TODO',                      desc: 'Active task list and next-pass planning' },
  { path: 'docs/architecture/foundation-map.md',     title: 'Foundation Map',                 desc: 'Architectural foundation diagram' },
  { path: 'docs/architecture/integration-map.md',    title: 'Integration Map',                desc: 'How product apps integrate the foundation' },
  { path: 'docs/architecture/phi-grid-system.md',    title: 'Phi Grid System',                desc: 'Golden-ratio design grid specifications' },
  { path: 'docs/architecture/stats-analyzer-architecture.md', title: 'Stats Analyzer',       desc: 'Stats system design and privacy architecture' },
  { path: 'docs/architecture/mode-behavior-map.md',  title: 'Mode Behavior Map',              desc: 'How modes affect behavior across the app' },
  { path: 'docs/design/QLPA-CANON.md',               title: 'QLPA Design Canon',              desc: 'Canonical design rules and aesthetic principles' },
  { path: 'docs/design/QLPA-COLOR-ENERGY-MAP.md',    title: 'Color Energy Map',               desc: 'Semantic color system and energy map' },
];

const DOC_GROUPS = [
  { label: 'Source Base',  color: 'hsl(192 78% 58%)', ids: [0,1,2,9,10,11] },
  { label: 'Protocols',    color: 'hsl(38 88% 62%)',  ids: [3,4,5,6,7,8] },
  { label: 'Architecture', color: 'hsl(220 80% 65%)', ids: [14,15,16,17,18] },
  { label: 'Design',       color: 'hsl(160 65% 52%)', ids: [19,20] },
  { label: 'Diagnostics',  color: 'hsl(280 55% 62%)', ids: [12,13] },
];

const ADAPTATION_STEPS = [
  {
    num: '01',
    title: 'Clone or fork the source base',
    detail: 'This is your starting point. The canonical source base exports to exports/qlpa-matrix-source/ for clean integration.',
    cmd: 'git clone <repo> && npm install',
    accent: 'hsl(192 78% 58%)',
  },
  {
    num: '02',
    title: 'Run qlpa:check to verify integrity',
    detail: 'All 26 checks must pass before you begin adapting. This guarantees you are working from a verified foundation.',
    cmd: 'npm run qlpa:check',
    accent: 'hsl(145 60% 50%)',
  },
  {
    num: '03',
    title: 'Set your product identity',
    detail: 'Update lib/qlpa/sourceBaseIdentity.ts with your product name, version, and adaptation target. This wires into the foundation\'s identity system.',
    cmd: '# edit lib/qlpa/sourceBaseIdentity.ts',
    accent: 'hsl(38 88% 62%)',
  },
  {
    num: '04',
    title: 'Choose your adaptation target',
    detail: 'Select from the 7 adaptation targets (EarthOS Messaging, World360, EarthOS.world, Earth Collective Exchange, Creator Tools, Care System, Codex Portals). Each has different active modules.',
    cmd: '# see docs/QLPA_SOURCE_BASE_SCOPE.md',
    accent: 'hsl(160 65% 52%)',
  },
  {
    num: '05',
    title: 'Wire the QLPA Runtime Context',
    detail: 'QLPARuntimeProvider and I18nProvider are the two root providers. Wrap your app root with both, in that order.',
    cmd: '# see components/ClientProviders.tsx',
    accent: 'hsl(220 80% 65%)',
  },
  {
    num: '06',
    title: 'Select harmony mode and locale',
    detail: 'Language harmony ships with 5 modes (off / soft / clear / strict / guardian) and 7 base locales. Add locales in lib/i18n/locales/. Keys are validated by check-i18n.',
    cmd: '# edit lib/i18n/locales/<lang>.json',
    accent: 'hsl(160 65% 52%)',
  },
  {
    num: '07',
    title: 'Configure shield policies',
    detail: 'NetShield ships with sensible defaults. Override policies in lib/qlpa/netShieldPolicies.ts for your specific moderation and trust requirements.',
    cmd: '# edit lib/qlpa/netShieldPolicies.ts',
    accent: 'hsl(220 80% 65%)',
  },
  {
    num: '08',
    title: 'Build your product layer on top',
    detail: 'Add product-specific routes in app/, product components in components/, and product-specific data layers. The foundation modules never depend on your product layer.',
    cmd: 'npm run build',
    accent: 'hsl(192 65% 62%)',
  },
];

const ARCHIVE_ITEMS = [
  {
    name: 'docs/archive/messaging-origin/',
    label: 'EarthOS Messaging Origin',
    desc: 'Pre-extraction documentation from the EarthOS Messaging product app. Preserved for historical continuity and audit purposes.',
    files: ['README.md', 'PRE_MVP_STATUS.md', 'QLPA_PHONE_TEST_PASS_129.md'],
    accent: 'hsl(210 60% 60%)',
  },
];

const ADAPTATION_TARGETS = [
  'EarthOS Messaging',
  'World360',
  'EarthOS.world',
  'Earth Collective Exchange',
  'Creator Tools',
  'Care System',
  'Codex Portals',
];

const FOUNDATION_LAYERS = [
  'QLPA principles and guards',
  'Shield foundation (NetShield)',
  'Language harmony (5 modes)',
  'Communication envelope + matrix',
  'Design tokens (phi / fibonacci)',
  'i18n framework (7 locales)',
  'Privacy and security layers',
  'Stats analyzer architecture',
  'qlpa:check pipeline (26 steps)',
];

// ─── Grid background ──────────────────────────────────────────────────────────

function GridBackground() {
  return (
    <div aria-hidden="true" style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: 'hsl(216 28% 5%)', pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(hsl(192 50% 50% / 0.035) 1px, transparent 1px),
          linear-gradient(90deg, hsl(192 50% 50% / 0.035) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(hsl(192 50% 50% / 0.07) 1px, transparent 1px),
          linear-gradient(90deg, hsl(192 50% 50% / 0.07) 1px, transparent 1px)
        `,
        backgroundSize: '240px 240px',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '50%',
        transform: 'translateX(-50%)', width: '120%', height: '60%',
        background: 'radial-gradient(ellipse at center bottom, hsl(192 80% 30% / 0.06) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '40%', height: '40%',
        background: 'radial-gradient(ellipse, hsl(38 88% 50% / 0.04) 0%, transparent 70%)',
      }} />
    </div>
  );
}

// ─── Identity bar ─────────────────────────────────────────────────────────────

function IdentityBar() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 44,
      background: 'hsl(216 28% 5% / 0.92)',
      borderBottom: '1px solid hsl(192 50% 50% / 0.10)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Cpu size={13} style={{ color: 'hsl(192 78% 58%)' }} />
        <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.08em', color: 'hsl(192 60% 62%)', fontWeight: 600 }}>
          QLPA MATRIX
        </span>
      </div>
      <span style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.08em', color: 'hsl(210 15% 38%)' }}>
        canonical-v1
      </span>
    </div>
  );
}

// ─── Top nav ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { label: string; tab: Tab; icon: React.ElementType }[] = [
  { label: 'Overview',        tab: 'overview',   icon: Activity },
  { label: 'QLPA Modules',    tab: 'modules',    icon: Layers },
  { label: 'Checks',          tab: 'checks',     icon: CheckSquare },
  { label: 'Docs',            tab: 'docs',       icon: FileText },
  { label: 'Adaptation Guide',tab: 'adaptation', icon: Zap },
  { label: 'Archive / Origin',tab: 'archive',    icon: Archive },
];

function TopNav({ active, onTab }: { active: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', padding: '0 24px', height: 44,
      borderBottom: '1px solid hsl(192 50% 50% / 0.08)',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
      scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
    }}>
      {NAV_ITEMS.map(({ label, tab }) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            onClick={() => onTab(tab)}
            style={{
              flexShrink: 0, padding: '0 14px', height: 44,
              background: 'transparent', border: 'none',
              borderBottom: isActive ? '2px solid hsl(38 88% 60%)' : '2px solid transparent',
              color: isActive ? 'hsl(38 85% 70%)' : 'hsl(210 15% 44%)',
              fontSize: 11, fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.04em', cursor: 'pointer',
              transition: 'color 160ms ease, border-color 160ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Section fade wrapper ──────────────────────────────────────────────────────

function FadeIn({ children, k }: { children: React.ReactNode; k: string }) {
  return (
    <div
      key={k}
      style={{
        animation: 'tabFadeIn 180ms ease-out both',
      }}
    >
      {children}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', color: 'hsl(192 50% 50% / 0.50)', marginBottom: 6 }}>
        {eyebrow}
      </p>
      <h3 style={{ fontSize: 22, fontWeight: 700, color: 'hsl(210 20% 90%)', letterSpacing: '-0.02em', marginBottom: sub ? 6 : 0 }}>
        {title}
      </h3>
      {sub && <p style={{ fontSize: 13, color: 'hsl(210 15% 50%)', lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

// ─── TAB: Overview ────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <FadeIn k="overview">
      {/* Hero */}
      <section style={{ marginBottom: 64 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '5px 12px',
          background: 'hsl(192 60% 50% / 0.10)',
          border: '1px solid hsl(192 60% 50% / 0.22)',
          borderRadius: 99, marginBottom: 22,
        }}>
          <Code2 size={11} style={{ color: 'hsl(192 78% 62%)' }} />
          <span style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.10em', color: 'hsl(192 70% 64%)', fontWeight: 600 }}>
            CANONICAL SOURCE BASE · v1
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 5.5vw, 52px)', fontWeight: 800,
          lineHeight: 1.10, letterSpacing: '-0.03em',
          color: 'hsl(210 20% 96%)', marginBottom: 6,
        }}>
          EarthOS QLPA Matrix
        </h1>
        <h2 style={{
          fontSize: 'clamp(16px, 2.8vw, 26px)', fontWeight: 400,
          lineHeight: 1.2, letterSpacing: '-0.01em',
          color: 'hsl(38 80% 60%)', marginBottom: 20,
        }}>
          Canonical Source Base v1
        </h2>

        <p style={{ fontSize: 15, color: 'hsl(210 15% 54%)', lineHeight: 1.70, maxWidth: 600, marginBottom: 28 }}>
          The reusable QLPA foundation for EarthOS-aligned applications — principles, shield, language harmony, consent, trust, and integrity pipeline, extracted and ready for adaptation.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            { icon: Activity,   label: 'canonical-v1',         color: 'hsl(192 78% 58%)' },
            { icon: BookOpen,   label: 'isolation-in-progress', color: 'hsl(38 80% 58%)' },
            { icon: Cpu,        label: '26-step qlpa:check',   color: 'hsl(145 60% 50%)' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: 'hsl(216 28% 9% / 0.80)',
              border: '1px solid hsl(210 20% 16%)',
              borderRadius: 6,
            }}>
              <Icon size={11} style={{ color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'hsl(210 15% 50%)', letterSpacing: '0.03em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Module grid */}
      <section style={{ marginBottom: 64 }}>
        <SectionHeader eyebrow="FOUNDATION MODULES" title="7 Core Modules" />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: 16,
        }}>
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.id} style={{
                background: `linear-gradient(145deg, ${mod.accentBg} 0%, hsl(216 28% 7% / 0.90) 100%)`,
                border: `1px solid ${mod.accentBorder}`,
                borderRadius: 12, padding: '20px',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: mod.accentBg, border: `1px solid ${mod.accentBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={16} style={{ color: mod.accent }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'hsl(210 20% 88%)', marginBottom: 2, lineHeight: 1.3 }}>
                      {mod.title}
                    </p>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.06em', color: mod.accent, opacity: 0.70 }}>
                      {mod.tag.toUpperCase()} · {mod.fileCount} FILES
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'hsl(192 40% 50% / 0.55)', background: 'hsl(216 28% 9% / 0.70)', padding: '4px 8px', borderRadius: 4, border: '1px solid hsl(192 40% 50% / 0.09)' }}>
                  {mod.path}
                </p>
                <p style={{ fontSize: 12, color: 'hsl(210 15% 58%)', lineHeight: 1.65 }}>
                  {mod.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom info grid */}
      <section>
        <div style={{
          padding: '32px 36px',
          background: 'hsl(216 28% 7% / 0.85)',
          border: '1px solid hsl(192 50% 50% / 0.10)',
          borderRadius: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 36,
        }}>
          <div>
            <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'hsl(192 70% 56%)', marginBottom: 14 }}>FOUNDATION LAYERS</p>
            {FOUNDATION_LAYERS.map((item) => (
              <p key={item} style={{ fontSize: 12, color: 'hsl(210 15% 54%)', lineHeight: 1.9, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: 'hsl(192 70% 56%)', flexShrink: 0, fontFamily: 'monospace' }}>›</span>
                {item}
              </p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'hsl(38 80% 58%)', marginBottom: 14 }}>BUILT FOR</p>
            {ADAPTATION_TARGETS.map((item) => (
              <p key={item} style={{ fontSize: 12, color: 'hsl(210 15% 54%)', lineHeight: 1.9, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: 'hsl(38 80% 58%)', flexShrink: 0, fontFamily: 'monospace' }}>→</span>
                {item}
              </p>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'hsl(145 60% 48%)', marginBottom: 14 }}>INTEGRITY PIPELINE</p>
            {[
              { cmd: 'npm run qlpa:check', desc: '26 automated checks — i18n, shield, envelope, invariants, release, diagnostics, identity, isolation, and build.' },
              { cmd: 'npm run export:qlpa-matrix-source', desc: 'Regenerate portable canonical export at exports/qlpa-matrix-source/' },
            ].map(({ cmd, desc }) => (
              <div key={cmd} style={{ background: 'hsl(216 28% 10% / 0.80)', border: '1px solid hsl(145 60% 48% / 0.14)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'hsl(145 60% 58%)', marginBottom: 4 }}>{cmd}</p>
                <p style={{ fontSize: 11, color: 'hsl(210 15% 42%)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

// ─── TAB: QLPA Modules ────────────────────────────────────────────────────────

function ModulesTab() {
  return (
    <FadeIn k="modules">
      <SectionHeader
        eyebrow="QLPA MODULES"
        title="Foundation Module Reference"
        sub="Each module is self-contained. Key files, exported symbols, and purpose for each."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div key={mod.id} style={{
              background: 'hsl(216 28% 7% / 0.85)',
              border: `1px solid ${mod.accentBorder}`,
              borderRadius: 14, padding: '24px 28px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: mod.accentBg, border: `1px solid ${mod.accentBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={18} style={{ color: mod.accent }} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(210 20% 92%)', marginBottom: 2 }}>{mod.title}</p>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', color: mod.accent, opacity: 0.7, letterSpacing: '0.06em' }}>
                    {mod.path} · {mod.fileCount} FILES
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'hsl(210 15% 58%)', lineHeight: 1.70, marginBottom: 20, maxWidth: 700 }}>
                {mod.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.10em', color: mod.accent, opacity: 0.60, marginBottom: 10 }}>KEY FILES</p>
                  {mod.keyFiles.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <ChevronRight size={10} style={{ color: mod.accent, opacity: 0.45, flexShrink: 0 }} />
                      <code style={{ fontSize: 11, color: 'hsl(210 15% 52%)', fontFamily: 'monospace' }}>{f}</code>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.10em', color: mod.accent, opacity: 0.60, marginBottom: 10 }}>EXPORTS / ENTRY POINTS</p>
                  {mod.exports.map((e) => (
                    <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: mod.accent, opacity: 0.50, fontFamily: 'monospace' }}>→</span>
                      <code style={{ fontSize: 11, color: 'hsl(210 20% 70%)', fontFamily: 'monospace' }}>{e}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}

// ─── TAB: Checks ─────────────────────────────────────────────────────────────

function ChecksTab() {
  return (
    <FadeIn k="checks">
      <SectionHeader
        eyebrow="QLPA:CHECK PIPELINE"
        title="26-Step Integrity Pipeline"
        sub="Every step in the automated check pipeline, what it verifies, and its category. Run: npm run qlpa:check"
      />

      <div style={{
        background: 'hsl(216 28% 7% / 0.85)',
        border: '1px solid hsl(192 50% 50% / 0.10)',
        borderRadius: 14, overflow: 'hidden', marginBottom: 24,
      }}>
        {/* Command banner */}
        <div style={{
          padding: '14px 24px',
          background: 'hsl(216 28% 9% / 0.90)',
          borderBottom: '1px solid hsl(192 50% 50% / 0.10)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Terminal size={13} style={{ color: 'hsl(145 60% 50%)' }} />
          <code style={{ fontSize: 12, fontFamily: 'monospace', color: 'hsl(145 60% 60%)', letterSpacing: '0.03em' }}>
            npm run qlpa:check
          </code>
          <span style={{ fontSize: 11, color: 'hsl(210 15% 40%)', marginLeft: 'auto' }}>26 checks + build</span>
        </div>

        {/* Check rows */}
        {CHECKS.map((check, i) => {
          const catColor = CATEGORY_COLORS[check.category] ?? 'hsl(210 15% 50%)';
          return (
            <div key={check.step} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '11px 24px',
              borderBottom: i < CHECKS.length - 1 ? '1px solid hsl(192 50% 50% / 0.06)' : 'none',
            }}>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'hsl(210 15% 30%)', width: 22, flexShrink: 0 }}>
                {String(check.step).padStart(2, '0')}
              </span>
              <span style={{
                fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.08em',
                color: catColor, opacity: 0.80,
                background: `${catColor}18`,
                border: `1px solid ${catColor}28`,
                borderRadius: 4, padding: '2px 6px',
                width: 82, flexShrink: 0, textAlign: 'center',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {check.category}
              </span>
              <span style={{ fontSize: 12, color: 'hsl(210 15% 58%)', flex: 1 }}>
                {check.label}
              </span>
              <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'hsl(210 15% 32%)', flexShrink: 0, display: 'none' }}>
                {check.script}
              </code>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: 'hsl(210 15% 36%)', fontFamily: 'monospace', letterSpacing: '0.02em', lineHeight: 1.7 }}>
        All checks must pass before publishing a release. The pipeline ends with npm run build as the final gate.
      </p>
    </FadeIn>
  );
}

// ─── TAB: Docs ────────────────────────────────────────────────────────────────

function DocsTab() {
  return (
    <FadeIn k="docs">
      <SectionHeader
        eyebrow="DOCUMENTATION"
        title="Document Index"
        sub="All docs/ files grouped by topic. Open in your editor to read the full content."
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {DOC_GROUPS.map((group) => (
          <div key={group.label}>
            <p style={{
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em',
              color: group.color, marginBottom: 12,
            }}>
              {group.label.toUpperCase()}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.ids.map((idx) => {
                const doc = DOCS[idx];
                if (!doc) return null;
                return (
                  <div key={doc.path} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '11px 16px',
                    background: 'hsl(216 28% 7% / 0.70)',
                    border: '1px solid hsl(192 50% 50% / 0.07)',
                    borderRadius: 8,
                  }}>
                    <FileText size={13} style={{ color: group.color, opacity: 0.55, flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'hsl(210 20% 78%)', marginBottom: 2 }}>
                        {doc.title}
                      </p>
                      <p style={{ fontSize: 11, color: 'hsl(210 15% 44%)', lineHeight: 1.5 }}>
                        {doc.desc}
                      </p>
                    </div>
                    <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'hsl(210 15% 30%)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {doc.path.replace('docs/', '')}
                    </code>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

// ─── TAB: Adaptation Guide ────────────────────────────────────────────────────

function AdaptationTab() {
  return (
    <FadeIn k="adaptation">
      <SectionHeader
        eyebrow="ADAPTATION GUIDE"
        title="Building on the Source Base"
        sub="Step-by-step guide for teams adapting the QLPA Matrix into a product application."
      />

      {/* Targets */}
      <div style={{
        padding: '18px 22px',
        background: 'hsl(38 88% 50% / 0.06)',
        border: '1px solid hsl(38 88% 50% / 0.16)',
        borderRadius: 10, marginBottom: 36,
      }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'hsl(38 80% 58%)', marginBottom: 12 }}>
          AVAILABLE ADAPTATION TARGETS
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ADAPTATION_TARGETS.map((t) => (
            <span key={t} style={{
              fontSize: 11, padding: '4px 10px',
              background: 'hsl(216 28% 9% / 0.80)',
              border: '1px solid hsl(38 88% 50% / 0.20)',
              borderRadius: 6, color: 'hsl(38 80% 65%)',
              fontFamily: 'monospace',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ADAPTATION_STEPS.map((step, i) => (
          <div key={step.num} style={{
            display: 'flex', gap: 20,
            padding: '22px 24px',
            background: 'hsl(216 28% 7% / 0.85)',
            border: '1px solid hsl(192 50% 50% / 0.09)',
            borderRadius: 12,
          }}>
            {/* Step number */}
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              <span style={{
                display: 'block', width: 34, height: 34,
                borderRadius: 8,
                background: `${step.accent}14`,
                border: `1px solid ${step.accent}28`,
                textAlign: 'center', lineHeight: '34px',
                fontSize: 12, fontFamily: 'monospace',
                fontWeight: 700, color: step.accent,
              }}>
                {step.num}
              </span>
            </div>
            {/* Content */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(210 20% 88%)', marginBottom: 6 }}>
                {step.title}
              </p>
              <p style={{ fontSize: 12, color: 'hsl(210 15% 52%)', lineHeight: 1.65, marginBottom: 12 }}>
                {step.detail}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 12px',
                background: 'hsl(216 28% 10% / 0.90)',
                border: '1px solid hsl(192 50% 50% / 0.10)',
                borderRadius: 6,
              }}>
                <Terminal size={11} style={{ color: step.accent, opacity: 0.7, flexShrink: 0 }} />
                <code style={{ fontSize: 11, fontFamily: 'monospace', color: 'hsl(210 15% 52%)', letterSpacing: '0.02em' }}>
                  {step.cmd}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 32, padding: '18px 22px',
        background: 'hsl(216 28% 7% / 0.70)',
        border: '1px solid hsl(192 50% 50% / 0.10)',
        borderRadius: 10,
      }}>
        <p style={{ fontSize: 11, fontFamily: 'monospace', color: 'hsl(210 15% 40%)', lineHeight: 1.8 }}>
          See docs/QLPA_SOURCE_BASE_SCOPE.md and docs/architecture/integration-map.md for full architecture guidance.
        </p>
      </div>
    </FadeIn>
  );
}

// ─── TAB: Archive / Origin ────────────────────────────────────────────────────

function ArchiveTab() {
  return (
    <FadeIn k="archive">
      <SectionHeader
        eyebrow="ARCHIVE / ORIGIN"
        title="Messaging Origin Archive"
        sub="Pre-extraction documentation preserved for historical continuity. This is where the QLPA foundation was born."
      />

      <div style={{
        padding: '18px 22px', marginBottom: 28,
        background: 'hsl(210 60% 50% / 0.06)',
        border: '1px solid hsl(210 60% 50% / 0.14)',
        borderRadius: 10,
      }}>
        <p style={{ fontSize: 12, color: 'hsl(210 15% 50%)', lineHeight: 1.75 }}>
          The QLPA Matrix Source Base was extracted from the EarthOS Messaging product app.
          These archived docs record the state of the system before extraction. They exist for audit
          and continuity — they are not active source base documentation.
        </p>
      </div>

      {ARCHIVE_ITEMS.map((item) => (
        <div key={item.name} style={{
          background: 'hsl(216 28% 7% / 0.85)',
          border: `1px solid ${item.accent}28`,
          borderRadius: 14, padding: '24px 28px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <Archive size={16} style={{ color: item.accent, opacity: 0.75 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(210 20% 82%)', marginBottom: 2 }}>
                {item.label}
              </p>
              <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'hsl(210 15% 36%)', letterSpacing: '0.03em' }}>
                {item.name}
              </code>
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'hsl(210 15% 52%)', lineHeight: 1.65, marginBottom: 18 }}>
            {item.desc}
          </p>

          <div>
            <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.10em', color: item.accent, opacity: 0.55, marginBottom: 10 }}>
              ARCHIVED FILES
            </p>
            {item.files.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <FileText size={11} style={{ color: item.accent, opacity: 0.40, flexShrink: 0 }} />
                <code style={{ fontSize: 11, color: 'hsl(210 15% 44%)', fontFamily: 'monospace' }}>
                  {item.name}{f}
                </code>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Isolation status */}
      <div style={{
        padding: '24px 28px',
        background: 'hsl(216 28% 7% / 0.85)',
        border: '1px solid hsl(192 50% 50% / 0.10)',
        borderRadius: 14,
      }}>
        <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'hsl(38 80% 58%)', marginBottom: 14 }}>
          ISOLATION STATUS
        </p>
        {[
          { label: 'Source base extraction plan',       status: 'complete',    color: 'hsl(145 60% 50%)' },
          { label: 'Product UI audit',                  status: 'complete',    color: 'hsl(145 60% 50%)' },
          { label: 'Archive docs relocated',            status: 'complete',    color: 'hsl(145 60% 50%)' },
          { label: 'Isolation manifest created',        status: 'complete',    color: 'hsl(145 60% 50%)' },
          { label: '/messaging route replaced with placeholder', status: 'complete', color: 'hsl(145 60% 50%)' },
          { label: 'Product messaging components removal', status: 'in progress', color: 'hsl(38 88% 62%)' },
          { label: 'Clean source base export',          status: 'in progress', color: 'hsl(38 88% 62%)' },
        ].map(({ label, status, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{
              fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.06em',
              color, background: `${color}18`, border: `1px solid ${color}28`,
              borderRadius: 4, padding: '2px 7px', flexShrink: 0,
            }}>
              {status}
            </span>
            <span style={{ fontSize: 12, color: 'hsl(210 15% 52%)' }}>{label}</span>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SourceBasePage() {
  useScrollPreservation();
  useQLPAViewport();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // After React renders the new tab content, scroll to top and clear the
  // preserved position so the next visit to this tab starts fresh.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    try { sessionStorage.removeItem(SCROLL_KEY); } catch {}
  }, [activeTab]);

  function handleTab(tab: Tab) {
    setActiveTab(tab);
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        nav::-webkit-scrollbar { display: none; }
        @keyframes tabFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <GridBackground />

      {/* No position:relative / z-index here — GridBackground is position:fixed
          and sits below naturally. A stacking context here is not needed and
          was interfering with the QLPA page-layer scroll contract. */}
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
        <IdentityBar />
        <TopNav active={activeTab} onTab={handleTab} />

        <main style={{ flex: 1, padding: '48px 24px 96px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {activeTab === 'overview'   && <OverviewTab />}
          {activeTab === 'modules'    && <ModulesTab />}
          {activeTab === 'checks'     && <ChecksTab />}
          {activeTab === 'docs'       && <DocsTab />}
          {activeTab === 'adaptation' && <AdaptationTab />}
          {activeTab === 'archive'    && <ArchiveTab />}
        </main>

        <footer style={{
          borderTop: '1px solid hsl(192 50% 50% / 0.07)',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.09em', color: 'hsl(210 15% 28%)' }}>
            EarthOS QLPA Matrix Source Code Base · canonical-v1
          </p>
        </footer>
      </div>
    </>
  );
}
