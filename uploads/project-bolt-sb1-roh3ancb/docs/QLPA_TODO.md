# QLPA To Do List — EarthOS Messaging

## Landing Page
- Add magnetic / gravity orb movement. *(Done — useMagneticAnchor hook)*
- Orbs stay anchored to their Phi positions. *(Done)*
- Mouse movement or phone tilt can gently push orbs away from anchor points. *(Desktop done; phone tilt deferred)*
- Orbs automatically return to anchor positions. *(Done — 369ms ease return)*
- Motion must be subtle, calm, and not affect readability. *(Done)*
- Orb 1 currently has no meaningful click action. *(Fixed — opens Root/Identity panel)*
- Orb 2 opens messaging. *(Done + prefetch added)*
- Orb 3 opens trust / install / local-first panel. *(Done)*
- Refine orb look later; current look is acceptable but not final.
- Phone tilt gyroscope support — deferred.

## Messaging UI
- Fix white background on the "Cause" option button. *(Fixed — all type buttons use dark glass)*
- Reduce repeated logos. *(Dashboard logo removed)*
- Reduce noise in the left panel. *(Trust banner calmed)*
- Make warning/info states calm unless actual error. *(Done)*
- Improve New Conversation option panel grid. *(Fixed — ConversationTypeButton component)*
- Keep all cards and buttons inside coherent Phi grid. *(Done)*

## QLPA 360 Refinement Pass
- Reduce Orb 2 → messaging entry delay from ~3.6s to visually under 1s. *(router.prefetch + eager image load added)*
- Fix Earth Alive light/white background leakage in Settings. *(Fixed — dark gradient swatch)*
- Improve New Conversation CTA visibility while keeping calm design. *(Fixed — readable border + glow)*
- Fix all right-panel toggle drift/out-of-box alignment. *(qlpa-toggle-row CSS class added to globals)*
- Audit Trust / Privacy / Delivery / Conversation Settings panels for containment. *(CSS utilities added)*
- Ensure all active/on buttons stay inside parent cards. *(overflow:hidden on qlpa-toggle-row)*
- Preserve magnetic orb movement, but no layout shift. *(Confirmed — transform only, no reflow)*
- Keep dark QLPA theme consistent across every component. *(SovereigntySettingsPanel DOMAIN_COLORS fixed)*
- Fix MvpChecklist light icon backgrounds (bg-emerald-50, bg-emerald-100). *(Fixed)*

## Motion System
- Phone tilt (gyroscope) for orb anchor offset — deferred.
- Investigate spring physics library (no external deps preferred — use CSS only).

## Performance
- Audit image loading order on first paint.
- Confirm NatureBackdrop background images load before orbs.
- Consider adding `fetchPriority="high"` on orb 1 image.

## Design Refinement
- Final orb visual polish (glows, halos, atmosphere rim).
- Dark mode / light mode consideration.
- QLPA color energy map integration into token system.

## Next Step — Captain Direction
After this 360 pass: responsive QA pass (desktop, tablet, iPhone 17), then simplify first real user
flow: create conversation → invite → send message → verify local protection.

## Overlay Controller
- Future Pass: lift overlay control from ConversationView to PhiShell for app-level overlays including
  search, settings, onboarding, and dashboard overlays. ConversationView currently holds a single
  `activeOverlay: ActiveOverlay` state (from `lib/messaging/qlpaSettings.ts`) that enforces one-at-a-time
  exclusivity within the conversation screen. PhiShell and AppDashboard still use independent boolean
  flags for their own overlays. A future pass should unify all overlay state into a single controller
  at the PhiShell level so that e.g. opening search always closes the new-conversation drawer.
- SovereigntySettingsPanel has two independent dialog states (`confirmState`, `infoState`) that can
  technically both render at once. They share z-50 and the UX is degraded if both open. Future pass:
  collapse into a single `activeDialog: 'confirm' | 'info' | null` state.

## Pass 09 — Fixed
- AppDashboard StatusPill: `ok` prop was boolean-attribute shorthand (always truthy). Fixed to explicit
  `ok={true}` on the two always-true status pills (local-first active, language).
- ModeBar dropdown: `minWidth: '260px'` was hardcoded and ignored the calculated `DROPDOWN_WIDTH`.
  Fixed to use `width: dropdownPos.width` from the stored computed value, preventing overflow on 390px.
- ModeBar close button: missing `aria-label`. Fixed.
- ConversationInfoPanel close button: missing `aria-label`. Fixed.
- SettingsTab developer section expand buttons: missing `aria-expanded` + `aria-label`. Fixed.
- Added i18n keys `settings.hideMvpReadiness` and `settings.hideReleaseStatus` to en.json.

## Pass 09 — Deferred (not blockers for v0.1 MVP testing)
- SettingsTab: `backgroundMode` and `cameraPermission` are component-local state only. Neither persists
  across reload. `cameraPermission` is also statically initialized to 'prompt' and never updated by a
  real permission check. Background mode is v0.1 display-only; document as local mock.
- localPersistence.ts: silent failures on localStorage quota exceeded. No user-visible error. Acceptable
  for v0.1 prototype; add error surface in a future production hardening pass.
- NewConversationDrawer: "Close" and "Back" strings are hardcoded English (not i18n keys). Low risk for
  MVP; fix in i18n pass.
- Retention settings: ConversationView passes `onRetentionChange` to parent, which handles persistence.
  This chain is correct but fragile — if parent doesn't wire it, retention settings won't persist. Verify
  in PhiShell/messaging page that the callback is wired to `updateConversationSettings` in localPersistence.
