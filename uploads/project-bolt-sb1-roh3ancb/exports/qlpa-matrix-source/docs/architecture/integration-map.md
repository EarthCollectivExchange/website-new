# QLPA Matrix Source — Integration Map

**Version:** 1.0.0 Foundation  
**Date:** 2026-05-08  
**Status:** Active roots verified, functional waves pending

---

## What Is Active Now

These systems are live in the exported source and functioning in a host application:

| System | Module | Status |
|--------|--------|--------|
| Human Modes (6 modes) | `lib/foundation/modes.ts` | Active |
| Interface Depth (simple/advanced/developer) | `lib/foundation/modes.ts` | Active |
| i18n (7 locales) | `lib/i18n/` | Active |
| Preferences (unified context) | `lib/foundation/preferencesContext.tsx` | Active |
| Light Stats (aggregate counters, localStorage) | `lib/stats/` | Active (off by default until wired to events) |
| App Constants (canonical storage keys) | `lib/foundation/appConstants.ts` | Active |
| Feature Flags | `lib/foundation/featureFlags.ts` | Active |
| App Layers + Capabilities | `lib/foundation/appLayers.ts`, `appCapabilities.ts` | Active (declarations only) |
| App Readiness | `lib/foundation/appReadiness.ts` | Active (declarations only) |
| Phi / Fibonacci design tokens | `lib/design/` | Active (constants — not yet wired to Tailwind) |
| QLPA language protocol | `lib/qlpa/` | Active (guards + terminology, not wired to live input) |
| Privacy rules | `lib/privacy/` | Active (boundary rules — not enforced at runtime yet) |
| Security types | `lib/security/` | Active (type declarations only) |
| PreferenceBoundary / DeveloperOnly / AdvancedOnly | `components/foundation/` | Active |
| Stats components | `components/stats/` | Active (display only, no live event feed yet) |
| Validation scripts | `scripts/` | Active |
| Host app layer (messaging, files, voice) | `lib/<host-app>/` | Provided by host — not part of this export |

---

## What Is Scaffolded Only (No Live Behavior Yet)

These modules exist with correct types and stubs but perform no live work:

| System | Module | Waiting For |
|--------|--------|-------------|
| Complete Stats (IndexedDB, richer aggregates) | `lib/stats/completeAnalyzer.ts` | Feature flag `completeStats` + IndexedDB implementation |
| QLPA Net Shield (live content scanning) | `lib/qlpa/netShield.ts` | Feature flag `qlpaNetShield` + integration into message render path |
| Relay transport | `lib/foundation/featureFlags.ts` `relayTransport` | Backend relay infrastructure — future |
| Guardian Shield | `lib/foundation/featureFlags.ts` `guardianShield` | Future safety feature — do not build yet |
| Shield Phrase | `lib/foundation/featureFlags.ts` `shieldPhrase` | Future safety feature — do not build yet |
| RTL locale support | `lib/i18n/localeRegistry.ts` (`ar` scaffold) | UI direction system — future |
| Live Stats event wiring | `lib/stats/statsEvents.ts` | Stats factory functions exist; no component calls them yet |

---

## How PreferencesContext Connects to the System

`lib/foundation/preferencesContext.tsx` is the single source of truth for all runtime user preferences.

```
PreferencesProvider
│
├── humanMode          → lib/foundation/modes.ts (load/save via STORAGE_KEYS.humanMode)
├── interfaceDepth     → lib/foundation/modes.ts (load/save via STORAGE_KEYS.interfaceDepth)
├── appMode            → lib/foundation/modes.ts (load/save via STORAGE_KEYS.appMode)
├── statsMode          → lib/stats/statsStore.ts (load/save via STORAGE_KEYS.statsMode)
├── backgroundMode     → preferencesContext (local load/save via STORAGE_KEYS.backgroundMode)
├── reducedMotion      → preferencesContext (local load/save via STORAGE_KEYS.reducedMotion)
├── compactMode        → preferencesContext (local load/save via STORAGE_KEYS.compactMode)
├── developerDiagnostics → preferencesContext (local load/save via STORAGE_KEYS.developerDiagnostics)
│
├── isAdvancedOrDev    → computed from interfaceDepth
└── isDeveloper        → computed from interfaceDepth
```

All STORAGE_KEYS are defined canonically in `lib/foundation/appConstants.ts`.  
Host apps override `STORAGE_NAMESPACE` in `appConstants.ts` to avoid key collisions.

**i18n** is a separate context (`lib/i18n/context.tsx` / `I18nProvider`) providing `locale` and `t()`.  
Locale is independent of PreferencesContext by design — language switching is handled by the i18n system.

---

## How Simple / Advanced / Developer Gates Features

All gating uses `interfaceDepth` from `usePreferences()`.

```
interfaceDepth === 'simple'
  → Show: core messaging, conversation list, basic settings
  → Hide: all QA panels, stats, QLPA diagnostics, relay settings

interfaceDepth === 'advanced'
  → Show: everything in simple + sync status, trust badges, advanced settings
  → Hide: developer QA panels, raw event logs, foundation status

interfaceDepth === 'developer'
  → Show: everything, including stats, QLPA guards, foundation status, QA panels
```

Helper components for gating:
- `components/foundation/PreferenceBoundary` — renders children only if depth ≥ minDepth
- `components/foundation/AdvancedOnly` — renders children only in advanced or developer mode
- `components/foundation/DeveloperOnly` — renders children only in developer mode

**Rule:** Every QA panel, stats display, foundation badge, and diagnostic output must be wrapped in `DeveloperOnly` or `AdvancedOnly`. Simple view must never show them.

---

## How Light Stats Should Be Integrated (Next Wave)

Light Stats records aggregate behavioral counters — no content, no identifiers.

**Current state:** Types, store, privacy guard, and display components exist. No events are being fired yet.

**Integration steps:**
1. Import `recordStatsEvent` from `lib/stats/lightAnalyzer.ts` into host app action sites
2. Fire events at natural action boundaries:
   - `app_opened` → on app mount
   - `message_sent` → on message send action
   - `conversation_created` → on new conversation creation
   - `file_prepared` → on file attachment confirmation
   - `voice_recorded` → on voice recording completion
   - `language_changed` → on locale change action
   - `mode_changed` → on humanMode or interfaceDepth change
3. Pass `statsMode` from `usePreferences()` to `recordStatsEvent` — it auto-respects `mode === 'off'`
4. Surface `StatsPlaceholderPanel` in Developer settings panel (already built)
5. Do NOT fire events on message content, file names, or contact details — ever

**Privacy guarantee:** `validateStatsEvent()` in `lib/stats/statsPrivacy.ts` blocks any event with prohibited fields at recording time. The check-stats-privacy script confirms the types remain clean.

---

## How Complete Stats Should Be Integrated (Future Wave)

Complete Stats extends Light Stats with persistent IndexedDB storage and richer breakdowns.

**Do not start until:**
- Light Stats is wired to all action sites and verified working
- Feature flag `completeStats` is set to `true` in `lib/foundation/featureFlags.ts`
- A decision is made on the Web Worker strategy (SharedWorker vs. dedicated Worker)

**Integration path:**
1. Implement IndexedDB adapter in `completeAnalyzer.ts` (the scaffold stub is ready)
2. Wire `initCompleteStats()` into app startup
3. Replace `lightAnalyzer` calls with the unified `recordStatsEvent()` which routes to whichever mode is active
4. Add richer display panels behind `DeveloperOnly` (charts etc. — add heavy libs at this point only)
5. Privacy rules remain identical — the stats privacy guard applies to both modes

---

## How QLPA Net Shield Should Be Added (Future Wave)

Net Shield scans message rendering paths for discouraged language and provides gentle replacements.

**Current state:** `lib/qlpa/netShield.ts` defines 9 shield layers. All are inactive (`status: 'inactive'`). `scanTextForQlpaTerms()` exists and works.

**Critical constraint:** Net Shield must NEVER scan plaintext message content for analytics. It may only operate at the UI rendering layer to suggest visual replacements — never as a data collection mechanism.

**Integration path:**
1. Set feature flag `qlpaNetShieldScaffold` to `true` — activates developer visibility only
2. Add QLPA scan to the host app's message render component — wraps rendered text, no persistence
3. Show replacement suggestions inline for developer mode only; silent in simple/advanced
4. Gate: only apply in developer mode initially; never touch content in storage or transit
5. Do NOT log matched terms to stats except in developer diagnostic mode (`qlpa_term_detected_dev_only` event type already exists)

---

## Recommended Next Build Waves

### Wave A — Stats Wiring (Low risk, high value)
Wire `recordStatsEvent` calls to the 7 primary action sites listed above. No new UI needed — stats display already exists. Acceptance: `StatsPlaceholderPanel` shows real counts in Developer mode.

### Wave B — Phi/Fibonacci → Tailwind (Visual consistency, no behavior change)
Wire `lib/design/fibonacciScale.ts` and `lib/design/layoutRhythm.ts` values into `tailwind.config.ts` as custom spacing/sizing tokens. Apply them to existing components in one pass. Acceptance: No visual regressions; spacing is Fibonacci-aligned.

### Wave C — PreferenceBoundary Gating (Security hygiene)
Wrap all host app QA panels in `DeveloperOnly`. Confirm they are invisible in Simple and Advanced view. Acceptance: Simple view shows zero developer diagnostic content.

### Wave D — Complete Stats Scaffold → Active (Future)
Only after Wave A is stable. Activate IndexedDB backend for Complete Stats, add richer display panels.

### Wave E — QLPA Net Shield (Future)
Only after Wave C is stable. Activate developer-mode language suggestions in message rendering.

### Wave F — Relay Transport (Future, requires backend)
Infrastructure decision needed. Do not start without explicit backend plan.

---

## Dependency Order Constraints

```
lib/foundation/appConstants.ts
  └── lib/foundation/modes.ts (reads STORAGE_KEYS)
  └── lib/stats/statsStore.ts (reads STORAGE_KEYS)
  └── lib/foundation/preferencesContext.tsx (reads STORAGE_KEYS + imports from modes.ts)

lib/foundation/featureFlags.ts
  └── lib/stats/completeAnalyzer.ts (reads isFeatureEnabled)

lib/stats/statsTypes.ts → statsPrivacy.ts → statsStore.ts → lightAnalyzer.ts
                                                         └── completeAnalyzer.ts

lib/i18n/context.tsx (I18nProvider) — parallel to PreferencesProvider, not nested inside it
lib/foundation/preferencesContext.tsx (PreferencesProvider) — wraps host app UI
```

**Import direction rule:** `lib/` files must never import from `components/`. The only correct direction is `components/` → `lib/`. The `AppMode` type was fixed in this pass to enforce this.

---

## Files by Role

| Role | Files |
|------|-------|
| Single source of truth for preferences | `lib/foundation/preferencesContext.tsx` |
| Single source of truth for storage keys | `lib/foundation/appConstants.ts` STORAGE_KEYS |
| Single source of truth for feature flags | `lib/foundation/featureFlags.ts` |
| Single source of truth for mode types | `lib/foundation/modes.ts` |
| Single source of truth for stats types | `lib/stats/statsTypes.ts` |
| Single source of truth for QLPA terms | `lib/qlpa/terminology.ts` |
| Privacy enforcement at record time | `lib/stats/statsPrivacy.ts` validateStatsEvent() |
| i18n truth for English | `lib/i18n/locales/en.json` |
