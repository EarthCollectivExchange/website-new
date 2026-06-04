# QLPA Multilingual Language Root

**Pass:** 138 — Multilingual Language Adapter Foundation
**Date:** 2026-05-24
**Status:** Foundation (pre-MVP)

---

## Purpose

This document describes the multilingual language analysis foundation added in Pass 138. It enables the QLPA Intention Mirror to analyze messages written in Arabic, Chinese, Japanese, and other non-English scripts using the same semantic categories, severity model, reason codes, and Shield rules as the English taxonomy.

---

## Design Constraints

1. **No server calls.** All analysis is local-only. Text never leaves the device.
2. **No translation APIs.** Script detection and matching is purely Unicode range-based.
3. **No private text off-device.** Zero network I/O in any new module.
4. **No new restrictive behavior.** The foundation adds detection capability only — no new blocks, holds, or escalations that did not already exist in the English taxonomy.
5. **English taxonomy unchanged.** `TAXONOMY_TERMS` and all English helper functions are untouched. Non-English routing is additive.
6. **Foundation-only.** Adapters for Arabic, Chinese, and Japanese contain safe, general-purpose vocabulary entries only. No explicit harmful phrase examples in Shield-escalation categories (`childSafety`, `nonConsensualSexual`).
7. **Same root categories for all languages.** All languages map to the same 14 `TaxonomyCategory` values, same `TaxonomySeverity` levels, and same `TaxonomyDefaultAction` values.

---

## Architecture

### New Modules

| Module | Purpose |
|---|---|
| `lib/qlpa/languageScriptDetection.ts` | Unicode range-based script detection (latin/arabic/han/kana/mixed/unknown) |
| `lib/qlpa/unicodeLanguageNormalize.ts` | NFKC + Arabic diacritics/tatweel removal + full-width Latin folding + whitespace collapse |
| `lib/qlpa/multilingualTaxonomy.ts` | `LanguageTaxonomyAdapter` interface, starter adapters for ar/zh/ja/multilingual, `SupportedAnalysisLanguage` type |

### Modified Modules

| Module | Change |
|---|---|
| `lib/qlpa/languageTaxonomy.ts` | Added `findMultilingualTaxonomyMatches()` — routes to adapter or falls back to English |
| `lib/qlpa/intentionMirror.ts` | `IntentionMirrorContext.languageHint` added; analysis routes through multilingual path when set |
| `lib/qlpa/index.ts` | Three new modules re-exported |

---

## Script Detection

Supported scripts detected via Unicode code point ranges:

| Script | Unicode Ranges |
|---|---|
| `arabic` | U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF |
| `han` | U+4E00–U+9FFF, U+3400–U+4DBF, U+F900–U+FAFF |
| `kana` | U+3040–U+309F (hiragana), U+30A0–U+30FF (katakana) |
| `latin` | A–Z, a–z, U+00C0–U+024F |
| `mixed` | Multiple scripts each ≥ 30% of alpha chars |
| `unknown` | No recognizable script chars |

---

## Supported Analysis Languages

```typescript
type SupportedAnalysisLanguage =
  | 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'id'  // Latin-script
  | 'ar'                                               // Arabic
  | 'zh'                                               // Chinese
  | 'ja'                                               // Japanese
  | 'multilingual';                                    // Script-based fallback
```

Latin-script languages (en/fr/de/es/it/pt/id) all route through the English taxonomy. Language-specific Latin adapters are registered but use empty `entries` arrays in this foundation pass — they will be populated with locale-specific vocabulary in future passes.

---

## Routing Logic

`findMultilingualTaxonomyMatches(text, languageHint?)`:

1. If no hint or `'en'` or any Latin-script language → use existing English `findTaxonomyMatches()`.
2. If `'ar'`, `'zh'`, or `'ja'` → run language-specific adapter first, then also run English taxonomy as safety net. Merge results, deduplicating by term.
3. If `'multilingual'` or unknown → run `inferAdapterFromText()` (script detection), then merge with English.

Shield escalation (`childSafety`, `nonConsensualSexual`) is always checked in the merged result regardless of language.

---

## Unicode Normalization

`normalizeLanguageInput(text, options?)` applies in this order:

1. NFKC normalization (canonical decomposition + compatibility composition)
2. Zero-width / invisible formatting character removal
3. Arabic diacritics (tashkeel U+064B–U+065F) and tatweel (U+0640) removal
4. Full-width Latin character folding (U+FF01–U+FF5E → U+0021–U+007E)
5. Whitespace collapse + trim

All options are enabled by default. The `stripArabicDiacritics` option is disabled for non-Arabic languages to avoid unintended stripping.

---

## Shield Escalation Guarantee

All languages inherit the same Shield escalation rules:

- Terms in `childSafety` or `nonConsensualSexual` categories always set `shieldEscalationRequired = true`.
- Context patterns with `reasonCode: 'shield-child-safety'` or `'shield-sexual-violence'` always escalate.
- Escalation is checked on the merged English + adapter term set, so mixed-language messages are fully covered.

---

## Language Adapter Structure

```typescript
interface LanguageTaxonomyAdapter {
  language: SupportedAnalysisLanguage;
  displayName: string;
  primaryScripts: LanguageScript[];
  normalize: (text: string) => string;
  entries: readonly TaxonomyEntry[];
  phraseHooks: Partial<Record<TaxonomyCategory, readonly string[]>>;
}
```

`phraseHooks` provides empty arrays for Shield categories in the foundation pass. Future passes will populate them with safe community-reviewed vocabulary — never explicit harmful content.

---

## i18n Keys Added

`languageHarmony.multilingual.*` section (9 keys) added to all 7 locales (en/fr/de/es/it/pt/id):

- `analysisLanguage`
- `detectedScript`
- `multilingualFallback`
- `localOnlyAnalysis`
- `unsupportedLanguageSafeMode`
- `arabicSupported`
- `chineseSupported`
- `japaneseSupported`
- `sameRootCategories`

---

## Known Limitations at Pass 138

- Arabic, Chinese, and Japanese adapters contain basic vocabulary (emotion, pressure, insult, threat, self-harm, scam) only. Full vocabulary coverage requires community review in future passes.
- Script detection is heuristic — very short texts may return `'unknown'`.
- Japanese Han characters (shared with Chinese) are currently routed to `'zh'` when script is `'han'` alone. Mixed kana+han input correctly routes to `'ja'`.
- Latin-script language adapters (fr/de/es/it/pt/id) are empty stubs — all analysis falls through to the English taxonomy.
- No user-facing language selection UI in this pass.
