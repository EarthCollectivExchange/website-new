# QLPA Matrix Source — Release Notes v1.0.0

**Package:** qlpa-matrix-source  
**Version:** 1.0.0  
**Export Date:** 2026-05-08  
**Maturity:** active

---

## Validation Results

All five checks passed with zero errors and zero warnings:

| Check | Result |
|-------|--------|
| check-foundation | pass — 0 errors, 0 warnings |
| check-i18n | pass — all 6 non-English locales complete, no hardcoded strings, no missing keys |
| check-qlpa-language | pass — 0 discouraged terms found in en.json |
| check-stats-privacy | pass — 0 violations, no prohibited fields in stats types |
| check-portability | pass — no project-specific coupling found |
| npm run build | pass — all 6 pages generated, 0 errors |

**Known warning (host app only):**  
Supabase `realtime-js` emits a webpack "Critical dependency: the request of a dependency is an expression" warning during the EarthOS Messaging host app build. This warning originates entirely within the `node_modules/@supabase/realtime-js` package and is unrelated to this export. It does not appear when building a fresh host project from this source alone.

---

## What Is Included

### Root Systems (Reusable, Portable)

| Group | Contents |
|-------|----------|
| `lib/foundation/` | App layers, capabilities, constants, feature flags, modes, preferences context, source identity |
| `lib/qlpa/` | Language protocol, Net Shield architecture, terminology, guards, principles, vocabulary |
| `lib/design/` | Phi/Golden Ratio tokens, Fibonacci scale, layout rhythm, touch targets, z-index scale |
| `lib/i18n/` | 7 active locales (en, fr, id, es, de, it, pt), registry, dictionary, useT hook, context |
| `lib/privacy/` | Data classes, content boundaries, retention rules, local-only rules |
| `lib/security/` | Trust levels, clear scopes, protection states, delivery states |
| `lib/stats/` | Light analyzer (active), complete analyzer (scaffold), stats store, privacy guard, events, selectors, export |
| `components/foundation/` | PreferenceBoundary, AdvancedOnly, DeveloperOnly, FoundationStatusBadge |
| `components/stats/` | StatsModeBadge, StatsSummaryCard, StatsPrivacyNotice, StatsPlaceholderPanel |
| `scripts/` | 5 validation scripts |
| `docs/architecture/` | foundation-map, integration-map, phi-grid-system, stats-analyzer-architecture |
| Root docs | README.md, QLPA-MATRIX-SOURCE.md, INTEGRATION-GUIDE.md, PROJECT-ADAPTATION.md, QLPA-ETHICAL-USE.md |
| Package meta | package.json, tsconfig.json, qlpa-matrix-source.manifest.json |

**Total: 102 files**

### Excluded Host-App Systems

These paths belong to the EarthOS Messaging host application and are **not** included in this export:

| Path | Reason |
|------|--------|
| `lib/messaging/` | Host app messaging types, modes, preferences, actions, sync, relay, crypto, files, voice |
| `components/messaging/` | 57 host-specific messaging components |
| `app/messaging/` | Next.js route and layout for the messaging feature |
| `lib/supabase.ts` | Host app Supabase client singleton |
| `supabase/` | Host app database migrations |
| `app/auth/` | Host app authentication callback |

---

## Decoupling Applied (Batches 1–3)

- Validation scripts corrected: `check-foundation` no longer requires `lib/messaging/`; `check-portability` now scans the export root correctly; `check-i18n` scans exported paths only
- Source files decoupled: all "EarthOS Messaging" identity strings replaced with "QLPA Matrix Source" or "host application" equivalents across 8 source files
- `appConstants.ts`: `APP_NAME` renamed to `DEFAULT_APP_NAME = 'QLPA Matrix Source'`; `STORAGE_NAMESPACE` set to `'qlpa'`; host-override notes added
- `languageProtocol.ts`: internal TODO block updated from `lib/messaging/` and `components/messaging/` paths to generic host-app terminology
- Documentation updated: titles, integration map, foundation map all aligned to portable identity
- README.md created from scratch
- Manifest regenerated with full validation results and decoupling history

---

## Next Recommended Wave

**Wave A — Stats Wiring (host app)**  
Wire `recordStatsEvent` from `lib/stats/lightAnalyzer.ts` into the host app's 7 primary action sites (app opened, message sent, conversation created, file prepared, voice recorded, language changed, mode changed). No new UI needed — `StatsPlaceholderPanel` already exists in Developer mode. Acceptance: real counts appear in the Developer stats panel.

**Wave B — Phi/Fibonacci → Tailwind (host app)**  
Wire `lib/design/fibonacciScale.ts` and `lib/design/layoutRhythm.ts` into `tailwind.config.ts` as custom spacing tokens. Apply to existing components in one pass. Acceptance: no visual regressions; spacing is Fibonacci-aligned throughout.

**Wave C — PreferenceBoundary Gating (host app)**  
Wrap all host app QA panels in `DeveloperOnly`. Confirm Simple and Advanced views show zero developer diagnostic content.

---

## Archive

| File | Path |
|------|------|
| Archive | `exports/releases/qlpa-matrix-source-v1.0.0.zip` |
| Checksum | `exports/releases/qlpa-matrix-source-v1.0.0.sha256.txt` |
| Release notes | `exports/releases/RELEASE-NOTES-v1.0.0.md` |

SHA-256: `2562a02191db76e920498ab53b769111f28e5c3f0aff0c5838a5f0cc125b6ec4`
