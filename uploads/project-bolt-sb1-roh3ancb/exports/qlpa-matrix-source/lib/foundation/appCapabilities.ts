/**
 * EarthOS Application Capabilities
 * Declares what the app can currently do vs. what is scaffolded for the future.
 * Use this as the canonical source for feature availability checks.
 */

import type { InterfaceVisibility } from './appLayers';

export interface AppCapability {
  id: string;
  labelKey: string;
  active: boolean;
  visibleIn: InterfaceVisibility;
  userFacing: boolean;
  requiresBackend: boolean;
  privacyNoteKey: string;
}

const CAPABILITIES: AppCapability[] = [
  {
    id: 'localMessaging',
    labelKey: 'capability.localMessaging',
    active: true,
    visibleIn: 'simple',
    userFacing: true,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.localOnly',
  },
  {
    id: 'localFiles',
    labelKey: 'capability.localFiles',
    active: true,
    visibleIn: 'simple',
    userFacing: true,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.localOnly',
  },
  {
    id: 'localVoice',
    labelKey: 'capability.localVoice',
    active: true,
    visibleIn: 'simple',
    userFacing: true,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.localOnly',
  },
  {
    id: 'autoClear',
    labelKey: 'capability.autoClear',
    active: true,
    visibleIn: 'simple',
    userFacing: true,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.localClearOnly',
  },
  {
    id: 'i18n',
    labelKey: 'capability.i18n',
    active: true,
    visibleIn: 'simple',
    userFacing: true,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.noData',
  },
  {
    id: 'humanModes',
    labelKey: 'capability.humanModes',
    active: true,
    visibleIn: 'simple',
    userFacing: true,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.localOnly',
  },
  {
    id: 'interfaceDepth',
    labelKey: 'capability.interfaceDepth',
    active: true,
    visibleIn: 'simple',
    userFacing: true,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.noData',
  },
  {
    id: 'qlpaLanguage',
    labelKey: 'capability.qlpaLanguage',
    active: true,
    visibleIn: 'developer',
    userFacing: false,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.noData',
  },
  {
    id: 'qlpaNetShieldScaffold',
    labelKey: 'capability.qlpaNetShieldScaffold',
    active: false,
    visibleIn: 'developer',
    userFacing: false,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.scaffold',
  },
  {
    id: 'lightStats',
    labelKey: 'capability.lightStats',
    active: true,
    visibleIn: 'developer',
    userFacing: false,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.aggregateOnly',
  },
  {
    id: 'completeStatsScaffold',
    labelKey: 'capability.completeStatsScaffold',
    active: false,
    visibleIn: 'developer',
    userFacing: false,
    requiresBackend: false,
    privacyNoteKey: 'capability.privacy.scaffold',
  },
  {
    id: 'relayFuture',
    labelKey: 'capability.relayFuture',
    active: false,
    visibleIn: 'developer',
    userFacing: false,
    requiresBackend: true,
    privacyNoteKey: 'capability.privacy.relayFuture',
  },
];

const CAPABILITY_MAP = new Map(CAPABILITIES.map((c) => [c.id, c]));

export function getCapability(id: string): AppCapability | undefined {
  return CAPABILITY_MAP.get(id);
}

export function isCapabilityActive(id: string): boolean {
  return CAPABILITY_MAP.get(id)?.active ?? false;
}

export function getActiveCapabilities(): AppCapability[] {
  return CAPABILITIES.filter((c) => c.active);
}

export function getUserFacingCapabilities(): AppCapability[] {
  return CAPABILITIES.filter((c) => c.active && c.userFacing);
}

export { CAPABILITIES };
