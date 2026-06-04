<!--
  QLPA Source Base Extraction Plan
  This document was created as part of the first-pass audit of the EarthOS QLPA Matrix Source Code Base
  (duplicated from EarthOS Messaging project). No files have been deleted yet.
  Status: extraction-planning
-->

# QLPA Source Base Extraction Plan

**Project:** EarthOS QLPA Matrix Source Code Base — Canonical v1
**Status:** extraction-planning
**Date:** 2026-05-24
**This is a duplicated project.** The original active EarthOS Messaging app is maintained separately. No deletions from the original were performed. This duplicate is now the reusable foundation source.

---

## Purpose

Transform this duplicated EarthOS Messaging project into a clean, reusable EarthOS QLPA Matrix Source Code Base. The goal is NOT to maintain a finished messaging product here — it is to preserve and expose the QLPA foundation layers so future EarthOS-aligned applications can be bootstrapped from them cleanly.

---

## 1. PRESERVE LIST

These files constitute the QLPA foundation and must be retained in full.

### Core Foundation — `lib/foundation/` (11 files)
- `index.ts`
- `sourceIdentity.ts`
- `appConstants.ts`
- `appCapabilities.ts`
- `appLayers.ts`
- `appReadiness.ts`
- `featureFlags.ts`
- `modes.ts`
- `preferencesContext.tsx`
- `qlpaVisual.ts`
- `scrollOrchestrator.ts`

### QLPA Core — `lib/qlpa/` (38 files including new)
- `index.ts`
- `sourceBaseIdentity.ts` (new — created in this pass)
- `qlpaPrinciples.ts`
- `terminology.ts`
- `qlpaGuards.ts`
- `tokens.ts`
- `layoutTokens.ts`
- `netShield.ts`, `netShieldEvents.ts`, `netShieldPolicies.ts`, `netShieldReadiness.ts`, `netShieldTypes.ts`, `netShieldVocabulary.ts`
- `languageProtocol.ts`
- `languageBlueprint.ts`, `languageHarmonyPolicy.ts`, `languageTaxonomy.ts`, `languageSuggestionEngine.ts`, `languageScriptDetection.ts`, `unicodeLanguageNormalize.ts`
- `multilingualTaxonomy.ts`
- `appOrchestrator.ts`
- `deviceRuntime.ts`
- `consentEngine.ts`
- `trustGraph.ts`
- `messageLifecycle.ts`
- `abuseTaxonomy.ts`
- `shieldPolicy.ts`
- `communicationEnvelope.ts`
- `communicationCapabilityMatrix.ts`
- `releaseContract.ts`
- `reportingEngine.ts`
- `intentionMirror.ts`, `intentionMirrorTypes.ts`
- `testDiagnostics.ts`, `localTestLog.ts`
- `QLPARuntimeContext.tsx`

### Design System — `lib/design/` (6 files)
- `index.ts`
- `phiTokens.ts`
- `fibonacciScale.ts`
- `layoutRhythm.ts`
- `touchTargets.ts`
- `zIndex.ts`

### Internationalization — `lib/i18n/` (16 files)
- `index.ts`, `context.tsx`, `useT.ts`, `dictionary.ts`, `keys.ts`
- `localeTypes.ts`, `localeRegistry.ts`, `validateLocales.ts`, `missingKeyPolicy.ts`
- `locales/en.json`, `locales/fr.json`, `locales/de.json`, `locales/es.json`
- `locales/it.json`, `locales/pt.json`, `locales/id.json`

### Privacy — `lib/privacy/` (5 files)
- `index.ts`, `dataClasses.ts`, `localOnlyRules.ts`, `retentionRules.ts`, `contentBoundaries.ts`

### Security — `lib/security/` (5 files)
- `index.ts`, `trustLevels.ts`, `deliveryStates.ts`, `protectionStates.ts`, `clearScopes.ts`

### Stats — `lib/stats/` (10 files)
- `index.ts`, `statsTypes.ts`, `statsModes.ts`, `statsStore.ts`, `statsPrivacy.ts`
- `statsEvents.ts`, `statsExport.ts`, `statsSelectors.ts`, `lightAnalyzer.ts`, `completeAnalyzer.ts`

### Utilities
- `lib/utils.ts`
- `lib/supabase.ts`
- `hooks/use-toast.ts`

### Foundation Components — `components/foundation/` (4 files)
- `AdvancedOnly.tsx`, `DeveloperOnly.tsx`, `FoundationStatusBadge.tsx`, `PreferenceBoundary.tsx`

### Stats Components — `components/stats/` (4 files)
- `StatsModeBadge.tsx`, `StatsPlaceholderPanel.tsx`, `StatsPrivacyNotice.tsx`, `StatsSummaryCard.tsx`

### UI Kit — `components/ui/` (all 51 shadcn/ui files)
Retain as-is — they are framework primitives, not messaging-specific.

### Providers
- `components/ClientProviders.tsx`

### QLPA Check Scripts — `scripts/` (foundation-facing)
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
- `check-source-base-extraction-plan.mjs` (new — created in this pass)
- `export-qlpa-matrix-source.mjs`
- `validate-i18n.mjs`

### Documentation — `docs/`
- `QLPA_ARCHITECTURE_MAP.md`
- `QLPA_SHIELD_FOUNDATION.md`
- `QLPA_COMMUNICATION_ENVELOPE.md`
- `QLPA_LANGUAGE_HARMONY_BLUEPRINT.md`
- `QLPA_MULTILINGUAL_LANGUAGE_ROOT.md`
- `QLPA_COMMUNICATION_CAPABILITY_MATRIX.md`
- `QLPA_MODE_PROTOCOL.md`
- `QLPA_INTERNAL_TEST_DIAGNOSTICS.md`
- `QLPA_TODO.md`
- `QLPA_SOURCE_BASE_EXTRACTION_PLAN.md` (this file)
- `architecture/foundation-map.md`
- `architecture/integration-map.md`
- `architecture/phi-grid-system.md`
- `architecture/stats-analyzer-architecture.md`
- `architecture/mode-behavior-map.md`
- `design/QLPA-CANON.md`
- `design/QLPA-COLOR-ENERGY-MAP.md`

### Root-Level Docs
- `QLPA-ETHICAL-USE.md`
- `QLPA-MATRIX-SOURCE.md`
- `INTEGRATION-GUIDE.md`
- `PROJECT-ADAPTATION.md`

### Exports
- `exports/qlpa-matrix-source/` (entire directory — portable canonical export)
- `exports/releases/` (release artifacts)

### Config Files (portable foundation)
- `tsconfig.json`
- `package.json` (after messaging scripts are isolated in pass 2)
- `tailwind.config.ts` (after messaging-specific theme tokens are separated)
- `postcss.config.js`
- `next.config.js`
- `next-env.d.ts`
- `components.json`
- `.env` (local dev only — never committed secrets)
- `.gitignore`
- `.eslintrc.json`

### App Shell (reframe candidates, keep for now)
- `app/layout.tsx`
- `app/page.tsx`
- `app/error.tsx`
- `app/global-error.tsx`
- `app/globals.css`
- `components/EarthOSLogo.tsx`
- `components/NatureAppShell.tsx`
- `components/NatureBackdrop.tsx`

---

## 2. REMOVE / ISOLATE LIST

These files are specific to EarthOS Messaging. They should NOT be removed in pass 1. In pass 2, they will be moved to an isolated `_messaging/` subtree or deleted entirely to expose the clean foundation.

**DO NOT DELETE FROM THE ACTIVE EARTHOS MESSAGING APP.** This duplicate is the only copy being modified.

### Messaging Library — `lib/messaging/` (22 files)
All 22 files: types, mockData, actions, consent, safety, trust, crypto, files, relay, storage, sync, hooks, modes, identity, earthId, intentionMirror, ledger, searchIndex, qlpaSettings, authBridge, localPersistence, preferencesContext

### Messaging Components — `components/messaging/` (53 files)
All 53 files — entire AppDashboard, ConversationList, MessageBubble family, FileTransfer family, PhiShell, OnboardingScreen, QA panels, dev panels, etc.

### Messaging Routes — `app/messaging/` (2 files)
- `app/messaging/page.tsx`
- `app/messaging/layout.tsx`

### Auth Route (messaging-specific implementation)
- `app/auth/callback/page.tsx`

### Messaging-Specific Check Scripts (15 files)
- `check-earthos-bridge.mjs`
- `check-earthcoin-governance.mjs`
- `check-mobile-sheet-layers.mjs`
- `check-first-mission-actions.mjs`
- `check-first-user-flow.mjs`
- `check-mobile-scroll-orchestrator.mjs`
- `check-pass128.mjs`
- `check-phone-test-doc.mjs`
- `check-phone-qa-panel.mjs`
- `check-first-use-layout.mjs`
- `check-pass134-phone-verification.mjs`
- `check-communication-capability-matrix.mjs`
- `check-language-harmony.mjs`
- `check-local-test-message-flow.mjs`
- `check-multilingual-language-adapters.mjs`

### Messaging-Specific Docs
- `docs/PRE_MVP_STATUS.md`
- `docs/QLPA_PHONE_TEST_PASS_129.md`

---

## 3. RENAME / REFRAME LIST

Files that exist in both the foundation and messaging contexts that need adaptation rather than deletion.

| File | Current State | Recommended Action |
|------|--------------|-------------------|
| `app/page.tsx` | EarthOS Messaging orb landing page | Reframe as QLPA Source Base demo/launcher in pass 2 |
| `app/layout.tsx` | Root layout with messaging setup | Strip messaging-specific metadata; keep QLPA providers |
| `app/globals.css` | Mixed foundation + messaging styles | Split: keep foundation tokens, move messaging CSS |
| `tailwind.config.ts` | Mixed theme (foundation + messaging) | Isolate messaging color names in pass 2 |
| `package.json` scripts | Mixed foundation + messaging checks | In pass 2: restructure `qlpa:check` to be foundation-only |
| `components/EarthOSLogo.tsx` | EarthOS identity mark | Retain as EarthOS brand asset, not Messaging-specific |
| `components/NatureAppShell.tsx` | Nature-themed shell | Retain as visual layer; remove messaging route hard-wires |
| `components/NatureBackdrop.tsx` | Nature backdrop | Retain — purely visual, not messaging-specific |
| `lib/messaging/preferencesContext.tsx` | Re-exports from `lib/foundation/` | Correct bridge pattern; retain but document as messaging-only |

---

## 4. RISKS

1. **Script interdependencies:** Messaging-specific check scripts reference both `lib/messaging/` and `lib/qlpa/` types. Removing `lib/messaging/` before removing the scripts will break the `qlpa:check` pipeline. Scripts must be removed first or the `qlpa:check` command must be restructured before files are deleted.

2. **`app/page.tsx` imports messaging route:** The root landing page currently hard-links to `/messaging`. Removing `app/messaging/` before updating `app/page.tsx` will produce broken navigation.

3. **`app/layout.tsx` may import messaging providers:** Must audit before removing to avoid provider chain breakage.

4. **`lib/qlpa/messageLifecycle.ts` name collision:** Despite being in `lib/qlpa/`, this file is conceptually relevant to messaging. It defines the QLPA-level message state machine (not the Messaging app's message model). It stays in PRESERVE but should have its scope documented clearly.

5. **Translation keys:** Some keys in `lib/i18n/locales/*.json` may be messaging-specific (e.g., "New conversation", "Send message"). These should be audited in pass 2 and messaging-specific keys moved to a messaging locale overlay.

6. **`exports/qlpa-matrix-source/`** already exists as a clean copy. Any pass 2 changes to the main `lib/` must be mirrored there if the export script is not re-run.

---

## 5. NEXT RECOMMENDED CLEANUP PASS (Pass 2)

### Sequence (order matters due to dependencies)

1. **Restructure `package.json` `qlpa:check`** to only include foundation-facing scripts. Create a separate `messaging:check` for messaging scripts. This is safe to do before any file removal.

2. **Update `app/page.tsx`** to remove hard-link to `/messaging` and replace with a QLPA Source Base index page.

3. **Audit and update `app/layout.tsx`** — remove messaging-specific metadata, keep QLPA providers.

4. **Split `app/globals.css`** — extract messaging-specific component styles.

5. **Move `lib/messaging/`** to `_archive/lib/messaging/` (do not delete yet — soft isolation).

6. **Move `components/messaging/`** to `_archive/components/messaging/`.

7. **Move `app/messaging/`** to `_archive/app/messaging/`.

8. **Move messaging-specific scripts** to `_archive/scripts/`.

9. **Move messaging-specific docs** to `_archive/docs/`.

10. **Run `npm run qlpa:check`** — all checks should pass with only foundation scripts.

11. **Run `npm run build`** — build should succeed with no messaging imports.

12. **Once clean:** Delete `_archive/` if no longer needed.

13. **Update `exports/qlpa-matrix-source/`** by re-running `export:qlpa-matrix-source`.

14. **Audit i18n locale keys** for messaging-specific strings; move to messaging-only overlay.

15. **Tag the repo** as `qlpa-source-base-canonical-v1`.

---

## 6. COMPLIANCE NOTES

- This document does NOT instruct deletion from the active EarthOS Messaging app. This is a duplicate.
- All QLPA principles, shield policies, language harmony, and consent engines are preserved.
- No crypto system, wallet, or financial authority is being built here.
- No medical, legal, or financial authority use is permitted (see `lib/qlpa/sourceBaseIdentity.ts`).
- All adaptation targets are EarthOS-aligned applications only.
