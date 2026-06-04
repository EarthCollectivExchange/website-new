# QLPA Language Harmony Blueprint

**Pass: 140 — Intention Mirror UX Verification and Deduplication**
**Status: LIVE — QLPA analysis engine wired into MessageComposer as canonical single panel.**

---

## What It Is

The Language Harmony system is a local, pattern-based reflection engine that helps senders notice how a message might feel before they send it. Internally this is called the "Zero Negative Blueprint Energy Checker."

It is surfaced to users through the **Intention Mirror** — a gentle feedback layer that shows observations without making judgments, and always lets the sender decide.

---

## What It Does

1. **Analyzes message text locally** — pattern matching only, no AI server calls, no text leaving the device.
2. **Returns a result level** — `clear`, `reflect`, `caution`, `hold`, or `block` — based on a weighted composite score.
3. **Shows gentle observations** — "heavy urgency detected", "possible pressure language" — with optional suggestions for softening.
4. **Escalates to Shield** for severe categories (child safety, sexual violence) where `shieldEscalationRequired = true`.
5. **Always allows the sender to proceed** — except when Shield escalation is required, in which case the sender must explicitly acknowledge before sending.

---

## What It Does NOT Do

- It does NOT censor messages.
- It does NOT silently discard any text.
- It does NOT make automatic rewrites.
- It does NOT contact any server or AI service.
- It does NOT passively monitor private conversations.
- It does NOT punish normal emotional language.
- It does NOT block messages that express anger, sadness, or frustration.

---

## Why It Is Not Censorship

The Intention Mirror is a **mirror**, not a gatekeeper. It shows the sender what it notices. The sender remains in full control:

- `sendAsIs` — send the original message with no changes
- `soften` — the sender optionally edits with suggestions as a starting point
- `cancel` — the sender pauses and returns to the composer

Even in `strict` and `guardian` modes, `alwaysAllowOverride: true` — the user can send any non-Shield message as written.

---

## Result Levels

| Level | Score Range | Meaning |
|-------|------------|---------|
| `clear` | 0–21 | Message reads fine; no reflection shown |
| `reflect` | 22–34 | Gentle nudge — "here's what we noticed" |
| `caution` | 35–55 | Soft suggestion — consider rewording |
| `hold` | 56–89 | Strong reflection — review before sending |
| `block` | 90–100 | Severe Shield category detected; escalation required |

Thresholds are aligned to the Fibonacci / phi design system: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89.

---

## Policy Modes

| Mode | Reflection from | Hold from | Suggestions | Override |
|------|----------------|-----------|-------------|---------|
| `off` | block only | never | no | always |
| `soft` | caution | never | yes | always |
| `clear` | reflect | never | yes | always |
| `strict` | reflect | hold | yes | always |
| `guardian` | reflect | caution | yes | always |

`off` mode: Intention Mirror is disabled, but Shield severe categories are still detected and `shieldEscalationRequired` is still set.

`guardian` mode: designed for group/community spaces where a wider audience may be affected.

---

## QLPA Dimension Weights

Weights are Fibonacci-inspired and sum to 100:

| Dimension | Weight | Why |
|-----------|--------|-----|
| safety | 34 | Proximity to harm vocabulary is the strongest signal |
| consent | 21 | User autonomy is foundational |
| pressure | 13 | Coercion signals affect message safety |
| clarity | 13 | Unclear messages create friction |
| care | 8 | Warmth and consideration matter |
| sovereignty | 8 | Boundary respect for both parties |
| context | 3 | Catch-all adjustment factor |

Dimensions not in the weight map (`publicRisk`, `childSafety`, `sexualViolence`, `botSpam`, `scamRisk`) are Shield-linked and bypass composite scoring — any non-zero signal triggers `shieldEscalationRequired`.

---

## Shield Connection

The Language Harmony system connects to the Shield taxonomy at two points:

1. **`SHIELD_ESCALATION_DIMENSIONS`** — `childSafety` and `sexualViolence` bypass normal scoring. Any pattern match in these dimensions forces `level = 'block'` and `shieldEscalationRequired = true`.

2. **`shouldBlockForShield(result)`** — returns `true` when `result === 'block'`, regardless of policy mode.

Shield-level content: child exploitation vocabulary, sexual violence vocabulary. These are deliberately broad patterns — detailed classification belongs in the Shield reporting engine, not here.

Normal emotional language (anger, frustration, disappointment) does NOT trigger Shield escalation.

---

## Language Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| `clarity` | How clearly the message communicates intent |
| `consent` | Respect for the recipient's autonomy |
| `pressure` | Urgency and coercion signals |
| `care` | Warmth and consideration |
| `sovereignty` | Respect for both parties' boundaries |
| `safety` | Proximity to harm vocabulary |
| `publicRisk` | Risk if the message were made public |
| `childSafety` | Child safety signals (Shield-linked) |
| `sexualViolence` | Sexual violence signals (Shield-linked) |
| `botSpam` | Repetitive / bot-like patterns |
| `scamRisk` | Financial manipulation patterns |

---

## Privacy Rule: Local-First Analysis Only

All analysis runs on-device using pattern matching (RegExp). The text being analyzed:

- Never leaves the device
- Is never sent to any server
- Is never logged to any database
- Is never shared with any third party

The only data that persists is the user's chosen policy mode preference (stored in local preferences).

---

## Suggestion Engine

The `languageSuggestionEngine` provides i18n-keyed suggestions for 7 common pressure patterns:

| Pattern | Suggestion |
|---------|-----------|
| "you never" | suggestionFeelUnheard |
| "you always" | suggestionFeelUnheard |
| "do this now" | suggestionPrioritize |
| "you must" | suggestionPrioritize |
| "if you cared" | suggestionOpenRequest |
| "you failed" | suggestionFeelUnheard |
| "that's wrong" | suggestionDifferentView |

Suggestions are returned as i18n keys. They are never auto-applied. The sender sees the suggestion and chooses whether to use it.

---

## Future Connections

### Voice Transcription
When voice notes are added (Pass 136+), the transcribed text will be passed through `analyzeTextForIntentionMirror` before the voice note is sent. The same policy modes apply.

### Public / Governance / EarthOS Signals
Public signals, governance records, and EarthCoin signals have higher `publicRisk` weights. In `guardian` mode, the system may hold these for review at the `caution` threshold rather than `hold`.

### Community Moderation
`communityGuardActive: true` in `guardian` mode enables future community-level moderation hooks. Currently this is a flag only — no moderation behavior is active.

---

## Vocabulary Taxonomy v1 (Pass 136)

The `languageTaxonomy.ts` module provides explicit vocabulary entries for the analysis engine. It replaced an earlier hardcoded pattern-rules approach and corrected a detection gap where profanity terms were not being matched.

### Why a Taxonomy?

The original `intentionMirror.ts` used only context pattern regexps, which meant common profanity like "shit" and "fuck" were not detected. The taxonomy adds a two-layer approach:

1. **Term matching** — explicit vocabulary entries with severity, defaultAction, and contextRequired
2. **Context pattern overrides** — multi-word patterns that escalate the action level only when profanity combines with attack or threat language

### Profanity Rule

Profanity alone does NOT block or hold. The `contextRequired: true` flag means profanity in isolation resolves to `detect` (score 10, level `clear`). Only when combined with a direct attack pattern does the score escalate.

| Text | Result | Reason |
|------|--------|--------|
| "this is shit" | reflect (or clear) | profanity alone, contextRequired=true |
| "fuck off" | caution | profanity + direct-attack context pattern |
| "I am so angry" | reflect | emotional-intensity, canSendOriginal=true |
| "I will hurt you" | hold | explicit threat pattern |
| [child safety term] | block + Shield | shieldEscalationRequired=true |

### 14 Taxonomy Categories

| Category | Severity | Notes |
|----------|----------|-------|
| `emotion` | low | Anger, frustration — detect only, never block alone |
| `profanity` | low–medium | contextRequired=true — escalates only with attack pattern |
| `pressure` | medium | Urgency and coercion signals |
| `insult` | medium | Personal attacks |
| `threat` | high | Explicit harm vocabulary |
| `hate` | high | Hate speech vocabulary |
| `sexual` | high | Sexual content |
| `nonConsensualSexual` | critical | Shield-linked |
| `childSafety` | critical | Shield-linked — forces block + escalation |
| `scam` | high | Financial manipulation |
| `botSpam` | medium | Repetitive pattern indicators |
| `selfHarm` | high | Self-harm vocabulary |
| `doxxing` | high | Personal information sharing |
| `manipulation` | medium | Psychological manipulation patterns |

### Context Patterns

Context patterns override the highest matched term action upward:

| Pattern | Override Action | Reason Code |
|---------|----------------|-------------|
| Profanity + "you/him/her/them" | caution | direct-attack |
| "I will [harm verb] you" | hold | possible-threat |
| Explicit threat phrase | hold | possible-threat |
| Sexual + child term | block | shield-child-safety |
| URL/link in message | reflect | possible-scam |

---

## Module Summary

| File | Purpose |
|------|---------|
| `lib/qlpa/languageBlueprint.ts` | Dimensions, result levels, Fibonacci thresholds, QLPA weights, pure helpers |
| `lib/qlpa/languageHarmonyPolicy.ts` | Policy modes, mode-specific behavior rules, pure policy helpers |
| `lib/qlpa/intentionMirrorTypes.ts` | Shared types (ReasonCode, SuggestionKey) — no dependencies, prevents circular imports |
| `lib/qlpa/intentionMirror.ts` | Main analysis function — uses `findTaxonomyMatches` + suggestion engine integration |
| `lib/qlpa/languageTaxonomy.ts` | Vocabulary registry — 14 categories, 90+ terms, 7 context patterns, 9 pure helpers |
| `lib/qlpa/languageSuggestionEngine.ts` | Suggestion engine — 15 pattern rules → i18n suggestion keys (4 new in Pass 136) |

All functions are pure. No React, no browser APIs, no network calls in any module.

---

## Pass History

- **Pass 135a** (2026-05-24): Language Harmony Blueprint Foundation created. 11 language dimensions, 5 result levels, 5 policy modes, Fibonacci-aligned thresholds, QLPA weights summing to 100, Shield escalation connection, 7 suggestion trigger patterns, 20 i18n keys × 7 locales = 140 new strings, check script with 17 assertion groups, qlpa:check pipeline expanded to 21 steps.

- **Pass 135b — Vocabulary Taxonomy Refinement** (2026-05-24): Created `languageTaxonomy.ts` (14 categories, ~70 vocabulary terms, 7 context patterns). Created `intentionMirrorTypes.ts` to break circular import. Rewrote `intentionMirror.ts` to use taxonomy for detection. Fixed detection gap where "shit"/"fuck" were not matched. Added profanity rule: contextRequired=true → escalates only with attack/threat patterns. Added 10 `languageHarmony.reason.*` i18n keys × 7 locales = 70 new strings. Expanded check script to 22 assertion groups.

- **Pass 136 — Language Taxonomy Vocabulary Registry** (2026-05-24): Extended `languageTaxonomy.ts` with 5 new registry-level pure helpers: `normalizeForTaxonomy`, `findTaxonomyMatches`, `getCategoryMatches`, `hasCriticalSafetyMatch`, `classifyTaxonomySeverity`. Extended `languageSuggestionEngine.ts` with 8 new suggestion rules (profanity+frustration → `suggestionFrustratedMoment`; direct attack → `suggestionUnderstandEachOther`; pressure/blame → `suggestionLookTogether`; urgency → `suggestionPrioritizeWhenPossible`). Updated `intentionMirror.ts` to use `findTaxonomyMatches` (normalized text path) and merge suggestion-engine keys into analysis result. Added 6 new i18n keys × 7 locales = 42 new strings (4 suggestion keys + `blameLanguage` + `nonConsensualSafety` reason keys). Expanded check script to 23 assertion groups with Pass 136 static behavior assertions. Total vocabulary entries: 90+. Total assertion groups: 23.

- **Pass 140 — Intention Mirror UX Verification and Deduplication** (2026-05-25): Audited and eliminated parallel mirror systems. Removed legacy `checkIntentionMirror` (from `lib/messaging/intentionMirror.ts`) from `MessageComposer` — it was the only active mirror UI, while `analyzeTextForIntentionMirror` (QLPA canonical, from `lib/qlpa/intentionMirror.ts`) was a complete library with no UI wiring. The QLPA analysis engine is now the single source of truth. Added `languageHarmonyMode` preference to `PreferencesContext` + `appConstants` (storage key `earthos.language_harmony_mode`, default `soft`). Rewrote `MessageComposer` to use debounced local QLPA analysis (draft text never stored or sent). Rewrote `IntentionMirrorCard` to consume `IntentionMirrorAnalysis` with: level color palette, reason code labels, optional suggestions (max 2), local-only badge, `Send as-is` (user_overrode — consent gate still active), `Soften` (user-triggered draft clear only). Added Language Harmony mode selector to `SettingsTab` (all 5 modes). Added 11 settings i18n keys × 7 locales = 77 new strings. Created `check:intention-mirror-composer` (136 assertions). Wired into `qlpa:check` pipeline (now 25 check steps before build). All mode behavior assertions verified: off/soft/clear have no holds; strict holds at `hold`; guardian holds at `caution`; all modes allow override. Test phrase coverage: angry/shit/fuck sendable; fuck-you → caution; normal → no panel; Arabic/CJK → no crash; Shield-critical → block level, enforcement future-gated.
