# QLPA Source Base Scope

**Project:** EarthOS QLPA Matrix Source Code Base — Canonical v1
**Status:** isolation-in-progress (Pass 003)
**Date:** 2026-05-25

---

## Branch Purpose

This is the reusable QLPA foundation layer — the extracted, integrity-verified infrastructure that EarthOS-aligned application teams adapt into sovereign, consent-first products.

The active EarthOS Messaging product is maintained in a separate branch/repo. This branch holds only the canonical foundation.

---

## Foundation Layers

Everything in this source base is infrastructure — not deployed product runtime.

### QLPA Architecture
- QLPA principles, guards, tokens, layout tokens
- Consent engine (QLPA-level)
- Trust graph (QLPA-level)
- Message lifecycle state machine
- Abuse taxonomy
- Intention mirror (analysis engine, types)
- Test diagnostics, local test log
- QLPA Runtime Context

### Shield Foundation
- NetShield policy, events, readiness, types, vocabulary
- Shield policy enforcement layer

### Language Harmony
- Language protocol
- Language harmony policy (5 modes: off, soft, clear, strict, guardian)
- Language script detection
- Language suggestion engine
- Language blueprint and taxonomy
- Multilingual taxonomy
- Unicode language normalization

### Communication Infrastructure
- Communication envelope definitions
- Communication capability matrix
- Release contract
- Reporting engine

### App Foundation
- App constants, capabilities, layers, readiness gates
- Feature flags, mode system
- Preferences context (foundation-level)
- Scroll orchestrator
- Source identity

### Design System
- Phi tokens, fibonacci scale, layout rhythm
- Touch targets, z-index, design index

### Internationalization
- i18n context, dictionary, keys, locale registry, locale types
- Missing key policy, useT hook
- 7 locale files (en, fr, de, es, it, pt, id)

### Privacy and Security
- Data classes, local-only rules, retention rules, content boundaries
- Trust levels, delivery states, protection states, clear scopes

### Stats Architecture
- Stats types, modes, store, privacy, events, export, selectors
- Light analyzer, complete analyzer

### Foundation Components
- AdvancedOnly, DeveloperOnly, FoundationStatusBadge, PreferenceBoundary

### Stats Components
- StatsModeBadge, StatsPlaceholderPanel, StatsPrivacyNotice, StatsSummaryCard

### Integrity Pipeline
- 26-step qlpa:check (foundation check scripts + validate i18n + export + build)

---

## Scope Boundary

The source base provides the architectural layer. Deployed product runtimes are built on top in product branches:

| Layer | Source Base | Product Branch |
|-------|-------------|----------------|
| QLPA principles + guards | Canonical | Inherited |
| Shield policy | Canonical | Inherited + extended |
| Language harmony engine | Canonical | Inherited |
| Communication primitives | Canonical | Inherited |
| Message relay / live transport | — | Product runtime |
| Live token / reward engine | — | Product runtime |
| Public statistics service | — | Product runtime |
| Chat product UI | — | Product runtime |
| Auth + user accounts | — | Product runtime |

---

## Differences from EarthOS Messaging Branch

| Aspect | EarthOS Messaging App | QLPA Source Base (this) |
|--------|----------------------|------------------------|
| Purpose | Sovereign messaging product | Reusable foundation layer |
| Homepage | Orb trinity launcher | Source base index with module overview |
| lib/messaging/ | Active, maintained | Present — archived in pass 2 |
| components/messaging/ | Active, maintained | Present — archived in pass 2 |
| qlpa:check | 26 steps (foundation + messaging) | 26 steps (foundation — messaging scripts removed in pass 2) |
| Adaptation | Is the product | Bootstraps new products |

---

## Adaptation Targets

Applications this foundation is built to serve:

- EarthOS Messaging
- World360
- EarthOS.world
- Earth Collective Exchange
- Creator tools
- Care system
- Codex portals

---

## Isolation Progress

| Stage | Status |
|-------|--------|
| Visual rebrand | COMPLETE |
| Product UI audit and manifest | COMPLETE (Pass 003) |
| app/messaging route stubbed | COMPLETE (Pass 003) |
| docs/archive/messaging-origin/ created | COMPLETE (Pass 003) |
| components/messaging/ archived | PENDING — Pass 004 |
| lib/messaging/ archived | PENDING — Pass 004 |
| Messaging check scripts restructured | PENDING — Pass 004 |
| Clean foundation-only build | PENDING — Pass 004 |

See `docs/SOURCE_BASE_STATUS.md` for the full pass history and next steps.
See `docs/QLPA_SOURCE_BASE_ISOLATION_MANIFEST.md` for the per-file action manifest.
See `docs/QLPA_SOURCE_BASE_EXTRACTION_PLAN.md` section 5 for the original isolation sequence.

---

*EarthOS QLPA Matrix Source Code Base · canonical-v1*
