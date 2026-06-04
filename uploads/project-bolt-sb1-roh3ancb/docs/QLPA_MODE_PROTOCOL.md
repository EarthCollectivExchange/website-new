# QLPA Human Mode Protocol — EarthOS Messaging v0.1

**Pass 13 — Canonical Structure**

---

## Canonical Mode Order

```
Calm → Care → Focus → Creator → Shield → Sovereign
```

Universal functions:

| Mode      | Universal Function | One-word verb |
|-----------|--------------------|---------------|
| Calm      | Regulate           | regulate      |
| Care      | Relate             | relate        |
| Focus     | Concentrate        | concentrate   |
| Creator   | Create             | create        |
| Shield    | Protect            | protect       |
| Sovereign | Command            | command       |

---

## Mode Definitions

### 1. Calm — Regulate

**Purpose:** Support nervous system regulation. Keep communication gentle, grounded, and non-urgent.

**Behavior:**
- Minimal composer tools: voice note and ritual note only
- File transfer hidden
- Intention mirror enabled (soft tone)
- Retention timer hidden
- Notifications: gentle
- Spacing: comfortable
- Storage: local only

**Shows:** Voice memo, Ritual note, Intention mirror
**Hides:** File transfer, Retention timer, Diagnostics, Emergency broadcast

**Panel priority:** Overview → People → Privacy → Settings → Files
**Composer:** minimal
**Protection level:** standard

---

### 2. Care — Relate

**Purpose:** Support emotional presence, care circles, and human warmth.

**Behavior:**
- Voice note, ritual note, and intention mirror available
- File transfer hidden (care is about presence, not content)
- Spacious layout for breathing room
- Prioritise people panel
- Notifications: gentle

**Shows:** Voice memo, Ritual note, Intention mirror
**Hides:** File transfer, Retention timer, Diagnostics

**Panel priority:** People → Overview → Privacy → Settings → Files
**Composer:** standard
**Protection level:** standard

---

### 3. Focus — Concentrate

**Purpose:** Reduce noise. Concentrate on the current conversation thread only.

**Behavior:**
- Message composer only — all other tools hidden
- Voice, file, ritual, intention mirror all hidden
- Compact layout
- Silent notifications
- No background aura motion

**Shows:** Message only
**Hides:** Voice memo, File transfer, Ritual note, Intention mirror, Retention timer

**Panel priority:** Overview → People → Settings → Privacy → Files
**Composer:** minimal
**Protection level:** standard

---

### 4. Creator — Create

**Purpose:** Open the full expressive and generative toolkit.

**Behavior:**
- Files, voice, and ritual notes all open
- Retention timer visible (creative sovereignty)
- Intention mirror hidden (flow state — check before send disabled)
- Standard notifications
- Comfortable layout

**Shows:** Voice memo, File transfer, Ritual note, Retention timer
**Hides:** Intention mirror, Emergency broadcast

**Panel priority:** Files → Overview → People → Privacy → Settings
**Composer:** expressive
**Protection level:** standard

---

### 5. Shield — Protect

**Purpose:** Strengthen consent, privacy, and safety boundaries.

**Behavior:**
- Privacy, Trust, and Consent panels prioritised
- Retention timer (auto-clear) visible — key protection tool
- All creative/expressive tools hidden
- Compact, focused layout
- Silent notifications
- Storage: local only

**Shows:** Retention timer (auto-clear) only
**Hides:** Voice memo, File transfer, Ritual note, Intention mirror

**Panel priority:** Privacy → Overview → People → Settings → Files
**Composer:** minimal
**Protection level:** maximum

---

### 6. Sovereign — Command

**Purpose:** Full agency. Full visibility. All tools and data controls available.

**Behavior:**
- All features enabled
- All panels accessible
- Export and data controls visible
- Advanced diagnostics visible when interface depth allows
- Standard notifications
- Comfortable layout

**Shows:** Voice memo, File transfer, Ritual note, Intention mirror, Retention timer
**Hides:** Emergency broadcast only

**Panel priority:** Privacy → Overview → People → Files → Settings
**Composer:** expressive
**Protection level:** elevated

---

## Composer Behavior Levels

| Level      | Shows                                                    |
|------------|----------------------------------------------------------|
| minimal    | Text input + send only                                   |
| standard   | Text input + send + voice note                           |
| expressive | Text input + send + voice note + file attach + ritualNote|

The `composerBehavior` field on `HumanMode` maps to `showVoiceButton`, `showFileButton`, and `showRitualNote` props on `MessageComposer`. These are derived from `visibleFeatures` via `activeModeConfig` in `app/messaging/page.tsx`.

---

## What Each Mode Shows/Hides (Summary)

| Feature           | Calm | Care | Focus | Creator | Shield | Sovereign |
|-------------------|------|------|-------|---------|--------|-----------|
| Voice memo        | ✓    | ✓    | —     | ✓       | —      | ✓         |
| File transfer     | —    | —    | —     | ✓       | —      | ✓         |
| Ritual note       | ✓    | ✓    | —     | ✓       | —      | ✓         |
| Intention mirror  | ✓    | ✓    | —     | —       | —      | ✓         |
| Retention timer   | —    | —    | —     | ✓       | ✓      | ✓         |
| Emergency bcast   | —    | —    | —     | —       | —      | —         |

---

## Atmosphere Tokens (Pass 12)

Each mode has a canonical color set in `lib/qlpa/tokens.ts → QLPA_MODE_COLORS`:

| Mode      | Hue               | Key Value             |
|-----------|-------------------|-----------------------|
| Calm      | Teal-green        | rgba(86, 210, 168)    |
| Care      | Rose-magenta      | rgba(228, 120, 168)   |
| Focus     | Prussian blue     | rgba(100, 150, 230)   |
| Creator   | Amber-gold        | rgba(232, 186, 72)    |
| Shield    | Bright aqua-cyan  | rgba(56, 218, 222)    |
| Sovereign | Royal violet-blue | rgba(120, 140, 255)   |

Use `getHumanModeAtmosphere(mode)` from `lib/qlpa/tokens.ts` for all mode-driven styling.

---

## Surfaces Responding to Active Mode (Pass 12 + 13)

1. ModeBar trigger pill — mode bg/border/text/dot
2. ModeBar dropdown header — panelGradient wash
3. ModeBar mode selector cards — active bg/border/glow
4. ModeBar ActiveModeCard — gradient background, text, icon
5. ConversationView background aura — panelGradient overlay (z-0, transition 700ms)
6. ConversationView header border — mode border/glow
7. ConversationView right panels — all 6 DesktopDrawer instances use mode border/glow
8. Page layout — conversation list divider uses mode border
9. MessageComposer — tools visible/hidden per visibleFeatures
10. PhiShell left column — mode border on right edge

---

## QLPA Language Commitments

- No mode claims to encrypt, relay, or protect data it does not control.
- Shield mode does NOT claim "encrypted relay active" — it only shows local-first notice.
- Sovereign mode does NOT claim "AI protection active" or "cloud backup active".
- All mode descriptions are plain language, non-overclaiming, consent-first.
- The universalFunction is a single verb (no inflated claims).

---

## Deferred Items

| Item | Priority | Pass |
|------|----------|------|
| SettingsTab Human Mode section uses canonicalMode config for card display | Medium | 14 |
| Conversation right-panel auto-opens based on panelPriority | Medium | 14 |
| Focus mode reduces aura motion (transition 0ms) | Low | 14 |
| Shield mode auto-opens retention panel if not set | Medium | 14 |
| Sovereign mode shows export button in conversation header | Low | 14 |
| Emergency → Shield preference migration | Low | 14 |
| composerBehavior used to set max-height on composer area | Low | 15 |
| protectionLevel affects consent panel prominence | Low | 15 |
