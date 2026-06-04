/**
 * Clear Scopes
 * Defines what "clear" operations are available and what they honestly claim.
 * QLPA principle: never overclaim remote deletion capabilities.
 */

export type ClearScopeId =
  | 'clear_from_this_device'
  | 'request_clear_everywhere'
  | 'clear_confirmed_devices_future'
  | 'source_clear_future';

export interface ClearScope {
  id: ClearScopeId;
  labelKey: string;
  descriptionKey: string;
  certaintyClaim: string;
  requiresRelay: boolean;
  maturity: 'active' | 'scaffold' | 'future';
  honestCaveatKey: string;
}

export const CLEAR_SCOPES: ClearScope[] = [
  {
    id: 'clear_from_this_device',
    labelKey: 'messages.deleteFromDevice',
    descriptionKey: 'privacy.localOnly',
    certaintyClaim: 'Cleared from this device',
    requiresRelay: false,
    maturity: 'active',
    honestCaveatKey: 'retention.scopeLocalDesc',
  },
  {
    id: 'request_clear_everywhere',
    labelKey: 'messages.requestRecipientDelete',
    descriptionKey: 'messages.localOnlyNoRemote',
    certaintyClaim: 'Clear request sent — not enforceable in v0.1',
    requiresRelay: false,
    maturity: 'active',
    honestCaveatKey: 'retention.scopeRequestCaveat',
  },
  {
    id: 'clear_confirmed_devices_future',
    labelKey: 'retention.scopeBoth',
    descriptionKey: 'retention.scopeBothDesc',
    certaintyClaim: 'Clear request sent to relay — confirmed on enrolled devices',
    requiresRelay: true,
    maturity: 'scaffold',
    honestCaveatKey: 'retention.scopeBothCaveat',
  },
  {
    id: 'source_clear_future',
    labelKey: 'retention.scopeBoth',
    descriptionKey: 'retention.scopeBothDesc',
    certaintyClaim: 'Source clear initiated — requires relay enforcement',
    requiresRelay: true,
    maturity: 'future',
    honestCaveatKey: 'retention.scopeBothCaveat',
  },
];

const SCOPE_MAP = new Map(CLEAR_SCOPES.map((s) => [s.id, s]));

export function getClearScope(id: ClearScopeId): ClearScope | undefined {
  return SCOPE_MAP.get(id);
}

export function getAvailableClearScopes(): ClearScope[] {
  return CLEAR_SCOPES.filter((s) => s.maturity === 'active');
}
