# QLPA Canonical Color & Semantic Language

**EarthOS Visual Architecture — Canonical Root**
Version 1.1 | Captain Aether Nova Lumina

---

## 1. Base Palette

The EarthOS palette derives from the view of Earth from orbit:
deep space void, the teal atmosphere rim, the gold sunrise, and the jade-green of living land.

```
Aether Void    hsl(218 40% 4%)     — deepest space, background base
Crystal Water  hsl(192 65% 48%)    — atmosphere aqua, primary action
Jade Heart     hsl(158 58% 46%)    — living green, safe, consent alive
Solar Gold     hsl(38 88% 62%)     — sunrise warmth, pending, gentle attention
Rose Care      hsl(340 60% 62%)    — warmth, human support
Crown Violet   hsl(262 50% 60%)    — advanced, developer, integrity
Root Red       hsl(4 60% 55%)      — true danger only — irreversible action
Mist           hsl(210 16% 58%)    — neutral, receded, quiet states
Ocean Blue     hsl(208 72% 50%)    — deep trust, identity, sovereignty
```

---

## 2. Emotional Meaning

| Color         | Emotional Signal                              |
|---------------|----------------------------------------------|
| Crystal Water | Flow, communication, clarity, movement        |
| Jade Heart    | Safety, consent given, life, protected        |
| Solar Gold    | Patience, waiting, gentle caution, hope       |
| Rose Care     | Human warmth, support, tenderness             |
| Crown Violet  | Mastery, advanced knowledge, developer power  |
| Root Red      | Stop. Danger. Cannot be undone. Use sparingly |
| Mist          | Quiet, off, neutral, resting state            |
| Aether Void   | Deep space, silence, the ground of being      |
| Ocean Blue    | Trust, depth, sovereignty, identity           |

**Law: Red does not mean "important". Red means this action cannot be undone.**
**Law: Do not make every state saturated cyan. Let most UI rest in mist.**

---

## 3. Chakra Correspondence

| Chakra   | Sanskrit   | Color         | QLPA Role                          |
|----------|-----------|---------------|------------------------------------|
| Root     | Muladhara | Root Red      | Danger, blocked, irreversible      |
| Sacral   | Svadhistha| Solar Gold    | Pending, waiting, processing       |
| Solar    | Manipura  | Solar Gold    | Attention, caution, review         |
| Heart    | Anahata   | Jade Heart    | Safe, consent, allowed, trust      |
| Throat   | Vishuddha | Crystal Water | Communication, send, action, flow  |
| Third Eye| Ajna      | Ocean Blue    | Identity, sovereignty, insight     |
| Crown    | Sahasrara | Crown Violet  | Developer, advanced, cosmic order  |

---

## 4. Elemental Correspondence

| Element | Color         | Application                       |
|---------|---------------|-----------------------------------|
| Earth   | Jade Heart    | Grounded safety, consent confirmed|
| Water   | Crystal Water | Flow, message sent, in motion     |
| Fire    | Solar Gold    | Warmth, energy, waiting ignition  |
| Air     | Mist          | Neutral, passing, transitional    |
| Ether   | Aether Void   | Background silence, deep space    |
| Light   | Crystal White | Inner glow, edge-light, clarity   |

---

## 5. Planetary Correspondence

| Planet  | Color         | QLPA Meaning                        |
|---------|---------------|-------------------------------------|
| Earth   | Jade Heart    | Home, local-first, consent, safe    |
| Moon    | Mist          | Reflection, quiet, local sync       |
| Sun     | Solar Gold    | Attention, warmth, pending          |
| Mercury | Crystal Water | Communication, messaging, flow      |
| Venus   | Rose Care     | Care, warmth, human connection      |
| Saturn  | Ocean Blue    | Sovereignty, trust, structure       |
| Uranus  | Crown Violet  | Advanced, developer, evolution      |
| Mars    | Root Red      | Danger, blocked — use only for this |

---

## 6. Semantic UI Mapping

### Protected / Trust / Allowed
```
tone: heart
color: Jade Heart — hsl(158 58% 46%)
chip: qlpa-chip-heart
icon: text-emerald-400
border: border-emerald-500/25
background: bg-emerald-500/10
```

### Encrypted / Privacy / Local-First
```
tone: water
color: Crystal Water — hsl(192 65% 48%)
chip: qlpa-chip-water
icon: text-sky-400
border: border-sky-500/22
background: bg-sky-500/8
```

### Pending / Waiting / Processing
```
tone: solar
color: Solar Gold — hsl(38 88% 62%)
chip: qlpa-chip-solar
icon: text-amber-400
border: border-amber-500/25
background: bg-amber-500/8
```

### Care / Human Warmth / Support
```
tone: care
color: Rose Care — hsl(340 60% 62%)
chip: qlpa-chip-care
icon: text-rose-400
border: border-rose-500/22
background: bg-rose-500/8
```

### Developer / Advanced / Integrity
```
tone: crown
color: Crown Violet — hsl(262 50% 60%)
chip: qlpa-chip-crown
icon: text-violet-400
border: border-violet-500/22
background: bg-violet-500/8
```

### Danger / Blocked / Destructive
```
tone: rootAlert
color: Root Red — hsl(4 60% 55%)
chip: qlpa-chip-danger
icon: text-red-400
border: border-red-500/22
background: bg-red-500/8
NOTE: use only for genuinely irreversible or blocking actions.
      Do not use for "warning" or "notice". That is solar/amber.
```

### Neutral / Quiet States / Informational
```
tone: muted / aether
color: Mist — hsl(210 16% 58%)
chip: qlpa-chip-muted
icon: text-muted-foreground
border: border-border/40
background: bg-muted/30
```

---

## 7. Visual Grammar Rules

1. **Glass before opaque.** Every panel is a glass surface. The Earth shows through.
2. **Inset top light.** All glass panels carry `0 1px 0 hsl(192 70% 80% / 0.07) inset` — the inner edge of sunlight.
3. **Teal atmosphere rim.** All panel borders use `hsl(194 55% 70% / 0.11–0.15)` — the Earth's atmosphere color.
4. **Rounded surfaces.** `rounded-xl` for cards, `rounded-2xl` for drawers, `rounded-3xl` for modals.
5. **Typography calm.** Three weights maximum: 400 body, 600 label/emphasis, 700 title. No 900 weight.
6. **Red is sacred.** Do not use red for warnings, notices, or information. Only for danger/blocked/irreversible.
7. **Sunrise echoes active states.** Selected rows and active cards carry a micro-glow from `hsl(38 88% 62%)` — the sunrise gold — in their box-shadow.

---

## 8. CSS Class Reference

| Class                      | Use                                      |
|----------------------------|------------------------------------------|
| `qlpa-glass-card`          | Inner content cards, settings rows       |
| `qlpa-glass-panel`         | Side panels, drawers, elevated surfaces  |
| `qlpa-glass-drawer`        | Bottom sheets, side drawers              |
| `qlpa-glass-card-elevated` | Floating panels, mode dropdowns          |
| `earthos-surface-glass`    | Left panels, secondary columns           |
| `earthos-panel-glass`      | Floating panels, modals                  |
| `qlpa-chip-water`          | Encrypted / local-first / privacy        |
| `qlpa-chip-heart`          | Protected / allowed / consent            |
| `qlpa-chip-solar`          | Pending / waiting                        |
| `qlpa-chip-care`           | Care / warmth                            |
| `qlpa-chip-crown`          | Developer / advanced                     |
| `qlpa-chip-danger`         | Blocked / destructive (use sparingly)    |
| `qlpa-chip-muted`          | Neutral / informational                  |
| `qlpa-primary-water`       | Primary crystalline action button        |
| `qlpa-soft-warning`        | Amber glass notice panel                 |
| `qlpa-soft-danger`         | Red glass notice panel                   |
| `qlpa-reflection-panel`    | Intention Mirror pause card              |
| `qlpa-active-glow`         | Selected state micro-glow                |
| `qlpa-section-label`       | Uppercase section heading 9px            |

---

*This document is the canonical reference for all visual decisions in EarthOS Messaging.*
*When in doubt: ask what the Earth looks like from orbit. Design from that.*
