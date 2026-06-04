// ─── Intention Mirror shared types ───────────────────────────────────────────
//
// Extracted to avoid circular imports between languageTaxonomy and intentionMirror.

export type ReasonCode =
  | 'heavy-urgency'
  | 'possible-pressure'
  | 'possible-blame'
  | 'possible-threat'
  | 'possible-scam'
  | 'absolute-language'
  | 'high-punctuation'
  | 'strong-emotion'
  | 'emotional-intensity'
  | 'profanity-detected'
  | 'direct-attack'
  | 'bot-repetition'
  | 'shield-child-safety'
  | 'shield-sexual-violence';

export type SuggestionKey =
  | 'languageHarmony.suggestionFeelUnheard'
  | 'languageHarmony.suggestionPrioritize'
  | 'languageHarmony.suggestionOpenRequest'
  | 'languageHarmony.suggestionDifferentView'
  | 'languageHarmony.suggestionFrustratedMoment'
  | 'languageHarmony.suggestionUnderstandEachOther'
  | 'languageHarmony.suggestionLookTogether'
  | 'languageHarmony.suggestionPrioritizeWhenPossible';
