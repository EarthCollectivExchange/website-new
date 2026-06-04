# QLPA Matrix Source — Foundation Architecture Map

## What This Is

QLPA Matrix Source is the portable, consent-first, local-first foundation layer shared by QLPA-aligned host applications. This document describes the root architecture — the scaffolding that any host application builds on.

EarthOS Messaging is a reference host application built on this foundation.

---

## Current Status: v0.1 — Local-First Prototype

All data lives on the device. No real relay transport. No backend analytics. No server-side processing.

---

## Root Architecture

```
lib/
  foundation/      Active    Core app layers, capabilities, constants, feature flags
  qlpa/            Active    Language protocol, Net Shield scaffold, principles, guards
  design/          Active    Phi/Fibonacci tokens, layout rhythm, touch targets
  i18n/            Active    7 active locales, registry for 100+ future scale
  stats/           Scaffold  Light Stats active, Complete Stats scaffold only
  privacy/         Active    Data classes, content boundaries, retention rules
  security/        Active    Trust levels, clear scopes, delivery states
  <host-app>/      —         Host app messaging, files, voice, and app-specific layers

components/
  foundation/      Active    PreferenceBoundary, DeveloperOnly, AdvancedOnly
  stats/           Scaffold  StatsModeBadge, StatsSummaryCard, StatsPlaceholderPanel
  <host-app>/      —         Host app components (not part of this export)

scripts/
  check-foundation.mjs      Validates root architecture exists
  check-i18n.mjs            Validates locale completeness
  check-qlpa-language.mjs   Scans for discouraged terms
  check-stats-privacy.mjs   Guards against content fields in stats
  check-portability.mjs     Scans for project-specific coupling
```

---

## What Is Active Now

| Feature | Status | Notes |
|---------|--------|-------|
| Local messaging | Active | All data in localStorage |
| File transfer | Active | Local only in v0.1 |
| Voice memos | Active | Local only in v0.1 |
| Auto-clear | Active | Local device only — no remote enforcement |
| 7 languages | Active | en, fr, id, es, de, it, pt |
| Human Modes | Active | calm, sovereign, focus, care, creator, shield |
| Interface Depth | Active | simple, advanced, developer |
| QLPA Language | Active | Scans user-facing strings for fear-based language |
| Consent gates | Active | 6 QLPA gates before every message |
| Light Stats | Active | Local aggregate counters only |
| Privacy guards | Active | Content boundaries enforced |
| Phi/Fibonacci | Active | Design token system — not yet applied to all CSS |

## What Is Scaffolded (Not Active)

| Feature | Status | Notes |
|---------|--------|-------|
| QLPA Net Shield UI | Scaffold | Architecture typed, no UI surface yet |
| Complete Stats | Scaffold | Types exist, IndexedDB not wired |
| Multi-device sync | Scaffold | Supabase sync layer not active |
| Source Clear | Scaffold | Requires relay enforcement |
| Guardian Shield | Scaffold | Do not surface to users yet |
| Shield Phrase | Future | Not implemented |
| Real relay transport | Future | Requires production auth + E2EE key exchange |

---

## Interface Depth System

Three levels control what users see:

**Simple** (default)
- Calm, clean interface
- No QA panels, no diagnostics, no dev tools
- Privacy and delivery shown in plain language only
- Suitable for all users

**Advanced**
- Privacy, delivery, consent, and trust panels visible
- Relay boundary visible
- QLPA validation journey accessible
- Suitable for privacy-conscious users

**Developer**
- Full QA panels: crypto, relay, sync, consent, integrity
- Stats Analyzer visible
- Foundation status visible
- Raw event log accessible
- For contributors and product team only

---

## Human Mode System

Six modes adjust communication tone and feature visibility:

| Mode | Storage Default | Tone | Features |
|------|----------------|------|----------|
| Calm | local_only | Peaceful, grounded | Voice, ritual, mirror |
| Sovereign | local_only | Full control | All features |
| Focus | encrypted_relay | Minimal | Message only |
| Care | local_only | Warm, supportive | Voice, ritual, mirror |
| Creator | encrypted_relay | Expressive | Voice, file, ritual |
| Shield | local_only | Private, minimal | Message, voice |

**Emergency** mode is a legacy key — migrates to **Shield** automatically.

---

## QLPA Language Protocol

Every user-facing string must be reviewed against these principles:

1. **Truth** — only claim what the system can actually do
2. **Calm** — no fear-based language, no manufactured urgency
3. **Consent** — no action without clear user choice
4. **Sovereignty** — users own their data
5. **Care** — support wellbeing, not engagement metrics
6. **Clarity** — every action has a visible, honest consequence
7. **Reversibility** — be honest about what can and cannot be undone
8. **No hidden extraction** — no silent upload, no plaintext relay
9. **No overclaiming** — especially around remote deletion

Run `npm run check:qlpa` to scan for discouraged terms.

---

## Stats: Light vs. Complete

### Light Mode (active)
- Local aggregate counters only
- Stored in localStorage
- In-memory event log (not persisted)
- No content, no identifiers, no backend
- Bundle impact: minimal

### Complete Mode (scaffold only)
- Future local IndexedDB storage
- Future Web Worker for background processing
- Richer per-day/per-week aggregation
- Export as JSON
- Never sends data to backend

Both modes are **always local-first** and **never inspect message content**.

---

## Phi / Golden Ratio Grid

All spacing should trace back to Fibonacci values: 3, 5, 8, 13, 21, 34, 55, 89, 144.

Two-column layouts use a 61.8/38.2 ratio (sidebar/content split).

See `docs/architecture/phi-grid-system.md` for full guidance.

---

## Next Wave Recommendations

1. Apply Phi/Fibonacci tokens to Tailwind config
2. Wire Complete Stats to IndexedDB
3. Surface QLPA Net Shield status in Developer view
4. Add locale detection for RTL (Arabic, future)
5. Add Foundation Status to Developer settings panel
6. Wire Stats events to host app action boundaries (message sent, file prepared, etc.)
7. Add PreferenceBoundary usage to existing QA panels
