/**
 * QLPA Principles
 * Quantum Love Protection Architecture — core design axioms.
 * These are not rules imposed on users. They are commitments made by the system.
 */

export interface QlpaPrinciple {
  id: string;
  name: string;
  description: string;
  userFacing: boolean;
}

export const QLPA_PRINCIPLES: QlpaPrinciple[] = [
  {
    id: 'truth',
    name: 'Truth',
    description: 'The system only claims what it can actually do. No overclaiming remote deletion, remote protection, or delivery guarantees it cannot verify.',
    userFacing: true,
  },
  {
    id: 'calm',
    name: 'Calm',
    description: 'Language and interface design reduce anxiety rather than creating urgency. No fear-based copy, no dark patterns, no manufactured urgency.',
    userFacing: true,
  },
  {
    id: 'consent',
    name: 'Consent',
    description: 'No message, file, voice, or action proceeds without the user\'s active or clearly standing consent. Consent is never assumed.',
    userFacing: true,
  },
  {
    id: 'sovereignty',
    name: 'Sovereignty',
    description: 'Users own their data. Local-first by default. Export, clear, and migrate are always available. No silent upload, no silent extraction.',
    userFacing: true,
  },
  {
    id: 'care',
    name: 'Care',
    description: 'The system is designed to support human wellbeing, not to optimize engagement metrics. Relationships matter more than session length.',
    userFacing: true,
  },
  {
    id: 'clarity',
    name: 'Clarity',
    description: 'Every action has a visible consequence explained in plain language. What the system does is transparent to the user.',
    userFacing: true,
  },
  {
    id: 'reversibility',
    name: 'Reversibility where possible',
    description: 'Actions are reversible where technically feasible. When they are not reversible, this is stated clearly and honestly — never dramatized.',
    userFacing: true,
  },
  {
    id: 'noHiddenExtraction',
    name: 'No hidden extraction',
    description: 'No plaintext message content, file content, voice content, or private keys ever leave the device without an explicit user export action.',
    userFacing: true,
  },
  {
    id: 'noOverclaiming',
    name: 'No overclaiming',
    description: 'The system never claims it has deleted data on remote devices when it can only send a request. Certainty levels are always stated accurately.',
    userFacing: true,
  },
];

export function getPrincipleById(id: string): QlpaPrinciple | undefined {
  return QLPA_PRINCIPLES.find((p) => p.id === id);
}

export function getUserFacingPrinciples(): QlpaPrinciple[] {
  return QLPA_PRINCIPLES.filter((p) => p.userFacing);
}
