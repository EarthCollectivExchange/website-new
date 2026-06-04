/**
 * Script detection for multilingual taxonomy routing.
 * Pure Unicode range checks — no network, no browser APIs, no side effects.
 */

export type LanguageScript = 'latin' | 'arabic' | 'han' | 'kana' | 'mixed' | 'unknown';

// Unicode ranges used for detection
// Arabic: U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// CJK Unified Ideographs (core block) + Extension A + Extension B proxy + CJK Compatibility
const HAN_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/;

// Hiragana + Katakana (includes small forms and extensions)
const KANA_RE = /[\u3040-\u309F\u30A0-\u30FF]/;

// Latin: Basic Latin letters + Latin-1 Supplement letters + Latin Extended-A/B
const LATIN_RE = /[A-Za-z\u00C0-\u024F]/;

// Minimum ratio of a script's chars to classify as "primary"
const PRIMARY_SCRIPT_THRESHOLD = 0.30;

function scriptCharCount(text: string): {
  arabic: number; han: number; kana: number; latin: number; total: number;
} {
  let arabic = 0, han = 0, kana = 0, latin = 0;
  for (const ch of text) {
    if (ARABIC_RE.test(ch)) arabic++;
    else if (HAN_RE.test(ch)) han++;
    else if (KANA_RE.test(ch)) kana++;
    else if (LATIN_RE.test(ch)) latin++;
  }
  const total = arabic + han + kana + latin;
  return { arabic, han, kana, latin, total };
}

export function containsArabicScript(text: string): boolean {
  return ARABIC_RE.test(text);
}

export function containsHanScript(text: string): boolean {
  return HAN_RE.test(text);
}

export function containsKanaScript(text: string): boolean {
  return KANA_RE.test(text);
}

export function containsLatinScript(text: string): boolean {
  return LATIN_RE.test(text);
}

export function isMixedScript(text: string): boolean {
  const counts = scriptCharCount(text);
  if (counts.total === 0) return false;
  const scripts = [counts.arabic, counts.han, counts.kana, counts.latin];
  const dominant = scripts.filter(n => n / counts.total >= PRIMARY_SCRIPT_THRESHOLD);
  return dominant.length >= 2;
}

export function detectPrimaryScript(text: string): LanguageScript {
  const counts = scriptCharCount(text);
  if (counts.total === 0) return 'unknown';

  if (isMixedScript(text)) return 'mixed';

  const ratio = (n: number) => n / counts.total;

  if (ratio(counts.arabic) >= PRIMARY_SCRIPT_THRESHOLD) return 'arabic';
  if (ratio(counts.han)    >= PRIMARY_SCRIPT_THRESHOLD) return 'han';
  if (ratio(counts.kana)   >= PRIMARY_SCRIPT_THRESHOLD) return 'kana';
  if (ratio(counts.latin)  >= PRIMARY_SCRIPT_THRESHOLD) return 'latin';

  return 'unknown';
}
