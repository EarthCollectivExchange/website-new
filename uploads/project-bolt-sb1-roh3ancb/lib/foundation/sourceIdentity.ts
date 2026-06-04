export const QLPA_MATRIX_SOURCE = {
  name: 'qlpa-matrix-source',
  version: '1.0.0',
  maturity: 'active' as const,
  corePrinciple:
    'Calm protection, clear consent, local sovereignty, truthful language, and privacy by structure.',

  activeDefinition:
    'The foundation is live, tested, and used in EarthOS Messaging. All 13 pillars are present.',

  scaffoldDefinition:
    'The architecture is defined and stubbed. Implementation follows in future waves.',

  futureDefinition:
    'Capability requires relay, multi-device, guardian network, or protocol infrastructure not yet built.',

  alignmentTags: [
    'consent-first',
    'local-first',
    'privacy-by-structure',
    'truthful-language',
    'phi-aligned',
    'multilingual',
    'portable',
    'non-extractive',
    'life-supporting',
    'transparent-maturity',
  ],

  createdFor: [
    'EarthOS',
    'Earth Collective Exchange',
    'World360',
    'Codex',
    'EarthOS Care',
    'EarthOS Creator',
    'EarthOS Organizer',
    'EarthOS Community',
    'QLPA-aligned systems',
  ],

  portableUse:
    'Copy lib/foundation, lib/qlpa, lib/design, lib/i18n, lib/privacy, lib/security, lib/stats, and components/foundation into any new project. Follow PROJECT-ADAPTATION.md to customize for your app.',
} as const;

export type QlpaMatrixSourceIdentity = typeof QLPA_MATRIX_SOURCE;
