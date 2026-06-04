// ─── QLPA Local Test Log ──────────────────────────────────────────────────────
//
// Browser localStorage wrapper for TestDiagnosticRecord persistence.
//
// Design rules:
//   - localStorage only. No network. No server. No database.
//   - All operations guarded by typeof window check.
//   - Safe failure: if localStorage is unavailable, returns empty / no-ops.
//   - Storage key is versioned so future schema changes can be detected.
//
// Storage key: earthos.testDiagnostics.v1
//
// Reference: docs/QLPA_INTERNAL_TEST_DIAGNOSTICS.md

import type { TestDiagnosticRecord } from './testDiagnostics';

export const LOCAL_TEST_LOG_KEY = 'earthos.testDiagnostics.v1';

function isAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveDiagnosticRecord(record: TestDiagnosticRecord): void {
  if (!isAvailable()) return;
  try {
    const existing = listDiagnosticRecords();
    existing.push(record);
    localStorage.setItem(LOCAL_TEST_LOG_KEY, JSON.stringify(existing));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function listDiagnosticRecords(): TestDiagnosticRecord[] {
  if (!isAvailable()) return [];
  try {
    const raw = localStorage.getItem(LOCAL_TEST_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as TestDiagnosticRecord[];
  } catch {
    return [];
  }
}

export function clearDiagnosticRecords(): void {
  if (!isAvailable()) return;
  try {
    localStorage.removeItem(LOCAL_TEST_LOG_KEY);
  } catch {
    // Fail silently
  }
}

export function exportDiagnosticRecords(): string {
  const records = listDiagnosticRecords();
  if (records.length === 0) return '[]';
  return JSON.stringify(records, null, 2);
}
