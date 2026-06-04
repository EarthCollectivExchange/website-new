'use client';

import { UserPlus, Send, ChevronRight, Lock, Radio, ShieldCheck } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

interface EmptyConversationJourneyProps {
  hasMembers: boolean;
  hasMessages: boolean;
  testMessageSent?: boolean;
  relayReady?: boolean;
  onOpenMembers: () => void;
  onSendTestMessage: () => void;
  onOpenSovereignty?: () => void;
}

function JourneyStep({
  number, label, body, done, cta, ctaDisabled, ctaDisabledHint, isInviteStep, onCta,
}: {
  number: number; label: string; body: string; done?: boolean;
  cta?: string; ctaDisabled?: boolean; ctaDisabledHint?: string;
  isInviteStep?: boolean; onCta?: () => void;
}) {
  return (
    <div className={`flex gap-phi-3 ${done ? 'opacity-50' : ''}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
        style={done ? {
          background: 'rgba(97,214,178,0.12)',
          border: '1px solid rgba(97,214,178,0.24)',
          color: 'rgba(97,214,178,0.80)',
        } : {
          background: 'hsl(192 65% 48% / 0.12)',
          border: '1px solid hsl(192 65% 48% / 0.30)',
          color: 'rgba(120,210,240,0.90)',
        }}
      >
        {done ? '✓' : number}
      </div>
      <div className="flex-1 min-w-0 pb-phi-4">
        <p className={`text-sm font-semibold leading-snug ${done ? 'text-muted-foreground' : 'text-foreground'}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{body}</p>
        {cta && onCta && !done && (
          ctaDisabled ? (
            <div className="mt-phi-3 space-y-1">
              <button
                disabled
                className="flex items-center gap-1.5 px-phi-3 py-1.5 rounded-xl
                  text-xs font-semibold opacity-35 cursor-not-allowed select-none
                  border border-white/10 text-muted-foreground"
              >
                {isInviteStep ? <UserPlus className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{cta}</span>
              </button>
              {ctaDisabledHint && (
                <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{ctaDisabledHint}</p>
              )}
            </div>
          ) : (
            <button
              onClick={onCta}
              className="mt-phi-3 flex items-center gap-1.5 px-phi-3 py-1.5 rounded-xl
                qlpa-primary-water text-xs font-semibold
                hover:opacity-90 active:scale-95 transition-all touch-manipulation"
            >
              {isInviteStep ? <UserPlus className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{cta}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

export function EmptyConversationJourney({
  hasMembers, hasMessages, testMessageSent = false, relayReady = false,
  onOpenMembers, onSendTestMessage, onOpenSovereignty,
}: EmptyConversationJourneyProps) {
  const { t } = useT();

  const step2Done = hasMessages || testMessageSent;

  return (
    // Transparent shell — NatureBackdrop owns the background.
    // justify-start + paddingTop keeps the label in the upper third
    // and ensures the card is always visible without scrolling.
    <div
      className="flex flex-col items-center justify-start w-full pb-safe-bottom"
      style={{ paddingTop: 34 }}
    >

      {/* App identity label */}
      <div className="text-center mb-5 px-4 animate-slide-up">
        <p
          className="text-[0.6875rem] font-semibold tracking-[0.18em] uppercase select-none mb-2"
          style={{ color: 'rgba(80,200,240,0.55)' }}
        >
          EarthOS
        </p>
        <h2 className="text-base font-semibold text-foreground tracking-tight">
          {!hasMembers
            ? t('conversation.inviteToBegin')
            : !hasMessages
            ? t('conversation.sendFirstMessage')
            : t('conversation.journeyContinues')}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
          {!hasMembers
            ? t('conversation.trustedTagline')
            : !hasMessages
            ? t('conversation.messagesEncrypted')
            : t('conversation.everythingEncrypted')}
        </p>
      </div>

      {/* Primary CTA — Invite member (visible only when no members yet) */}
      {!hasMembers && (
        <button
          onClick={onOpenMembers}
          className="mb-5 flex items-center gap-2 px-6 py-3 rounded-2xl
            qlpa-primary-water text-sm font-semibold
            hover:opacity-90 active:scale-95 transition-all touch-manipulation shadow-lg animate-slide-up"
          style={{ animationDelay: '40ms' }}
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('conversation.inviteCta')}</span>
        </button>
      )}

      {/* Glass journey card */}
      <div
        className="w-full max-w-sm mx-auto px-phi-5 pt-phi-4 pb-phi-5 rounded-3xl animate-slide-up"
        style={{
          animationDelay: '80ms',
          background: 'hsl(212 48% 9% / 0.76)',
          border: '1px solid hsl(194 55% 70% / 0.10)',
          backdropFilter: 'blur(32px) saturate(1.55)',
          boxShadow: '0 1px 0 hsl(192 70% 80% / 0.07) inset, 0 -4px 32px hsl(218 40% 3% / 0.20)',
        }}
      >
        <div className="space-y-0">
          <JourneyStep
            number={1}
            label={t('conversation.inviteSomeoneTrusted')}
            body={t('conversation.inviteBody')}
            done={hasMembers}
            isInviteStep
            onCta={onOpenMembers}
          />

          <div
            className="ml-3.5 w-0.5 h-4 rounded-full -mt-2 mb-1"
            style={{ background: 'rgba(80,200,240,0.12)' }}
          />

          <JourneyStep
            number={2}
            label={t('emptyJourney.createLocalTestMessage')}
            body={t('emptyJourney.createLocalTestMessageBody')}
            done={step2Done}
            cta={step2Done ? undefined : t('emptyJourney.createLocalTestMessage')}
            ctaDisabled={false}
            onCta={onSendTestMessage}
          />

          <div
            className="ml-3.5 w-0.5 h-4 rounded-full -mt-2 mb-1"
            style={{ background: 'rgba(80,200,240,0.12)' }}
          />

          <JourneyStep
            number={3}
            label={t('conversation.relayReady')}
            body={t('conversation.relayBody')}
            done={relayReady}
          />
        </div>

        {hasMessages && (
          <div className="mt-phi-5 flex items-center gap-phi-2 flex-wrap justify-center">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(97,214,178,0.08)', border: '1px solid rgba(97,214,178,0.20)', color: 'rgba(97,214,178,0.80)' }}
            >
              <Lock className="w-2.5 h-2.5" />
              <span>{t('conversation.statusPrivate')}</span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(80,200,240,0.08)', border: '1px solid rgba(80,200,240,0.18)', color: 'rgba(80,200,240,0.78)' }}
            >
              <Radio className="w-2.5 h-2.5" />
              <span>{t('conversation.statusLocalOnly')}</span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(97,214,178,0.08)', border: '1px solid rgba(97,214,178,0.20)', color: 'rgba(97,214,178,0.80)' }}
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>{t('conversation.statusAllowed')}</span>
            </div>
          </div>
        )}

        {onOpenSovereignty && (
          <button
            onClick={onOpenSovereignty}
            className="mt-phi-4 flex items-center gap-1 text-[10px] text-muted-foreground/50
              hover:text-muted-foreground transition-colors w-full justify-center"
          >
            <span>{t('conversation.settingsShortcut')}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
