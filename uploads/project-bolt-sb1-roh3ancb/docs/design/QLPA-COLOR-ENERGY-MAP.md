# QLPA Color Energy Map
## EarthOS Visual-Emotional Color System

> **Scope:** Design reference only. No code changes required.
> Future token implementations should reference this file for naming and intent.

---

## 1. Prime Rule

Colors must calm, clarify, and guide. They must not create unnecessary alarm.

Strong colors are reserved for true risk or irreversible action. Every color choice is an energetic signal — it communicates state, intention, and urgency to the person using the application. When colors shout, people stop trusting the interface. When colors speak quietly and accurately, trust deepens.

Red does not mean "important." Red means "this action cannot be undone or this contact is genuinely blocked."

---

## 2. Base EarthOS Palette

### Deep Space / Aether
**Role:** Background, contemplation, silence, the void from which form arises.
**HSL range:** `hsl(218 40% 3–6%)`
**Use:** Root background, base layer, empty states, breathing room between elements.
**Do not use:** As a foreground color or to fill interactive elements.

---

### Ocean / Crystal Blue — Primary Action
**Role:** Primary action, clarity, communication, water intelligence, message flow.
**HSL range:** `hsl(192 65–75% 44–54%)`
**Use:** Primary buttons, send actions, active links, selected indicators, crystalline glass highlights.
**Emotional signal:** "This is clear. This is the way forward."

---

### Emerald / Heart Green — Safe
**Role:** Protected, allowed, safe, consent alive, trust confirmed, encryption active.
**HSL range:** `hsl(158 50–60% 40–68%)`
**Use:** Consent granted chips, encryption status, local-first indicators, positive completion states.
**Emotional signal:** "You are safe here. Consent is alive. This is protected."

---

### Soft Gold / Solar Amber — Gentle Attention
**Role:** Attention, pending, waiting, reflection, gentle action needed.
**HSL range:** `hsl(38 80–90% 58–74%)`
**Use:** Pending approval chips, waiting states, Intention Mirror activation, retry suggestions, "action needed" banners.
**Emotional signal:** "Something is waiting. No alarm — simply awareness."
**Not for:** Errors, danger, blocked states. That is Red's role.

---

### Rose / Compassion — Care
**Role:** Human warmth, care, support, invitation, togetherness.
**HSL range:** `hsl(340 55–65% 55–70%)`
**Use:** Care mode indicators, human support contexts, warm invitations, soft highlights in social flows.
**Emotional signal:** "This is a human moment. Warmth is present."

---

### Violet / Crown — Developer & Advanced Awareness
**Role:** Developer mode, diagnostic insight, advanced settings, system-level awareness.
**HSL range:** `hsl(262 45–55% 55–70%)`
**Use:** Developer badges, advanced view depth indicators, diagnostic panels, system health overlays.
**Emotional signal:** "You are seeing the deeper layer. Handle with care and awareness."
**Not for:** Warnings, errors, general UI. This color signals depth of access, not alarm.

---

### Red / Root Alert — Danger Only
**Role:** Danger, destructive action, blocked state, irreversible reset. Use sparingly.
**HSL range:** `hsl(4 55–65% 50–62%)`
**Use:** Block actions, erase/reset confirmation flows, genuinely blocked contacts, critical system failures.
**Emotional signal:** "This is a point of no return. Or this contact has been blocked."
**Prime rule:** If the situation is not genuinely dangerous or irreversible, do not use red. Use amber instead.

---

## 3. QLPA Status Colors

| Status | Color Family | HSL Reference | Rationale |
|---|---|---|---|
| Protected | Emerald / Heart Green | `hsl(158 58% 46%)` | Consent is alive, the channel is safe |
| Allowed | Emerald / Heart Green | `hsl(158 58% 46%)` | Same as protected — permission confirmed |
| Waiting | Soft Gold / Amber | `hsl(38 88% 62%)` | Gentle attention, not alarm |
| Pending approval | Soft Amber | `hsl(38 80% 68%)` | Softer than waiting — something is in motion |
| Muted | Soft Blue-Gray | `hsl(214 20% 52%)` | Neutral, receded, temporarily quieted |
| Blocked | Red / Root Alert | `hsl(4 60% 55%)` | True block — contact or channel is refused |
| Danger / Destructive | Red / Root Alert | `hsl(4 60% 55%)` | Only for irreversible or dangerous actions |
| Developer | Violet / Crown | `hsl(262 50% 60%)` | Depth of access, diagnostic visibility |
| Local-first | Ocean Teal | `hsl(192 65% 48%)` | Data stays on device — water flow, clarity |
| Encrypted | Crystal Blue / Emerald-Blue | `hsl(192 65% 48%)` | Clarity and protection combined |
| Trust | Emerald / Turquoise | `hsl(158 58% 46%)` | Trust is a form of safety |
| Privacy | Crystal Blue | `hsl(208 72% 50%)` | Clear, protected, known only to you |
| Delivery waiting | Soft Gold | `hsl(38 88% 62%)` | Message is on its way |
| Delivery ready | Emerald | `hsl(158 58% 46%)` | Arrived, confirmed, safe |

---

## 4. Chakra Correspondence

| Chakra | Color | UI Role |
|---|---|---|
| Root | Red | Survival, danger, grounding. Use sparingly — only for true risk. |
| Sacral | Orange | Emotion, creation, warmth. Avoid using as an alarm. Use for creative or playful moments only. |
| Solar Plexus | Gold | Decision, attention, pending, gentle willpower. Primary "action needed" signal. |
| Heart | Green | Safety, consent, care, connection. Primary "all is well" signal. |
| Throat | Blue | Communication, clarity, message flow, voice. Primary action and interface color. |
| Third Eye | Indigo | Insight, diagnostics, developer awareness, seeing the unseen. |
| Crown | Violet / White | Source, advanced overview, system-level awareness, transparent glass. |

**Application:** When choosing a color for a UI state, ask which chakra the state relates to. A message in transit relates to the Throat (blue). A confirmed safe channel relates to the Heart (green). A destructive reset touches the Root (red). Let the energetic correspondence guide the choice.

---

## 5. Element Correspondence

| Element | Colors | UI Expression |
|---|---|---|
| Earth | Deep green, moss, warm brown | Grounding, stability, local-first, offline resilience |
| Water | Crystal blue, cyan, aqua | Flow, communication, cleansing, message delivery |
| Fire | Gold, warm amber, sunrise orange | Transformation, attention, pending, gentle urgency |
| Air | Pale blue, silver, light mist | Lightness, movement, breath, transitions |
| Aether | Deep space, violet, transparent glass | Field awareness, advanced state, the ground of all states |

**Application:** The app shell lives in Aether. Messages flow through Water. Consent and safety are Earth and Heart. Attention and pending states are Fire — warm and transforming, not burning. Transitions and animations breathe like Air.

---

## 6. Planetary Correspondence

| Planet | Colors | UI Signal |
|---|---|---|
| Sun | Gold, warm source light | Vitality, visibility, primary highlight, active presence |
| Moon | Silver, soft blue | Reflection, privacy, emotional calm, local/offline states |
| Earth | Green / blue | Grounding, local-first, life, the device itself |
| Mercury | Cyan / blue | Messages, language, relay, signal transmission |
| Venus | Rose / emerald | Care, harmony, social invitation, warmth in contact |
| Mars | Red | Action/risk only — use as Red / Root Alert |
| Jupiter | Royal blue / gold | Expansion, governance, large-scope decisions |
| Saturn | Dark blue / indigo | Structure, boundaries, retention rules, time constraints |
| Uranus | Electric cyan | Innovation, unexpected, experimental features |
| Neptune | Ocean blue / violet | Dreams, subtle field, ephemeral messages, disappearing data |
| Pluto | Deep violet / crimson | Transformation, hidden risk, irreversible change |

**Application:** Relay transmission states draw from Mercury (cyan). Retention timers draw from Saturn (dark blue, constraint). Ephemeral/disappearing messages draw from Neptune (ocean blue/violet). The Danger Zone draws from Mars and Pluto.

---

## 7. UI Usage Rules

**Buttons**
Primary buttons use crystalline water blue — a translucent aqua gradient with glass border and inner glow. Not a heavy solid block of color. The button should feel like pressing water.

**Warning banners**
Use soft amber glass for "attention needed" states. Use red only when the situation is genuinely dangerous or irreversible. A pending approval request is not a danger — it is amber, not red.

**Cards and panels**
All surface panels are transparent crystalline glass: `rgba(5, 18, 30, 0.35–0.55)` with a subtle crystal-bright border. The Earth backdrop must remain visible behind the UI at all times.

**Text**
Default text is calm white / mist: near-white but not harsh (`hsl(210 20% 92–96%)`). Muted text uses soft blue-gray: `hsl(214 20% 55–65%)`. Avoid using saturated color for body text — reserve it for status chips and highlights.

**Color quantity**
No more than two accent color families should be prominent on the same screen at once. If emerald and amber are already active, do not add violet and rose simultaneously. Let one story be told at a time.

**State communication**
Every state chip, badge, and indicator should communicate using the minimum color intensity needed. If a soft border and a small tinted background are enough, do not add a glowing ring as well. Restraint is clarity.

**Red is rare**
A user should encounter red at most once per session — in a destructive confirm flow or a genuine block state. Seeing red often means the color system has been diluted. Audit red usage if it appears more than once per primary flow.

**The background stays alive**
The Earth image is the environmental field. No panel, card, or drawer should be opaque enough to completely hide it. Minimum glass transparency is `0.35` surface opacity with backdrop blur active. The person using the app should always feel they are floating in space, with the Earth below.

---

## 8. Implementation Notes

When the QLPA token layer is formalized, CSS custom properties should map as follows:

| Token | Semantic Role | Suggested HSL |
|---|---|---|
| `--qlpa-aether` | Background base, void, space | `hsl(218 40% 4%)` |
| `--qlpa-water` | Primary action, crystal blue | `hsl(192 65% 48%)` |
| `--qlpa-heart` | Safe, protected, consent | `hsl(158 58% 46%)` |
| `--qlpa-solar` | Pending, attention, gold | `hsl(38 88% 62%)` |
| `--qlpa-care` | Rose, warmth, human | `hsl(340 60% 62%)` |
| `--qlpa-crown` | Violet, developer, advanced | `hsl(262 50% 60%)` |
| `--qlpa-root-alert` | Red, danger, blocked | `hsl(4 60% 55%)` |
| `--qlpa-glass` | Panel surface | `rgba(5, 18, 30, 0.40)` |
| `--qlpa-border` | Glass border highlight | `rgba(125, 211, 252, 0.14)` |
| `--qlpa-text-primary` | Primary readable text | `hsl(210 20% 94%)` |
| `--qlpa-text-muted` | Secondary / supporting text | `hsl(214 20% 58%)` |

**Existing partial token layer** (`app/globals.css`) already defines:
```css
--qlpa-safe:    158 58% 46%;
--qlpa-flow:    192 65% 48%;
--qlpa-trust:   208 72% 50%;
--qlpa-reflect: 38 88% 62%;
--qlpa-block:   4 60% 55%;
--qlpa-dev:     262 50% 60%;
```

These should be reconciled with the full token set above in a future token consolidation pass. The names above (`--qlpa-water`, `--qlpa-heart`, etc.) carry clearer energetic meaning and should be preferred when the layer is expanded.

**Priority for next token pass:**
1. Consolidate existing `--qlpa-safe / flow / trust / reflect / block / dev` with the canonical names above
2. Add `--qlpa-aether`, `--qlpa-glass`, `--qlpa-border`, `--qlpa-text-primary`, `--qlpa-text-muted`
3. Apply tokens to the `.earthos-glass-panel`, `.earthos-glass-card`, `.earthos-status-*` classes in `globals.css`
4. Document any component-level overrides that diverge from canonical token values

---

*Created: 2026-05-08 · EarthOS Messaging · QLPA Layer 17*
