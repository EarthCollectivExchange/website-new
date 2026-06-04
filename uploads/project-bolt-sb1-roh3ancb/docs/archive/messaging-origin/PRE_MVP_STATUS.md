# EarthOS Messaging — Pre-MVP Status

**Version:** v0.1 pre-MVP  
**Pass:** Pass 140 (Intention Mirror UX Verification and Deduplication)  
**Date:** 2026-05-25  
**Build:** PASS — zero errors, three pre-existing third-party warnings (see Known Warnings)

---

## What EarthOS Messaging Is Right Now

EarthOS Messaging is a local-first, consent-first prototype for protected communication. Messages are designed to stay on the device. Relay, cloud backup, and production-grade key exchange are future layers — they are not active in v0.1. The interface, flows, and privacy model are complete enough for controlled pre-MVP user testing on real devices.

---

## Build Status

| Check | Result |
|-------|--------|
| `npm run build` | PASS |
| TypeScript type check | PASS |
| Static pages generated | 4 routes (/, /messaging, /auth/callback, /_not-found) |
| Bundle size — /messaging | 109 kB page / 352 kB first load JS |
| Lint | Skipped (ESLint config present, skipped in build script) |
| New errors introduced | None |

---

## Completed Core Flows

These flows are implemented, visually complete, and verified on-screen:

1. **Landing page** — loads with EarthOS space backdrop, mode selector, orb navigation, install hint (Advanced+ only)
2. **Messages tab** — conversation list loads with mock data, filter chips, search entry point
3. **Conversation list scroll** — touch-scrollable on mobile with single scroll owner, `overscroll-contain`, safe-area clearance
4. **Conversation view** — opens on tap, displays message bubbles, timestamps, encryption status chips
5. **Conversation view scroll** — single scroll owner, `overscroll-contain`, `WebkitOverflowScrolling: touch`, safe-area bottom padding
6. **New conversation drawer** — type selector, name/intention step, storage/trust step, review step, creates conversation locally
7. **Message composer** — text input, send button, attachment menu, voice recorder panel, file transfer panel, Intention Mirror card
8. **Conversation tools (sovereignty drawer)** — trust level, consent controls, storage mode, intention mirror, reflection mode, local ledger
9. **Message retention panel** — auto-clear timer selector, scope selector, metadata note
10. **Members panel** — participant list with trust badges, invite member dialog
11. **Trust panel** — principles section, trust level descriptions, status row
12. **Privacy drilldown panel** — encryption status, storage mode, consent state, "what this means" copy
13. **Delivery drilldown panel** — storage-mode-aware delivery state, human-friendly labels per mode
14. **Consent drilldown panel** — current decision, trust/type matrix (Advanced+)
15. **Settings tab** — experience, identity, protection, app status (Advanced+), developer tools (Developer), danger zone, about, language selector
16. **Contacts tab** — contact list, search, empty state
17. **Trust tab** — principles, trust levels, current status
18. **Simple / Calm mode** — technical panels hidden, QLPA/AES/relay/ledger/integrity/E2EE terms absent from visible UI, install banner hidden
19. **Advanced mode** — privacy/delivery/consent panels visible, app status section visible, storage/trust controls unlocked
20. **Developer mode** — MVP checklist, release readiness panel, crypto QA panel, relay QA panel, sync QA panel, consent matrix, integrity check all visible
21. **Locale system** — 7 languages (EN, FR, DE, ES, IT, PT, ID), pre-hydration inline script eliminates locale flash, lazy `useState` reads `document.documentElement.dataset.locale` before first paint
22. **French mode (Simple)** — all visible Simple-mode strings are in French, no English surface leakage
23. **EarthID sign-in panel** — email entry, sign-in link flow (Supabase Auth), local mode fallback
24. **Search panel** — local-only search, filter chips, empty/no-results states
25. **Onboarding screen** — welcome flow, local continue, sign-in/create account paths

---

## Local-First Limitations (By Design)

These are intentional constraints of the v0.1 local-first prototype, not bugs:

- **No real relay.** Messages are stored in browser `localStorage` only. "Ready to send" states and relay envelope metadata are created locally but no network delivery occurs. Relay is a future layer.
- **No cloud backup.** "Encrypted backup" storage mode is a placeholder. No external copy is made. All data is on-device only.
- **No production key exchange.** Encryption uses a symmetric AES-GCM-256 key stored in `localStorage`. This is device-local only — not production end-to-end encryption. Future layers add asymmetric key exchange.
- **Clearing browser data removes all messages.** `localStorage` is cleared by browser data reset, private/incognito window close, and some aggressive storage-management policies on mobile.
- **No cross-device sync without sign-in.** Conversation metadata can sync via Supabase after EarthID sign-in, but message content never leaves the device.
- **Invite flow is simulated.** Invited members are generated locally from a handle. No external invitation is sent. Members exist only in local storage.
- **"Relay delivery" steps in delivery timeline are prototype states.** They show the intended future flow, not live delivery.

---

## Prototype-Only Limitations

These are areas that exist in the UI but are not production-ready:

| Area | Status |
|------|--------|
| Voice recording | Records locally, stores in `localStorage` as base64. No relay. |
| File transfer | Encrypts locally, stores in `localStorage`. No upload. Relay not active. |
| Message deletion (recipient) | "Request recipient clears" is logged locally only. Not enforced. |
| Auto-clear timer | Clears from local storage only after timer. No server enforcement. |
| "Encrypted relay" storage mode | Creates relay envelope metadata locally. No actual relay. |
| Net Shield | Foundation and vocabulary defined. Event system wired. UI gates present. Not production-active. |
| EarthID migration | "Migrate EarthID" is a placeholder. Not implemented. |
| Push notifications | Not implemented. |
| Offline indicator | Not implemented beyond local-first storage mode label. |
| Conversation export | Exports local ledger events and messages as JSON. Contains only local data. |

---

## Platform Deployment Incidents

### 2026-05-19 (Pass 95) — iPhone Black Screen "Error - Request ID"

**Symptom:** iPhone 14 (Safari + Brave) showed a black page with only `Error - Request ID: 01KS10FMQQDGGXZ...`. Samsung/desktop had loaded correctly. The app failed before any UI rendered.

**Root cause:** `PreferencesProvider` in `lib/foundation/preferencesContext.tsx` used `useState` lazy initializers that called `loadHumanMode()`, `loadInterfaceDepth()`, `loadAppMode()`, etc. synchronously. These run during the SSR pass, return server-safe defaults. On the client, React rehydrates with values from `localStorage`, creating a **hydration mismatch**. Next.js App Router treats hydration mismatches as hard errors on hosted edge runtimes, producing the "Request ID" error page instead of rendering the app.

**Fix applied:**
- `lib/foundation/preferencesContext.tsx`: all `useState` initializers now use static defaults (matching SSR output). A single `useEffect` runs after first mount to read localStorage and set the real values. This eliminates the SSR/client mismatch entirely.
- `app/error.tsx`: added route-level error boundary (catches errors in `/messaging` and other routes).
- `app/global-error.tsx`: added root layout error boundary (catches errors in `app/layout.tsx` itself).

**Files changed:** `lib/foundation/preferencesContext.tsx`, `app/error.tsx` (new), `app/global-error.tsx` (new).

**Verification:** `npm run build` passes. Same 3 pre-existing warnings. No new errors.

---

### 2026-05-19 20:58:28 UTC — bolt.new 502 Bad Gateway

During publish/preview on bolt.new, the following error appeared:

```
bolt.new | 502: Bad gateway
Cloudflare Ray ID: 9fe604211e30a137
Browser: Working | Cloudflare: Working | bolt.new Host: Error
```

**Diagnosis:** This is a Cloudflare/Bolt infrastructure failure, not an EarthOS Messaging code error.

- The browser and Cloudflare layer were both healthy
- The fault was on the bolt.new origin server side
- No matching local build error, runtime error, or stack trace exists
- The local `npm run build` passes cleanly before and after this incident

**Impact on app code:** None. Zero code changes were made in response to this 502.

**Recommended response if this recurs:**
1. Wait 2–5 minutes and refresh the bolt.new preview
2. Retry the publish action from the bolt.new editor
3. Try from a different browser or network if the problem persists
4. Check bolt.new infrastructure status
5. Do not modify application code — this is a hosting-layer issue

**Note on Ray ID:** Cloudflare Ray ID `9fe604211e30a137` is a Cloudflare diagnostic reference for bolt.new's infrastructure team. It does not contain or expose any tester IP addresses and is safe to record here.

---

## Known Build Warnings

These warnings are pre-existing, do not block the build, and are not introduced by EarthOS code:

1. **`Critical dependency: the request of a dependency is an expression`**
   - Source: `@supabase/realtime-js` → `RealtimeClient.js`
   - Trace: `lib/supabase.ts` → `lib/messaging/authBridge.ts` → `app/messaging/page.tsx`
   - Impact: None. Webpack warning on a dynamic `require()` inside the Supabase SDK. Build succeeds. Functionality unaffected.
   - Resolution: Upstream Supabase fix or switching to a non-realtime client config in a future pass.

2. **`The class duration-[369ms] is ambiguous and matches multiple utilities`**
   - Source: Tailwind CSS arbitrary-value class in animation definitions
   - Impact: None. Tailwind emits this when an arbitrary value matches multiple utility prefixes. Styles compile correctly.
   - Resolution: Escape brackets in template strings (`duration-&lsqb;369ms&rsqb;`) if the warning becomes a lint blocker. Not urgent.

3. **`The class ease-[cubic-bezier(...)] is ambiguous`**
   - Source: Tailwind CSS arbitrary-value class in animation definitions
   - Impact: None. Same category as warning 2.
   - Resolution: Same as warning 2.

---

## Real-Phone Regression Checklist

Items verified across Pass 85–87. Re-verify after each deploy:

### Scroll
- [ ] ConversationView message list scrolls with touch (single scroll owner, no bounce-lock)
- [ ] MobileSheet (panels: Privacy, Delivery, Consent, Journey, Retention, Members, Info, Settings) scrolls independently
- [ ] TrustTab content scrolls past BottomNav clearance (`pb-[80px]`)
- [ ] ContactsTab content scrolls past BottomNav clearance
- [ ] SettingsTab content scrolls past BottomNav clearance
- [ ] SovereigntySettingsPanel scrolls past BottomNav clearance

### Bottom layer
- [ ] BottomNav visible and not obscured by home indicator (iOS/Android)
- [ ] MessageComposer send button reachable above BottomNav
- [ ] FAB (`+` new conversation) positioned above composer bar
- [ ] No UI element clipped by `env(safe-area-inset-bottom)`

### Viewport / fit
- [ ] Landing page fits 360px–430px without horizontal scroll
- [ ] ConversationView header fits without overflow at 360px
- [ ] Onboarding screen fits 360px without overflow
- [ ] Settings scroll area not clipped at 360px

### Mode gates
- [ ] Simple mode: no QLPA, AES, relay envelope, ledger, integrity, E2EE terms visible
- [ ] Simple mode: install banner hidden
- [ ] Simple mode: only 3 filter chips (All / Direct / Projects)
- [ ] Advanced mode: privacy/delivery/consent panels visible
- [ ] Developer mode: QA panels visible

### Locale
- [ ] French Simple mode: all visible strings in French
- [ ] Language selector persists across reload (localStorage + pre-hydration script)
- [ ] No English locale flash on reload when French is active

### Devices
- [ ] Samsung (Android) — Brave
- [ ] iPhone Safari (notch / dynamic island)
- [ ] iPhone Brave
- [ ] Desktop Chrome (1280px+)
- [ ] Desktop Safari

---

## Human-Facing MVP Note

EarthOS Messaging is a local-first, consent-first prototype for protected communication. Messages are designed to stay on your device. The relay, cloud backup, and production key exchange that will power full end-to-end delivery are future layers being built on this foundation. Everything you see today — the consent engine, the trust model, the privacy panels, the intention mirror — represents the real system being assembled. v0.1 is the foundation working as designed.

---

## Next Recommended Development Steps

Listed in priority order for reaching a shippable v0.2:

1. **Production relay layer** — WebSocket or HTTP relay with authenticated delivery. Replace prototype envelope states with real delivery confirmations.
2. **Asymmetric key exchange** — Replace device-local symmetric key with X25519 or similar. Enable true end-to-end encryption between devices.
3. **Cloud backup (user-opted)** — Activate encrypted backup storage mode. Implement Supabase Storage or equivalent with client-side encryption.
4. **Real push notifications** — Web Push API integration for new message alerts.
5. **Cross-device message sync** — Extend Supabase sync from metadata-only to encrypted message bodies (with user consent).
6. **File/voice relay** — Activate sealed relay for file and voice transfers. Replace localStorage base64 with blob storage.
7. **Physical device CI** — Add Playwright or Cypress mobile viewport tests as a smoke suite after every deploy.
8. **SSR locale** — Add cookie-based locale detection for Next.js SSR to eliminate any remaining pre-hydration flash edge cases.
9. **Bundle size reduction** — /messaging first load is 352 kB. Tree-shake unused Supabase realtime modules, lazy-load Developer panels.
10. **ESLint CI gate** — Re-enable lint in build script (`next build` currently skips it). Fix all lint warnings before v0.2 release.

---

## Pass 130 — Physical Phone QA Harness + First-Use Clarity (2026-05-22)

**Goal:** Add an in-app Developer-only Phone QA panel so Michael can test iPhone/Samsung flows with a live on-device checklist, without needing to reference an external document.

### Changes made

| File | Change |
|------|--------|
| `components/messaging/PhoneQAPanel.tsx` | New component: Device runtime summary (vw/vh/vvh/platform/bodyLock/mode/activeSheet), 15-item tap-to-check local checklist, progress bar, reset button. localStorage key `earthos.phoneQa.v1`. No network, no supabase, no telemetry. |
| `components/messaging/SettingsTab.tsx` | `PhoneQAPanel` imported and rendered inside `isDeveloper(viewLevel)` block; `useActiveSheet` wired in to pass `activeSheet` prop |
| `scripts/check-phone-qa-panel.mjs` | New check script — 26 assertions covering storage key, DOM attributes, SSR guard, all 15 checklist items, no-network safety, reset action, Developer-only gate |
| `package.json` | Added `check:phone-qa-panel`; `qlpa:check` expanded to 17 steps before build |
| `docs/QLPA_PHONE_TEST_PASS_129.md` | Added Pass 130 note pointing to in-app panel |
| `docs/PRE_MVP_STATUS.md` | Updated to Pass 130 |
| `docs/QLPA_ARCHITECTURE_MAP.md` | Pass 130 row added to pass history |

### Phone QA Panel

- **Developer-only** — rendered only when `isDeveloper(viewLevel)` is true in SettingsTab
- **Local-only** — all state in `localStorage` under `earthos.phoneQa.v1`; SSR-guarded with `typeof window === 'undefined'` check; safe failure if localStorage unavailable
- **No network** — zero `fetch()`, zero `supabase`, zero `XMLHttpRequest` calls
- **Device runtime** — shows live viewport width/height, visualViewport height (keyboard-aware), platform label, interface mode, active sheet, body lock state
- **15-item checklist** — matches the Pass 129 physical device checklist categories
- **Reset** — "Reset phone QA checklist" clears only `earthos.phoneQa.v1`; never touches messages, settings, or ledger data

---

## Pass 129 — Physical Device Verification + First-User Flow Stabilization (2026-05-22)

**Goal:** Verify Pass 128 persists, audit first-user flow, create physical device test checklist.

### Changes made

| File | Change |
|------|--------|
| `docs/QLPA_PHONE_TEST_PASS_129.md` | Created: 4-device checklist (iPhone Safari, iPhone Brave, Samsung Brave, Samsung Chrome), 30+ items per device, sign-off table, known limitations |
| `scripts/check-phone-test-doc.mjs` | New check script — 26 assertions covering file existence, device sections, checklist items, sign-off, limitations |
| `package.json` | Added `check:phone-test-doc`; `qlpa:check` expanded to 16 steps before build |

---

## Pass 128 — Mobile Sheet Comfort + Action Flow Refinement (2026-05-22)

**Goal:** Reduce MobileSheet height to 82dvh, make scroll diagnostic Developer-only (not NODE_ENV), add drag handle tap-to-close, cap ModeBar dropdown, make Invite member primary CTA, disable Send test message until invite precondition met.

### Changes made

| File | Change |
|------|--------|
| `lib/qlpa/mobileScrollOrchestrator.ts` | `QLPA_SHEET_MAX_H_RATIO = 0.82`; `getSheetMaxHeightStyle()` uses `min(calc(vvh * 0.82), 82dvh)` |
| `components/messaging/ConversationView.tsx` | `MobileSheet` gains `isDeveloper` prop; scroll diagnostic gated on `isDeveloper` (not `NODE_ENV`); drag handle gets `role="button"` + `onClick={onClose}`; all 7 usages pass `isDeveloper={isDeveloper}` |
| `components/messaging/ModeBar.tsx` | Dropdown gets `maxHeight: min(82dvh, calc(100dvh - 80px))`, `overflowY: auto`, `overscrollBehavior: contain` |
| `components/messaging/EmptyConversationJourney.tsx` | Large primary "Invite member" button when `!hasMembers`; `JourneyStep` gains `ctaDisabled`/`ctaDisabledHint` props; Step 2 disabled with `inviteFirstHint` until member invited |
| All 7 locale files | `inviteFirstHint` key added in each language |
| `scripts/check-pass128.mjs` | New check script — 12 assertion categories |
| `package.json` | Added `check:pass128`; `qlpa:check` expanded to 15 steps before build |

---

## Pass 127 — Real Phone Sheet Scroll Orchestrator (2026-05-22)

**Goal:** Create a coherent QLPA scroll system for mobile sheets instead of patching each sheet manually. Sheets on iPhone/Samsung were feeling blocked or frozen because scroll wiring was split across the component and the foundation module with no single QLPA-namespaced contract.

### Changes made

| File | Change |
|------|--------|
| `lib/qlpa/mobileScrollOrchestrator.ts` | New QLPA-namespaced facade over `lib/foundation/scrollOrchestrator`; exports `lockMobileSheetScroll`, `applyVisualViewportHeight`, `getSheetMaxHeightStyle`, `getScrollDiagnostics`, `QLPA_MOBILE_SCROLL_INVARIANTS` |
| `components/messaging/ConversationView.tsx` | `MobileSheet` now imports from `mobileScrollOrchestrator` (no direct foundation import); sheet root style uses `getSheetMaxHeightStyle()` spread; Developer-only scroll diagnostic line added showing scroll owner, viewport height, body lock status |
| `scripts/check-mobile-scroll-orchestrator.mjs` | New check script — 15 assertion categories covering orchestrator exports, foundation lock technique, MobileSheet usage, CSS classes, diagnostic block |
| `package.json` | Added `check:mobile-scroll-orchestrator`; `qlpa:check` now 14 steps before build |
| `docs/QLPA_ARCHITECTURE_MAP.md` | `mobileScrollOrchestrator` added to module table; Pass 127 row added to pass history; Next Recommended Pass updated to 128 |

### What the orchestrator provides

| Export | Purpose |
|--------|---------|
| `lockMobileSheetScroll(reason)` | Calls `lockBodyScroll('mobile-sheet')` + dev-mode invariant warning if scroll owner conflict detected; returns cleanup function |
| `applyVisualViewportHeight()` | Delegates to `attachVisualViewportListeners()`; keeps `--qlpa-vvh` and `--qlpa-sheet-max-h` in sync with keyboard-aware viewport height |
| `getSheetMaxHeightStyle()` | Returns inline style object with `height`, `maxHeight`, `overflow: hidden`, `touchAction: none` — all required for correct sheet sizing and clip |
| `getScrollDiagnostics()` | Returns `{ scrollOwner, viewportHeight, bodyLocked, bodyPosition }` snapshot for Developer diagnostic line |
| `QLPA_MOBILE_SCROLL_INVARIANTS` | 8 invariant string constants used as check script assertions and dev-mode console labels |

---

## Pass 126 — First-User Flow Verification + New Conversation Clarity (2026-05-22)

**Goal:** Clarify first-user orientation, verify new conversation action, add local test message feedback, keep prototype wording honest.

### Changes made

| File | Change |
|------|--------|
| `components/messaging/ConversationList.tsx` | CTA button enlarged (min-width 44px); Simple mode shows "New" label beside Plus icon; dismissible first-run hint added when conversation list is empty (localStorage-guarded, `earthos.messaging.firstNewConversationHintDismissed.v1`) |
| `components/messaging/EmptyConversationJourney.tsx` | Added `testMessageSent` prop; Step 2 marked done when test message already exists; Step 2 CTA hidden after test message sent |
| `components/messaging/ConversationView.tsx` | Added duplicate test message guard (`messages.some(m => m.contentKind === 'generated')` check before allowing send); added inline `testMessageCreated` label below generated message bubble |
| `lib/i18n/locales/en.json` | `relayReady` changed from "Ready to send" → "Ready locally"; `relayBody` updated to prototype-honest wording; `sendFirstBody` updated to "stored on this device"; added `testMessageCreated`, `testMessageAlreadyCreated`, `firstRunHint`, `commandBar.newShort` |
| All 6 other locales (de, fr, es, it, pt, id) | Same 5 key updates as en.json |
| `scripts/check-first-user-flow.mjs` | New check script — 52 assertions across CTA/hint, wording honesty, dedup guard, i18n completeness |
| `package.json` | Added `check:first-user-flow`; `qlpa:check` now 13 steps before build |

### Wording changes

| Key | Before | After |
|-----|--------|-------|
| `conversation.relayReady` | "Ready to send" | "Ready locally" |
| `conversation.relayBody` | "Messages are encrypted and ready to send to others when connected." | "Messages are encrypted on this device. They will reach others when relay is connected." |
| `conversation.sendFirstBody` | "Your first message will be encrypted locally before sending." | "Your first message will be encrypted and stored on this device." |

### New conversation CTA behavior

- Plus icon button beside Search input — visible on all screen sizes
- Simple mode: shows "New" text label beside Plus icon for clarity
- Advanced mode: icon only (space efficient)
- Dismissible first-run hint below filter chips when no conversations exist
- Hint stored in localStorage with browser guard; disappears after first tap on New

### Send test message behavior

- Duplicate guard: if a generated message already exists in the conversation, the button does nothing (no second test message created)
- Local feedback: a small green badge appears below the generated message bubble: "Local test message created — stayed on your device."
- QLPA dual-gate consent continues to apply to all user-typed messages

---

## Pass 125 — New Conversation CTA + First Mission Action Fix (2026-05-22)

**Goal:** Make "New conversation" discoverable on mobile, and fix the silent failure of "Send test message" in the First Mission panel.

### Root cause (Send test message silent failure)

`handleSend` in `ConversationView.tsx` has two trust gates. Gate 1 calls `checkActionPermission('send-message', convSettings.trustLevel)`. New conversations default to `trustLevel: 'unknown'`, but `send-message` requires `'known'`. Gate 1 blocked the action and returned with no visible feedback — only a ledger event.

**Fix:** Generated messages (`meta?.contentKind === 'generated'`) are self-authored, local-only, and carry no social trust requirement. They now bypass Gates 1 and 2 entirely, receiving a synthetic `allowed_local_prototype` consent decision. All other messages continue through the full dual-gate consent flow unchanged.

### Changes made

| File | Change |
|------|--------|
| `components/messaging/ConversationList.tsx` | Added Plus icon button adjacent to the Search input (mobile-visible), triggers same `setDrawerOpen(true)` as the desktop command bar FAB |
| `components/messaging/ConversationView.tsx` | `handleSend`: wrapped Gates 1 and 2 in `if (!isGeneratedMessage)` guard; added `else` branch with `allowed_local_prototype` consent decision for generated messages |
| `scripts/check-first-mission-actions.mjs` | New check script — 10 assertions across CTA placement, onSendTestMessage wiring, generated message bypass, i18n key, and no duplicate mock conversation IDs |
| `package.json` | Added `check:first-mission-actions` to scripts; added to `qlpa:check` pipeline (now 12 steps before build) |

---

## Pass 124 — Mobile Sheet Blur Isolation Fix (2026-05-22)

**Goal:** Sheets must never blur their own content. Background may blur/dim freely. No new features — layer separation and visual clarity only.

**Blur cause found:** `MobileSheet` root div carried `backdrop-blur-2xl` in its Tailwind className (line 1516 before this pass). On iOS/Android, `backdrop-blur` on a containing element creates a compositing layer whose blur filter bleeds into child content depending on the browser's rendering path. The sheet already had a near-opaque `background` in inline style (`hsl(212 48% 9% / 0.94)`), so `backdrop-blur` on the root was redundant for appearance.

**Second issue:** All `MobileSheet` renders were inside the mobile scroll wrapper div (`z-10`), placing them as descendants of a stacking context rather than true siblings of the backdrop (`z-[48]`). On some browsers this can cause the sheet to inherit compositing effects from ancestor elements.

### Changes made

| File | Change |
|------|--------|
| `components/messaging/ConversationView.tsx` | Removed `backdrop-blur-2xl` from `MobileSheet` root className; added `qlpa-sheet-clear`; moved all 7 mobile sheet renders out of scroll wrapper to be direct siblings of the backdrop at root container level |
| `app/globals.css` | Added `.qlpa-sheet-clear` (filter/backdrop-filter/opacity guards) and `.qlpa-sheet-clear *` descendant rule |
| `scripts/check-mobile-sheet-layers.mjs` | New check script — 22 assertions across root class, scroll body, backdrop, z-index, scroll architecture, sibling structure, CSS definitions |
| `package.json` | Added `check:mobile-sheet-layers` to scripts; added to `qlpa:check` pipeline (now 11 steps before build) |

### Final layer stack (mobile)

| Layer | Element | z-index | blur |
|-------|---------|---------|------|
| App content | Main column | z-10 | none |
| Backdrop | `fixed inset-0 z-[48] bg-black/50 backdrop-blur-[2px]` | 48 | `backdrop-blur-[2px]` — allowed here only |
| Sheet | `MobileSheet` root — `fixed inset-x-0 bottom-0 z-[50] qlpa-sheet-clear` | 50 | none — `qlpa-sheet-clear` guards against any inherited blur |
| Sheet body | `.qlpa-sheet-body` | (within sheet) | none |

### Scroll architecture preserved

- `lockBodyScroll('mobile-sheet')` / `unlockBodyScroll('mobile-sheet')` — YES
- `attachVisualViewportListeners()` in MobileSheet — YES
- `data-qlpa-scroll-owner="mobile-sheet"` on sheet body — YES
- `stopPropagation` on touchstart/touchmove in sheet body — YES
- `pointer-events-none` on composer/FAB when `anyPanelOpen` — YES

---

## Pass 123 — Internal Test Diagnostics Layer (2026-05-22)

**Goal:** Add a local-only, Developer-mode-only structured diagnostics layer for founder device testing on iPhone and Samsung. No new features. No regressions.

### New files created

| File | Purpose |
|------|---------|
| `lib/qlpa/releaseContract.ts` | Single source of truth for release stage and 18 capability statuses |
| `lib/qlpa/testDiagnostics.ts` | Pure module: types, record schema, utility functions — no browser APIs |
| `lib/qlpa/localTestLog.ts` | localStorage-backed log with browser guards and safe failure |
| `docs/QLPA_INTERNAL_TEST_DIAGNOSTICS.md` | Architecture documentation |
| `scripts/check-test-diagnostics.mjs` | Pass 123 check script |
| `scripts/check-earthos-bridge.mjs` | Bridge boundary check script |
| `scripts/check-earthcoin-governance.mjs` | Governance boundary check script |
| `scripts/check-system-invariants.mjs` | System invariants check script |
| `scripts/check-release-claims.mjs` | Release claims truthfulness check |
| `scripts/check-docs-release.mjs` | Documentation consistency check |

### Updated files

| File | Change |
|------|--------|
| `lib/qlpa/index.ts` | Added re-exports for `releaseContract`, `testDiagnostics`, `localTestLog` |
| `components/messaging/SettingsTab.tsx` | Added Pass 121 controlled test marker + Pass 123 diagnostics panel (Developer only) |
| All 7 locale files | Added `"release"` and `"diagnostics"` i18n sections |
| `lib/i18n/keys.ts` | Added `release` and `diagnostics` namespace entries |
| `package.json` | Added all 8 check scripts + rebuilt `qlpa:check` 10-step pipeline |

### Check results

| Check | Result |
|-------|--------|
| `npm run validate:i18n` | PASS |
| `npm run check:shield` | PASS |
| `npm run check:envelope` | PASS |
| `npm run check:earthos-bridge` | PASS |
| `npm run check:earthcoin-governance` | PASS |
| `npm run check:system-invariants` | PASS |
| `npm run check:release-claims` | PASS |
| `npm run check:docs-release` | PASS |
| `npm run check:test-diagnostics` | PASS |
| `npm run build` | PASS |

---

## Pre-MVP User Testing Readiness

| Criterion | Status |
|-----------|--------|
| Build passes | YES |
| Core messaging flows complete | YES |
| Simple mode clean (no jargon) | YES |
| French translation complete | YES (Simple mode) |
| Safe area / bottom nav correct | YES |
| Scroll works on mobile | YES |
| Data stays local by default | YES |
| No crashes in core flows | YES (Pass 122 regression audit — all screens pass) |
| In-app controlled test marker | YES — Pass 121 |
| Device diagnostics layer | YES — Pass 123 (Developer mode only) |
| Real relay / production delivery | NO — future layer |
| Production E2EE | NO — future layer |

**Verdict:** Ready for controlled pre-MVP user testing with informed testers who understand the local-first prototype constraints. Internal diagnostics layer active for founder device testing. Not ready for general public release.
