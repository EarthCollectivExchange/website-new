# QLPA Source Base Product UI Audit

**Project:** EarthOS QLPA Matrix Source Code Base — Canonical v1
**Pass:** Source Base Pass 003 — Isolate Messaging Product UI
**Date:** 2026-05-25
**Status:** isolation-in-progress

---

## Purpose

Classify every file in this project as:

- **A. Archive now** — product-specific, not part of the reusable foundation
- **B. Preserve as canonical foundation** — reusable QLPA infrastructure
- **C. Reframe later** — exists in both contexts, needs adaptation

This audit does not delete. It records intended actions for Pass 004 and beyond.

---

## A. Archive Now — Product-Specific Messaging UI / Runtime

These files belong to the EarthOS Messaging product and should be moved to
`archive/messaging-origin/` in a future isolation pass once build/check safety is confirmed.

### app/messaging/ (2 files)
| File | Action |
|------|--------|
| `app/messaging/page.tsx` | archive → `archive/messaging-origin/app/messaging/page.tsx` |
| `app/messaging/layout.tsx` | archive → `archive/messaging-origin/app/messaging/layout.tsx` |

### components/messaging/ (54 files)
| File | Action |
|------|--------|
| `AppDashboard.tsx` | archive |
| `AdvancedViewSettings.tsx` | archive |
| `AttachmentMenu.tsx` | archive |
| `BottomNav.tsx` | archive |
| `ConsentDrilldownPanel.tsx` | archive |
| `ConsentQAPanel.tsx` | archive |
| `ContactsTab.tsx` | archive |
| `ConversationInfoPanel.tsx` | archive |
| `ConversationList.tsx` | archive |
| `ConversationView.tsx` | archive |
| `CryptoDevPanel.tsx` | archive |
| `DeliveryDrilldownPanel.tsx` | archive |
| `EarthIdSignInPanel.tsx` | archive |
| `EmptyConversationJourney.tsx` | archive |
| `FileCostEstimateBadge.tsx` | archive |
| `FileDetailsDrawer.tsx` | archive |
| `FileMessageBubble.tsx` | archive |
| `FilePermissionsPanel.tsx` | archive |
| `FileRetentionSelector.tsx` | archive |
| `FileTransferPanel.tsx` | archive |
| `FileUploadProgress.tsx` | archive |
| `IdentityCard.tsx` | archive |
| `IntentionMirrorCard.tsx` | archive (QLPA analysis engine stays in lib/qlpa; this is product UI) |
| `InviteMemberDialog.tsx` | archive |
| `JourneyStatusBar.tsx` | archive |
| `MVPStatusPanel.tsx` | archive |
| `MembersPanel.tsx` | archive |
| `MessageBubble.tsx` | archive |
| `MessageComposer.tsx` | archive |
| `MessageDetailDrawer.tsx` | archive |
| `MessageJourneyPanel.tsx` | archive |
| `MessageRetentionPanel.tsx` | archive |
| `ModeBar.tsx` | archive |
| `NewConversationDrawer.tsx` | archive |
| `OnboardingScreen.tsx` | archive |
| `PhiShell.tsx` | archive |
| `PhoneQAPanel.tsx` | archive |
| `PrivacyDrilldownPanel.tsx` | archive |
| `ProductLoopPanel.tsx` | archive |
| `RelayQAPanel.tsx` | archive |
| `ReleaseReadinessPanel.tsx` | archive |
| `SearchPanel.tsx` | archive |
| `SettingsTab.tsx` | archive |
| `SovereigntyJourneyDrawer.tsx` | archive |
| `SovereigntySettingsPanel.tsx` | archive |
| `StorageBadge.tsx` | archive |
| `SyncQAPanel.tsx` | archive |
| `SyncStatusBadge.tsx` | archive |
| `TrustBadge.tsx` | archive |
| `TrustTab.tsx` | archive |
| `VoiceMessageBubble.tsx` | archive |
| `VoicePlaceholder.tsx` | archive |
| `VoiceRecorderPanel.tsx` | archive |

### lib/messaging/ (22 files)
| File | Action |
|------|--------|
| `types.ts` | archive (messaging product types — QLPA types stay in lib/qlpa) |
| `mockData.ts` | archive |
| `actions.ts` | archive |
| `consent.ts` | archive (messaging consent layer — QLPA consent engine in lib/qlpa) |
| `safety.ts` | archive |
| `trust.ts` | archive (messaging trust layer — QLPA trust graph in lib/qlpa) |
| `crypto.ts` | archive |
| `files.ts` | archive |
| `relay.ts` | archive |
| `storage.ts` | archive |
| `sync.ts` | archive |
| `hooks.ts` | archive |
| `modes.ts` | archive (messaging modes — QLPA modes in lib/foundation) |
| `identity.ts` | archive |
| `earthId.ts` | archive |
| `intentionMirror.ts` | archive (messaging-layer mirror — QLPA mirror engine in lib/qlpa) |
| `ledger.ts` | archive |
| `searchIndex.ts` | archive |
| `qlpaSettings.ts` | archive |
| `authBridge.ts` | archive |
| `localPersistence.ts` | archive |
| `preferencesContext.tsx` | archive (re-exports from lib/foundation — no logic here) |

### app/auth/ (1 file)
| File | Action |
|------|--------|
| `app/auth/callback/page.tsx` | archive (messaging-specific auth flow) |

### Messaging-Specific Docs
| File | Action |
|------|--------|
| `docs/PRE_MVP_STATUS.md` | reframe → `docs/SOURCE_BASE_STATUS.md` |
| `docs/QLPA_PHONE_TEST_PASS_129.md` | archive → `docs/archive/messaging-origin/` |
| `docs/QLPA_TODO.md` | review — contains mixed foundation + messaging todos |

---

## B. Preserve as Canonical Foundation

These files are the reusable QLPA foundation. Do not archive or remove.

### lib/qlpa/ (38 files) — ALL PRESERVE
QLPA principles, guards, tokens, layout tokens, consent engine, trust graph, message lifecycle, abuse taxonomy, intention mirror engine, test diagnostics, netShield family, language family, communication envelope, capability matrix, release contract, reporting engine, app orchestrator, device runtime, QLPA Runtime Context.

### lib/foundation/ (11 files) — ALL PRESERVE
Source identity, app constants, capabilities, layers, readiness, feature flags, modes, preferences context, qlpa visual, scroll orchestrator, index.

### lib/design/ (6 files) — ALL PRESERVE
Phi tokens, fibonacci scale, layout rhythm, touch targets, z-index, index.

### lib/i18n/ (9 files + 7 locales) — ALL PRESERVE
Context, dictionary, keys, locale registry, locale types, missing key policy, useT, validate locales, index. All 7 locale JSON files.

### lib/privacy/ (5 files) — ALL PRESERVE
Data classes, local-only rules, retention rules, content boundaries, index.

### lib/security/ (5 files) — ALL PRESERVE
Trust levels, delivery states, protection states, clear scopes, index.

### lib/stats/ (10 files) — ALL PRESERVE
Stats types, modes, store, privacy, events, export, selectors, light analyzer, complete analyzer, index.

### lib/utils.ts, lib/supabase.ts — PRESERVE
### hooks/use-toast.ts — PRESERVE

### components/foundation/ (4 files) — ALL PRESERVE
AdvancedOnly, DeveloperOnly, FoundationStatusBadge, PreferenceBoundary.

### components/stats/ (4 files) — ALL PRESERVE
StatsModeBadge, StatsPlaceholderPanel, StatsPrivacyNotice, StatsSummaryCard.

### components/ui/ (all 51 shadcn/ui files) — PRESERVE
Framework primitives, not product-specific.

### components/ClientProviders.tsx — PRESERVE
### components/EarthOSLogo.tsx — PRESERVE
### components/NatureAppShell.tsx — PRESERVE (remove messaging route wiring later)
### components/NatureBackdrop.tsx — PRESERVE

### app/page.tsx — PRESERVE (source base index)
### app/layout.tsx — PRESERVE (strip messaging metadata — done)
### app/error.tsx, app/global-error.tsx — PRESERVE
### app/globals.css — PRESERVE (audit for messaging-specific CSS in pass 4)

### Foundation Check Scripts — ALL PRESERVE
- `check-foundation.mjs`
- `check-i18n.mjs`
- `check-qlpa-language.mjs`
- `check-stats-privacy.mjs`
- `check-shield.mjs`
- `check-envelope.mjs`
- `check-portability.mjs`
- `check-system-invariants.mjs`
- `check-release-claims.mjs`
- `check-docs-release.mjs`
- `check-test-diagnostics.mjs`
- `check-source-base-extraction-plan.mjs`
- `check-source-base-visual-identity.mjs`
- `check-source-base-product-isolation.mjs` (new, Pass 003)
- `export-qlpa-matrix-source.mjs`
- `validate-i18n.mjs`

### Canonical QLPA Docs — ALL PRESERVE
- `docs/QLPA_ARCHITECTURE_MAP.md`
- `docs/QLPA_SHIELD_FOUNDATION.md`
- `docs/QLPA_COMMUNICATION_ENVELOPE.md`
- `docs/QLPA_LANGUAGE_HARMONY_BLUEPRINT.md`
- `docs/QLPA_MULTILINGUAL_LANGUAGE_ROOT.md`
- `docs/QLPA_COMMUNICATION_CAPABILITY_MATRIX.md`
- `docs/QLPA_MODE_PROTOCOL.md`
- `docs/QLPA_INTERNAL_TEST_DIAGNOSTICS.md`
- `docs/QLPA_SOURCE_BASE_EXTRACTION_PLAN.md`
- `docs/QLPA_SOURCE_BASE_SCOPE.md`
- `docs/SOURCE_BASE_STATUS.md` (new, Pass 003)
- `docs/architecture/*` (all 5 files)
- `docs/design/*` (both files)

### Root Docs — ALL PRESERVE
- `README.md`
- `QLPA-ETHICAL-USE.md`
- `QLPA-MATRIX-SOURCE.md`
- `INTEGRATION-GUIDE.md`
- `PROJECT-ADAPTATION.md`

### Exports — ALL PRESERVE
- `exports/qlpa-matrix-source/`
- `exports/releases/`

---

## C. Reframe Later

| File | Current State | Recommended Action |
|------|--------------|-------------------|
| `docs/PRE_MVP_STATUS.md` | Messaging pass history | Reframe as `docs/SOURCE_BASE_STATUS.md` |
| `docs/QLPA_TODO.md` | Mixed foundation + messaging todos | Audit and split in Pass 004 |
| `scripts/check-earthos-bridge.mjs` | Checks messaging runtime + QLPA bridge | Rewrite as foundation-only bridge check |
| `scripts/check-earthcoin-governance.mjs` | Checks governance boundary — may be reusable | Audit in Pass 004 |
| `scripts/check-communication-capability-matrix.mjs` | Checks QLPA comm matrix | Likely preserve — audit in Pass 004 |
| `scripts/check-language-harmony.mjs` | Checks language harmony — QLPA | Likely preserve — audit in Pass 004 |
| `scripts/check-mobile-sheet-layers.mjs` | Checks messaging UI sheet layers | Archive in Pass 004 |
| `scripts/check-first-mission-actions.mjs` | Checks messaging first-use flow | Archive in Pass 004 |
| `scripts/check-first-user-flow.mjs` | Checks messaging user flow | Archive in Pass 004 |
| `scripts/check-mobile-scroll-orchestrator.mjs` | Checks scroll — may be foundation | Audit in Pass 004 |
| `scripts/check-pass128.mjs` | Messaging pass milestone | Archive in Pass 004 |
| `scripts/check-phone-test-doc.mjs` | Phone QA doc check | Archive in Pass 004 |
| `scripts/check-phone-qa-panel.mjs` | Phone QA panel check | Archive in Pass 004 |
| `scripts/check-first-use-layout.mjs` | Partly messaging, partly foundation layout | Rewrite as foundation-only in Pass 004 |
| `scripts/check-pass134-phone-verification.mjs` | Phone verification pass | Archive in Pass 004 |
| `scripts/check-local-test-message-flow.mjs` | Messaging message flow test | Archive in Pass 004 |
| `scripts/check-multilingual-language-adapters.mjs` | Multilingual — likely foundation | Audit in Pass 004 |
| `scripts/check-intention-mirror-composer.mjs` | Checks MessageComposer (product UI) | Rewrite as QLPA engine check only |
| `app/auth/callback/page.tsx` | Messaging auth callback | Archive in Pass 004 |
| `components/NatureAppShell.tsx` | Has messaging route wiring | Audit and strip in Pass 004 |

---

## Summary Counts

| Category | Count |
|----------|-------|
| Archive now (components/messaging) | 54 |
| Archive now (lib/messaging) | 22 |
| Archive now (app/messaging) | 2 |
| Archive now (app/auth) | 1 |
| Archive now (docs) | 1 |
| Preserve as canonical foundation | ~170 |
| Reframe later | 19 |

---

*EarthOS QLPA Matrix Source Code Base · Pass 003 audit*
