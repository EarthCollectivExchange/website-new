# EarthOS QLPA Matrix Source Code Base — Canonical v1

EarthOS QLPA Matrix Source Code Base — Canonical v1 is the reusable QLPA foundation for EarthOS-aligned applications. It contains the extracted infrastructure layer — principles, shield, language harmony, consent, trust, and integrity pipeline — ready for adaptation into sovereign, consent-first products.

---

## What this is

A structured canonical foundation extracted from the EarthOS Messaging QLPA Matrix build. Contains:

- **QLPA Core** — Principles, terminology, guards, consent engine, trust graph, message lifecycle, abuse taxonomy, intention mirror, test diagnostics
- **Shield Foundation** — NetShield policy engine, event taxonomy, readiness checks, vocabulary
- **Language Harmony** — 5-mode harmony policy, script detection, suggestion engine, multilingual taxonomy, unicode normalization
- **Communication Capability Matrix** — Transport envelope definitions and capability matrix
- **EarthOS Bridge** — App constants, capabilities, layers, readiness gates, feature flags, mode system
- **EarthCoin / Governance Boundary** — Release contract, reporting engine, shield policy
- **qlpa:check Pipeline** — 26-step automated integrity pipeline

---

## Scope

The QLPA infrastructure layer: principles, shield, language harmony, consent, trust, design tokens, i18n (7 locales), privacy/security layers, stats architecture, and the integrity pipeline. Application-specific product runtimes (message relay, live token engine, deployed stats service) are built on top of this foundation in product branches.

See `docs/QLPA_SOURCE_BASE_SCOPE.md` for the full scope map.

---

## Origin

Extracted from the EarthOS Messaging QLPA Matrix build at canonical-v1 status. The active EarthOS Messaging product is maintained in a separate branch. See `docs/QLPA_SOURCE_BASE_EXTRACTION_PLAN.md` for the full preservation and isolation plan.

---

## Adaptation Targets

- EarthOS Messaging
- World360
- EarthOS.world
- Earth Collective Exchange
- Creator tools
- Care system
- Codex portals

See `INTEGRATION-GUIDE.md` and `PROJECT-ADAPTATION.md` for how to adapt this foundation into a new EarthOS-aligned application.

---

## Foundation Integrity

```bash
npm run qlpa:check
```

26 automated checks — i18n, shield, envelope, system invariants, release claims, diagnostics, visual identity, and build.

```bash
npm run export:qlpa-matrix-source
```

Regenerate the portable canonical export at `exports/qlpa-matrix-source/`.

---

## Key Docs

- `docs/QLPA_SOURCE_BASE_EXTRACTION_PLAN.md` — Preserve/isolate audit
- `docs/QLPA_SOURCE_BASE_SCOPE.md` — Scope map
- `docs/QLPA_ARCHITECTURE_MAP.md` — Layer architecture
- `docs/QLPA_SHIELD_FOUNDATION.md` — Shield system
- `docs/QLPA_LANGUAGE_HARMONY_BLUEPRINT.md` — Language harmony
- `INTEGRATION-GUIDE.md` — How to build on this foundation
- `QLPA-ETHICAL-USE.md` — Ethical use requirements
- `QLPA-MATRIX-SOURCE.md` — Matrix source documentation

---

*EarthOS QLPA Matrix Source Code Base · canonical-v1*
