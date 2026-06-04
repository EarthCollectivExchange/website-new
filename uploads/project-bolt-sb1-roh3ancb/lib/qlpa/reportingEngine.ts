// ─── QLPA Reporting Engine ────────────────────────────────────────────────────
//
// Pure logic for validating, classifying, and structuring user-submitted reports.
//
// Design rules:
//   - No database calls in this module.
//   - No external network calls in this module.
//   - All functions are synchronous and deterministic.
//   - Callers are responsible for persisting and/or relaying ReportSubmission.
//   - A classified report never leaves the device without explicit user consent.
//
// PRODUCTION NOTE: classifyReport() is UI-scaffolding only. Automated content
// analysis or escalation pipelines must not be activated without legal review
// and informed user consent at the point of reporting.

import type { AbuseCategory } from './abuseTaxonomy';
import { ABUSE_CATEGORY_META } from './abuseTaxonomy';
import type { RecommendedShieldAction, ShieldLevel } from './shieldPolicy';
import { getRecommendedAction } from './shieldPolicy';

// ─── Report target types ──────────────────────────────────────────────────────

export type ReportTargetType =
  | 'message'
  | 'member'
  | 'conversation'
  | 'link'
  | 'media'
  | 'file'
  | 'profile';

// ─── Report lifecycle ─────────────────────────────────────────────────────────

export type ReportStatus =
  | 'draft'       // created locally, not yet submitted
  | 'submitted'   // user confirmed submission; stored locally
  | 'reviewing'   // under review (requires server-side state)
  | 'actioned'    // action taken
  | 'escalated'   // escalated to external authority
  | 'closed';     // resolved / no action needed

// ─── Report submission ────────────────────────────────────────────────────────

export interface ReportSubmission {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  conversationId: string;
  reporterEarthId: string;
  reason: AbuseCategory;
  additionalContext?: string;
  status: ReportStatus;
  createdAt: string; // ISO 8601
}

// ─── Classification result ────────────────────────────────────────────────────

export interface ReportClassification {
  report: ReportSubmission;
  severity: 'low' | 'medium' | 'high' | 'critical';
  requiresEscalation: boolean;
  recommendedAction: RecommendedShieldAction;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ReportValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateReport(
  report: Partial<ReportSubmission>,
): ReportValidationResult {
  const errors: string[] = [];

  if (!report.targetType) errors.push('targetType is required');
  if (!report.targetId || report.targetId.trim() === '') errors.push('targetId is required');
  if (!report.conversationId || report.conversationId.trim() === '') errors.push('conversationId is required');
  if (!report.reporterEarthId || report.reporterEarthId.trim() === '') errors.push('reporterEarthId is required');
  if (!report.reason) errors.push('reason is required');

  return { valid: errors.length === 0, errors };
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createReport(
  params: Omit<ReportSubmission, 'id' | 'status' | 'createdAt'>,
): ReportSubmission {
  return {
    ...params,
    id:        crypto.randomUUID(),
    status:    'draft',
    createdAt: new Date().toISOString(),
  };
}

// ─── Classification ───────────────────────────────────────────────────────────

export function classifyReport(
  report: ReportSubmission,
  shieldLevel: ShieldLevel,
): ReportClassification {
  const meta = ABUSE_CATEGORY_META[report.reason];
  const recommendedAction = getRecommendedAction(report.reason, shieldLevel);

  return {
    report,
    severity:           meta.severity,
    requiresEscalation: meta.requiresEscalation,
    recommendedAction,
  };
}
