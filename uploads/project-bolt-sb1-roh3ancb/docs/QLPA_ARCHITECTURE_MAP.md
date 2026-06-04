# QLPA Architecture Map

> EarthOS Messaging — communication without extraction.

---

## 1. QLPA Foundation Modules

Each module owns a single concern. No module imports from a peer at the same architectural layer.

| Module | Location | Owns |
|--------|----------|------|
| **scrollOrchestrator** | `lib/foundation/scrollOrchestrator.ts` | Body scroll lock, visual viewport height (`--qlpa-vvh`, `--qlpa-sheet-max-h`), scroll owner registry, depth-counted lock/unlock |
| **mobileScrollOrchestrator** | `lib/qlpa/mobileScrollOrchestrator.ts` | QLPA facade over `scrollOrchestrator`: `lockMobileSheetScroll`, `applyVisualViewportHeight`, `getSheetMaxHeightStyle`, `getScrollDiagnostics`, `QLPA_MOBILE_SCROLL_INVARIANTS` |
| **appOrchestrator** | `lib/qlpa/appOrchestrator.ts` | Canonical app state types (`AppState`, `ActiveView`, `ActiveSheet`, `AppMode`, `DeviceRuntime`), `toQlpaActiveSheet()` adapter, `openSheet/closeSheet` helpers |
| **deviceRuntime** | `lib/qlpa/deviceRuntime.ts` | Feature-based device detection: iOS, Android, Safari, Brave, PWA standalone, touch, reduced motion, safe area, visual viewport height |
| **QLPARuntimeContext** | `lib/qlpa/QLPARuntimeContext.tsx` | Runtime React context + provider: deviceRuntime (live), activeView, activeSheet, activeScrollOwner, selectedConversationId, appMode |
| **consentEngine** | `lib/qlpa/consentEngine.ts` | `ConsentAction` type, `ACTION_MIN_TRUST` map, `checkActionPermission()`, `canPerformAction()`, re-exports `evaluateMessageConsent` / `evaluateRelayConsent` / `evaluateInviteConsent` |
| **trustGraph** | `lib/qlpa/trustGraph.ts` | `TrustLevel` gradient (`blocked` → `self`), `TRUST_LEVEL_META`, `TRUST_LEVELS_ORDERED`, `trustMeetsMinimum()`, `ACCESS_STATE_META` (Protected / Ready / Allowed with Tailwind color classes) |
| **messageLifecycle** | `lib/qlpa/messageLifecycle.ts` | Canonical message state machine (`draft` → `delivered` → `cleared`), `LIFECYCLE_STATE_META`, `LIFECYCLE_TRANSITIONS`, `canTransition()`, `JOURNEY_STEPS` |
| **layoutTokens** | `lib/qlpa/layoutTokens.ts` | CSS variable name constants (`CSS_VARS`), static pixel values (`LAYOUT`), phi spacing scale (`PHI_SPACE`), safe area expressions (`SAFE_AREA`), `SHEET_MAX_H_EXPR`, `Z` hierarchy. All aligned to globals.css |
| **validateLocales** | `lib/i18n/validateLocales.ts` | Pure TypeScript locale validation logic; run by `scripts/validate-i18n.mjs` |

---

## 2. What Each Module Owns (One Rule Each)

- **scrollOrchestrator** — exactly one layer owns vertical scroll at any moment
- **appOrchestrator** — exactly one canonical name for every app-level state dimension
- **deviceRuntime** — detected once at startup, immutable for session lifetime; viewport height kept live
- **QLPARuntimeContext** — single React context delivering all runtime state to the component tree; no SSR risk (all browser APIs run in `useEffect`)
- **consentEngine** — every user-initiated action has a classifiable `ConsentAction` and a minimum required `TrustLevel`; `checkActionPermission` is the live gate
- **trustGraph** — trust is a gradient from `blocked` (no access) to `self` (full access); each level is a strict superset of the level below; `ACCESS_STATE_META` holds canonical Tailwind color classes for pill states
- **messageLifecycle** — every message travels a defined, one-directional state path; no state may be skipped
- **layoutTokens** — every z-index, height, and spacing constant has one source of truth, aligned to CSS variables in globals.css
- **validateLocales** — build fails if any active locale is missing a key present in `en.json`

---

## 3. What UI Components Currently Consume Each Module

| Module | Consuming components / files |
|--------|------------------------------|
| scrollOrchestrator | `ConversationView.tsx` (MobileSheet body lock + vvh tracking) |
| appOrchestrator | `ConversationView.tsx` (`ActiveSheet` type, `toQlpaActiveSheet` called on every overlay open/close) |
| deviceRuntime | `QLPARuntimeContext.tsx` (`detectDeviceRuntime()` on mount, `watchVisualViewportHeight` live) |
| QLPARuntimeContext | `ClientProviders.tsx` (mounted), `ConversationView.tsx` (`setActiveSheet` mirror), `NewConversationDrawer.tsx` (`setActiveSheet` on open/close), `app/messaging/page.tsx` (`setActiveView`, `setSelectedConversationId`) |
| consentEngine | `ConversationView.tsx` (`checkActionPermission('send-message')` as Gate 1, `evaluateMessageConsent` as Gate 2, `ConsentAction` type) |
| trustGraph | `JourneyStatusBar.tsx` (`ACCESS_STATE_META.allowed.colorClass` for positive pill states) |
| messageLifecycle | `MessageJourneyPanel.tsx` (step keys use `MessageLifecycleState`, `LIFECYCLE_STATE_META` imported) |
| layoutTokens | `ConversationView.tsx` (`Z.backdrop`, `Z.sheet`, `SHEET_MAX_H_EXPR`), `BottomNav.tsx` (`CSS_VARS.bottomNavH`), `ConversationList.tsx` (nav height CSS var for scroll padding), `MessageComposer.tsx` (`--qlpa-bottom-bar-h` minHeight) |
| validateLocales | `scripts/validate-i18n.mjs` (build gate), `npm run qlpa:check` |

---

## 4. Active Sheet Bridge Status (Pass 111)

**Status: BRIDGED — both sources in sync, local `activeOverlay` retained.**

Every `openOverlay`, `closeOverlay`, `toggleOverlay`, and `openDrill` call in `ConversationView` now mirrors to `QLPARuntimeContext.activeSheet` via `toQlpaActiveSheet()`.

Conversation switches also clear both `activeOverlay` and `activeSheet`.

The local `activeOverlay` state is intentionally kept for this pass — removing it requires a broader refactor of all the panel render conditions. Scheduled for Pass 112.

---

## 5. Consent Engine Live Gate Status (Pass 111)

**Status: LIVE at `handleSend`.**

`handleSend` now has two sequential consent gates:

1. **Gate 1** — `checkActionPermission('send-message', convSettings.trustLevel)` — trust-level minimum check (canonical QLPA engine). Blocks with `consent_denied` + `message_blocked` ledger events.
2. **Gate 2** — `evaluateMessageConsent(...)` — full sovereignty settings check (existing behavior, unchanged).

Behavior for existing users: identical (no regressions). Users with trust level `unknown` or `blocked` will now be blocked at Gate 1, which matches expected behavior and is equivalent to what the sovereignty check would have produced.

---

## 6. Active View Sync Status (Pass 111)

**Status: LIVE in `app/messaging/page.tsx`.**

- `handleTabChange(tab)` replaces all direct `setActiveTab(tab)` calls at BottomNav sites.
- Maps `BottomNavTab` → `ActiveView`: `messages → conversation-list`, `contacts → contacts`, `trust → trust`, `settings → settings`.
- When a conversation is selected/deselected, `activeView` is updated to `'conversation'` / `'conversation-list'` via a `useEffect`.
- `selectedConversationId` is synced to `QLPARuntimeContext` via the same effect.

---

## 7. Action Classification Map

| Action site | File | ConsentAction |
|-------------|------|---------------|
| `handleSend()` — Gate 1 (live) | `ConversationView.tsx` | `'send-message'` — `checkActionPermission` called |
| `handleSend()` — Gate 2 (live) | `ConversationView.tsx` | `'send-message'` — `evaluateMessageConsent` called |
| `handleInviteMember()` | `ConversationView.tsx` | `'invite-member'` — annotated, not yet gated |
| `handleRetentionChange()` | `ConversationView.tsx` | `'change-retention'` — annotated |
| Export data button | `SovereigntySettingsPanel.tsx` | `'export-data'` — annotated |
| Delete conversation button | `SovereigntySettingsPanel.tsx` | `'clear-data'` — annotated |
| Clear all data button | `SovereigntySettingsPanel.tsx` | `'clear-data'` — annotated |
| `patchConv({ trustLevel })` | `SovereigntySettingsPanel.tsx` | `'change-trust'` — annotated |
| `patchConv({ storageMode: 'encrypted_relay' })` | `SovereigntySettingsPanel.tsx` | `'enable-relay'` — annotated |
| `NewConversationDrawer` open | `NewConversationDrawer.tsx` | `'invite-member'` — `setActiveSheet` wired |
| File upload (future) | `FileTransferPanel.tsx` | `'upload-file'` — future |
| Location share (future) | — | `'share-location'` — future |

---

## 8. Layout Token Alignment

| Token | CSS variable | `LAYOUT` constant | Consumers |
|-------|-------------|-------------------|-----------|
| Bottom nav height | `--qlpa-mobile-nav-h: 4.5rem` (72px) | `LAYOUT.bottomNavH = 72` | `BottomNav.tsx`, `ConversationList.tsx`, `NewConversationDrawer` footer |
| Composer/bar height | `--qlpa-bottom-bar-h: 4.5rem` (72px) | `LAYOUT.composerH = 72` | `MessageComposer.tsx` (minHeight) |
| Touch target | `--qlpa-touch-target: 2.75rem` (44px) | `LAYOUT.touchTarget = 44` | Available, not yet wired to buttons |
| Sheet z-index | — | `Z.sheet = 50` | `ConversationView.tsx` MobileSheet |
| Backdrop z-index | — | `Z.backdrop = 48` | `ConversationView.tsx` backdrop |
| Sheet max height | `--qlpa-sheet-max-h` (runtime) | `SHEET_MAX_H_EXPR` | `ConversationView.tsx` MobileSheet |

---

## 9. Areas Not Yet Connected

| Area | Current state | Next step |
|------|--------------|-----------|
| `activeOverlay` removal | ✅ Done Pass 113 | — |
| `checkActionPermission` at invite site | ✅ Live Pass 113 | — |
| `ACCESS_STATE_META` full coverage | ✅ Done Pass 113 — 6 states with `severity` + `recommendedSheet` | — |
| `JourneyStatusBar` inline HSL | ✅ Removed Pass 113 — all pills use canonical Tailwind | — |
| Shield Foundation on disk | ✅ Done Pass 113 — `abuseTaxonomy`, `shieldPolicy`, `reportingEngine` | — |
| `upload-file` consent gate | TODO comment at `handleFileSend` | Pass 114 |
| `change-retention` consent gate | Annotated only | Pass 114 |
| Shield UI surface (ReportMessageDrawer) | Foundation modules on disk; no UI wiring | Pass 114 |
| Remaining shield i18n taxonomy keys | 8 basic keys present; scam/harassment/etc. not yet added | Pass 114 (before report UI ships) |
| `QLPARuntimeContext.activeView` on desktop | Only mobile tab change syncs it | Pass 114 |
| `CryptoDevPanel` / `RelayQAPanel` | No lifecycle or consent wiring | Future |
| `touch-target` Tailwind utility | `LAYOUT.touchTarget` defined but not applied | Future |

---

## 10. Future Media Type Roadmap

Every future media type **must** pass through the same lifecycle pipeline:

```
Consent → Protection → Local storage → Optional relay → Retention → Audit
```

| Media type | ConsentAction | Lifecycle state path | Status |
|------------|--------------|---------------------|--------|
| **Text** | `'send-message'` | `draft` → `consent_checked` → `encrypted_local` → `stored_local` → `relay_ready` → `sent` → `delivered` → `cleared` | Active — dual gate live |
| **Voice** | `'send-message'` | Same path; `draft` = recording captured | Scaffolded |
| **Photo** | `'send-message'` | Same path | Scaffolded |
| **Video** | `'upload-file'` + `'send-message'` | Same path; relay gated by size | Future |
| **File** | `'upload-file'` | Same path; consent required at relay step | Active scaffold |
| **Location** | `'share-location'` | Requires minimum `trusted` level | Future |
| **Call** | New action type | New lifecycle branch | Future |

---

## 11. Pass History

| Pass | Outcome |
|------|---------|
| **107** | `scrollOrchestrator` created and wired to MobileSheet; CSS variables established |
| **108** | Core QLPA modules created: `appOrchestrator`, `deviceRuntime`, `consentEngine`, `trustGraph`, `messageLifecycle`, `layoutTokens`, `validateLocales` |
| **109** | Layout tokens wired to `ConversationView`; `messageLifecycle` keys in `MessageJourneyPanel`; `trustGraph.ACCESS_STATE_META` backing in `JourneyStatusBar`; `consentEngine` canonical import path; `toQlpaActiveSheet` adapter |
| **110** | `QLPARuntimeContext` created and mounted; `deviceRuntime` live; `BottomNav`/`ConversationList` on CSS var; `NewConversationDrawer` syncs `setActiveSheet`; `ConsentAction` annotations at all action sites; `LAYOUT` aligned to 72px |
| **111** | `activeOverlay` bridged to `QLPARuntimeContext.activeSheet` (all mutations mirrored); `checkActionPermission` live as Gate 1 in `handleSend`; `activeView` synced from tab changes and conversation selection; `JourneyStatusBar` positive pills use `ACCESS_STATE_META.allowed.colorClass`; `MessageComposer` uses `--qlpa-bottom-bar-h`; `toQlpaActiveSheet` confirmed in `appOrchestrator` |
| **112** | Partial — reported as complete but several items did not land on disk. i18n `shield.*` keys added to all 7 locales. Architecture docs updated. |
| **113** | `activeOverlay` fully removed from `ConversationView` — `useActiveSheet()` is sole source of truth; `handleInviteMember` gated with `checkActionPermission('invite-member')`; `trustGraph` extended to 6 `ConversationAccessState` values (added `pending`, `blocked`, `unknown`) each with `severity` + `recommendedSheet`; `JourneyStatusBar` all pills use `ACCESS_STATE_META` — zero inline HSL; Shield Foundation written to disk: `abuseTaxonomy`, `shieldPolicy`, `reportingEngine`; exported from `lib/qlpa/index.ts`; `QLPA_SHIELD_FOUNDATION.md` corrected to accurately reflect implementation vs. not-yet-implemented; `qlpa:check` passes |
| **114** | Pass 114 was regression verification only. `check-shield.mjs` created (88 assertions); wired into `qlpa:check`. Zero regressions found. No files changed beyond adding the check script and updating `package.json`. |
| **115** | Communication Envelope Foundation: `communicationEnvelope.ts` created with 11 `CommunicationKind` values, 4 state types, `QLPACommunicationEnvelope`, `EnvelopeBody`, `EnvelopeAudit`, 3 adapter functions; `consentEngine.ts` extended with `start-call` action and `CommunicationKind → ConsentAction` mapping comment; `shieldPolicy.ts` extended with `getShieldCategoryForEnvelopeKind` and `EnvelopeShieldCategory` (6 categories); `envelope.*` i18n keys added to all 7 locales (11 keys × 7 = 77 new strings); `check-envelope.mjs` created (107 assertions); `qlpa:check` now runs `validate:i18n && check:shield && check:envelope && build` — all pass; `QLPA_COMMUNICATION_ENVELOPE.md` created |
| **121** | In-app controlled test marker: `releaseContract.ts` created (18 capabilities, `CURRENT_RELEASE_STAGE = 'pre-mvp'`, `getCurrentStageLabelKey()`); Settings/About section shows amber "Pre-MVP controlled test" badge + "Use demo or non-sensitive content." in all modes; Advanced/Developer adds 4 capability status lines; 22 `release.*` i18n keys added to all 7 locales; `check-release-claims.mjs` created |
| **122** | Physical device regression audit: code-level review of 16 screen areas across iPhone/Samsung/Desktop device profiles. All screens PASS. No regressions found. No code changes — documentation only. |
| **123** | Internal Test Diagnostics Layer: `testDiagnostics.ts` (pure module, 6 types, 4 helpers), `localTestLog.ts` (localStorage-backed, browser-guarded), Developer-only panel in SettingsTab; 10 `diagnostics.*` i18n keys in all 7 locales; `check-test-diagnostics.mjs` (multi-section audit); 5 additional check scripts created (earthos-bridge, earthcoin-governance, system-invariants, release-claims, docs-release); `qlpa:check` expanded to 10 steps; `QLPA_INTERNAL_TEST_DIAGNOSTICS.md` created |
| **124** | Mobile Sheet Blur Isolation: `backdrop-blur-2xl` removed from `MobileSheet` root (was cause of content blur on iOS/Android); `qlpa-sheet-clear` class added to MobileSheet root; all 7 `MobileSheet` renders moved out of scroll wrapper to be direct siblings of backdrop at root container level; `.qlpa-sheet-clear` + `.qlpa-sheet-clear *` defensive CSS rules added to `globals.css`; `check-mobile-sheet-layers.mjs` created (22 assertions); `qlpa:check` expanded to 11 steps before build |
| **125** | New Conversation CTA + First Mission Action Fix: Plus icon button added adjacent to Search input in `ConversationList` (mobile-visible); `handleSend` in `ConversationView` now bypasses Gates 1 and 2 for generated messages (`contentKind === 'generated'`) — fixes silent failure of "Send test message" in First Mission panel; `check-first-mission-actions.mjs` created; `qlpa:check` expanded to 12 steps before build |
| **126** | First-user flow clarified: CTA button enlarged with "New" label in Simple mode; dismissible first-run hint (localStorage-guarded); duplicate test message guard added; inline generated message confirmation badge; `relayReady`/`relayBody`/`sendFirstBody` i18n updated to prototype-honest wording in all 7 locales; `check-first-user-flow.mjs` (52 assertions); `qlpa:check` expanded to 13 steps |
| **127** | Real Phone Sheet Scroll Orchestrator: `lib/qlpa/mobileScrollOrchestrator.ts` created as QLPA facade over `lib/foundation/scrollOrchestrator`; exports `lockMobileSheetScroll`, `applyVisualViewportHeight`, `getSheetMaxHeightStyle`, `getScrollDiagnostics`, `QLPA_MOBILE_SCROLL_INVARIANTS`; `MobileSheet` in `ConversationView` migrated to orchestrator facade (no direct foundation import); sheet root uses `getSheetMaxHeightStyle()` spread; Developer-only scroll diagnostic line added to `MobileSheet` (scroll owner, viewport height, body lock status); `check-mobile-scroll-orchestrator.mjs` created (15 assertion categories); `qlpa:check` expanded to 14 steps |
| **128** | Mobile Sheet Comfort + Action Flow Refinement: `QLPA_SHEET_MAX_H_RATIO = 0.82` + `82dvh` cap in `getSheetMaxHeightStyle()`; `MobileSheet.isDeveloper` prop gates scroll diagnostic (not `NODE_ENV`); drag handle tap-to-close; `ModeBar` dropdown `maxHeight` + `overflowY` scroll cap; `EmptyConversationJourney` primary "Invite member" CTA + `JourneyStep.ctaDisabled/ctaDisabledHint` props + Step 2 disabled until member invited; `inviteFirstHint` added to all 7 locales; `check-pass128.mjs` created; `qlpa:check` 15 steps |
| **129** | Physical Device Verification: `docs/QLPA_PHONE_TEST_PASS_129.md` created (4-device checklist, 30+ items each, sign-off table, known limitations); `check-phone-test-doc.mjs` created (26 assertions); `qlpa:check` 16 steps |
| **130** | Physical Phone QA Harness: `components/messaging/PhoneQAPanel.tsx` created — Developer-only, local-only (localStorage `earthos.phoneQa.v1`), no network; shows live device runtime (vw/vh/vvh/platform/bodyLock/mode/activeSheet) + 15-item tap-to-check local checklist + reset button; wired into `SettingsTab` inside `isDeveloper` block; `check-phone-qa-panel.mjs` created (26 assertions); `qlpa:check` 17 steps |
| **131** | Phone QA Result Capture + Test Session Export: `PhoneQAPanel` extended with session metadata (deviceLabel, testRound, testerNote, lastUpdated), 3-state checklist (untested/pass/issue — tap cycles), per-item issue notes (textarea shown only when status is 'issue'), "Copy QA report" button with `navigator.clipboard.writeText` and textarea fallback for unavailable clipboard, dual reset ("Reset checklist statuses" / "Reset all Phone QA data"); legacy boolean check migration handled; `phoneQa.*` i18n keys added to all 7 locales; `check-phone-qa-panel.mjs` expanded with Pass 131 assertions (3-state, metadata, export, fallback, dual reset) |
| **132** | Phone QA Guided Test Runner: `PhoneQAPanel` expanded with 10 collapsible grouped sections (Launch & Landing, Conversation List, Create Conversation, Empty Conversation Journey, Message Composer, Status Pills, Mobile Sheets, Settings, Release Marker, Export / Reset) with per-section `x/y passed` counters; "Next untested" button scrolls to first untested item (shows "All items have been reviewed." when all done); focus line shows next section+item or issues count or all-pass state; device presets (iPhone Safari, iPhone Brave, Samsung Brave, Desktop Preview) fill Device label without touching statuses; grouped report includes sections, app mode, total counts (Pass/Issue/Untested); Pass 132 `phoneQa.*` i18n keys added to all 7 locales; `check-phone-qa-panel.mjs` expanded to 97 assertions |
| **134** | Physical Phone Verification After First-Use Flow Alignment: `PhoneQAPanel` extended with Pass 134 focus block (6 display-only verification items for on-device visual checks), "Reset first-run hint" button (`localStorage.removeItem('earthos.firstConversationCreated.v1')` — touches no other state), Go test flow 8-item mini checklist reusing 3-state mechanism (Open Root/Messaging orbs, Confirm New button, Create Direct conv, Confirm Empty Journey, Invite member, Confirm send activates, Send test msg); `FIRST_RUN_HINT_KEY` constant centralises the localStorage key; 18 new `phoneQa.*` i18n keys added to all 7 locales; `check-pass134-phone-verification.mjs` created (55+ assertions covering reset safety, focus items, go-test-flow, no-network, Developer gate, i18n); `qlpa:check` expanded to 19 steps |
| **133** | First-Use Flow and Golden Ratio Layout Alignment: `layoutTokens.ts` extended with `QLPA_SPACE_8/13/21/34/55/89`, `QLPA_PANEL_MAX_H_RATIO = 0.82`, `QLPA_ROOT_CARD_MAX_H_RATIO = 0.77`, `QLPA_ROOT_CARD_WIDTH_RATIO = 0.90`; `BottomSheet` in `app/page.tsx` converted from bottom-anchored sheet to centered compact Φ-card (`max-width: 90vw`, `max-height: 77dvh`, centered via `top: 50% / translateY(-50%)`, opacity fade); first-run hint in `ConversationList` now uses `earthos.messaging.firstNewConversationHintDismissed.v1` localStorage flag (no longer gated on `conversations.length === 0` which was always false with demo data); `EmptyConversationJourney` Step 1 duplicate Invite CTA removed — primary button above card is the sole invite entry point; `PhoneQAPanel` checklist wording updated ("New button visible", "Empty journey shows single Invite button"); `check-first-use-layout.mjs` created (18 assertions); `qlpa:check` expanded to 18 steps |
| **135 (a)** | Communication Capability Matrix Foundation: `communicationCapabilityMatrix.ts` created with 15 `CapabilityKind` values, 19-field `CapabilityPolicy` interface, full `CAPABILITY_MATRIX` record, 9 pure helper functions (`getCapabilityPolicy`, `canCapabilityRunInTrust`, `requiresExplicitConsent`, `requiresRecordingNotice`, `canCapabilityCrossEarthOSBridge`, `canCapabilityCrossEarthCoinBoundary`, `canCapabilityEnterGovernance`, `getCapabilityShieldCategory`, `getCapabilityReleaseStatus`), `ALL_CAPABILITY_KINDS` typed list; safety rules encoded (unknown trust → text/event/emergency/system only; calls require trusted + recording consent + ephemeral + not-exportable; location requires trusted + ephemeral + not-exportable; EarthCoin/governance records only from designated signal kinds; bridge-gated for public/governance/EarthCoin); no React or browser imports; integrated with `trustGraph`, `shieldPolicy`, `releaseContract`; exported from `lib/qlpa/index.ts`; `capability.*` i18n keys in all 7 locales (15 keys × 7 = 105 strings); `check-communication-capability-matrix.mjs` created; `qlpa:check` expanded to 20 steps; `QLPA_COMMUNICATION_CAPABILITY_MATRIX.md` created |
| **135 (b)** | Language Harmony / Zero Negative Blueprint Foundation: `languageBlueprint.ts` created with 11 `LanguageDimension` values, 5 `LanguageResultLevel` values, Fibonacci-aligned score thresholds (0–21/22–34/35–55/56–89/90–100), QLPA dimension weights (safety=34, consent=21, pressure=13, clarity=13, care=8, sovereignty=8, context=3, total=100), `SHIELD_ESCALATION_DIMENSIONS` (childSafety/sexualViolence), 4 pure helper functions; `languageHarmonyPolicy.ts` with 5 policy modes (off/soft/clear/strict/guardian), `HARMONY_MODE_POLICIES`, 5 pure policy helpers (`getLanguageHarmonyModePolicy`, `shouldReflectLanguage`, `shouldHoldForReview`, `shouldBlockForShield`, `canSendOriginal` — always true except Shield block); `intentionMirror.ts` with `analyzeTextForIntentionMirror` — local pattern-only analysis, no network, emergency bypass, Shield escalation for childSafety/sexualViolence; `languageSuggestionEngine.ts` with 7 trigger patterns (you never/always/must, do this now, if you cared, you failed, that's wrong) → i18n suggestion keys; no auto-rewrite, suggestions optional; all 4 modules exported from `lib/qlpa/index.ts`; `languageHarmony.*` i18n keys in all 7 locales (20 keys × 7 = 140 strings); `check-language-harmony.mjs` created (17 assertion groups); `qlpa:check` expanded to 21 steps; `QLPA_LANGUAGE_HARMONY_BLUEPRINT.md` created |
| **136** | Language Taxonomy Vocabulary Registry: `languageTaxonomy.ts` extended with 5 new registry-level pure helpers (`normalizeForTaxonomy`, `findTaxonomyMatches`, `getCategoryMatches`, `hasCriticalSafetyMatch`, `classifyTaxonomySeverity`); `languageSuggestionEngine.ts` extended with 8 new suggestion rules (profanity+frustration, direct attack, pressure/blame, urgency) mapping to 4 new i18n suggestion keys (`suggestionFrustratedMoment`, `suggestionUnderstandEachOther`, `suggestionLookTogether`, `suggestionPrioritizeWhenPossible`); `intentionMirror.ts` updated to use `findTaxonomyMatches` (normalized text path) and merge suggestion-engine keys alongside reason-code-driven keys; 6 new i18n keys per locale × 7 locales = 42 new strings (4 suggestion keys + 2 new reason keys: blameLanguage, nonConsensualSafety); `check-language-harmony.mjs` expanded to 23 assertion groups with Pass 136 static behavior assertions (profanity sendable, emotion not blocked, direct-attack escalates to caution, threat escalates above profanity, Shield critical categories force escalation, new helpers exported, suggestion engine integration); `QLPA_LANGUAGE_HARMONY_BLUEPRINT.md` updated with Vocabulary Taxonomy v1 section |
| **137** | Local Test Message Flow + Send Gate Clarity: `create-local-test-message` added to `ConsentAction` union in `consentEngine.ts` with `ACTION_MIN_TRUST = 'self'` (always allowed, local-only, no relay, no recipient required); `EmptyConversationJourney` Step 2 updated — CTA renamed to "Create local test message", body text clarifies device-local-only, `ctaDisabled` removed (always enabled even with unknown trust), `inviteFirstHint` removed; `SendGateNotice` component added to `ConversationView` — shows above the composer when `trustLevel === 'unknown'`, explains real sending requires a trusted recipient, includes "Invite member" shortcut button, does not hide composer or erase draft; generated message bypass path in `handleSend` unchanged — `contentKind: 'generated'` still skips trust gates and relay evaluation; duplicate guard (`messages.some(m => m.contentKind === 'generated')`) still in place; 7 new i18n keys × 7 locales = 49 new strings (`emptyJourney.createLocalTestMessage`, `emptyJourney.createLocalTestMessageBody`, `emptyJourney.localTestCreated`, `sendGate.trustRequiredTitle`, `sendGate.trustRequiredBody`, `sendGate.inviteMember`, `diagnostics.clearLocalTestConversations`); `check-local-test-message-flow.mjs` created (10 assertion groups); `qlpa:check` expanded to 22 steps |
| **138** | Multilingual Language Adapter Foundation: `languageScriptDetection.ts` created — pure Unicode range-based script detection (latin/arabic/han/kana/mixed/unknown), 7 exported functions, zero network; `unicodeLanguageNormalize.ts` created — `normalizeLanguageInput()` with NFKC + Arabic diacritics/tatweel removal + full-width Latin folding + zero-width removal + whitespace collapse, 4 NormalizeOptions flags; `multilingualTaxonomy.ts` created — `SupportedAnalysisLanguage` (11 values: en/fr/de/es/it/pt/id/ar/zh/ja/multilingual), `LanguageTaxonomyAdapter` interface, starter adapters for ar (9 entries), zh (10 entries), ja (11 entries), multilingual fallback (merged all non-English), Latin stubs for en/fr/de/es/it/pt/id, `getLanguageAdapter()`, `inferAdapterFromText()`, `ADAPTER_REGISTRY`; Shield-escalation categories (childSafety/nonConsensualSexual) structurally wired in all non-English adapters — empty phrase arrays in foundation pass, no explicit harmful examples; `languageTaxonomy.ts` extended with `findMultilingualTaxonomyMatches()` — routes through adapter + English safety-net merge, deduplicates by term; `intentionMirror.ts` extended with optional `languageHint` on `IntentionMirrorContext`, analysis routes through multilingual path when set; `lib/qlpa/index.ts` exports all 3 new modules; 9 `languageHarmony.multilingual.*` i18n keys × 7 locales = 63 new strings; `check-multilingual-language-adapters.mjs` created (11 assertion groups); `qlpa:check` expanded to 23 steps; `QLPA_MULTILINGUAL_LANGUAGE_ROOT.md` created |
| **140** | Intention Mirror UX Verification and Deduplication: Audited parallel mirror systems — legacy `checkIntentionMirror` in `lib/messaging/intentionMirror.ts` was the only active composer mirror (simple regex); QLPA `analyzeTextForIntentionMirror` in `lib/qlpa/intentionMirror.ts` was complete library with no UI wiring. Eliminated duplication. Rewrote `MessageComposer` to use QLPA analysis engine as canonical (debounced 600ms, draft text never stored or sent to any server). Rewrote `IntentionMirrorCard` to consume `IntentionMirrorAnalysis`: level-based color palette, reason code labels (max 3), optional suggestions (max 2), local-only badge, `Send as-is` (user_overrode — subject to consent gate), `Soften` (user-triggered draft clear only), `Dismiss` (hides panel for current draft, no send). Added `languageHarmonyMode` to `PreferencesContext`, `appConstants` (key `earthos.language_harmony_mode`), and `SettingsTab` selector. Removed `mirrorEnabled`/`mirrorConfig` props from `MessageComposer`; `ConversationView` updated accordingly with `conversationContext` prop wired to conversation type. Added 11 settings i18n keys × 7 locales = 77 new strings. `SuggestionKey` type extended with 4 Pass 136 keys. `check-intention-mirror-composer.mjs` created (136 assertions: no duplicate panel, QLPA canonical, no draft persistence, no network, mode behavior, test phrase coverage, i18n coverage, consent gate integrity). `qlpa:check` expanded to 25 steps before build. Next: Pass 141 — Media, Voice, and Call UX Planning. |

---

## 12. Active Sheet Status (Pass 113)

**Status: COMPLETE — `activeOverlay` local state fully removed. `useActiveSheet()` is sole source of truth.**

`ConversationView` reads and writes `activeSheet` exclusively via `useActiveSheet()`. The `ActiveOverlay` import, `toQlpaActiveSheet`, and `useQLPARuntime` (direct) imports are all removed. All panel render conditions use `activeSheet === 'X'` directly. The conversation-switch `useEffect` calls `setActiveSheet(null)` once.

## 13. Next Recommended Pass (141 — Media, Voice, and Call UX Planning)

Pass 140 established the Intention Mirror as a live, canonical single-panel analysis system in `MessageComposer`. The QLPA analysis engine is fully wired: `languageHarmonyMode` preference drives 5 modes; draft text is local-only; `Send as-is` and `Soften` are fully user-controlled; 136 check assertions guard the invariants.

**Pass 141 candidates:**

1. **Media / Voice UX Planning** — map out the voice note composer, photo attachment, and file send flows against the `communicationCapabilityMatrix` policies
2. **Call UX Planning** — define what a QLPA-aligned call consent flow looks like (recording notice, trust minimum, ephemeral-by-default)
3. **Latin-script adapter vocabulary** — add French/German/Spanish/Portuguese/Indonesian locale-specific vocabulary entries to the stub adapters created in Pass 138
4. **Capability matrix × composer buttons** — apply `canCapabilityRunInTrust` to gate attachment buttons; apply `requiresRecordingConsent` to voice note record button
5. **SovereigntySettingsPanel harmony mode** — expose the `languageHarmonyMode` selector also in the per-conversation sovereignty panel (currently only in global Settings)

---

## 13. North Star

> **EarthOS Messaging — communication without extraction.**

Every architectural decision is measured against one question:
*Does this give users more sovereignty over their communication, or less?*

- **Consent before contact** — no message reaches a recipient without consent validation
- **Local first** — data lives on device by default; relay is opt-in, not default
- **Transparent lifecycle** — every message has a visible, inspectable journey
- **Minimal metadata** — no tracking, no analytics, no behavioral profiling
- **User-controlled retention** — messages clear on the user's schedule, not the platform's
- **Open architecture** — the QLPA foundation is portable and auditable
