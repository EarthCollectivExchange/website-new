# Human Mode Behavior Map

Each Human Mode shapes the composer UI and message spacing. No mode blocks sending or removes access to settings — all choices remain voluntary and reversible.

---

## Mode Summaries

### Calm
- **User intention:** Peaceful, grounded communication with trusted people.
- **Spacing density:** comfortable (default)
- **UI behavior:** Voice notes and ritual notes visible. Intention Mirror active. File transfer and retention timer hidden to reduce noise. Attachment menu shows voice note and ritual note only.
- **Future metadata:** notificationTone=gentle, accentHue=emerald, panelPriority=[overview, people, files, privacy, settings]

### Sovereign
- **User intention:** Full data sovereignty. Consent-first, privacy-forward, all controls visible.
- **Spacing density:** comfortable (default)
- **UI behavior:** All composer features visible — voice, file transfer, ritual notes, intention mirror, retention timer. Complete toolset.
- **Future metadata:** notificationTone=standard, accentHue=sky, panelPriority=[privacy, overview, people, files, settings]

### Focus
- **User intention:** No distractions. Only the essential act of writing.
- **Spacing density:** compact (tighter)
- **UI behavior:** All attachments hidden. Voice button hidden. Intention Mirror suppressed. Retention timer hidden. Paperclip button disappears. Minimal composer bar.
- **Future metadata:** notificationTone=silent, accentHue=slate, panelPriority=[overview, people, settings, privacy, files]

### Care
- **User intention:** Warm, supported communication. Ideal for support circles and close connections.
- **Spacing density:** spacious (more breathing room)
- **UI behavior:** Voice notes and ritual notes available. Intention Mirror active. File transfer and retention timer hidden to reduce cognitive load. Spacious layout gives messages more room.
- **Future metadata:** notificationTone=gentle, accentHue=rose, panelPriority=[people, overview, files, privacy, settings]

### Creator
- **User intention:** Expressive, collaborative work. Full composer toolset.
- **Spacing density:** comfortable (default)
- **UI behavior:** Voice notes, file transfer, ritual notes, and retention timer visible. Intention Mirror suppressed (creative flow is prioritized). Attachment menu shows all options.
- **Future metadata:** notificationTone=standard, accentHue=amber, panelPriority=[files, overview, people, privacy, settings]

### Shield
- **User intention:** Elevated privacy. Minimal footprint, clear consent, retention control.
- **Spacing density:** compact (tighter)
- **UI behavior:** Voice notes and retention timer available. File transfer, ritual notes, and intention mirror hidden. Compact layout reduces UI surface area.
- **Future metadata:** notificationTone=silent, accentHue=teal, panelPriority=[privacy, overview, people, settings, files]

---

## Spacing Density

| Mode      | Density     | CSS class applied |
|-----------|-------------|-------------------|
| calm      | comfortable | (none — default) |
| sovereign | comfortable | (none — default) |
| focus     | compact     | `.density-compact` |
| care      | spacious    | `.density-spacious` |
| creator   | comfortable | (none — default) |
| shield    | compact     | `.density-compact` |

Density is applied via modifier classes on the root messages container in `app/messaging/page.tsx`. The `comfortable` density is the default and requires no override. Density classes only override phi-spacing utilities — font sizes, border radii, and touch targets are unchanged.

---

## Composer Feature Visibility

| Feature          | calm | sovereign | focus | care | creator | shield |
|------------------|------|-----------|-------|------|---------|--------|
| Voice memo       | yes  | yes       | no    | yes  | yes     | yes    |
| File transfer    | no   | yes       | no    | no   | yes     | no     |
| Ritual note      | yes  | yes       | no    | yes  | yes     | no     |
| Intention mirror | yes  | yes       | no    | yes  | no      | no     |
| Retention timer  | no   | yes       | no    | no   | yes     | yes    |

- **Voice memo:** controls the Mic button and `voice_note` in the attachment menu.
- **File transfer:** controls `file` and `image` in the attachment menu.
- **Ritual note:** controls `ritual_note` in the attachment menu.
- **Intention mirror:** gates IntentionMirrorCard. User's sovereign mirror toggle also applies.
- **Retention timer:** controls the Timer header button and retention indicator bar.

When all attachment options are hidden, the Paperclip button is also hidden.

---

## Protection Comprehension (Simple View)

A passive notice strip appears beneath the JourneyStatusBar for Simple-mode users. It shows:

1. **Stored locally** — messages are on this device, no server content.
2. **Locally protected** — messages are encrypted before any relay.
3. **Relay not active yet** — shown when `storageMode === 'local_only'` to be honest about delivery status.

Advanced and Developer mode users see the full JourneyStatusBar with interactive drill panels instead.

Copy is QLPA-aligned: calm, honest, no overclaiming. Uses terms: "Stored locally", "Locally protected", "Relay not active yet".

---

## Active Mode Card (ModeBar Dropdown)

When the user opens the Mode & Interface dropdown, an `ActiveModeCard` is displayed between the mode grid and the interface depth selector. It shows:

- The active mode icon and a one-sentence summary of its intent.
- **Available** features (green pill badges with checkmarks).
- **Not shown in this mode** features (muted pill badges with minus icons).

This gives users immediate clarity about what their current mode enables or simplifies without requiring them to consult documentation.

---

## Implementation Notes

- `visibleFeatures` flows from `HUMAN_MODES[humanMode]` in `app/messaging/page.tsx` → `ConversationView` → `MessageComposer` + `AttachmentMenu`.
- All feature flags default to `true` when `visibleFeatures` is not supplied — no existing behavior is lost.
- `emergency` mode key is a backwards-compat alias for `shield` and carries identical settings.
- The `ProtectionNotice` component is only rendered when `advancedView === false`.
- The `ActiveModeCard` renders inside the ModeBar portal dropdown using the existing `t()` hook.
- All strings are in the `modeCard` and `protection` i18n namespaces, available in all 7 locales.

---

## Unused / Scaffolded Metadata

The following fields are defined in `HUMAN_MODES` but not yet wired to UI behavior:

| Field | Status |
|-------|--------|
| `accentHue` | Defined, not applied to UI |
| `notificationTone` | Defined, not wired to notification system |
| `panelPriority` | Defined, not used to reorder panels |
| `quickActions` | Defined, not rendered as quick-action bar |
| `emergencyBroadcast` (visibleFeatures) | All false, feature not implemented |

These are intentionally scaffolded for future waves.
