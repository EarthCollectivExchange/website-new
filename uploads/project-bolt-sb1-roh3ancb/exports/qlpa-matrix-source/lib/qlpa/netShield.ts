/**
 * QLPA Net Shield — Public API
 * Re-exports the full Net Shield foundation: types, vocabulary, policies, events, readiness.
 * Also exports the shield layer registry (original scaffold).
 *
 * STATUS: FOUNDATION — architecture ready; no runtime enforcement yet.
 */

export * from './netShieldTypes';
export * from './netShieldVocabulary';
export * from './netShieldPolicies';
export * from './netShieldEvents';
export * from './netShieldReadiness';

// ─── Shield Layer Registry (original scaffold) ────────────────────────────────

export type ShieldMaturity = 'active' | 'scaffold' | 'future';

export interface NetShieldLayer {
  id: string;
  labelKey: string;
  descriptionKey: string;
  active: boolean;
  maturity: ShieldMaturity;
  simpleExplanationKey: string;
  developerNotes: string;
}

export const NET_SHIELD_LAYERS: NetShieldLayer[] = [
  {
    id: 'LanguageShield',
    labelKey: 'netShield.languageShield',
    descriptionKey: 'netShield.languageShieldDesc',
    active: true,
    maturity: 'active',
    simpleExplanationKey: 'netShield.languageShieldSimple',
    developerNotes: 'QLPA language protocol — scans user-facing strings for discouraged terms.',
  },
  {
    id: 'ConsentShield',
    labelKey: 'netShield.consentShield',
    descriptionKey: 'netShield.consentShieldDesc',
    active: true,
    maturity: 'active',
    simpleExplanationKey: 'netShield.consentShieldSimple',
    developerNotes: 'Consent matrix validation gate — runs before every message send.',
  },
  {
    id: 'EncryptionShield',
    labelKey: 'netShield.encryptionShield',
    descriptionKey: 'netShield.encryptionShieldDesc',
    active: true,
    maturity: 'active',
    simpleExplanationKey: 'netShield.encryptionShieldSimple',
    developerNotes: 'AES-GCM-256 local encryption — prototype key, no external exchange yet.',
  },
  {
    id: 'TrustShield',
    labelKey: 'netShield.trustShield',
    descriptionKey: 'netShield.trustShieldDesc',
    active: true,
    maturity: 'active',
    simpleExplanationKey: 'netShield.trustShieldSimple',
    developerNotes: 'Trust gradient gate — validates sender/recipient trust before delivery.',
  },
  {
    id: 'SourceShield',
    labelKey: 'netShield.sourceShield',
    descriptionKey: 'netShield.sourceShieldDesc',
    active: false,
    maturity: 'scaffold',
    simpleExplanationKey: 'netShield.sourceShieldSimple',
    developerNotes: 'Source clearing layer — bilateral clear requests. Requires relay enforcement. Scaffold only.',
  },
  {
    id: 'GuardianShieldFuture',
    labelKey: 'netShield.guardianShield',
    descriptionKey: 'netShield.guardianShieldDesc',
    active: false,
    maturity: 'future',
    simpleExplanationKey: 'netShield.guardianShieldSimple',
    developerNotes: 'Guardian protection layer — Shield Phrase, trusted contacts, access sealing. Future only. Do not surface to users.',
  },
  {
    id: 'ModeShield',
    labelKey: 'netShield.modeShield',
    descriptionKey: 'netShield.modeShieldDesc',
    active: true,
    maturity: 'active',
    simpleExplanationKey: 'netShield.modeShieldSimple',
    developerNotes: 'Human mode context — enforces mode-appropriate feature visibility and defaults.',
  },
  {
    id: 'StatsPrivacyShield',
    labelKey: 'netShield.statsPrivacyShield',
    descriptionKey: 'netShield.statsPrivacyShieldDesc',
    active: true,
    maturity: 'active',
    simpleExplanationKey: 'netShield.statsPrivacyShieldSimple',
    developerNotes: 'Stats privacy guard — ensures no plaintext content, filename, contact names, or private keys enter stats.',
  },
  {
    id: 'RecoveryShieldFuture',
    labelKey: 'netShield.recoveryShield',
    descriptionKey: 'netShield.recoveryShieldDesc',
    active: false,
    maturity: 'future',
    simpleExplanationKey: 'netShield.recoveryShieldSimple',
    developerNotes: 'Recovery layer — multi-device recovery, Guardian contact recovery. Future only.',
  },
];

const SHIELD_MAP = new Map(NET_SHIELD_LAYERS.map((l) => [l.id, l]));

export function getShieldLayer(id: string): NetShieldLayer | undefined {
  return SHIELD_MAP.get(id);
}

export function getActiveShields(): NetShieldLayer[] {
  return NET_SHIELD_LAYERS.filter((l) => l.active);
}

export function getShieldsByMaturity(maturity: ShieldMaturity): NetShieldLayer[] {
  return NET_SHIELD_LAYERS.filter((l) => l.maturity === maturity);
}
