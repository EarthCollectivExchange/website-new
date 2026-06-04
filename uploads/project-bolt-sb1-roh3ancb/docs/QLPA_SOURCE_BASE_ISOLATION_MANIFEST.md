# QLPA Source Base Isolation Manifest

**Project:** EarthOS QLPA Matrix Source Code Base — Canonical v1
**Pass:** Source Base Pass 003 — Isolate Messaging Product UI
**Date:** 2026-05-25
**Status:** isolation-in-progress

This manifest records the proposed action for every file in the project.
Actions are: `keep` | `archive` | `remove-later` | `reframe` | `replace-with-stub`.

Physical moves have NOT yet been executed. This manifest is the record of intent.
Execute moves in Pass 004 after confirming build/check safety.

---

## app/

| File | Action | Notes |
|------|--------|-------|
| `app/page.tsx` | keep | Source base index — canonical |
| `app/layout.tsx` | keep | Strip any remaining messaging metadata |
| `app/error.tsx` | keep | Foundation error boundary |
| `app/global-error.tsx` | keep | Foundation root error boundary |
| `app/globals.css` | keep | Audit for messaging-specific CSS in Pass 004 |
| `app/messaging/page.tsx` | replace-with-stub | Route replaced with source-base placeholder (Pass 003) |
| `app/messaging/layout.tsx` | archive | Messaging product layout |
| `app/auth/callback/page.tsx` | archive | Messaging-specific auth flow |

---

## components/

### components/messaging/ (54 files) — ALL archive

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
| `IntentionMirrorCard.tsx` | archive (QLPA engine stays in lib/qlpa; this is product UI) |
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

### components/foundation/ — ALL keep

| File | Action |
|------|--------|
| `AdvancedOnly.tsx` | keep |
| `DeveloperOnly.tsx` | keep |
| `FoundationStatusBadge.tsx` | keep |
| `PreferenceBoundary.tsx` | keep |

### components/stats/ — ALL keep

| File | Action |
|------|--------|
| `StatsModeBadge.tsx` | keep |
| `StatsPlaceholderPanel.tsx` | keep |
| `StatsPrivacyNotice.tsx` | keep |
| `StatsSummaryCard.tsx` | keep |

### components/ui/ (51 files) — ALL keep

All shadcn/ui primitives — framework layer, not product-specific.

### components/ (root)

| File | Action |
|------|--------|
| `ClientProviders.tsx` | keep |
| `EarthOSLogo.tsx` | keep |
| `NatureAppShell.tsx` | reframe — audit for messaging route wiring in Pass 004 |
| `NatureBackdrop.tsx` | keep |

---

## lib/

### lib/messaging/ (22 files) — ALL archive

| File | Action |
|------|--------|
| `types.ts` | archive |
| `mockData.ts` | archive |
| `actions.ts` | archive |
| `consent.ts` | archive |
| `safety.ts` | archive |
| `trust.ts` | archive |
| `crypto.ts` | archive |
| `files.ts` | archive |
| `relay.ts` | archive |
| `storage.ts` | archive |
| `sync.ts` | archive |
| `hooks.ts` | archive |
| `modes.ts` | archive |
| `identity.ts` | archive |
| `earthId.ts` | archive |
| `intentionMirror.ts` | archive |
| `ledger.ts` | archive |
| `searchIndex.ts` | archive |
| `qlpaSettings.ts` | archive |
| `authBridge.ts` | archive |
| `localPersistence.ts` | archive |
| `preferencesContext.tsx` | archive |

### lib/qlpa/ (38 files) — ALL keep (canonical foundation)
### lib/foundation/ (11 files) — ALL keep
### lib/design/ (6 files) — ALL keep
### lib/i18n/ (9 files + 7 locales) — ALL keep
### lib/privacy/ (5 files) — ALL keep
### lib/security/ (5 files) — ALL keep
### lib/stats/ (10 files) — ALL keep
### lib/utils.ts — keep
### lib/supabase.ts — keep

---

## hooks/

| File | Action |
|------|--------|
| `hooks/use-toast.ts` | keep |

---

## scripts/

### Foundation Check Scripts — ALL keep

| File | Action |
|------|--------|
| `check-foundation.mjs` | keep |
| `check-i18n.mjs` | keep |
| `check-qlpa-language.mjs` | keep |
| `check-stats-privacy.mjs` | keep |
| `check-shield.mjs` | keep |
| `check-envelope.mjs` | keep |
| `check-portability.mjs` | keep |
| `check-system-invariants.mjs` | keep |
| `check-release-claims.mjs` | keep |
| `check-docs-release.mjs` | keep |
| `check-test-diagnostics.mjs` | keep |
| `check-source-base-extraction-plan.mjs` | keep |
| `check-source-base-visual-identity.mjs` | keep |
| `check-source-base-product-isolation.mjs` | keep (new, Pass 003) |
| `export-qlpa-matrix-source.mjs` | keep |
| `validate-i18n.mjs` | keep |

### Messaging-Specific Check Scripts — archive in Pass 004

| File | Action | Notes |
|------|--------|-------|
| `check-mobile-sheet-layers.mjs` | archive | Checks messaging UI sheet layers |
| `check-first-mission-actions.mjs` | archive | Checks messaging first-use flow |
| `check-first-user-flow.mjs` | archive | Checks messaging user flow |
| `check-pass128.mjs` | archive | Messaging pass milestone |
| `check-phone-test-doc.mjs` | archive | Phone QA doc check |
| `check-phone-qa-panel.mjs` | archive | Phone QA panel check |
| `check-pass134-phone-verification.mjs` | archive | Phone verification pass |
| `check-local-test-message-flow.mjs` | archive | Messaging message flow test |
| `check-intention-mirror-composer.mjs` | reframe | Rewrite as QLPA engine check only |

### Reframe Later Scripts

| File | Action | Notes |
|------|--------|-------|
| `check-earthos-bridge.mjs` | reframe | Audit: likely foundation-relevant |
| `check-earthcoin-governance.mjs` | reframe | Audit: likely foundation-relevant |
| `check-communication-capability-matrix.mjs` | reframe | Likely preserve — audit Pass 004 |
| `check-language-harmony.mjs` | reframe | QLPA module — likely keep |
| `check-mobile-scroll-orchestrator.mjs` | reframe | Scroll orchestrator is foundation |
| `check-first-use-layout.mjs` | reframe | Partly messaging, partly foundation |
| `check-multilingual-language-adapters.mjs` | reframe | Likely preserve — audit Pass 004 |

---

## docs/

### Canonical Foundation Docs — ALL keep

| File | Action |
|------|--------|
| `QLPA_ARCHITECTURE_MAP.md` | keep |
| `QLPA_SHIELD_FOUNDATION.md` | keep |
| `QLPA_COMMUNICATION_ENVELOPE.md` | keep |
| `QLPA_LANGUAGE_HARMONY_BLUEPRINT.md` | keep |
| `QLPA_MULTILINGUAL_LANGUAGE_ROOT.md` | keep |
| `QLPA_COMMUNICATION_CAPABILITY_MATRIX.md` | keep |
| `QLPA_MODE_PROTOCOL.md` | keep |
| `QLPA_INTERNAL_TEST_DIAGNOSTICS.md` | keep |
| `QLPA_SOURCE_BASE_EXTRACTION_PLAN.md` | keep |
| `QLPA_SOURCE_BASE_SCOPE.md` | keep |
| `QLPA_SOURCE_BASE_PRODUCT_UI_AUDIT.md` | keep (new, Pass 003) |
| `QLPA_SOURCE_BASE_ISOLATION_MANIFEST.md` | keep (this file, Pass 003) |
| `SOURCE_BASE_STATUS.md` | keep (new, Pass 003) |
| `architecture/foundation-map.md` | keep |
| `architecture/integration-map.md` | keep |
| `architecture/phi-grid-system.md` | keep |
| `architecture/stats-analyzer-architecture.md` | keep |
| `architecture/mode-behavior-map.md` | keep |
| `design/QLPA-CANON.md` | keep |
| `design/QLPA-COLOR-ENERGY-MAP.md` | keep |

### Archived Messaging Docs

| File | Action |
|------|--------|
| `PRE_MVP_STATUS.md` | archived to `docs/archive/messaging-origin/` — remove from docs/ in Pass 004 |
| `QLPA_PHONE_TEST_PASS_129.md` | archived to `docs/archive/messaging-origin/` — remove from docs/ in Pass 004 |
| `QLPA_TODO.md` | reframe — audit and split in Pass 004 |

---

## Root Docs — ALL keep

| File | Action |
|------|--------|
| `README.md` | keep |
| `QLPA-ETHICAL-USE.md` | keep |
| `QLPA-MATRIX-SOURCE.md` | keep |
| `INTEGRATION-GUIDE.md` | keep |
| `PROJECT-ADAPTATION.md` | keep |

---

## Exports — ALL keep

| Path | Action |
|------|--------|
| `exports/qlpa-matrix-source/` | keep |
| `exports/releases/` | keep |

---

## Summary

| Action | Count |
|--------|-------|
| keep | ~170 files |
| archive (pending Pass 004 execution) | 80 files |
| reframe (pending Pass 004 audit) | 19 files |
| replace-with-stub (done, Pass 003) | 1 file (`app/messaging/page.tsx`) |
| docs copied to archive | 2 files |

---

*EarthOS QLPA Matrix Source Code Base · canonical-v1 · Pass 003*
