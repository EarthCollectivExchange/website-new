/**
 * QLPA Application Layers
 * Defines the architectural layers that compose a QLPA-aligned host application.
 * Each layer has a maturity level and visibility scope.
 */

export type LayerMaturity = 'active' | 'scaffold' | 'future';
export type InterfaceVisibility = 'simple' | 'advanced' | 'developer';

export interface AppLayer {
  id: string;
  labelKey: string;
  descriptionKey: string;
  maturity: LayerMaturity;
  visibleIn: InterfaceVisibility;
}

export const APP_LAYERS: AppLayer[] = [
  {
    id: 'foundation',
    labelKey: 'layers.foundation',
    descriptionKey: 'layers.foundationDesc',
    maturity: 'active',
    visibleIn: 'developer',
  },
  {
    id: 'language',
    labelKey: 'layers.language',
    descriptionKey: 'layers.languageDesc',
    maturity: 'active',
    visibleIn: 'simple',
  },
  {
    id: 'preferences',
    labelKey: 'layers.preferences',
    descriptionKey: 'layers.preferencesDesc',
    maturity: 'active',
    visibleIn: 'simple',
  },
  {
    id: 'privacy',
    labelKey: 'layers.privacy',
    descriptionKey: 'layers.privacyDesc',
    maturity: 'active',
    visibleIn: 'advanced',
  },
  {
    id: 'security',
    labelKey: 'layers.security',
    descriptionKey: 'layers.securityDesc',
    maturity: 'active',
    visibleIn: 'advanced',
  },
  {
    id: 'messaging',
    labelKey: 'layers.messaging',
    descriptionKey: 'layers.messagingDesc',
    maturity: 'active',
    visibleIn: 'simple',
  },
  {
    id: 'files',
    labelKey: 'layers.files',
    descriptionKey: 'layers.filesDesc',
    maturity: 'active',
    visibleIn: 'simple',
  },
  {
    id: 'voice',
    labelKey: 'layers.voice',
    descriptionKey: 'layers.voiceDesc',
    maturity: 'active',
    visibleIn: 'simple',
  },
  {
    id: 'stats',
    labelKey: 'layers.stats',
    descriptionKey: 'layers.statsDesc',
    maturity: 'scaffold',
    visibleIn: 'developer',
  },
  {
    id: 'relayFuture',
    labelKey: 'layers.relayFuture',
    descriptionKey: 'layers.relayFutureDesc',
    maturity: 'future',
    visibleIn: 'developer',
  },
  {
    id: 'developer',
    labelKey: 'layers.developer',
    descriptionKey: 'layers.developerDesc',
    maturity: 'active',
    visibleIn: 'developer',
  },
];

export function getLayerById(id: string): AppLayer | undefined {
  return APP_LAYERS.find((l) => l.id === id);
}

export function getActiveLayers(): AppLayer[] {
  return APP_LAYERS.filter((l) => l.maturity === 'active');
}

export function getLayersForDepth(depth: InterfaceVisibility): AppLayer[] {
  const order: InterfaceVisibility[] = ['simple', 'advanced', 'developer'];
  const depthIndex = order.indexOf(depth);
  return APP_LAYERS.filter((l) => order.indexOf(l.visibleIn) <= depthIndex);
}
