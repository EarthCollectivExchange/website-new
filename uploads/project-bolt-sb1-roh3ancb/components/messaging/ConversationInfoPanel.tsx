'use client';

import { X, ShieldCheck, Eye, Database, Lock, Zap, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import type {
  Conversation,
  ConversationMember,
  ConversationSovereigntySettings,
} from '@/lib/messaging/types';
import { TrustBadge } from './TrustBadge';
import { StorageBadge } from './StorageBadge';
import { MOCK_MEMBERS } from '@/lib/messaging/mockData';
import { resolveIdentity } from '@/lib/messaging/identity';
import { useT } from '@/lib/i18n/useT';

interface ConversationInfoPanelProps {
  conversation: Conversation;
  viewerEarthId: string;
  extraMembers?: ConversationMember[];
  convSettings?: ConversationSovereigntySettings;
  onClose: () => void;
  onBack?: () => void;
  advancedView?: boolean;
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-phi-3 py-phi-4 last:border-0" style={{ borderBottom: '1px solid var(--qlpa-divider-hairline)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'hsl(194 55% 60% / 0.08)', border: '1px solid var(--qlpa-divider-hairline)' }}>
        <Icon className="w-3.5 h-3.5 text-sky-400/80" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

function StatusPill({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel?: string }) {
  const { t } = useT();
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${active ? 'text-emerald-400' : 'text-muted-foreground'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
      {active ? activeLabel : (inactiveLabel ?? t('common.off'))}
    </span>
  );
}

export function ConversationInfoPanel({
  conversation,
  viewerEarthId,
  extraMembers = [],
  convSettings,
  onClose,
  onBack,
  advancedView = false,
}: ConversationInfoPanelProps) {
  const { t } = useT();
  const members = [
    ...MOCK_MEMBERS.filter((m) => m.conversationId === conversation.id),
    ...extraMembers.filter((m) => m.conversationId === conversation.id),
  ];
  const otherMember = members.find((m) => m.earthId !== viewerEarthId);
  const otherEarth = otherMember ? resolveIdentity(otherMember.earthId) : undefined;

  const effectiveStorage = convSettings?.storageMode ?? conversation.storageMode;
  const effectiveTrust   = convSettings?.trustLevel  ?? otherMember?.trustSnapshot ?? 'unknown';

  return (
    <div className="flex flex-col earthos-panel-glass">
      <div className="flex items-center px-phi-3 py-phi-3" style={{ minHeight: 52, borderBottom: '1px solid var(--qlpa-divider-soft)' }}>
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 pr-3 h-9 rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0 touch-manipulation"
            aria-label={t('common.back')}
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{t('common.back')}</span>
          </button>
        ) : null}
        <div className="flex-1 min-w-0 px-2">
          <h3 className="text-sm font-semibold text-foreground truncate">{t('conversation.conversationDetails')}</h3>
          {!onBack && advancedView && <p className="text-[10px] text-muted-foreground mt-0.5">{t('conversation.qlpaStatus')}</p>}
        </div>
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-phi-4" style={{ touchAction: 'pan-y' }}>
        {/* Identity block */}
        <div className="py-phi-4" style={{ borderBottom: '1px solid var(--qlpa-divider-hairline)' }}>
          {conversation.title ? (
            <>
              <h4 className="text-base font-semibold text-foreground">{conversation.title}</h4>
              {conversation.description && (
                <p className="text-sm text-muted-foreground mt-[8px] leading-relaxed">{conversation.description}</p>
              )}
            </>
          ) : otherEarth ? (
            <>
              <div className="flex items-center gap-3">
                {otherEarth.avatarUrl
                  ? <img src={otherEarth.avatarUrl} alt={otherEarth.displayName} className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground">{otherEarth.displayName.slice(0, 2).toUpperCase()}</div>
                }
                <div>
                  <p className="text-sm font-semibold text-foreground">{otherEarth.displayName}</p>
                  <p className="text-xs text-muted-foreground">{otherEarth.handle}</p>
                </div>
              </div>
              {otherEarth.bio && <p className="text-xs text-muted-foreground mt-phi-3 leading-relaxed">{otherEarth.bio}</p>}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t('conversation.noNameSet')}</p>
          )}
        </div>

        {/* Simple mode: compact trust + member summary only */}
        {!advancedView && (
          <div className="py-phi-3 space-y-phi-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('conversation.trustLevel')}</span>
              <TrustBadge level={effectiveTrust} showLabel size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('messages.panelMembers')}</span>
              <span className="text-xs font-medium text-foreground">
                {members.length} {members.length !== 1 ? t('conversation.participants') : t('conversation.participant')}
              </span>
            </div>
          </div>
        )}

        {/* Advanced mode: full QLPA status */}
        {advancedView && (
          <div className="py-phi-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-phi-3">{t('conversation.qlpaStatus')}</p>

            <InfoRow icon={Zap} label={t('conversation.conversationType')}>
              <span className="font-medium">{t(`conversation.type${conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1).replace('_c', 'C').replace('_', '')}`)}</span>
            </InfoRow>

            <InfoRow icon={ShieldCheck} label={t('conversation.trustLevel')}>
              <TrustBadge level={effectiveTrust} showLabel size="md" />
            </InfoRow>

            <InfoRow icon={Database} label={t('conversation.storageSovereignty')}>
              <div className="space-y-1">
                <StorageBadge mode={effectiveStorage} showLabel />
                <p className="text-xs text-muted-foreground leading-relaxed">{t(`conversation.storage${effectiveStorage.charAt(0).toUpperCase() + effectiveStorage.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`)}</p>
              </div>
            </InfoRow>

            <InfoRow icon={Lock} label={t('conversation.consent')}>
              {convSettings ? (
                <div className="space-y-1">
                  <StatusPill active={convSettings.allowDirectMessages} activeLabel={t('conversation.directMessagesAllowed')} inactiveLabel={t('conversation.directMessagesOff')} />
                  {convSettings.requireApproval && (
                    <p className="text-xs text-amber-400 mt-0.5">{t('conversation.approvalRequired')}</p>
                  )}
                </div>
              ) : (
                <StatusPill active activeLabel={t('common.active')} />
              )}
            </InfoRow>

            <InfoRow icon={ShieldCheck} label={t('conversation.safetyPolicy')}>
              {convSettings ? (
                <div className="space-y-1">
                  <StatusPill
                    active={!convSettings.isBlocked}
                    activeLabel={t('conversation.enforced')}
                    inactiveLabel={t('messages.blocked')}
                  />
                  {convSettings.isMuted && (
                    <p className="text-xs text-muted-foreground mt-0.5">{t('conversation.mutedDesc')}</p>
                  )}
                </div>
              ) : (
                <StatusPill active activeLabel={t('conversation.enforced')} />
              )}
            </InfoRow>

            <InfoRow icon={Eye} label={t('conversation.intentionMirror')}>
              <StatusPill
                active={convSettings !== undefined}
                activeLabel={t('conversation.mirrorActive')}
                inactiveLabel={t('common.available')}
              />
            </InfoRow>

            <InfoRow icon={Users} label={t('messages.panelMembers')}>
              <span className="font-medium">{members.length}</span>
              <span className="text-muted-foreground text-xs ml-1">{members.length !== 1 ? t('conversation.participants') : t('conversation.participant')}</span>
            </InfoRow>
          </div>
        )}

        {/* Timestamps */}
        <div className="py-phi-4 border-t border-border space-y-phi-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('conversation.created')}</span>
            <span>{format(new Date(conversation.createdAt), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('conversation.lastActivity')}</span>
            <span>{format(new Date(conversation.updatedAt), 'MMM d, h:mm a')}</span>
          </div>
          {convSettings && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('conversation.settingsUpdated')}</span>
              <span>{format(new Date(convSettings.updatedAt), 'MMM d, h:mm a')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
