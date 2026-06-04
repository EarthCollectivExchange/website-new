# Project Adaptation Guide

## Purpose

This guide explains what future projects customize when building on the QLPA Matrix Source.

The source foundation remains universal. Each project adapts the surface layer for its specific context while keeping the QLPA roots intact.

---

## What You Customize

### App Identity
- `APP_NAME` in `lib/foundation/appConstants.ts`
- `APP_VERSION` and storage key prefixes
- Source identity reference in `lib/foundation/sourceIdentity.ts`

### App Capabilities
- Enable or disable capabilities in `lib/foundation/appCapabilities.ts`
- Declare which features are active, scaffold, or future for your app
- Map capabilities to your product's feature set

### Human Modes
- Add, remove, or rename modes in `lib/foundation/modes.ts`
- Adjust accent hues, spacing density, and panel priorities per mode
- Keep mode vocabulary calm and clear

### Interface Depth
- Choose which depths your app supports (simple / advanced / developer)
- Adjust default depth per deployment context

### Supported Locales
- Add locale files in `lib/i18n/locales/`
- Register active locales in `lib/i18n/localeRegistry.ts`
- Add product-specific i18n keys to all active locale files
- Keep `en.json` as source of truth

### Stats Events
- Add product-specific event types to `lib/stats/statsTypes.ts`
- Keep all events privacy-clean (no content, no PII, no crypto material)
- Choose light or complete stats mode for your deployment

### Readiness Labels
- Customize maturity labels for your product context
- Map active / scaffold / future to your release stages

### Privacy Boundaries
- Add product-specific data classes in `lib/privacy/dataClasses.ts`
- Define retention rules appropriate for your data types
- Add content boundary rules for new data flows

### Design Skin
- Apply your product's color palette over the Phi/Fibonacci token structure
- Keep spacing and rhythm aligned to the 8px base and Fibonacci ladder
- Add product-specific Tailwind tokens in `tailwind.config.ts`

### Feature Maturity Labels
- Use foundation feature flags in `lib/foundation/featureFlags.ts`
- Add product flags with appropriate maturity levels
- Never mark scaffold or future capabilities as stable

### Deployment Context
- Set app mode to `local_first`, `demo`, or `network_future`
- Configure relay and network capabilities per deployment maturity
- Adjust appCapabilities to reflect what is actually available

### Protected Terms
- Add product-specific stable terms in `lib/i18n/localeTypes.ts`
- These terms are not translated — they remain consistent across locales
- Examples: product names, protocol identifiers, technical labels

---

## What You Keep Unchanged

- QLPA language protocol core (discouraged terms, replacements)
- Net Shield foundation architecture
- Privacy boundary rules
- Consent-first patterns
- Local-first default
- Phi/Fibonacci spacing system
- i18n key structure and fallback policy
- Stats privacy guards
- Security trust levels and clear scope definitions

---

## Quick Start Checklist

1. Copy `lib/foundation`, `lib/qlpa`, `lib/design`, `lib/i18n`, `lib/privacy`, `lib/security`, `lib/stats`, `components/foundation`, `components/stats` into your project
2. Update `lib/foundation/appConstants.ts` with your app name and version
3. Update `lib/foundation/sourceIdentity.ts` to reference this source
4. Add your product locales and i18n keys
5. Enable the capabilities your app supports
6. Apply your design skin over the token structure
7. Run `check-portability.mjs` to confirm clean foundation imports
8. Run `check-i18n.mjs`, `check-qlpa-language.mjs`, `check-stats-privacy.mjs`

---

## Keeping the Source Universal

When a feature is specific to your product, keep it in your product layer — not in the foundation.

Foundation paths: `lib/foundation/`, `lib/qlpa/`, `lib/design/`, `lib/i18n/`, `lib/privacy/`, `lib/security/`, `lib/stats/`

Product paths: `lib/<your-product>/`, `components/<your-product>/`, `app/<your-product>/`

This keeps the QLPA Matrix Source portable and reusable for every future system.
