'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ShieldCheck, Lock, Radio, ChevronRight, TriangleAlert as AlertTriangle, ChevronDown, Users, Timer, Info } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import type {
  Conversation, ConversationSovereigntySettings, UserSovereigntySettings,
  ConversationMember, Message, LedgerEvent, StorageMode, TrustLevel, ReflectionMode,
} from '@/lib/messaging/types';
import type { SyncResult } from '@/lib/messaging/sync';
import type { AuthBridgeResult } from '@/lib/messaging/authBridge';
import { SyncQAPanel } from './SyncQAPanel';
import { CryptoDevPanel } from './CryptoDevPanel';
import { RelayQAPanel } from './RelayQAPanel';
import { ConsentQAPanel } from './ConsentQAPanel';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivePanel = null | 'trust' | 'privacy' | 'delivery';

interface SovereigntyJourneyDrawerProps {
  conversation: Conversation;
  convSettings: ConversationSovereigntySettings;
  userSettings: UserSovereigntySettings;
  allMessages?: Message[];
  members?: ConversationMember[];
  viewerEarthId?: string;
  syncResult?: SyncResult;
  authResult?: AuthBridgeResult | null;
  ledgerEvents?: LedgerEvent[];
  advancedView?: boolean;
  developerMode?: boolean;
  onUpdateConvSettings: (patch: Partial<ConversationSovereigntySettings> & { conversationId: string }) => void;
  onUpdateUserSettings: (patch: Partial<Pick<UserSovereigntySettings, 'intentionMirror'>>) => void;
  onSyncNow?: () => Promise<void> | void;
  onRebuildBridge?: () => Promise<void> | void;
  onSignOut?: () => Promise<void> | void;
  onClose: () => void;
  /** Called when user taps the Participants entry — opens members panel */
  onOpenMembers?: () => void;
  /** Called when user taps the Retention entry — opens retention panel */
  onOpenRetention?: () => void;
  /** Called when user taps the Details entry — opens info panel */
  onOpenDetails?: () => void;
  /** Summary label for members count */
  memberCount?: number;
  /** Current retention timer label for status display */
  retentionLabel?: string;
}

// ─── Select pill ──────────────────────────────────────────────────────────────

function SelectPill<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="text-xs font-semibold px-2 py-1 rounded-lg bg-muted border border-border
        text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30
        hover:bg-secondary transition-colors cursor-pointer"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label, description, checked, onChange, destructive = false,
}: {
  label: string; description: string; checked: boolean;
  onChange: (v: boolean) => void; destructive?: boolean;
}) {
  return (
    <div className="qlpa-toggle-row">
      <div className="qlpa-toggle-copy">
        <div className={`qlpa-toggle-title${destructive ? ' destructive' : ''}`}>{label}</div>
        <div className="qlpa-toggle-description">{description}</div>
      </div>
      <div className="qlpa-toggle-slot">
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className="qlpa-switch-track"
          style={{
            background: checked
              ? (destructive ? 'hsl(4 60% 50%)' : 'linear-gradient(135deg, hsl(192 52% 40%) 0%, hsl(194 48% 34%) 100%)')
              : 'hsl(214 32% 18%)',
            border: checked
              ? (destructive ? '1px solid hsl(4 60% 60% / 0.36)' : '1px solid hsl(192 60% 50% / 0.38)')
              : '1px solid hsl(214 30% 28%)',
          }}
        >
          <span
            className="qlpa-switch-thumb"
            style={{
              transform: checked ? 'translateX(16px)' : 'translateX(0px)',
              background: checked ? 'hsl(192 20% 96%)' : 'hsl(210 20% 52%)',
            }}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Options (built inside component where t() is available) ─────────────────

// ─── QA domain accordion ─────────────────────────────────────────────────────

function QaDomainSection({
  label, color, children, devOnly = false, developerMode = false,
}: {
  label: string; color: 'sky' | 'emerald' | 'amber';
  children: React.ReactNode; devOnly?: boolean; developerMode?: boolean;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const locked = devOnly && !developerMode;
  const c = {
    sky:     { borderColor: 'rgba(80,200,240,0.08)',  headerBg: 'rgba(80,200,240,0.04)',  labelColor: 'rgba(140,210,240,0.72)' },
    emerald: { borderColor: 'rgba(97,214,178,0.08)',  headerBg: 'rgba(97,214,178,0.04)',  labelColor: 'rgba(140,220,190,0.72)' },
    amber:   { borderColor: 'rgba(218,190,108,0.08)', headerBg: 'rgba(218,190,108,0.04)', labelColor: 'rgba(235,210,150,0.72)' },
  }[color];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.borderColor}` }}>
      <button
        onClick={() => !locked && setOpen((v) => !v)}
        className={`flex items-center gap-phi-3 w-full px-phi-3 py-phi-3
          ${locked ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 transition-opacity'}`}
        style={{ background: c.headerBg }}
      >
        <p className="flex-1 text-xs font-semibold text-left" style={{ color: c.labelColor }}>{label}</p>
        {devOnly && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/12 text-amber-300 border border-amber-500/25">
            {developerMode ? t('sovereignty.devUnlockedBadge') : t('sovereignty.devLockedBadge')}
          </span>
        )}
        {!locked && <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>
      {!locked && open && (
        <div className="px-phi-3 pt-phi-3 pb-phi-4 space-y-phi-3" style={{ background: 'rgba(3,14,26,0.72)' }}>{children}</div>
      )}
      {locked && (
        <div className="px-phi-3 py-2 bg-muted/10" style={{ borderTop: '1px solid var(--qlpa-divider-hairline)' }}>
          <p className="text-[10px] text-muted-foreground/60">{t('sovereigntyDrawer.developerModeRequired')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Entry button ─────────────────────────────────────────────────────────────

const ENTRY_PALETTE = {
  emerald: {
    bg:         'rgba(5,38,24,0.16)',
    border:     'rgba(97,214,178,0.09)',
    iconBg:     'rgba(97,214,178,0.07)',
    icon:       'rgba(97,214,178,0.76)',
    title:      'rgba(220,248,240,0.88)',
  },
  sky: {
    bg:         'rgba(5,28,44,0.16)',
    border:     'rgba(80,200,240,0.08)',
    iconBg:     'rgba(80,200,240,0.07)',
    icon:       'rgba(80,200,240,0.76)',
    title:      'rgba(220,248,255,0.88)',
  },
  amber: {
    bg:         'rgba(44,34,12,0.12)',
    border:     'rgba(218,190,108,0.08)',
    iconBg:     'rgba(218,190,108,0.06)',
    icon:       'rgba(218,190,108,0.70)',
    title:      'rgba(235,210,150,0.82)',
  },
} as const;

function EntryButton({
  icon, label, helper, status, statusColor, onClick, color,
}: {
  icon: React.ReactNode; label: string; helper?: string; status: string; statusColor: string;
  onClick: () => void; color: keyof typeof ENTRY_PALETTE;
}) {
  const p = ENTRY_PALETTE[color];
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-phi-3 w-full px-phi-3 py-phi-3 rounded-2xl hover:opacity-90 active:scale-[0.99] transition-all touch-manipulation"
      style={{ background: p.bg, border: `1px solid ${p.border}`, touchAction: 'pan-y' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: p.iconBg, color: p.icon }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-semibold" style={{ color: p.title }}>{label}</p>
        {helper && (
          <p className="text-[9px] leading-snug mt-0.5" style={{ color: 'rgba(140,180,220,0.45)' }}>{helper}</p>
        )}
        <p className="text-[10px] font-medium mt-0.5" style={{ color: statusColor }}>{status}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(140,180,220,0.35)' }} />
    </button>
  );
}

// ─── Sub-panel wrappers ───────────────────────────────────────────────────────

function SubPanelHeader({ title, onBack, onClose }: { title: string; onBack: () => void; onClose?: () => void }) {
  const { t } = useT();
  return (
    <div className="flex items-center px-phi-3 py-phi-3" style={{ minHeight: 52, borderBottom: '1px solid var(--qlpa-divider-soft)' }}>
      <button
        onClick={onBack}
        className="flex items-center gap-1 pr-3 h-9 rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0 touch-manipulation"
        aria-label={t('common.back')}
      >
        <ChevronRight className="w-3.5 h-3.5 rotate-180 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{t('common.back')}</span>
      </button>
      <p className="flex-1 text-sm font-semibold text-foreground px-2 truncate">{title}</p>
      {onClose && (
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function SettingSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden" style={{ touchAction: 'pan-y' }}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-phi-4 pt-phi-3 pb-phi-2">{label}</p>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SovereigntyJourneyDrawer({
  conversation, convSettings, userSettings,
  allMessages, members, viewerEarthId, syncResult, authResult, ledgerEvents,
  advancedView = false, developerMode = false,
  onUpdateConvSettings, onUpdateUserSettings,
  onSyncNow, onRebuildBridge, onSignOut, onClose,
  onOpenMembers, onOpenRetention, onOpenDetails,
  memberCount, retentionLabel,
}: SovereigntyJourneyDrawerProps) {
  const { t } = useT();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { mainScrollRef.current?.scrollTo(0, 0); }, [activePanel]);

  const STORAGE_OPTIONS: { value: StorageMode; label: string }[] = [
    { value: 'local_only',       label: t('sovereigntyDrawer.storageModeLocal') },
    { value: 'encrypted_relay',  label: t('sovereigntyDrawer.storageModeRelay') },
    { value: 'encrypted_backup', label: t('sovereigntyDrawer.storageModeBackup') },
  ];

  const TRUST_OPTIONS: { value: TrustLevel; label: string }[] = [
    { value: 'trusted',   label: t('sovereigntyDrawer.trustTrusted') },
    { value: 'known',     label: t('sovereigntyDrawer.trustKnown') },
    { value: 'community', label: t('sovereigntyDrawer.trustCommunity') },
    { value: 'unknown',   label: t('sovereigntyDrawer.trustUnknown') },
    { value: 'blocked',   label: t('sovereigntyDrawer.trustBlocked') },
  ];

  const REFLECTION_OPTIONS: { value: ReflectionMode; label: string }[] = [
    { value: 'soft',   label: t('sovereigntyDrawer.reflectionSoft') },
    { value: 'clear',  label: t('sovereigntyDrawer.reflectionClear') },
    { value: 'strict', label: t('sovereigntyDrawer.reflectionStrict') },
  ];

  function patchConv(patch: Partial<Omit<ConversationSovereigntySettings, 'conversationId' | 'updatedAt'>>) {
    onUpdateConvSettings({ ...patch, conversationId: conversation.id });
  }

  function patchMirror(patch: Partial<UserSovereigntySettings['intentionMirror']>) {
    onUpdateUserSettings({ intentionMirror: { ...userSettings.intentionMirror, ...patch } });
  }

  // ── Sub-panel: Trust ──────────────────────────────────────────────────────
  if (activePanel === 'trust') {
    return (
      <div className="flex flex-col">
        <SubPanelHeader title={t('trust.titleAdvanced')} onBack={() => setActivePanel(null)} onClose={onClose} />
        <div className="px-phi-4 py-phi-4 space-y-phi-4" style={{ touchAction: 'pan-y' }}>
          <SettingSection label={t('sovereigntyDrawer.trustLevelLabel')}>
            <div className="flex items-center justify-between px-phi-4 pb-phi-3">
              <p className="text-xs text-foreground">{t('sovereigntyDrawer.relationshipTrust')}</p>
              <SelectPill value={convSettings.trustLevel} options={TRUST_OPTIONS} onChange={(v) => patchConv({ trustLevel: v })} />
            </div>
          </SettingSection>
          <SettingSection label={t('sovereigntyDrawer.consentControls')}>
            <ToggleRow label={t('sovereigntyDrawer.requireApproval')} description={t('sovereigntyDrawer.requireApprovalDesc')} checked={convSettings.requireApproval} onChange={(v) => patchConv({ requireApproval: v })} />
            <ToggleRow label={t('sovereigntyDrawer.muteConversation')} description={t('sovereigntyDrawer.muteConversationDesc')} checked={convSettings.isMuted} onChange={(v) => patchConv({ isMuted: v })} />
            <ToggleRow label={t('sovereigntyDrawer.blockConversation')} description={t('sovereigntyDrawer.blockConversationDesc')} checked={convSettings.isBlocked} onChange={(v) => patchConv({ isBlocked: v })} destructive />
          </SettingSection>
          <SettingSection label={t('sovereigntyDrawer.inviteControls')}>
            <ToggleRow label={t('sovereigntyDrawer.allowProjectInvites')} description={t('sovereigntyDrawer.allowProjectInvitesDesc')} checked={convSettings.allowProjectInvites} onChange={(v) => patchConv({ allowProjectInvites: v })} />
            <ToggleRow label={t('sovereigntyDrawer.allowEventInvites')} description={t('sovereigntyDrawer.allowEventInvitesDesc')} checked={convSettings.allowEventInvites} onChange={(v) => patchConv({ allowEventInvites: v })} />
          </SettingSection>
        </div>
      </div>
    );
  }

  // ── Sub-panel: Privacy ────────────────────────────────────────────────────
  if (activePanel === 'privacy') {
    const storageModeDesc = convSettings.storageMode === 'local_only'
      ? t('sovereigntyDrawer.storageModeLocalDesc')
      : convSettings.storageMode === 'encrypted_relay'
      ? t('sovereigntyDrawer.storageModeRelayDesc')
      : t('sovereigntyDrawer.storageModeBackupDesc');

    return (
      <div className="flex flex-col">
        <SubPanelHeader title={t('privacy.panelTitle')} onBack={() => setActivePanel(null)} onClose={onClose} />
        <div className="px-phi-4 py-phi-4 space-y-phi-4" style={{ touchAction: 'pan-y' }}>
          <SettingSection label={t('sovereigntyDrawer.storageModeLabel')}>
            <div className="px-phi-4 pb-phi-3 space-y-phi-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{storageModeDesc}</p>
              <SelectPill value={convSettings.storageMode} options={STORAGE_OPTIONS} onChange={(v) => patchConv({ storageMode: v })} />
              {convSettings.storageMode === 'encrypted_backup' && (
                <div
                  className="flex items-start gap-2 rounded-xl p-3"
                  style={{ background: 'rgba(44,34,12,0.24)', border: '1px solid rgba(218,190,108,0.20)' }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(218,190,108,0.78)' }} />
                  <p className="text-xs" style={{ color: 'rgba(235,210,150,0.82)' }}>{t('sovereigntyDrawer.storageModeBackupWarning')}</p>
                </div>
              )}
            </div>
          </SettingSection>
          <SettingSection label={t('sovereigntyDrawer.messagePermissions')}>
            <ToggleRow label={t('sovereigntyDrawer.allowDirectMessages')} description={t('sovereigntyDrawer.allowDirectMessagesDesc')} checked={convSettings.allowDirectMessages} onChange={(v) => patchConv({ allowDirectMessages: v })} />
            <ToggleRow label={t('sovereigntyDrawer.allowLocationMessages')} description={t('sovereigntyDrawer.allowLocationMessagesDesc')} checked={convSettings.allowLocationMessages} onChange={(v) => patchConv({ allowLocationMessages: v })} />
          </SettingSection>
          <SettingSection label={t('sovereigntyDrawer.intentionMirrorLabel')}>
            <ToggleRow label={t('sovereigntyDrawer.intentionMirrorLabel')} description={t('sovereigntyDrawer.intentionMirrorDesc')} checked={userSettings.intentionMirror.enabled} onChange={(v) => patchMirror({ enabled: v })} />
            {userSettings.intentionMirror.enabled && (
              <div className="flex items-center justify-between px-phi-4 pb-phi-3">
                <p className="text-xs text-muted-foreground">{t('sovereigntyDrawer.reflectionModeLabel')}</p>
                <SelectPill value={userSettings.intentionMirror.reflectionMode} options={REFLECTION_OPTIONS} onChange={(v) => patchMirror({ reflectionMode: v })} />
              </div>
            )}
          </SettingSection>
        </div>
      </div>
    );
  }

  // ── Sub-panel: Delivery ───────────────────────────────────────────────────
  if (activePanel === 'delivery') {
    return (
      <div className="flex flex-col">
        <SubPanelHeader title={t('delivery.panelTitle')} onBack={() => setActivePanel(null)} onClose={onClose} />
        <div className="px-phi-4 py-phi-4 space-y-phi-4" style={{ touchAction: 'pan-y' }}>
          <div className="glass-card rounded-2xl p-phi-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('sovereigntyDrawer.deliveryInfoDesc')}
            </p>
          </div>
          <SettingSection label={t('sovereigntyDrawer.recipientConsent')}>
            <ToggleRow label={t('sovereigntyDrawer.requireApproval')} description={t('sovereigntyDrawer.requireApprovalDeliveryDesc')} checked={convSettings.requireApproval} onChange={(v) => patchConv({ requireApproval: v })} />
          </SettingSection>
        </div>
      </div>
    );
  }

  const storageModeLabel = ({
    local_only: t('sovereigntyDrawer.storageModeLocal'),
    encrypted_relay: t('sovereigntyDrawer.storageModeRelay'),
    encrypted_backup: t('sovereigntyDrawer.storageModeBackup'),
  } as Record<string, string>)[convSettings.storageMode];

  const showMore = advancedView || moreOpen;

  return (
    <div className="flex flex-col">
      {/* Header — single clean boundary, no bottom border weight */}
      <div className="flex items-center justify-between px-phi-4 py-phi-3" style={{ borderBottom: '1px solid rgba(80,200,240,0.08)' }}>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t('sovereigntyDrawer.headerTitle')}</h3>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(140,180,220,0.45)' }}>{t('sovereigntyDrawer.headerSubtitle')}</p>
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
          style={{ color: 'rgba(140,180,220,0.55)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div ref={mainScrollRef} className="px-phi-3 py-phi-3 space-y-phi-2" style={{ touchAction: 'pan-y' }}>

        {/* ── Essential surface (always visible) ──────────────────────── */}

        {/* Members — conversation identity */}
        {onOpenMembers && (
          <EntryButton
            icon={<Users className="w-4 h-4" />}
            label={t('members.panelTitle')}
            helper={t('members.helperCopy')}
            status={memberCount !== undefined
              ? (memberCount === 1
                ? t('members.participantCount').replace('{n}', '1')
                : t('members.participantCountPlural').replace('{n}', String(memberCount)))
              : t('chips.ready')}
            statusColor="rgba(80,200,240,0.62)"
            color="sky"
            onClick={() => { onClose(); onOpenMembers(); }}
          />
        )}

        {/* Trust */}
        <EntryButton
          icon={<ShieldCheck className="w-4 h-4" />}
          label={t('trust.titleAdvanced')}
          helper={t('trust.helperCopy')}
          status={convSettings.isBlocked ? t('chips.blocked') : convSettings.trustLevel}
          statusColor={convSettings.isBlocked ? 'rgba(255,130,130,0.80)' : 'rgba(97,214,178,0.72)'}
          color="emerald"
          onClick={() => setActivePanel('trust')}
        />

        {/* Privacy */}
        <EntryButton
          icon={<Lock className="w-4 h-4" />}
          label={t('privacy.panelTitle')}
          helper={t('privacy.helperCopy')}
          status={storageModeLabel}
          statusColor="rgba(80,200,240,0.72)"
          color="sky"
          onClick={() => setActivePanel('privacy')}
        />

        {/* Delivery */}
        <EntryButton
          icon={<Radio className="w-4 h-4" />}
          label={t('delivery.panelTitle')}
          helper={t('delivery.helperCopy')}
          status={convSettings.requireApproval ? t('consent.pendingApproval') : t('chips.ready')}
          statusColor={convSettings.requireApproval ? 'rgba(218,190,108,0.72)' : 'rgba(97,214,178,0.72)'}
          color="amber"
          onClick={() => setActivePanel('delivery')}
        />

        {/* ── Progressive disclosure: More options ─────────────────────── */}

        {/* In simple mode: collapsible "More options" row */}
        {!advancedView && (
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex items-center gap-phi-2 w-full px-phi-3 py-2.5 rounded-2xl transition-all touch-manipulation"
            style={{
              background: moreOpen ? 'rgba(80,200,240,0.04)' : 'transparent',
              border: '1px solid rgba(80,200,240,0.08)',
              touchAction: 'pan-y',
            }}
          >
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform flex-shrink-0"
              style={{
                color: 'rgba(140,180,220,0.45)',
                transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
            <span className="text-xs font-medium" style={{ color: 'rgba(140,180,220,0.65)' }}>
              {moreOpen ? t('sovereigntyDrawer.moreOptionsHide') : t('sovereigntyDrawer.moreOptionsLabel')}
            </span>
          </button>
        )}

        {/* Secondary tools — shown when expanded (simple) or always (advanced/dev) */}
        {showMore && (
          <>
            {/* Retention */}
            {onOpenRetention && (
              <EntryButton
                icon={<Timer className="w-4 h-4" />}
                label={t('retention.panelTitle')}
                helper={t('retention.helperCopy')}
                status={retentionLabel && retentionLabel !== 'off'
                  ? `${t('retention.autoDeleteTimer')}: ${retentionLabel}`
                  : `${t('retention.autoDeleteTimer')}: ${t('retention.off')}`}
                statusColor={retentionLabel && retentionLabel !== 'off'
                  ? 'rgba(218,190,108,0.72)'
                  : 'rgba(140,180,220,0.45)'}
                color="amber"
                onClick={() => { onClose(); onOpenRetention(); }}
              />
            )}

            {/* Conversation details */}
            {onOpenDetails && (
              <EntryButton
                icon={<Info className="w-4 h-4" />}
                label={t('conversation.conversationDetails')}
                helper={t('conversation.conversationDetailsHelper')}
                status={conversation.type ? t(`conversation.type${conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1).replace('_c', 'C').replace('_', '')}`) : ''}
                statusColor="rgba(140,180,220,0.45)"
                color="sky"
                onClick={() => { onClose(); onOpenDetails(); }}
              />
            )}

            {/* Advanced QA tools — advanced + dev mode only */}
            {advancedView && (
              <div className="pt-phi-2 space-y-phi-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider px-phi-2" style={{ color: 'rgba(140,180,220,0.38)' }}>
                  {t('sovereigntyDrawer.advancedToolsLabel')}
                </p>

                <QaDomainSection label={t('sovereigntyDrawer.identityKeys')} color="sky">
                  <SyncQAPanel
                    authResult={authResult ?? null}
                    syncResult={syncResult ?? null}
                    isSyncing={syncResult?.status === 'syncing'}
                    onSyncNow={onSyncNow ?? (() => {})}
                    onRebuildBridge={onRebuildBridge ?? (() => {})}
                    onSignOut={onSignOut ?? (() => {})}
                  />
                </QaDomainSection>

                <QaDomainSection label={t('sovereigntyDrawer.messageTrustFlow')} color="emerald">
                  <ConsentQAPanel
                    convSettings={convSettings}
                    viewerEarthId={viewerEarthId ?? ''}
                    recipientCount={(members ?? []).filter((m) => m.conversationId === convSettings.conversationId && m.earthId !== (viewerEarthId ?? '')).length}
                  />
                  <RelayQAPanel
                    convSettings={convSettings}
                    members={members ?? []}
                    viewerEarthId={viewerEarthId ?? ''}
                  />
                </QaDomainSection>

                <QaDomainSection label={t('sovereigntyDrawer.integrityAndSecurity')} color="amber" devOnly developerMode={developerMode}>
                  {developerMode && <CryptoDevPanel messages={allMessages ?? []} />}
                </QaDomainSection>
              </div>
            )}

            {/* Simple mode: note about upgrading */}
            {!advancedView && (
              <p className="text-center text-[10px] px-phi-3 pt-phi-1" style={{ color: 'rgba(140,180,220,0.35)' }}>
                {t('sovereigntyDrawer.simpleToolsNote')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
