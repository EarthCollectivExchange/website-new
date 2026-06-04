/**
 * Multilingual Taxonomy Adapter Foundation (Pass 138)
 *
 * Maps non-English languages into the same QLPA semantic categories,
 * severity model, reason codes, and Shield rules as the English taxonomy.
 *
 * Design constraints:
 *   - No network calls, no translation APIs, no private text leaves device.
 *   - No new restrictive user-facing behavior.
 *   - Does NOT replace the existing English taxonomy.
 *   - Foundation-only pass: adapters are stubs with category mappings only.
 *   - For Arabic/Chinese/Japanese: no explicit harmful phrase examples
 *     in childSafety or nonConsensualSexual categories — placeholder hooks only.
 */

import type { TaxonomyEntry, TaxonomyCategory, TaxonomySeverity, TaxonomyDefaultAction } from './languageTaxonomy';
import type { ReasonCode } from './intentionMirrorTypes';
import { detectPrimaryScript, type LanguageScript } from './languageScriptDetection';
import { normalizeLanguageInput } from './unicodeLanguageNormalize';

// ─── Supported analysis languages ────────────────────────────────────────────

export type SupportedAnalysisLanguage =
  | 'en'           // English (existing taxonomy)
  | 'fr'           // French
  | 'de'           // German
  | 'es'           // Spanish
  | 'it'           // Italian
  | 'pt'           // Portuguese
  | 'id'           // Indonesian
  | 'ar'           // Arabic
  | 'zh'           // Chinese (Simplified/Traditional)
  | 'ja'           // Japanese
  | 'multilingual'; // Script-based fallback for unknown/mixed input

// ─── Adapter interface ────────────────────────────────────────────────────────

export interface LanguageTaxonomyAdapter {
  language: SupportedAnalysisLanguage;
  /** Human-readable name for logging/diagnostics. */
  displayName: string;
  /** Primary script(s) expected for this language. */
  primaryScripts: LanguageScript[];
  /** Normalize input text before matching. */
  normalize: (text: string) => string;
  /** Vocabulary entries for this language. */
  entries: readonly TaxonomyEntry[];
  /**
   * Category-level phrase hooks. These are empty arrays in foundation pass —
   * concrete entries will be added per language in future passes.
   */
  phraseHooks: Partial<Record<TaxonomyCategory, readonly string[]>>;
}

// ─── Helper to build a stub entry ────────────────────────────────────────────

function stubEntry(
  term: string,
  category: TaxonomyCategory,
  severity: TaxonomySeverity,
  defaultAction: TaxonomyDefaultAction,
  contextRequired: boolean,
  reasonCode: ReasonCode,
): TaxonomyEntry {
  return { term, category, severity, defaultAction, contextRequired, reasonCode };
}

// ─── Arabic adapter ───────────────────────────────────────────────────────────
//
// Safe general-purpose entries only. Shield-escalation categories
// (childSafety, nonConsensualSexual) are structurally wired but have no
// explicit phrase examples in this foundation pass.

const AR_ENTRIES: readonly TaxonomyEntry[] = [
  // Emotion
  stubEntry('غاضب',    'emotion', 'low', 'detect',  false, 'emotional-intensity'),  // angry
  stubEntry('خائف',    'emotion', 'low', 'detect',  false, 'emotional-intensity'),  // afraid
  stubEntry('حزين',    'emotion', 'low', 'detect',  false, 'emotional-intensity'),  // sad
  stubEntry('قلق',     'emotion', 'low', 'detect',  false, 'emotional-intensity'),  // anxious
  // Pressure — generic coercive terms
  stubEntry('اجبرك',   'pressure', 'medium', 'reflect', true, 'possible-pressure'),  // I'll force you
  stubEntry('لازم',    'pressure', 'low',    'detect',  true, 'possible-pressure'),  // must (context-dependent)
  // Insult — mild placeholder
  stubEntry('غبي',     'insult', 'medium', 'reflect', false, 'direct-attack'),      // stupid
  // Threat — generic placeholder
  stubEntry('سأضرك',   'threat', 'high', 'caution', true, 'possible-threat'),       // I will hurt you
  // Self-harm
  stubEntry('أؤذي نفسي', 'selfHarm', 'high', 'hold', true, 'strong-emotion'),      // I'll hurt myself
  // Scam
  stubEntry('أرسل المال', 'scam', 'medium', 'reflect', true, 'possible-scam'),      // send money
  // childSafety and nonConsensualSexual: structurally present, no phrase examples
];

const AR_ADAPTER: LanguageTaxonomyAdapter = {
  language: 'ar',
  displayName: 'Arabic',
  primaryScripts: ['arabic'],
  normalize: (text) => normalizeLanguageInput(text, {
    stripArabicDiacritics: true,
    foldFullWidthLatin: false,
    stripZeroWidth: true,
    collapseWhitespace: true,
  }),
  entries: AR_ENTRIES,
  phraseHooks: {
    childSafety: [],         // reserved — no examples in foundation pass
    nonConsensualSexual: [], // reserved — no examples in foundation pass
    threat: [],
    pressure: [],
    scam: [],
  },
};

// ─── Chinese adapter ──────────────────────────────────────────────────────────
//
// Same structural constraints as Arabic. No Shield-category phrase examples.
// Note: Chinese has no inflectional morphology — term matching is substring-based.

const ZH_ENTRIES: readonly TaxonomyEntry[] = [
  // Emotion
  stubEntry('生气',   'emotion', 'low', 'detect',  false, 'emotional-intensity'), // angry
  stubEntry('害怕',   'emotion', 'low', 'detect',  false, 'emotional-intensity'), // afraid
  stubEntry('伤心',   'emotion', 'low', 'detect',  false, 'emotional-intensity'), // sad
  stubEntry('焦虑',   'emotion', 'low', 'detect',  false, 'emotional-intensity'), // anxious
  // Pressure
  stubEntry('必须',   'pressure', 'low',    'detect',  true, 'possible-pressure'), // must (context-dependent)
  stubEntry('逼你',   'pressure', 'medium', 'reflect', true, 'possible-pressure'), // force you
  // Insult
  stubEntry('白痴',   'insult', 'medium', 'reflect', false, 'direct-attack'),     // idiot
  // Threat
  stubEntry('我会伤害你', 'threat', 'high', 'caution', true, 'possible-threat'),  // I will hurt you
  // Self-harm
  stubEntry('伤害自己', 'selfHarm', 'high', 'hold', true, 'strong-emotion'),      // hurt myself
  // Scam
  stubEntry('转账',   'scam', 'medium', 'reflect', true, 'possible-scam'),        // transfer money
  // childSafety and nonConsensualSexual: structurally present, no phrase examples
];

const ZH_ADAPTER: LanguageTaxonomyAdapter = {
  language: 'zh',
  displayName: 'Chinese',
  primaryScripts: ['han'],
  normalize: (text) => normalizeLanguageInput(text, {
    stripArabicDiacritics: false,
    foldFullWidthLatin: true,
    stripZeroWidth: true,
    collapseWhitespace: true,
  }),
  entries: ZH_ENTRIES,
  phraseHooks: {
    childSafety: [],
    nonConsensualSexual: [],
    threat: [],
    pressure: [],
    scam: [],
  },
};

// ─── Japanese adapter ─────────────────────────────────────────────────────────
//
// Same structural constraints. Kana + Han mixed input is common.

const JA_ENTRIES: readonly TaxonomyEntry[] = [
  // Emotion
  stubEntry('怒り',     'emotion', 'low', 'detect',  false, 'emotional-intensity'), // anger
  stubEntry('怖い',     'emotion', 'low', 'detect',  false, 'emotional-intensity'), // scared
  stubEntry('悲しい',   'emotion', 'low', 'detect',  false, 'emotional-intensity'), // sad
  stubEntry('不安',     'emotion', 'low', 'detect',  false, 'emotional-intensity'), // anxious
  // Pressure
  stubEntry('しなければ', 'pressure', 'low',    'detect',  true, 'possible-pressure'), // must do
  stubEntry('強制する',   'pressure', 'medium', 'reflect', true, 'possible-pressure'), // force
  // Insult
  stubEntry('ばか',     'insult', 'medium', 'reflect', false, 'direct-attack'),     // idiot
  stubEntry('馬鹿',     'insult', 'medium', 'reflect', false, 'direct-attack'),     // idiot (kanji)
  // Threat
  stubEntry('傷つける', 'threat', 'high', 'caution', true, 'possible-threat'),      // to hurt
  // Self-harm
  stubEntry('自傷',     'selfHarm', 'high', 'hold', true, 'strong-emotion'),        // self-harm
  // Scam
  stubEntry('送金',     'scam', 'medium', 'reflect', true, 'possible-scam'),        // send money
  // childSafety and nonConsensualSexual: structurally present, no phrase examples
];

const JA_ADAPTER: LanguageTaxonomyAdapter = {
  language: 'ja',
  displayName: 'Japanese',
  primaryScripts: ['kana', 'han'],
  normalize: (text) => normalizeLanguageInput(text, {
    stripArabicDiacritics: false,
    foldFullWidthLatin: true,
    stripZeroWidth: true,
    collapseWhitespace: true,
  }),
  entries: JA_ENTRIES,
  phraseHooks: {
    childSafety: [],
    nonConsensualSexual: [],
    threat: [],
    pressure: [],
    scam: [],
  },
};

// ─── Latin-script adapter (fr/de/es/it/pt/id) ────────────────────────────────
//
// Latin-script languages share the normalized English taxonomy path.
// Individual locales may be specialized in future passes.

function makeLatinAdapter(lang: SupportedAnalysisLanguage, name: string): LanguageTaxonomyAdapter {
  return {
    language: lang,
    displayName: name,
    primaryScripts: ['latin'],
    normalize: (text) => normalizeLanguageInput(text, {
      stripArabicDiacritics: false,
      foldFullWidthLatin: true,
      stripZeroWidth: true,
      collapseWhitespace: true,
    }),
    entries: [],     // falls through to English taxonomy for latin-script
    phraseHooks: {},
  };
}

// ─── Multilingual fallback adapter ───────────────────────────────────────────
//
// Used when the script is mixed or undetected. Combines all non-English
// adapters so that at least one language's entries can match.

const MULTILINGUAL_ADAPTER: LanguageTaxonomyAdapter = {
  language: 'multilingual',
  displayName: 'Multilingual (fallback)',
  primaryScripts: ['mixed', 'unknown'],
  normalize: (text) => normalizeLanguageInput(text),
  entries: [
    ...AR_ENTRIES,
    ...ZH_ENTRIES,
    ...JA_ENTRIES,
  ],
  phraseHooks: {
    childSafety: [],
    nonConsensualSexual: [],
  },
};

// ─── Adapter registry ─────────────────────────────────────────────────────────

const ADAPTER_REGISTRY: Record<SupportedAnalysisLanguage, LanguageTaxonomyAdapter> = {
  en: makeLatinAdapter('en', 'English'),  // English uses native TAXONOMY_TERMS — see languageTaxonomy.ts
  fr: makeLatinAdapter('fr', 'French'),
  de: makeLatinAdapter('de', 'German'),
  es: makeLatinAdapter('es', 'Spanish'),
  it: makeLatinAdapter('it', 'Italian'),
  pt: makeLatinAdapter('pt', 'Portuguese'),
  id: makeLatinAdapter('id', 'Indonesian'),
  ar: AR_ADAPTER,
  zh: ZH_ADAPTER,
  ja: JA_ADAPTER,
  multilingual: MULTILINGUAL_ADAPTER,
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getLanguageAdapter(language: SupportedAnalysisLanguage): LanguageTaxonomyAdapter {
  return ADAPTER_REGISTRY[language];
}

/**
 * Infer the best adapter for a text when no explicit language hint is given.
 * Uses script detection as the primary signal.
 */
export function inferAdapterFromText(text: string): LanguageTaxonomyAdapter {
  const script = detectPrimaryScript(text);
  switch (script) {
    case 'arabic':  return ADAPTER_REGISTRY['ar'];
    case 'han':     return ADAPTER_REGISTRY['zh'];
    case 'kana':    return ADAPTER_REGISTRY['ja'];
    case 'latin':   return ADAPTER_REGISTRY['en'];  // English taxonomy handles latin
    case 'mixed':   return ADAPTER_REGISTRY['multilingual'];
    default:        return ADAPTER_REGISTRY['multilingual'];
  }
}

export { ADAPTER_REGISTRY };
