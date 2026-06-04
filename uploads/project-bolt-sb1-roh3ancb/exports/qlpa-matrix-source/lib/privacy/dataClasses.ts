/**
 * Data Classes
 * Canonical classification of all data types handled by a QLPA-aligned host application.
 * Use these to label what kind of data a given operation touches.
 */

export type DataClass =
  | 'messageContent'
  | 'fileContent'
  | 'voiceContent'
  | 'encryptedEnvelope'
  | 'routingMetadata'
  | 'consentEvent'
  | 'ledgerEvent'
  | 'preferenceData'
  | 'statsAggregate';

export interface DataClassDefinition {
  id: DataClass;
  name: string;
  staysLocal: boolean;
  entersSats: boolean;
  description: string;
}

export const DATA_CLASS_DEFINITIONS: DataClassDefinition[] = [
  {
    id: 'messageContent',
    name: 'Message Content',
    staysLocal: true,
    entersSats: false,
    description: 'The plaintext body of a message. Never leaves the device unencrypted. Never enters stats.',
  },
  {
    id: 'fileContent',
    name: 'File Content',
    staysLocal: true,
    entersSats: false,
    description: 'File binary data. Never inspected by the app. Encrypted before any relay transfer.',
  },
  {
    id: 'voiceContent',
    name: 'Voice Content',
    staysLocal: true,
    entersSats: false,
    description: 'Voice memo audio. Encrypted locally. Never analyzed for content.',
  },
  {
    id: 'encryptedEnvelope',
    name: 'Encrypted Envelope',
    staysLocal: false,
    entersSats: false,
    description: 'The encrypted payload ready for relay. Contains no readable plaintext. Future relay transport only.',
  },
  {
    id: 'routingMetadata',
    name: 'Routing Metadata',
    staysLocal: false,
    entersSats: false,
    description: 'Delivery routing data (recipient ID, timestamp, delivery status). Minimal — no content.',
  },
  {
    id: 'consentEvent',
    name: 'Consent Event',
    staysLocal: true,
    entersSats: false,
    description: 'A record of a consent decision (allowed, blocked, pending). Stored in local ledger.',
  },
  {
    id: 'ledgerEvent',
    name: 'Ledger Event',
    staysLocal: true,
    entersSats: false,
    description: 'Audit trail entry. Contains event type and metadata — no message content.',
  },
  {
    id: 'preferenceData',
    name: 'Preference Data',
    staysLocal: true,
    entersSats: false,
    description: 'User preferences (mode, locale, interface depth). Local only.',
  },
  {
    id: 'statsAggregate',
    name: 'Stats Aggregate',
    staysLocal: true,
    entersSats: true,
    description: 'Aggregate counters only. No content, no identifiers. Used by Stats Analyzer.',
  },
];

const CLASS_MAP = new Map(DATA_CLASS_DEFINITIONS.map((d) => [d.id, d]));

export function getDataClass(id: DataClass): DataClassDefinition | undefined {
  return CLASS_MAP.get(id);
}

export function getLocalOnlyClasses(): DataClassDefinition[] {
  return DATA_CLASS_DEFINITIONS.filter((d) => d.staysLocal);
}
