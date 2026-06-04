'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Paperclip, Mic, ShieldOff, VolumeX, Clock, Info } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import type { IntentionMirrorState, FileTransfer, VoiceMemo, UserTier } from '@/lib/messaging/types';
import type { QLPAGuardResult } from '@/lib/messaging/localPersistence';
import {
  analyzeTextForIntentionMirror,
  type IntentionMirrorAnalysis,
  type ConversationContext,
} from '@/lib/qlpa/intentionMirror';
import {
  shouldReflectLanguage,
  shouldHoldForReview,
} from '@/lib/qlpa/languageHarmonyPolicy';
import { usePreferences } from '@/lib/messaging/preferencesContext';
import { IntentionMirrorCard } from './IntentionMirrorCard';
import { AttachmentMenu } from './AttachmentMenu';
import { VoiceRecorderPanel } from './VoiceRecorderPanel';
import { FileTransferPanel } from './FileTransferPanel';

const ALLOW_ALL_GUARD: QLPAGuardResult = {
  canSend: true,
  isPending: false,
  blockReason: null,
  blockMessage: null,
  contextNotice: null,
};

interface MessageComposerProps {
  conversationId: string;
  senderEarthId: string;
  onSend: (body: string, mirrorState: IntentionMirrorState, isPending: boolean) => void;
  onFileSend?: (transfer: FileTransfer, body: string, mirrorState: IntentionMirrorState, isPending: boolean) => void;
  onVoiceSend?: (memo: VoiceMemo, body: string, mirrorState: IntentionMirrorState, isPending: boolean) => void;
  tier?: UserTier;
  qlpaGuard?: QLPAGuardResult;
  isMuted?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showVoiceButton?: boolean;
  showFileButton?: boolean;
  showRitualNote?: boolean;
  conversationContext?: ConversationContext;
}

export function MessageComposer({
  conversationId,
  senderEarthId,
  onSend,
  onFileSend,
  onVoiceSend,
  tier = 'free',
  qlpaGuard = ALLOW_ALL_GUARD,
  isMuted = false,
  disabled = false,
  placeholder,
  showVoiceButton = true,
  showFileButton = true,
  showRitualNote = true,
  conversationContext = 'direct',
}: MessageComposerProps) {
  const { t } = useT();
  const { languageHarmonyMode } = usePreferences();
  const resolvedPlaceholder = placeholder ?? t('composer.placeholder');

  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [mirrorState, setMirrorState] = useState<IntentionMirrorState>('not_checked');

  // QLPA analysis result — stays in component state only, never persisted or sent
  const [analysis, setAnalysis] = useState<IntentionMirrorAnalysis | null>(null);
  // Whether the mirror panel is visible (user can dismiss without re-triggering on same text)
  const [mirrorDismissed, setMirrorDismissed] = useState(false);

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Debounce timer ref — analysis runs on draft text, never persisted
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, []);

  const isBlocked = !qlpaGuard.canSend;
  const composerDisabled = disabled || isBlocked;

  // Debounced local analysis — fires 600ms after typing stops, never stores to localStorage or server
  useEffect(() => {
    if (languageHarmonyMode === 'off') {
      setAnalysis(null);
      return;
    }
    if (!body.trim()) {
      setAnalysis(null);
      setMirrorDismissed(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = analyzeTextForIntentionMirror(body.trim(), {
        conversationContext,
        isBroadcast: false,
        isEmergency: false,
      });
      setAnalysis(result);
      // Reset dismissed state only when body changes meaningfully
      setMirrorDismissed(false);
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [body, languageHarmonyMode, conversationContext]);

  // Whether the QLPA mirror panel should be visible
  const showMirrorPanel =
    !mirrorDismissed &&
    analysis !== null &&
    languageHarmonyMode !== 'off' &&
    shouldReflectLanguage(analysis.level, languageHarmonyMode) &&
    mirrorState !== 'user_overrode' &&
    body.trim().length > 0;

  // Whether the current draft is held pending user review
  const isHeld =
    analysis !== null &&
    shouldHoldForReview(analysis.level, languageHarmonyMode) &&
    mirrorState !== 'user_overrode';

  function attemptSend(forceOverride?: boolean) {
    const trimmed = body.trim();
    if (!trimmed || sending || isBlocked) return;

    const currentMirrorState: IntentionMirrorState = mirrorState;

    // If held and user hasn't overridden, show mirror panel and stop
    if (isHeld && !forceOverride && currentMirrorState !== 'user_overrode') {
      setMirrorDismissed(false);
      return;
    }

    setSending(true);
    try {
      const finalState: IntentionMirrorState =
        forceOverride || currentMirrorState === 'user_overrode' ? 'user_overrode' :
        analysis && analysis.level !== 'clear' ? 'reflected' :
        'clear';

      onSend(trimmed, finalState, qlpaGuard.isPending);
      setBody('');
      setMirrorState('not_checked');
      setAnalysis(null);
      setMirrorDismissed(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setSending(false);
    }
  }

  function handleSendAsIs() {
    // "Send as-is" — user consciously overrides the mirror; does NOT bypass consent gate
    setMirrorState('user_overrode');
    setMirrorDismissed(true);
    attemptSend(true);
  }

  function handleSoften() {
    // "Soften" — user-triggered only; clears the draft so they can rephrase
    setBody('');
    setAnalysis(null);
    setMirrorDismissed(false);
    setMirrorState('not_checked');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }

  function handleDismissMirror() {
    // Dismiss hides the panel for the current draft — does not send anything
    setMirrorDismissed(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      attemptSend();
    }
  }

  function handleAttachSelect(type: 'file' | 'image' | 'voice_note' | 'ritual_note') {
    if (type === 'voice_note' && showVoiceButton) {
      setShowVoice(true);
      return;
    }
    if ((type === 'file' || type === 'image') && showFileButton) {
      setShowFilePanel(true);
      return;
    }
    setBody((prev) => prev + (prev ? '\n' : '') + `[${type} — coming in Layer 2]`);
    autoResize();
    textareaRef.current?.focus();
  }

  function handleFileTransferReady(transfer: FileTransfer, fileBody: string) {
    setShowFilePanel(false);
    onFileSend?.(transfer, fileBody, mirrorState, qlpaGuard.isPending);
  }

  function handleVoiceMemoReady(memo: VoiceMemo, memoBody: string) {
    setShowVoice(false);
    onVoiceSend?.(memo, memoBody, mirrorState, qlpaGuard.isPending);
  }

  const canSend = body.trim().length > 0 && !sending && !composerDisabled;
  const hasAnyAttachment = showFileButton || showVoiceButton || showRitualNote;

  return (
    <div className="flex-shrink-0 backdrop-blur-2xl"
      style={{ background: 'var(--qlpa-bottom-bg, rgba(8,22,36,0.72))', borderTop: 'var(--qlpa-bottom-border, 1px solid rgba(125,220,255,0.09))', boxShadow: '0 -1px 0 rgba(125,220,255,0.05)', minHeight: 'var(--qlpa-bottom-bar-h, 4.5rem)' }}
    >

      {/* ── Block notice ─────────────────────────────────────────────────── */}
      {isBlocked && qlpaGuard.blockMessage && (
        <BlockNotice message={qlpaGuard.blockMessage} reason={qlpaGuard.blockReason} />
      )}

      {/* ── Context notice ────────────────────────────────────────────────── */}
      {!isBlocked && qlpaGuard.contextNotice && (
        <div className="flex items-center gap-phi-3 px-phi-5 py-phi-3 border-b border-sky-500/10"
          style={{ background: 'hsl(212 48% 10% / 0.40)' }}>
          <Info className="w-[0.875rem] h-[0.875rem] text-muted-foreground flex-shrink-0" />
          <span className="text-[0.8125rem] text-muted-foreground leading-snug">
            {qlpaGuard.contextNotice}
          </span>
        </div>
      )}

      {/* ── Muted notice ─────────────────────────────────────────────────── */}
      {!isBlocked && isMuted && (
        <div className="flex items-center gap-phi-3 px-phi-5 py-phi-3 border-b border-sky-500/10"
          style={{ background: 'hsl(212 48% 10% / 0.40)' }}>
          <VolumeX className="w-[0.875rem] h-[0.875rem] text-muted-foreground flex-shrink-0" />
          <span className="text-[0.8125rem] text-muted-foreground leading-snug">
            {t('composer.mutedNotice')}
          </span>
        </div>
      )}

      {/* ── Pending approval notice ──────────────────────────────────────── */}
      {!isBlocked && qlpaGuard.isPending && (
        <div className="flex items-center gap-phi-3 px-phi-5 py-phi-3 border-b"
          style={{ background: 'hsl(38 88% 62% / 0.08)', borderColor: 'hsl(38 88% 62% / 0.20)' }}>
          <Clock className="w-[0.875rem] h-[0.875rem] flex-shrink-0" style={{ color: 'hsl(38 88% 72%)' }} />
          <span className="text-[0.8125rem] leading-snug" style={{ color: 'hsl(38 80% 76%)' }}>
            {t('composer.approvalNotice')}
          </span>
        </div>
      )}

      {/* ── Composer body ─────────────────────────────────────────────────── */}
      <div className="px-3 md:px-phi-5" style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem' }}>

        {/* ── QLPA Intention Mirror panel (canonical — single source of truth) */}
        {showMirrorPanel && analysis && (
          <div className="mb-phi-3">
            <IntentionMirrorCard
              analysis={analysis}
              harmonyMode={languageHarmonyMode}
              onSendAsIs={handleSendAsIs}
              onSoften={handleSoften}
              onDismiss={handleDismissMirror}
            />
          </div>
        )}

        {/* Voice recorder */}
        {showVoice && !showMirrorPanel && !showFilePanel && (
          <div className="mb-phi-3">
            <VoiceRecorderPanel
              conversationId={conversationId}
              senderEarthId={senderEarthId}
              tier={tier}
              onMemoReady={handleVoiceMemoReady}
              onClose={() => setShowVoice(false)}
            />
          </div>
        )}

        {/* File transfer panel */}
        {showFilePanel && !showMirrorPanel && (
          <div className="mb-phi-3">
            <FileTransferPanel
              conversationId={conversationId}
              senderEarthId={senderEarthId}
              tier={tier}
              onTransferReady={handleFileTransferReady}
              onClose={() => setShowFilePanel(false)}
            />
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-phi-3">

          {/* Attachment button */}
          {hasAnyAttachment && (
          <div className="relative flex-shrink-0">
            <button
              disabled={composerDisabled}
              onClick={() => { setShowAttachMenu((v) => !v); setShowVoice(false); }}
              className={`w-10 h-10 flex items-center justify-center rounded-full
                transition-all duration-150 touch-manipulation
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                disabled:opacity-40
                ${showAttachMenu
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/70'
                }`}
              aria-label={t('composer.attach')}
            >
              <Paperclip className="w-[1.0625rem] h-[1.0625rem]" />
            </button>
            {showAttachMenu && (
              <AttachmentMenu
                onClose={() => setShowAttachMenu(false)}
                onSelect={handleAttachSelect}
                showFileOptions={showFileButton}
                showVoiceOption={showVoiceButton}
                showRitualNote={showRitualNote}
              />
            )}
          </div>
          )}

          {/* Text area */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => { setBody(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              disabled={composerDisabled || sending}
              placeholder={isBlocked ? '' : resolvedPlaceholder}
              rows={1}
              className="w-full resize-none rounded-phi-lg bg-sky-500/5 backdrop-blur-md
                px-phi-4 py-[0.5rem]
                text-[0.9375rem] text-foreground placeholder:text-muted-foreground/50
                focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/35
                disabled:opacity-50 transition-all leading-relaxed
                min-h-[2.5rem] max-h-24 md:max-h-36 overflow-y-auto"
              style={{ border: '1px solid var(--qlpa-divider-soft)', boxShadow: '0 0 0 1px rgba(125,220,255,0.04) inset' }}
            />
          </div>

          {/* Voice button */}
          {showVoiceButton && (
          <button
            disabled={composerDisabled}
            onClick={() => { setShowVoice((v) => !v); setShowAttachMenu(false); }}
            className={`flex-shrink-0 w-10 h-10 flex items-center justify-center
              rounded-full transition-all duration-150 touch-manipulation
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              disabled:opacity-40
              ${showVoice
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/70'
              }`}
            aria-label={t('composer.voice')}
          >
            <Mic className="w-[1.0625rem] h-[1.0625rem]" />
          </button>
          )}

          {/* Send button */}
          <button
            onClick={() => attemptSend()}
            disabled={!canSend}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center
              rounded-full qlpa-primary-water
              disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t('composer.send')}
          >
            {sending ? (
              <span className="w-[1rem] h-[1rem] border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : qlpaGuard.isPending ? (
              <Clock className="w-[1rem] h-[1rem]" />
            ) : (
              <Send className="w-[1rem] h-[1rem]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Block notice ─────────────────────────────────────────────────────────────

function BlockNotice({
  message,
  reason,
}: {
  message: string;
  reason: QLPAGuardResult['blockReason'];
}) {
  const { t } = useT();
  const Icon = reason === 'blocked_trust' || reason === 'blocked_conversation' ? ShieldOff : VolumeX;

  return (
    <div className="flex items-start gap-phi-4 px-phi-5 py-phi-4 qlpa-soft-danger border-b border-red-500/15 rounded-none">
      <div className="w-[2.125rem] h-[2.125rem] rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-[1rem] h-[1rem] text-red-400" />
      </div>
      <div>
        <p className="text-[0.9375rem] text-red-300 font-semibold leading-snug">
          {t('composer.pausedTitle')}
        </p>
        <p className="text-[0.8125rem] text-red-300/70 mt-[0.25rem] leading-relaxed">
          {message}
        </p>
        <p className="text-[0.75rem] text-red-300/50 mt-[0.25rem]">
          {t('composer.pausedDesc')}
        </p>
      </div>
    </div>
  );
}
