'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { RotateCcw, CheckCheck, Clock, Lock, Trash2, TriangleAlert as AlertTriangle, Timer, MoveHorizontal as MoreHorizontal } from 'lucide-react';
import type { Message, LedgerEvent } from '@/lib/messaging/types';
import { resolveIdentity } from '@/lib/messaging/identity';
import { useExpiryCountdown } from '@/lib/messaging/hooks';
import { useT } from '@/lib/i18n/useT';
import { TrustBadge } from './TrustBadge';
import { InlineAvatar } from './IdentityCard';
import { MessageJourneyPanel } from './MessageJourneyPanel';

interface MessageBubbleProps {
  message: Message;
  viewerEarthId: string;
  ledgerEvents?: LedgerEvent[];
  advancedView?: boolean;
  onDeleteLocally?: (messageId: string) => void;
  onRequestRecipientDelete?: (messageId: string) => void;
}


// ─── Status row ──────────────────────────────────────────────────────────────

function MessageStatusRow({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const isPending = message.consentStatus === 'pending';
  const isBlocked = message.consentStatus === 'blocked';
  const isEncrypted = message.encryptionStatus === 'local_encrypted';
  const isRelayReady = message.relayEnvelope?.deliveryStatus === 'ready_for_relay';
  const { label: expiryLabel, urgent } = useExpiryCountdown(message.expiresAt);

  return (
    <div className={`flex items-center gap-[0.3125rem] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      <span className="text-[0.6875rem] text-muted-foreground/70 tabular-nums">
        {format(new Date(message.createdAt), 'h:mm a')}
      </span>

      {expiryLabel && (
        <span className={`flex items-center gap-0.5 text-[10px] tabular-nums font-medium
          ${urgent ? 'text-amber-400' : 'text-muted-foreground/60'}`}>
          <Timer className="w-3 h-3" />
          {expiryLabel}
        </span>
      )}

      {isBlocked && <span className="w-[0.3125rem] h-[0.3125rem] rounded-full bg-destructive flex-shrink-0" />}
      {isPending && !isBlocked && <span className="w-[0.3125rem] h-[0.3125rem] rounded-full bg-amber-400 flex-shrink-0" />}
      {!isBlocked && !isPending && isRelayReady && <span className="w-[0.3125rem] h-[0.3125rem] rounded-full bg-emerald-500 flex-shrink-0" />}
      {!isBlocked && !isPending && !isRelayReady && isEncrypted && <Lock className="w-[0.6875rem] h-[0.6875rem] text-emerald-500/70 flex-shrink-0" />}
      {!isBlocked && !isPending && !isRelayReady && !isEncrypted && <span className="w-[0.3125rem] h-[0.3125rem] rounded-full bg-muted-foreground/25 flex-shrink-0" />}

      {isOwn && (
        isPending
          ? <Clock className="w-[0.75rem] h-[0.75rem] text-amber-400 flex-shrink-0" />
          : <CheckCheck className="w-[0.75rem] h-[0.75rem] text-muted-foreground/40 flex-shrink-0" />
      )}
    </div>
  );
}

// ─── Message actions menu ─────────────────────────────────────────────────────

function MessageActionsMenu({
  isOwn,
  deleteStatus,
  onDeleteLocally,
  onRequestRecipientDelete,
  onClose,
}: {
  isOwn: boolean;
  deleteStatus?: Message['deleteStatus'];
  onDeleteLocally: () => void;
  onRequestRecipientDelete: () => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const isLocalDeleted = deleteStatus === 'local_deleted';
  const isRecipientRequested = deleteStatus === 'recipient_delete_requested';
  const [confirm, setConfirm] = useState(false);

  function handleDeleteClick() {
    if (isLocalDeleted) return;
    if (!confirm) { setConfirm(true); return; }
    onDeleteLocally();
    onClose();
  }

  return (
    <div
      className="absolute z-20 top-full mt-1.5 right-0 w-60 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Delete from this device */}
      <button
        onClick={handleDeleteClick}
        disabled={isLocalDeleted}
        className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors
          ${isLocalDeleted
            ? 'opacity-40 cursor-not-allowed'
            : confirm
            ? 'bg-destructive/8 hover:bg-destructive/12'
            : 'hover:bg-muted/60'}`}
      >
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0
          ${isLocalDeleted ? 'bg-muted' : confirm ? 'bg-destructive/15' : 'bg-destructive/10'}`}>
          <Trash2 className={`w-3.5 h-3.5 ${isLocalDeleted ? 'text-muted-foreground' : 'text-destructive'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-tight
            ${isLocalDeleted ? 'text-muted-foreground' : 'text-destructive'}`}>
            {isLocalDeleted
              ? t('messages.removedFromDevice')
              : confirm
              ? t('messages.tapToConfirm')
              : t('messages.deleteFromDevice')}
          </p>
          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
            {isLocalDeleted
              ? t('messages.contentRemovedLocally')
              : t('messages.localOnlyNoRemote')}
          </p>
        </div>
      </button>

      {isOwn && (
        <>
          <div className="mx-3 border-t border-border/40" />
          <button
            onClick={() => { onRequestRecipientDelete(); onClose(); }}
            disabled={isRecipientRequested}
            className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-left transition-colors
              ${isRecipientRequested ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/50'}`}
          >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/12">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-tight">
                {isRecipientRequested ? t('messages.requestSent') : t('messages.requestRecipientDelete')}
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                {isRecipientRequested ? t('messages.loggedNotEnforced') : t('messages.notEnforced')}
              </p>
            </div>
          </button>
        </>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MessageBubble({
  message,
  viewerEarthId,
  ledgerEvents = [],
  advancedView = false,
  onDeleteLocally,
  onRequestRecipientDelete,
}: MessageBubbleProps) {
  const { t } = useT();
  const MESSAGE_TYPE_LABELS: Record<Message['type'], string> = {
    text: '',
    voice: t('msgType.voice'),
    video: t('msgType.video'),
    file: t('msgType.file'),
    proposal: t('msgType.proposal'),
    agreement: t('msgType.agreement'),
    task: t('msgType.task'),
    contribution: t('msgType.contribution'),
    ritual: t('msgType.ritual'),
    event_invite: t('msgType.eventInvite'),
    emergency_signal: t('msgType.emergency'),
  };
  const isOwn = message.senderId === viewerEarthId;
  const sender = resolveIdentity(message.senderId);
  const typeLabel = MESSAGE_TYPE_LABELS[message.type];
  const isPending = message.consentStatus === 'pending';
  const isBlocked = message.consentStatus === 'blocked';
  const [showJourney, setShowJourney] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const { expired: isTimerExpired } = useExpiryCountdown(message.expiresAt);

  const isDeletedLocally = message.deleteStatus === 'local_deleted';
  const isExpired = isTimerExpired || message.deleteStatus === 'expired' || isDeletedLocally;

  const isRecipientDeleteRequested = message.deleteStatus === 'recipient_delete_requested';

  useEffect(() => {
    if (!showActionsMenu) return;
    const handler = () => setShowActionsMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showActionsMenu]);

  return (
    <>
      {showJourney && (
        <MessageJourneyPanel
          message={message}
          ledgerEvents={ledgerEvents}
          viewerEarthId={viewerEarthId}
          advancedView={advancedView}
          onClose={() => setShowJourney(false)}
        />
      )}

      <div className={`group flex gap-phi-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>

        {!isOwn && (
          <div className="flex-shrink-0 mt-1">
            {sender
              ? <InlineAvatar identity={sender} size="sm" />
              : (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[0.625rem] font-semibold text-muted-foreground">
                  ??
                </div>
              )
            }
          </div>

        )}

        <div className={`flex flex-col gap-[0.3125rem] max-w-[min(80%,22rem)] md:max-w-[min(72%,24rem)] ${isOwn ? 'items-end' : 'items-start'}`}>

          {!isOwn && (
            <div className="flex items-center gap-phi-3 px-phi-2 max-w-full">
              <span className="text-[0.8125rem] font-semibold text-foreground leading-snug truncate min-w-0">
                {sender?.displayName ?? t('messages.unknownSender')}
              </span>
              <TrustBadge level={message.trustLevel} />
            </div>
          )}

          <div className="relative">
            {/* Main bubble */}
            <button
              onClick={() => { if (!showActionsMenu) setShowJourney(true); }}
              onContextMenu={(e) => { e.preventDefault(); setShowActionsMenu((v) => !v); }}
              style={isOwn && isPending && !isExpired ? {
                background: 'hsl(38 88% 62% / 0.10)',
                border: '1px solid hsl(38 88% 62% / 0.22)',
                color: 'hsl(38 80% 80%)',
              } : undefined}
              className={`relative text-left leading-relaxed transition-all duration-150 ease-in-out
                active:scale-[0.97] touch-manipulation
                rounded-phi-lg px-phi-5 py-phi-4
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${isExpired
                  ? 'bg-muted/20 text-muted-foreground/50 border border-border/25 rounded-br-[4px] rounded-bl-[4px]'
                  : isOwn
                    ? isPending
                      ? 'rounded-br-[4px]'
                      : isBlocked
                      ? 'bg-red-500/10 text-red-300 border border-red-500/22 rounded-br-[4px]'
                      : 'qlpa-primary-water rounded-br-[4px]'
                    : 'glass-card text-foreground rounded-bl-[4px]'
                }
                ${message.intentionMirrorState === 'user_overrode' && !isPending && !isExpired ? 'ring-1 ring-amber-400/30' : ''}
                ${isRecipientDeleteRequested && !isExpired ? 'ring-1 ring-amber-400/25' : ''}
              `}
            >
              {typeLabel && !isExpired && (
                <span className={`inline-flex items-center mb-phi-2 text-[0.6875rem] font-semibold
                  px-phi-3 py-[0.1875rem] rounded-full
                  ${isOwn && !isPending && !isBlocked
                    ? 'bg-white/22 text-white/90'
                    : 'bg-secondary text-secondary-foreground'
                  }`}>
                  {typeLabel}
                </span>
              )}

              {isExpired ? (
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 opacity-50" />
                  <p className="text-[0.875rem] italic opacity-70">
                    {isDeletedLocally ? t('messages.removedFromDevice') : t('messages.messageExpired')}
                  </p>
                </div>
              ) : (
                <p className="text-[0.9375rem] whitespace-pre-wrap break-words">{message.body}</p>
              )}

              {isPending && isOwn && !isExpired && (
                <div className="flex items-center gap-phi-2 mt-phi-2 text-[0.75rem]" style={{ color: 'hsl(38 80% 72%)' }}>
                  <Clock className="w-[0.75rem] h-[0.75rem]" />
                  <span>{t('messages.pendingApproval')}</span>
                </div>
              )}

              {message.intentionMirrorState === 'user_overrode' && !isPending && !isExpired && (
                <div className="flex items-center gap-phi-2 mt-phi-2 text-[0.75rem] opacity-60">
                  <RotateCcw className="w-[0.75rem] h-[0.75rem]" />
                  <span>{t('messages.sentWithAwareness')}</span>
                </div>
              )}

              {isRecipientDeleteRequested && !isExpired && (
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{t('messages.deletionRequested')}</span>
                </div>
              )}

              {!isExpired && (
                <div className="absolute bottom-[0.3125rem] right-[0.3125rem] opacity-30">
                  <Lock className="w-[0.5625rem] h-[0.5625rem]" />
                </div>
              )}
            </button>

            {/* Actions trigger — three-dot button, always visible on own messages, hover on others */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowActionsMenu((v) => !v); }}
              className={`absolute top-1 ${isOwn ? '-left-8' : '-right-8'}
                w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150
                hover:bg-muted/80 active:scale-95
                text-muted-foreground/50 hover:text-muted-foreground
                ${isOwn ? 'opacity-0 group-hover:opacity-100 focus:opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}
                ${showActionsMenu ? 'opacity-100 bg-muted text-muted-foreground' : ''}`}
              aria-label="Message actions"
              aria-expanded={showActionsMenu}
              aria-haspopup="menu"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showActionsMenu && (
              <MessageActionsMenu
                isOwn={isOwn}
                deleteStatus={message.deleteStatus}
                onDeleteLocally={() => onDeleteLocally?.(message.id)}
                onRequestRecipientDelete={() => onRequestRecipientDelete?.(message.id)}
                onClose={() => setShowActionsMenu(false)}
              />
            )}
          </div>

          <div className="px-phi-2">
            <MessageStatusRow message={message} isOwn={isOwn} />
          </div>
        </div>
      </div>
    </>
  );
}
