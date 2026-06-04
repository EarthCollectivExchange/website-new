'use client';

import { useState } from 'react';
import { X, UserPlus, ChevronRight } from 'lucide-react';
import type { Conversation, ConversationMember, EarthID } from '@/lib/messaging/types';
import { IdentityCard } from './IdentityCard';
import { InviteMemberDialog } from './InviteMemberDialog';
import { resolveIdentity } from '@/lib/messaging/identity';
import { MOCK_MEMBERS } from '@/lib/messaging/mockData';
import { useT } from '@/lib/i18n/useT';

export interface SimulatedMemberInfo {
  earthId: string;
  displayName: string;
  handle: string;
}

interface MembersPanelProps {
  conversation: Conversation;
  viewerEarthId: string;
  extraMembers?: ConversationMember[];
  simulatedMemberInfo?: SimulatedMemberInfo[];
  onClose: () => void;
  onBack?: () => void;
  onInviteMember?: (member: ConversationMember, displayName: string, handle: string) => void;
}

function fallbackIdentity(member: ConversationMember, sim?: SimulatedMemberInfo, unknownLabel?: string): EarthID {
  const now = new Date().toISOString();
  return {
    id: member.earthId,
    authUserId: '',
    handle: sim?.handle ?? member.earthId.slice(0, 12),
    displayName: sim?.displayName ?? (unknownLabel ?? 'Unknown'),
    sovereignSince: member.joinedAt,
    isActive: true,
    storagePreference: 'local_only',
    intentionMirrorConfig: {
      enabled: false,
      checkBeforeSending: false,
      toneReflection: false,
      harmfulPatternWarning: false,
      userCanOverride: true,
      reflectionMode: 'soft',
    },
    createdAt: member.joinedAt,
    updatedAt: now,
    isLocal: true,
  };
}

export function MembersPanel({
  conversation,
  viewerEarthId,
  extraMembers = [],
  simulatedMemberInfo = [],
  onClose,
  onBack,
  onInviteMember,
}: MembersPanelProps) {
  const { t } = useT();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const ROLE_LABELS: Record<ConversationMember['role'], string> = {
    owner:    t('members.roleOwner'),
    admin:    t('members.roleAdmin'),
    member:   t('members.roleMember'),
    observer: t('members.roleObserver'),
  };

  const seenMemberIds = new Set<string>();
  const members = [
    ...MOCK_MEMBERS.filter((m) => m.conversationId === conversation.id),
    ...extraMembers.filter((m) => m.conversationId === conversation.id),
  ].filter((m) => {
    if (seenMemberIds.has(m.earthId)) return false;
    seenMemberIds.add(m.earthId);
    return true;
  });

  function resolveForMember(member: ConversationMember): EarthID {
    const found = resolveIdentity(member.earthId);
    if (found) return found;
    const sim = simulatedMemberInfo.find((s) => s.earthId === member.earthId);
    return fallbackIdentity(member, sim, t('members.unknownIdentity'));
  }

  function handleInvite(member: ConversationMember, displayName: string, handle: string) {
    onInviteMember?.(member, displayName, handle);
    setShowInviteDialog(false);
  }

  const countKey = members.length !== 1 ? 'members.participantCountPlural' : 'members.participantCount';

  return (
    <>
      {showInviteDialog && (
        <InviteMemberDialog
          conversationId={conversation.id}
          onInvite={handleInvite}
          onClose={() => setShowInviteDialog(false)}
        />
      )}

      <div className="flex flex-col bg-transparent">
        {/* Header */}
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
            <h3 className="text-sm font-semibold text-foreground">{t('members.panelTitle')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {t(countKey).replace('{n}', String(members.length))}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Member list */}
        <div className="p-phi-3 space-y-phi-2" style={{ touchAction: 'pan-y' }}>
          {members.map((member) => {
            const identity = resolveForMember(member);
            const isViewer = member.earthId === viewerEarthId;

            return (
              <div
                key={member.id}
                className={`p-phi-3 rounded-xl bg-card
                  ${identity.isLocal ? 'border border-dashed border-primary/22' : ''}
                `}
                style={!identity.isLocal ? { border: '1px solid var(--qlpa-divider-hairline)', touchAction: 'pan-y' } : { touchAction: 'pan-y' }}
              >
                <div className="flex items-start gap-0">
                  <IdentityCard
                    identity={identity}
                    viewerTrustLevel={member.trustSnapshot}
                    size="md"
                    className="flex-1"
                  />
                  {isViewer && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">{t('members.youSuffix')}</span>
                  )}
                </div>
                <div className="mt-1.5 pl-12">
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                    {ROLE_LABELS[member.role]}
                  </span>
                </div>
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
              {t('members.noMembersFound')}
            </div>
          )}
        </div>

        {/* Invite action */}
        {onInviteMember && (
          <div className="p-phi-3 border-t" style={{ borderColor: 'rgba(80,200,240,0.10)' }}>
            <button
              onClick={() => setShowInviteDialog(true)}
              className="flex items-center justify-center gap-2 w-full text-sm font-medium transition-all active:scale-[0.98] touch-manipulation"
              style={{
                minHeight: 55,
                borderRadius: 21,
                background: 'rgba(5,24,38,0.62)',
                border: '1px solid rgba(80,220,255,0.28)',
                color: 'rgba(210,245,255,0.86)',
                boxShadow: '0 0 21px rgba(80,220,255,0.08)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(8,40,55,0.78)';
                el.style.borderColor = 'rgba(80,220,255,0.42)';
                el.style.boxShadow = '0 0 34px rgba(80,220,255,0.13)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(5,24,38,0.62)';
                el.style.borderColor = 'rgba(80,220,255,0.28)';
                el.style.boxShadow = '0 0 21px rgba(80,220,255,0.08)';
              }}
            >
              <UserPlus className="w-4 h-4" />
              {t('members.inviteMember')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
