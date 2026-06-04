# QLPA Internal Test Diagnostics

> EarthOS Messaging — Pass 123  
> Local-only structured feedback layer for founder device testing.

---

## Overview

The Internal Test Diagnostics layer provides a structured, privacy-safe way for the founder to log UI observations and issues during iPhone and Samsung device testing. All records stay on-device in localStorage. Nothing is sent to any server.

This layer is only visible in **Developer mode** — it is completely hidden in Simple and Advanced modes.

---

## Module Architecture

### `lib/qlpa/testDiagnostics.ts` — Pure module

**Purpose:** Types, record schema, and pure utility functions.

**Design rules (non-negotiable):**
- No network calls. No external analytics. No database writes.
- No browser APIs (localStorage, window, document).
- No framework imports (React, Supabase, etc.).
- All logic is deterministic and testable.

**Exports:**

| Export | Kind | Description |
|--------|------|-------------|
| `TestDeviceType` | type | `'iphone' \| 'android' \| 'desktop' \| 'tablet' \| 'unknown'` |
| `TestBrowser` | type | `'safari' \| 'brave' \| 'chrome' \| 'firefox' \| 'edge' \| 'unknown'` |
| `TestSurface` | type | 17 surface names matching QA script sections |
| `TestIssueCategory` | type | `'scroll' \| 'layout' \| 'i18n' \| 'touch' \| 'overlay' \| 'performance' \| 'wording' \| 'state' \| 'safety' \| 'unknown'` |
| `TestSeverity` | type | `'note' \| 'minor' \| 'major' \| 'blocker'` |
| `TestDiagnosticRecord` | interface | Full record structure (see below) |
| `DiagnosticInput` | interface | Input shape for `createDiagnosticRecord` |
| `createDiagnosticRecord(input)` | function | Creates a timestamped record with generated ID |
| `classifyIssueSeverity(category, description)` | function | Infers severity from category + description keywords |
| `getDeviceRuntimeSummary(runtime)` | function | Formats `DeviceRuntime` into a human-readable one-liner |
| `formatDiagnosticForCopy(record)` | function | Formats a record as multiline text for clipboard copy |

**`TestDiagnosticRecord` fields:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `diag_<timestamp>_<random>` |
| `createdAt` | string | ISO timestamp |
| `deviceType` | TestDeviceType | Device category |
| `browser` | TestBrowser | Browser detected |
| `surface` | TestSurface | Screen or panel where issue was observed |
| `issueCategory` | TestIssueCategory | Classification of issue type |
| `severity` | TestSeverity | Impact level |
| `description` | string | Plain language description |
| `expected` | string | What should have happened |
| `actual` | string | What actually happened |
| `screenshotNote?` | string | Optional: reference to screenshot file |
| `appMode?` | string | HumanMode at time of issue |
| `language?` | string | Active locale |
| `interfaceDepth?` | string | ViewLevel (simple / advanced / developer) |
| `resolved?` | boolean | Whether issue has been resolved |

---

### `lib/qlpa/localTestLog.ts` — localStorage wrapper

**Purpose:** Persist and retrieve `TestDiagnosticRecord` objects in localStorage.

**Design rules:**
- All operations guarded by `typeof window !== 'undefined'` check.
- Safe failure on every operation — no throws, empty fallbacks.
- Storage key is versioned for future schema changes.

**Storage key:** `earthos.testDiagnostics.v1`

**Exports:**

| Export | Kind | Description |
|--------|------|-------------|
| `LOCAL_TEST_LOG_KEY` | const | Versioned storage key |
| `saveDiagnosticRecord(record)` | function | Appends record to localStorage list |
| `listDiagnosticRecords()` | function | Returns all saved records, or `[]` on any failure |
| `clearDiagnosticRecords()` | function | Removes all records from localStorage |
| `exportDiagnosticRecords()` | function | Returns records as formatted JSON string |

---

## UI Integration — SettingsTab.tsx

The diagnostics panel is rendered inside a `{isDeveloper(viewLevel) && ...}` gate in the Settings tab About section. It is **never** rendered in Simple or Advanced mode.

**Panel contents (Developer mode only):**
1. Panel heading: `t('diagnostics.title')` + `t('diagnostics.localOnly')` badge
2. Device runtime summary line (from `getDeviceRuntimeSummary(deviceRuntime)`)
3. Record count: `t('diagnostics.records'): N`
4. "Create local test note" button — calls `createDiagnosticRecord` + `saveDiagnosticRecord`, auto-populates device/browser/surface from runtime context
5. "Clear local test log" button — calls `clearDiagnosticRecords`

**i18n keys used:**

| Key | English value |
|-----|---------------|
| `diagnostics.title` | "Internal diagnostics" |
| `diagnostics.localOnly` | "Local only — no server upload" |
| `diagnostics.deviceSummary` | "Device runtime unavailable" |
| `diagnostics.records` | "Saved records" |
| `diagnostics.copySummary` | "Copy diagnostic summary" |
| `diagnostics.clearLog` | "Clear local test log" |
| `diagnostics.createNote` | "Create local test note" |
| `diagnostics.noteCreated` | "Note saved" |
| `diagnostics.logCleared` | "Log cleared" |
| `diagnostics.hiddenInSimple` | "Diagnostics hidden in Simple mode" |

All 10 keys are present in all 7 locales (en, de, fr, es, it, pt, id).

---

## Check Script

`scripts/check-test-diagnostics.mjs` — Pass 123 check script.

**Assertions (Pass 123):**
- All types exported from `testDiagnostics.ts`
- All helpers present and named correctly
- Purity: no fetch, no XMLHttpRequest, no Supabase import, no localStorage
- `'No network calls'` comment present
- `localTestLog.ts` storage key = `earthos.testDiagnostics.v1`
- Browser API guard present in `localTestLog.ts`
- All 4 localStorage helpers exported
- Safe catch blocks present, `return []` fallback on parse failure
- All 10 `diagnostics.*` i18n keys in `en.json`
- `"diagnostics"` and `"release"` sections in all 7 locales
- `SettingsTab.tsx` imports and renders diagnostics via `t()`
- Developer mode gate (`isDeveloper(viewLevel)`) present with diagnostics

Run: `node scripts/check-test-diagnostics.mjs`

---

## Privacy Guarantees

| Concern | Guarantee |
|---------|-----------|
| Message content | Never logged. Records store only surface, category, and description. |
| EarthID handles | Never logged in diagnostic records. |
| Personal data | Not stored. Records only capture device/browser/UI observations. |
| Server upload | None. Records exist only in localStorage on the tester's device. |
| Retention | Cleared manually via the "Clear local test log" button. |

---

## Pass History

| Pass | Change |
|------|--------|
| **123** | `testDiagnostics.ts` + `localTestLog.ts` created. Developer-only panel in SettingsTab. 10 i18n `diagnostics.*` keys in all 7 locales. `check-test-diagnostics.mjs` check script. `releaseContract.ts` created (Pass 121 content). All 5 missing qlpa:check scripts created. |
