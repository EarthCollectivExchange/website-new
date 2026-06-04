# QLPA Pass 129 — Physical Device Verification Checklist

> **Pass 130 note:** An in-app **Phone QA panel** is now available in Developer mode under Settings. It shows live device runtime (viewport, visualViewport, platform, body lock state) and provides a local tap-to-check version of this checklist. Data is stored in `localStorage` under `earthos.phoneQa.v1` — no network, no telemetry. Use it alongside this document for on-device testing.

> **Pass 131 note:** The Phone QA panel now supports **test session export**. Before testing, fill in the Device label and Test round fields. The checklist uses 3 states: untested (default), pass (tap once), and issue (tap twice). When an item is marked as issue, a note field appears to capture details. Use **"Copy QA report"** to generate a plain-text report and copy it to clipboard — a fallback textarea appears if the clipboard API is unavailable. Two reset options: "Reset checklist statuses" keeps metadata but clears check states; "Reset all Phone QA data" clears everything.

> **Pass 132 note:** The Phone QA panel is now a **guided test runner**. Checklist items are grouped into 10 collapsible sections (Launch & Landing, Conversation List, Create Conversation, Empty Conversation Journey, Message Composer, Status Pills, Mobile Sheets, Settings, Release Marker, Export / Reset). Each section shows a `x/y passed` counter. Use the **"Next untested"** button to jump to the first unchecked item — it expands the relevant section and scrolls to it. The focus line at the top shows what to test next, any open issues, or an all-pass confirmation. Use the **device preset buttons** (iPhone Safari, iPhone Brave, Samsung Brave, Desktop Preview) to fill the Device label instantly without clearing any check statuses. The exported QA report is now grouped by section and includes app mode and total counts.

> **Pass 134 note:** Physical phone verification support. The Phone QA panel (Developer mode → Settings) now includes three new tools for on-device testing. (1) **Pass 134 focus block** — a display-only list of the six key layout items to verify visually on each device: Φ-card fit, New button clarity, first-run hint timing, Empty Journey top position, Send test message disabled state, and sheet scroll isolation. (2) **"Reset first-run hint" button** — removes only `earthos.firstConversationCreated.v1` from localStorage so you can retest the hint without clearing messages or QA records. (3) **Go test flow checklist** — 8-item sequential tap-to-check list (Open Root orb → Open Messaging orb → Confirm New button → Create Direct conversation → Confirm Empty Journey → Invite member → Confirm Send test message activates → Send local test message). Uses the same 3-state mechanism as the main checklist.

> **Pass 133 note:** First-use flow and layout alignment. The Root and Messaging explanation panels on the landing page are now **centered compact Φ-cards** (`max-width: 90vw`, `max-height: 77dvh`) — they no longer anchor to the bottom of the screen. The **first-run hint** ("Tap New to start a conversation") is now correctly triggered by a localStorage flag (`earthos.messaging.firstNewConversationHintDismissed.v1`) rather than `conversations.length === 0` — the hint now appears the first time a user visits, even with demo conversations loaded. The **empty conversation journey** no longer shows a duplicate Invite button inside the step card — the primary button above the card is the sole invite entry point. The QA checklist item "New CTA visible" is now labelled **"New button visible"**.

**Pass:** 129 — Mobile Sheet Comfort + Action Flow Stabilization  
**Date:** 2026-05-22  
**Purpose:** Confirm that all Pass 127 and Pass 128 changes behave correctly on real devices before progressing to further relay and identity passes.

---

## How to use this checklist

1. Clear localStorage before starting each device test: Settings → Reset & Restore → Clear all local data.
2. Test in Simple mode first (default). Re-test critical items in Developer mode.
3. Mark each item with `[x]` when verified, `[-]` if not applicable, `[!]` if a defect is found.
4. Add notes next to `[!]` items describing the observed behaviour.

---

## Device: iPhone Safari

**OS:** ___  **Browser:** Safari ___  **Screen:** ___  **Tester:** ___  **Date:** ___

### Landing & Navigation
- [ ] Landing page opens cleanly (no blank screen, no raw i18n keys)
- [ ] EarthOS orb and background render correctly
- [ ] Tap "Continue without account" loads the messaging view
- [ ] Bottom navigation bar (Messages / Contacts / Trust / Settings) is fully visible

### Conversation List
- [ ] Conversation list scrolls without body bleed-through
- [ ] "New conversation" CTA (+ button) is clearly visible
- [ ] First-run hint ("Tap New to start a conversation") appears when list is empty
- [ ] No duplicate seed conversations visible in the list
- [ ] Filter chips (All / Direct / Projects / etc.) scroll horizontally

### New Conversation Flow
- [ ] Tapping + opens the New Conversation drawer
- [ ] Conversation type grid renders and is tappable
- [ ] Name / intention step renders
- [ ] Sovereignty / storage step renders
- [ ] Tapping "Create" closes the drawer and adds the conversation

### Empty Conversation Journey
- [ ] Opening a new (empty) conversation shows the journey card
- [ ] "Invite member" is displayed as the prominent primary CTA
- [ ] "Create local test message" button is visible and enabled (Pass 137: no longer Disabled before member invited)
- [ ] Tapping "Create local test message" creates a local test message immediately
- [ ] Tapping again after first message does nothing (duplicate guard active)
- [ ] Send gate notice appears above composer when trust is unknown
- [ ] Send gate notice includes "Invite member" shortcut

### Sheets — Open and Close
- [ ] "Protected" chip tap opens Privacy sheet
- [ ] "Ready" chip tap opens Delivery sheet
- [ ] "Allowed" chip tap opens Consent sheet
- [ ] Members panel opens from top-right icon
- [ ] Conversation tools / sovereignty drawer opens
- [ ] Message Journey sheet opens from a message
- [ ] Each sheet renders at approximately 82% viewport height (not full-screen)
- [ ] Drag handle tap closes the sheet
- [ ] Backdrop tap closes the sheet

### Sheet Scroll Integrity
- [ ] Each sheet scrolls its content internally
- [ ] Background (conversation list or messages) does NOT scroll while a sheet is open
- [ ] No backdrop blur applied to sheet content (text remains sharp)
- [ ] Sheet content is not dimmed or faded while sheet is open

### Mode Panel
- [ ] Mode dropdown opens from ModeBar (top bar selector)
- [ ] Mode list scrolls when taller than 82dvh
- [ ] Selecting a mode updates the interface
- [ ] Mode dropdown closes on outside tap

### Message Journey
- [ ] Tapping "View journey" on a message opens the journey sheet
- [ ] Journey steps (Written / Consent / Encrypted / Ready / Delivered) render
- [ ] Sheet scrolls if content is taller than the panel

### Settings
- [ ] Settings tab opens
- [ ] Settings page scrolls fully (language, identity, privacy, danger zone all reachable)
- [ ] Language selector works and changes visible text
- [ ] "Clear all local data" works (resets to seed)

### Quality Checks
- [ ] No raw i18n keys visible anywhere (no `conversation.inviteToBegin` style text)
- [ ] No duplicate members in any conversation
- [ ] No duplicate seed conversations (only one "Direct" in seed)
- [ ] All status chips show readable text (Protected / Local only / Allowed)

---

## Device: iPhone Brave

**OS:** ___  **Browser:** Brave ___  **Screen:** ___  **Tester:** ___  **Date:** ___

### Landing & Navigation
- [ ] Landing page opens cleanly (no blank screen, no raw i18n keys)
- [ ] EarthOS orb and background render correctly
- [ ] Tap "Continue without account" loads the messaging view
- [ ] Bottom navigation bar is fully visible

### Conversation List
- [ ] Conversation list scrolls without body bleed-through
- [ ] "New conversation" CTA is clearly visible
- [ ] No duplicate seed conversations visible

### Empty Conversation Journey
- [ ] "Invite member" is displayed as the prominent primary CTA
- [ ] "Create local test message" is always enabled (Pass 137)
- [ ] Send gate notice visible above composer when trust is unknown

### Sheets — Open and Close
- [ ] Sheets open at approximately 82% viewport height
- [ ] Drag handle tap closes sheet
- [ ] Backdrop tap closes sheet
- [ ] Background does NOT scroll while sheet is open
- [ ] Sheet content is not blurred or dimmed

### Sheet Scroll Integrity
- [ ] Each sheet scrolls its content internally
- [ ] No scroll chaining to the body

### Settings
- [ ] Settings page scrolls fully
- [ ] No raw i18n keys visible

### Quality Checks
- [ ] No raw i18n keys visible anywhere
- [ ] No duplicate seed conversations

---

## Device: Samsung Brave

**OS:** ___  **Browser:** Brave ___  **Screen:** ___  **Tester:** ___  **Date:** ___

### Landing & Navigation
- [ ] Landing page opens cleanly
- [ ] EarthOS orb and background render correctly
- [ ] Tap "Continue without account" loads the messaging view
- [ ] Bottom navigation bar is fully visible

### Conversation List
- [ ] Conversation list scrolls without body bleed-through
- [ ] "New conversation" CTA is clearly visible
- [ ] No duplicate seed conversations visible

### Empty Conversation Journey
- [ ] "Invite member" is displayed as the prominent primary CTA
- [ ] "Create local test message" is always enabled (Pass 137)
- [ ] Send gate notice visible above composer when trust is unknown

### Sheets — Open and Close
- [ ] Sheets open at approximately 82% viewport height
- [ ] Drag handle tap closes sheet
- [ ] Backdrop tap closes sheet
- [ ] Background does NOT scroll while sheet is open
- [ ] Sheet content is not blurred or dimmed

### Sheet Scroll Integrity
- [ ] Each sheet scrolls its content internally
- [ ] No scroll chaining to the body
- [ ] Keyboard does not push sheet off screen

### Settings
- [ ] Settings page scrolls fully
- [ ] No raw i18n keys visible

### Quality Checks
- [ ] No raw i18n keys visible anywhere
- [ ] No duplicate seed conversations

---

## Device: Samsung Chrome

**OS:** ___  **Browser:** Chrome ___  **Screen:** ___  **Tester:** ___  **Date:** ___

### Landing & Navigation
- [ ] Landing page opens cleanly
- [ ] EarthOS orb and background render correctly
- [ ] Tap "Continue without account" loads the messaging view
- [ ] Bottom navigation bar is fully visible

### Conversation List
- [ ] Conversation list scrolls without body bleed-through
- [ ] "New conversation" CTA is clearly visible
- [ ] No duplicate seed conversations visible

### Empty Conversation Journey
- [ ] "Invite member" is displayed as the prominent primary CTA
- [ ] "Create local test message" is always enabled (Pass 137)
- [ ] Send gate notice visible above composer when trust is unknown

### Sheets — Open and Close
- [ ] Sheets open at approximately 82% viewport height
- [ ] Drag handle tap closes sheet
- [ ] Backdrop tap closes sheet
- [ ] Background does NOT scroll while sheet is open
- [ ] Sheet content is not blurred or dimmed

### Sheet Scroll Integrity
- [ ] Each sheet scrolls its content internally
- [ ] No scroll chaining to the body

### Settings
- [ ] Settings page scrolls fully
- [ ] No raw i18n keys visible

### Quality Checks
- [ ] No raw i18n keys visible anywhere
- [ ] No duplicate seed conversations

---

## Sign-off

| Device | Tester | Date | Result |
|---|---|---|---|
| iPhone Safari | | | |
| iPhone Brave | | | |
| Samsung Brave | | | |
| Samsung Chrome | | |  |

---

## Known limitations at Pass 129

- Relay transport is not active — messages are local-only.
- No production E2EE key exchange — local prototype key only.
- EarthID sync requires sign-in; local mode is fully functional without it.
- Token rewards are not active.
