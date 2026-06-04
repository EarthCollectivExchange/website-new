# QLPA Matrix Source

**Version:** 1.0.0  
**Maturity:** active  
**License:** SEE QLPA-ETHICAL-USE.md

---

## What Is QLPA Matrix Source?

QLPA Matrix Source is a portable, consent-first, local-first, Phi-aligned foundation for building privacy-preserving applications. It is not a framework — it is a set of roots: design language, privacy rules, protection architecture, i18n structure, mode logic, and QLPA language governance.

Any QLPA-aligned project copies this source, customizes the surface layer, and inherits the full ethical and structural foundation.

**EarthOS Messaging** is one example of a host application built on this base.

---

## What Is Included

| Directory | Contents |
|-----------|----------|
| `lib/foundation/` | App layers, capabilities, constants, feature flags, modes, preferences context |
| `lib/qlpa/` | Language protocol, Net Shield architecture, terminology, guards, principles |
| `lib/design/` | Phi/Golden Ratio tokens, Fibonacci scale, layout rhythm, touch targets, z-index |
| `lib/i18n/` | 7 active locales (en, fr, id, es, de, it, pt), registry, dictionary, hooks |
| `lib/privacy/` | Data classes, content boundaries, retention rules, local-only rules |
| `lib/security/` | Trust levels, clear scopes, protection states, delivery states |
| `lib/stats/` | Light analyzer, complete analyzer scaffold, stats store, privacy guard, events |
| `components/foundation/` | PreferenceBoundary, AdvancedOnly, DeveloperOnly, FoundationStatusBadge |
| `components/stats/` | StatsModeBadge, StatsSummaryCard, StatsPrivacyNotice, StatsPlaceholderPanel |
| `scripts/` | Five validation scripts |
| `docs/architecture/` | Foundation map, integration map, Phi grid system, stats analyzer architecture |

---

## How to Copy Into a New Project

1. Copy these directories into your project root:
   ```
   lib/foundation/
   lib/qlpa/
   lib/design/
   lib/i18n/
   lib/privacy/
   lib/security/
   lib/stats/
   components/foundation/
   components/stats/
   scripts/
   docs/architecture/
   ```

2. Ensure your `tsconfig.json` maps `@/*` to your project root:
   ```json
   { "compilerOptions": { "paths": { "@/*": ["./*"] } } }
   ```

3. Follow the full checklist in `PROJECT-ADAPTATION.md`.

---

## How to Use PreferencesProvider

Wrap your app root with `PreferencesProvider`:

```tsx
import { PreferencesProvider } from '@/lib/foundation/preferencesContext';

export default function RootLayout({ children }) {
  return (
    <PreferencesProvider>
      {children}
    </PreferencesProvider>
  );
}
```

Access preferences anywhere:

```tsx
import { usePreferences } from '@/lib/foundation/preferencesContext';

const { humanMode, interfaceDepth, isAdvancedOrDev, isDeveloper } = usePreferences();
```

---

## How to Use i18n

Wrap your app with `I18nProvider`:

```tsx
import { I18nProvider } from '@/lib/i18n/context';

<I18nProvider defaultLocale="en"><App /></I18nProvider>
```

Use translations in any component:

```tsx
import { useI18n } from '@/lib/i18n/context';

const { t, locale, setLocale } = useI18n();
// t('nav.conversations') → "Conversations"
```

Add your product-specific keys to all locale files. Keep `lib/i18n/locales/en.json` as the source of truth. Run `check:i18n` to verify all locales are complete.

---

## How to Use the QLPA Language Protocol

Import term lists and guards for developer tools and UI review:

```ts
import { DISCOURAGED_TERMS, TERM_REPLACEMENTS } from '@/lib/qlpa/languageProtocol';
import { scanTextForQlpaTerms } from '@/lib/qlpa/qlpaGuards';

const result = scanTextForQlpaTerms('Delete forever from all devices');
// result.found === true
// result.matches[0] → { term: 'Delete forever', replacement: 'Clear from this device' }
```

Run `check:qlpa` to scan your entire component tree for discouraged terms.

---

## How to Use Phi / Fibonacci Design Tokens

```ts
import { PHI, PHI_SCALE, phiMajor, phiMinor } from '@/lib/design/phiTokens';
import { FIBONACCI } from '@/lib/design/fibonacciScale';
import { SPACING } from '@/lib/design/layoutRhythm';

// Major/minor column split
const sidebar = phiMajor(1000); // 618px
const content = phiMinor(1000); // 382px

// Fibonacci spacing step
const gap = FIBONACCI.f13; // 13px
```

See `docs/architecture/phi-grid-system.md` for full layout guidance.

---

## How to Run Validation Scripts

From your project root (or from the export directory):

```bash
node scripts/check-foundation.mjs    # Validates all required directories and files exist
node scripts/check-i18n.mjs          # Checks locale completeness and hardcoded strings
node scripts/check-qlpa-language.mjs # Scans for discouraged terms in source
node scripts/check-stats-privacy.mjs # Confirms stats types contain no PII fields
node scripts/check-portability.mjs   # Scans for project-specific coupling
```

All five must pass (or warn without blocking) before distributing or building.

---

## What Host Projects Customize

| What | Where |
|------|-------|
| App name and storage namespace | `lib/foundation/appConstants.ts` — override `DEFAULT_APP_NAME` and `STORAGE_NAMESPACE` |
| App version and maturity | `lib/foundation/appConstants.ts` |
| Active capabilities | `lib/foundation/appCapabilities.ts` |
| Human modes (add/remove/rename) | `lib/foundation/modes.ts` |
| Supported locales | `lib/i18n/localeRegistry.ts` + add locale files |
| Product i18n keys | `lib/i18n/locales/*.json` |
| Stats event types | `lib/stats/statsTypes.ts` (keep privacy-clean) |
| Privacy data classes | `lib/privacy/dataClasses.ts` |
| Feature flags | `lib/foundation/featureFlags.ts` |
| Design skin | Tailwind config, color tokens (keep Phi spacing) |

Host applications must **not** modify the QLPA language protocol core, net shield architecture, consent patterns, or privacy boundary rules.

---

## Feature Maturity Model

Every capability in this source carries a maturity label:

| Label | Meaning |
|-------|---------|
| `active` | Working, tested, and in use in the reference host application |
| `scaffold` | Architecture is defined and typed — implementation follows in a future wave |
| `future` | Requires infrastructure not yet built (relay, guardian network, multi-device) |

Maturity is surfaced to developers via `appLayers.ts`, `appCapabilities.ts`, and `appReadiness.ts`. Never present a `scaffold` or `future` capability to users as if it were active.
