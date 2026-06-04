// ─── QLPA Release Contract ────────────────────────────────────────────────────
//
// Single source of truth for the current EarthOS release stage and capability
// status. All in-app markers, check scripts, and documentation derive from here.
//
// No network calls. No network calls. No external analytics. No database writes.
// This module is pure: it only exports constants and pure functions.

export type ReleaseStage =
  | 'prototype'
  | 'pre-mvp'
  | 'controlled-test'
  | 'public-beta'
  | 'production';

export type CapabilityStatus =
  | 'active'
  | 'local-only'
  | 'prototype-only'
  | 'planned'
  | 'inactive'
  | 'foundation-only'
  | 'controlled-testing'
  | 'not-active-yet';

export interface QLPACapability {
  key: string;
  labelKey: string;
  status: CapabilityStatus;
}

// ─── Current stage ────────────────────────────────────────────────────────────

export const CURRENT_RELEASE_STAGE: ReleaseStage = 'pre-mvp';

export function getCurrentStageLabelKey(): string {
  const map: Record<ReleaseStage, string> = {
    'prototype':        'release.stagePrototype',
    'pre-mvp':          'release.stagePreMvp',
    'controlled-test':  'release.stageControlledTest',
    'public-beta':      'release.stagePublicBeta',
    'production':       'release.stageProduction',
  };
  return map[CURRENT_RELEASE_STAGE];
}

// ─── Capability matrix ────────────────────────────────────────────────────────

export const QLPA_CAPABILITIES: QLPACapability[] = [
  {
    key:      'localMessaging',
    labelKey: 'release.capabilityLocalMessaging',
    status:   'active',
  },
  {
    key:      'relayTransport',
    labelKey: 'release.capabilityRelayNotActive',
    status:   'not-active-yet',
  },
  {
    key:      'productionE2EE',
    labelKey: 'release.capabilityProductionE2EENotActive',
    status:   'not-active-yet',
  },
  {
    key:      'tokenRewards',
    labelKey: 'release.capabilityTokenRewardsInactive',
    status:   'inactive',
  },
  {
    key:      'cloudBackup',
    labelKey: 'release.noCloudBackup',
    status:   'not-active-yet',
  },
  {
    key:      'productionRelay',
    labelKey: 'release.noProductionRelay',
    status:   'not-active-yet',
  },
  {
    key:      'consentEngine',
    labelKey: 'release.foundationOnly',
    status:   'foundation-only',
  },
  {
    key:      'identity',
    labelKey: 'release.localOnly',
    status:   'local-only',
  },
  {
    key:      'dataPortability',
    labelKey: 'release.prototypeOnly',
    status:   'prototype-only',
  },
  {
    key:      'netShield',
    labelKey: 'release.foundationOnly',
    status:   'foundation-only',
  },
  {
    key:      'trustGraph',
    labelKey: 'release.foundationOnly',
    status:   'foundation-only',
  },
  {
    key:      'voiceMemos',
    labelKey: 'release.prototypeOnly',
    status:   'prototype-only',
  },
  {
    key:      'fileTransfer',
    labelKey: 'release.prototypeOnly',
    status:   'prototype-only',
  },
  {
    key:      'syncMetadata',
    labelKey: 'release.notActiveYet',
    status:   'not-active-yet',
  },
  {
    key:      'governanceCircles',
    labelKey: 'release.planned',
    status:   'planned',
  },
  {
    key:      'earthCoin',
    labelKey: 'release.inactive',
    status:   'inactive',
  },
  {
    key:      'publicRegistry',
    labelKey: 'release.planned',
    status:   'planned',
  },
  {
    key:      'multiDevice',
    labelKey: 'release.planned',
    status:   'planned',
  },
];

export function getActiveCapabilities(): QLPACapability[] {
  return QLPA_CAPABILITIES.filter(c => c.status === 'active');
}

export function getInactiveCapabilities(): QLPACapability[] {
  return QLPA_CAPABILITIES.filter(c => c.status !== 'active');
}

export function isCapabilityActive(key: string): boolean {
  const cap = QLPA_CAPABILITIES.find(c => c.key === key);
  return cap?.status === 'active' ?? false;
}
