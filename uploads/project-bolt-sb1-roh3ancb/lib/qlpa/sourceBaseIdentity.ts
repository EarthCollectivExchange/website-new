export const SOURCE_BASE_IDENTITY = {
  sourceBaseName: 'EarthOS QLPA Matrix Source Code Base',
  sourceBaseVersion: 'canonical-v1',
  sourceBaseStatus: 'visual-realignment',
  origin: 'duplicated from EarthOS Messaging QLPA Matrix build',
  purpose: 'reusable QLPA foundation for EarthOS-aligned applications',
  intendedUse: 'reusable foundation for EarthOS-aligned apps',
  legalBoundary: [
    'not a production crypto/wallet system',
    'not medical authority',
    'not legal authority',
    'not financial authority',
  ],
  scopeBoundary: [
    'foundation layer — not a deployed product',
    'governance contracts — not live token engine',
    'stats architecture — not a public statistics service',
    'communication primitives — not a live message relay',
  ],
  adaptationTargets: [
    'EarthOS Messaging',
    'World360',
    'EarthOS.world',
    'Earth Collective Exchange',
    'Creator tools',
    'Care system',
    'Codex portals',
  ],
  extractionPlanDoc: 'docs/QLPA_SOURCE_BASE_EXTRACTION_PLAN.md',
  canonicalExportPath: 'exports/qlpa-matrix-source/',
} as const;

export type SourceBaseIdentity = typeof SOURCE_BASE_IDENTITY;
