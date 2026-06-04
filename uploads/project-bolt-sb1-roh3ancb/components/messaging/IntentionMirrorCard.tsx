'use client';

import { Eye, CreditCard as Edit3, X, Lock, ChevronRight } from 'lucide-react';
import type { IntentionMirrorAnalysis } from '@/lib/qlpa/intentionMirror';
import type { LanguageHarmonyMode } from '@/lib/qlpa/languageHarmonyPolicy';
import type { ReasonCode, SuggestionKey } from '@/lib/qlpa/intentionMirrorTypes';
import { useT } from '@/lib/i18n/useT';

interface IntentionMirrorCardProps {
  analysis: IntentionMirrorAnalysis;
  harmonyMode: LanguageHarmonyMode;
  /** User consciously chooses to send the message as written. Does NOT bypass consent gate. */
  onSendAsIs: () => void;
  /** User-triggered only — clears draft so they can rephrase */
  onSoften: () => void;
  /** Dismiss hides the panel for this draft. Does not send. */
  onDismiss: () => void;
}

// Reason code → i18n key mapping
const REASON_CODE_KEY: Partial<Record<ReasonCode, string>> = {
  'profanity-detected':   'languageHarmony.reason.profanityDetected',
  'emotional-intensity':  'languageHarmony.reason.emotionalIntensity',
  'strong-emotion':       'languageHarmony.reason.emotionalIntensity',
  'direct-attack':        'languageHarmony.reason.directAttack',
  'possible-pressure':    'languageHarmony.reason.pressureLanguage',
  'heavy-urgency':        'languageHarmony.reason.pressureLanguage',
  'possible-blame':       'languageHarmony.reason.blameLanguage',
  'absolute-language':    'languageHarmony.reason.blameLanguage',
  'possible-threat':      'languageHarmony.reason.threatLanguage',
  'shield-child-safety':  'languageHarmony.reason.childSafetyCritical',
  'shield-sexual-violence': 'languageHarmony.reason.nonConsensualSafety',
  'possible-scam':        'languageHarmony.reason.scamPattern',
  'bot-repetition':       'languageHarmony.reason.botSpamPattern',
  'high-punctuation':     'languageHarmony.reason.emotionalIntensity',
};

// Suggestion key → i18n translation key (keys are already i18n paths)
function suggestionI18nKey(key: SuggestionKey): string {
  return key; // e.g. "languageHarmony.suggestionFeelUnheard"
}

// Level color palette
function levelStyle(level: IntentionMirrorAnalysis['level']): {
  border: string;
  bg: string;
  accent: string;
  text: string;
} {
  switch (level) {
    case 'reflect':
      return {
        border: 'hsl(38 88% 62% / 0.22)',
        bg: 'linear-gradient(145deg, hsl(38 88% 62% / 0.07) 0%, hsl(210 30% 12% / 0.60) 100%)',
        accent: 'hsl(38 88% 72%)',
        text: 'hsl(38 60% 78%)',
      };
    case 'caution':
      return {
        border: 'hsl(30 90% 55% / 0.30)',
        bg: 'linear-gradient(145deg, hsl(30 90% 55% / 0.09) 0%, hsl(210 30% 12% / 0.60) 100%)',
        accent: 'hsl(30 90% 70%)',
        text: 'hsl(30 70% 76%)',
      };
    case 'hold':
      return {
        border: 'hsl(15 85% 50% / 0.35)',
        bg: 'linear-gradient(145deg, hsl(15 85% 50% / 0.10) 0%, hsl(210 30% 12% / 0.60) 100%)',
        accent: 'hsl(15 85% 68%)',
        text: 'hsl(15 70% 74%)',
      };
    case 'block':
      return {
        border: 'hsl(0 80% 50% / 0.40)',
        bg: 'linear-gradient(145deg, hsl(0 80% 50% / 0.10) 0%, hsl(210 30% 12% / 0.60) 100%)',
        accent: 'hsl(0 80% 70%)',
        text: 'hsl(0 65% 75%)',
      };
    default: // 'clear' — should not normally show
      return {
        border: 'hsl(192 65% 48% / 0.22)',
        bg: 'linear-gradient(145deg, hsl(192 65% 48% / 0.07) 0%, hsl(210 30% 12% / 0.60) 100%)',
        accent: 'hsl(192 65% 72%)',
        text: 'hsl(192 40% 78%)',
      };
  }
}

function levelMessageKey(level: IntentionMirrorAnalysis['level']): string {
  return `languageHarmony.${level}Message`;
}

export function IntentionMirrorCard({
  analysis,
  harmonyMode,
  onSendAsIs,
  onSoften,
  onDismiss,
}: IntentionMirrorCardProps) {
  const { t } = useT();
  const palette = levelStyle(analysis.level);

  // Deduplicate reason labels
  const reasonLabels = Array.from(
    new Set(
      analysis.reasonCodes
        .map((rc) => {
          const key = REASON_CODE_KEY[rc];
          return key ? t(key) : null;
        })
        .filter(Boolean) as string[]
    )
  ).slice(0, 3); // show max 3 reasons

  // Suggestion labels (optional — only shown if policy has suggestions enabled)
  const suggestionLabels =
    analysis.suggestionKeys.length > 0
      ? analysis.suggestionKeys
          .slice(0, 2)
          .map((k) => t(suggestionI18nKey(k)))
          .filter(Boolean)
      : [];

  const isShield = analysis.shieldEscalationRequired;

  return (
    <div
      className="mx-0 mt-1 rounded-2xl animate-in slide-in-from-bottom-2 duration-300"
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        boxShadow: `0 0 0 1px ${palette.border.replace('/ 0.', '/ 0.0')}, 0 4px 16px rgba(0,0,0,0.18)`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${palette.accent.replace(')', ' / 0.14)')?.replace('hsl(', 'hsl(')}`, border: `1px solid ${palette.border}` }}>
            <Eye className="w-3.5 h-3.5" style={{ color: palette.accent }} />
          </div>
          <p className="text-[0.8125rem] font-semibold" style={{ color: palette.accent }}>
            {t('mirror.title')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Local-only badge */}
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[0.65rem] font-medium"
            style={{ background: 'hsl(192 50% 18% / 0.50)', border: '1px solid hsl(192 50% 40% / 0.20)', color: 'hsl(192 50% 70%)' }}>
            <Lock className="w-2.5 h-2.5" />
            {t('languageHarmony.multilingual.localOnlyAnalysis').split('—')[0].trim()}
          </span>

          <button
            onClick={onDismiss}
            className="transition-opacity hover:opacity-100 opacity-50"
            aria-label="Dismiss"
            style={{ color: palette.accent }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Message ────────────────────────────────────────────────────────── */}
      <p className="px-3.5 text-[0.8125rem] leading-relaxed pb-2" style={{ color: palette.text }}>
        {t(levelMessageKey(analysis.level))}
      </p>

      {/* ── Reason labels ──────────────────────────────────────────────────── */}
      {reasonLabels.length > 0 && (
        <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
          {reasonLabels.map((label, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem]"
              style={{ background: `${palette.border.replace('/ 0.', '/ 0.12)')}`, border: `1px solid ${palette.border}`, color: palette.text }}>
              <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* ── Suggestions (optional) ─────────────────────────────────────────── */}
      {suggestionLabels.length > 0 && (
        <div className="mx-3.5 mb-2.5 px-3 py-2 rounded-xl"
          style={{ background: 'hsl(210 30% 14% / 0.60)', border: '1px solid hsl(210 30% 25% / 0.25)' }}>
          {suggestionLabels.map((s, i) => (
            <p key={i} className="text-[0.75rem] leading-relaxed" style={{ color: 'hsl(210 20% 68%)' }}>
              — {s}
            </p>
          ))}
        </div>
      )}

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="px-3.5 pb-3 flex gap-2">
        {/* "Send as-is" — does NOT bypass consent gate; records user_overrode state */}
        {analysis.canSendOriginal && (
          <button
            onClick={onSendAsIs}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
              transition-all hover:opacity-80 active:scale-95"
            style={{ background: 'hsl(214 30% 18%)', border: '1px solid hsl(214 30% 28%)', color: 'hsl(210 18% 76%)' }}
          >
            {t('languageHarmony.sendAsIs')}
          </button>
        )}

        {/* "Soften" — user-triggered only; clears draft */}
        <button
          onClick={onSoften}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
            transition-all hover:opacity-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, hsl(192 65% 40% / 0.80) 0%, hsl(192 60% 32% / 0.85) 100%)',
            border: `1px solid hsl(192 75% 50% / 0.25)`,
            color: 'hsl(192 30% 94%)',
          }}
        >
          <Edit3 className="w-3 h-3" />
          {t('languageHarmony.soften')}
        </button>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
      <p className="text-[10px] text-center pb-3 px-3 leading-relaxed" style={{ color: `${palette.accent.replace(')', ' / 0.50)')}` }}>
        {isShield
          ? t('languageHarmony.thisIsReflectionNotJudgment')
          : t('mirror.disclaimer')}
      </p>
    </div>
  );
}
