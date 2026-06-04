/**
 * EarthOS Feature Flags
 * Simple compile-time + runtime feature gates.
 * All flags default to their safe/conservative values.
 * Never use flags to hide harmful behavior — only to stage gradual rollout.
 */

export interface FeatureFlag {
  id: string;
  enabled: boolean;
  description: string;
  maturity: 'stable' | 'beta' | 'scaffold' | 'future';
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  lightStats: {
    id: 'lightStats',
    enabled: true,
    description: 'Local aggregate stats — no content, no backend.',
    maturity: 'beta',
  },
  completeStats: {
    id: 'completeStats',
    enabled: false,
    description: 'Full local stats with IndexedDB. Scaffold only.',
    maturity: 'scaffold',
  },
  qlpaNetShield: {
    id: 'qlpaNetShield',
    enabled: false,
    description: 'QLPA Net Shield multi-layer validation UI. Scaffold only.',
    maturity: 'scaffold',
  },
  relayTransport: {
    id: 'relayTransport',
    enabled: false,
    description: 'Real backend relay. Requires production auth and E2EE key exchange.',
    maturity: 'future',
  },
  multiDevice: {
    id: 'multiDevice',
    enabled: false,
    description: 'Multi-device sync via Supabase metadata.',
    maturity: 'scaffold',
  },
  guardianShield: {
    id: 'guardianShield',
    enabled: false,
    description: 'Guardian Shield behavior. Scaffold only — do not surface to users yet.',
    maturity: 'scaffold',
  },
  shieldPhrase: {
    id: 'shieldPhrase',
    enabled: false,
    description: 'Shield Phrase (panic phrase) trigger. Future only.',
    maturity: 'future',
  },
  sourceClearing: {
    id: 'sourceClearing',
    enabled: false,
    description: 'Source Clear (bilateral clear). Requires relay enforcement.',
    maturity: 'future',
  },
} as const;

export function isFeatureEnabled(id: string): boolean {
  return FEATURE_FLAGS[id]?.enabled ?? false;
}

export function getFeatureFlag(id: string): FeatureFlag | undefined {
  return FEATURE_FLAGS[id];
}
