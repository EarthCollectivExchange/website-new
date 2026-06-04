/**
 * Unicode normalization for multilingual taxonomy input.
 * All processing is local — no network, no APIs, no side effects.
 */

export interface NormalizeOptions {
  /** Remove Arabic diacritics (tashkeel) and tatweel. Default: true */
  stripArabicDiacritics?: boolean;
  /** Fold full-width Latin characters to ASCII equivalents. Default: true */
  foldFullWidthLatin?: boolean;
  /** Remove zero-width and invisible formatting characters. Default: true */
  stripZeroWidth?: boolean;
  /** Collapse repeated whitespace to a single space and trim. Default: true */
  collapseWhitespace?: boolean;
}

// Arabic diacritics (tashkeel): U+064B–U+065F + shadda U+0651 + sukun U+0652
// Arabic tatweel (kashida): U+0640
const ARABIC_DIACRITICS_RE = /[\u064B-\u065F\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;
const ARABIC_TATWEEL_RE    = /\u0640/g;

// Full-width Latin: U+FF01–U+FF5E maps to U+0021–U+007E
function foldFullWidth(text: string): string {
  return text.replace(/[\uFF01-\uFF5E]/g, ch =>
    String.fromCodePoint(ch.codePointAt(0)! - 0xFF01 + 0x0021)
  );
}

// Zero-width and invisible formatting characters
const ZERO_WIDTH_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF\u00AD]/g;

export function normalizeLanguageInput(
  text: string,
  options: NormalizeOptions = {},
): string {
  const {
    stripArabicDiacritics = true,
    foldFullWidthLatin    = true,
    stripZeroWidth        = true,
    collapseWhitespace    = true,
  } = options;

  // 1. NFKC normalization (canonical decomposition + compatibility composition)
  let out = text.normalize('NFKC');

  // 2. Remove zero-width / invisible formatting
  if (stripZeroWidth) {
    out = out.replace(ZERO_WIDTH_RE, '');
  }

  // 3. Strip Arabic diacritics and tatweel
  if (stripArabicDiacritics) {
    out = out.replace(ARABIC_DIACRITICS_RE, '').replace(ARABIC_TATWEEL_RE, '');
  }

  // 4. Fold full-width Latin characters
  if (foldFullWidthLatin) {
    out = foldFullWidth(out);
  }

  // 5. Collapse whitespace
  if (collapseWhitespace) {
    out = out.replace(/\s+/g, ' ').trim();
  }

  return out;
}
