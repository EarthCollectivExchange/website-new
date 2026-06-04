/**
 * Local-Only Rules
 * Defines what "local-first" means in practice for each data type.
 */

export interface LocalOnlyRule {
  dataType: string;
  isLocalOnly: boolean;
  canBeRelayed: boolean;
  canBeExported: boolean;
  requiresUserAction: boolean;
  description: string;
}

export const LOCAL_ONLY_RULES: LocalOnlyRule[] = [
  {
    dataType: 'messageContent',
    isLocalOnly: true,
    canBeRelayed: false,
    canBeExported: true,
    requiresUserAction: true,
    description: 'Message plaintext stays on this device. Can be exported by user action only.',
  },
  {
    dataType: 'fileContent',
    isLocalOnly: true,
    canBeRelayed: true,
    canBeExported: true,
    requiresUserAction: true,
    description: 'Files stay local by default. Can be sealed for relay when user chooses relay storage mode.',
  },
  {
    dataType: 'voiceContent',
    isLocalOnly: true,
    canBeRelayed: true,
    canBeExported: true,
    requiresUserAction: true,
    description: 'Voice memos stay local by default. Can be sealed for relay.',
  },
  {
    dataType: 'preferences',
    isLocalOnly: true,
    canBeRelayed: false,
    canBeExported: true,
    requiresUserAction: false,
    description: 'Preferences stored in localStorage only. Never synced.',
  },
  {
    dataType: 'ledgerEvents',
    isLocalOnly: true,
    canBeRelayed: false,
    canBeExported: true,
    requiresUserAction: true,
    description: 'Ledger events stay local. Included in user export.',
  },
  {
    dataType: 'statsAggregates',
    isLocalOnly: true,
    canBeRelayed: false,
    canBeExported: true,
    requiresUserAction: true,
    description: 'Aggregate stats stay local. Can be exported — no personal data included.',
  },
];

export function isDataTypeLocalOnly(dataType: string): boolean {
  return LOCAL_ONLY_RULES.find((r) => r.dataType === dataType)?.isLocalOnly ?? true;
}
