'use client';

import { useState, useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Search, Plus, Download, Settings, CreditCard as Edit3 } from 'lucide-react';
import { EarthOSLogo } from '@/components/EarthOSLogo';
import type { Conversation, ConversationType, ConversationMember, EarthID, ConversationTitleKind } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';
import { TrustBadge } from './TrustBadge';
import { ModeBar } from './ModeBar';
import { NewConversationDrawer } from './NewConversationDrawer';
import { MOCK_MEMBERS, MOCK_MESSAGES, MOCK_SPACES } from '@/lib/messaging/mockData';
import { resolveIdentity } from '@/lib/messaging/identity';
import { usePreferences } from '@/lib/messaging/preferencesContext';

type FilterChip = 'all' | ConversationType;

const CONV_TYPE_ICONS: Record<ConversationType, string> = {
  direct:         '◉',
  group:          '◈',
  project:        '◆',
  event:          '◇',
  place:          '◎',
  cause:          '◉',
  council:        '⬡',
  support_circle: '◍',
};

interface ConversationListProps {
  viewerEarthId: string;
  selectedConversationId?: string;
  conversations: Conversation[];
  onSelect: (conversationId: string) => void;
  onNewConversation: (conversation: Conversation, creatorMember: ConversationMember) => void;
  syncBadge?: React.ReactNode;
  showTesterBanner?: boolean;
  onOpenSearch?: () => void;
  onOpenSettings?: () => void;
}

function useFormatTimestamp() {
  const { t } = useT();
  return (iso: string): string => {
    const date = new Date(iso);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return t('common.yesterday');
    return format(date, 'MMM d');
  };
}

const TYPE_TITLE_KEYS: Record<ConversationType, string> = {
  direct:         'conversation.typeDirect',
  group:          'conversation.typeGroup',
  project:        'conversation.typeProject',
  event:          'conversation.typeEvent',
  place:          'conversation.typePlace',
  cause:          'conversation.typeCause',
  council:        'conversation.typeCouncil',
  support_circle: 'conversation.typeSupportCircle',
};

function getConversationName(
  conv: Conversation,
  viewerEarthId: string,
  t: (key: string) => string,
): string {
  if (conv.title && (conv.titleKind === 'custom' || conv.titleKind === 'system')) return conv.title;
  if (conv.title && !conv.titleKind) return conv.title;
  if (conv.type === 'direct') {
    const members = MOCK_MEMBERS.filter((m) => m.conversationId === conv.id);
    const other = members.find((m) => m.earthId !== viewerEarthId);
    const earth = other ? resolveIdentity(other.earthId) : undefined;
    return earth?.displayName ?? t('conversation.typeDirect');
  }
  return t(TYPE_TITLE_KEYS[conv.type]);
}

function getConversationAvatar(conv: Conversation, viewerEarthId: string): EarthID | undefined {
  if (conv.type === 'direct') {
    const members = MOCK_MEMBERS.filter((m) => m.conversationId === conv.id);
    const other = members.find((m) => m.earthId !== viewerEarthId);
    return other ? resolveIdentity(other.earthId) : undefined;
  }
  return undefined;
}

function getLastMessage(conversationId: string) {
  return MOCK_MESSAGES
    .filter((m) => m.conversationId === conversationId && !m.isDeleted)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

function getMemberTrustLevel(conversationId: string, viewerEarthId: string) {
  return MOCK_MEMBERS.find(
    (m) => m.conversationId === conversationId && m.earthId !== viewerEarthId
  )?.trustSnapshot ?? 'unknown';
}

function CommandBarButton({
  icon: Icon,
  label,
  onClick,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex flex-col items-center justify-center gap-[5px] rounded-[22px]
        transition-all touch-manipulation active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        minWidth: 64,
        height: 'var(--qlpa-bottom-control-h, 2.5rem)',
        paddingLeft: 12,
        paddingRight: 12,
        background: accent ? 'rgba(60,160,200,0.14)' : 'rgba(255,255,255,0.02)',
        border: accent ? '1px solid var(--qlpa-surface-border-medium)' : 'var(--qlpa-bottom-border, 1px solid rgba(125,220,255,0.09))',
        color: accent ? 'rgba(140,220,255,0.88)' : 'rgba(160,200,235,0.55)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (accent) {
          el.style.background = 'rgba(60,160,200,0.22)';
          el.style.borderColor = 'rgba(80,200,240,0.36)';
          el.style.color = 'rgba(190,235,255,0.95)';
        } else {
          el.style.background = 'rgba(255,255,255,0.05)';
          el.style.borderColor = 'rgba(125,220,255,0.12)';
          el.style.color = 'rgba(190,220,250,0.80)';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = accent ? 'rgba(60,160,200,0.14)' : 'rgba(255,255,255,0.02)';
        el.style.border = accent ? '1px solid rgba(125,220,255,0.16)' : 'var(--qlpa-bottom-border, 1px solid rgba(125,220,255,0.09))';
        el.style.color = accent ? 'rgba(140,220,255,0.88)' : 'rgba(160,200,235,0.55)';
      }}
    >
      <Icon className="w-[1.0625rem] h-[1.0625rem]" />
      <span className="text-[9px] font-semibold leading-none tracking-wide">{label}</span>
    </button>
  );
}

export function ConversationList({
  viewerEarthId,
  selectedConversationId,
  conversations,
  onSelect,
  onNewConversation,
  syncBadge,
  showTesterBanner = true,
  onOpenSearch,
  onOpenSettings,
}: ConversationListProps) {
  const { t } = useT();
  const { isAdvancedOrDev: isAdvanced } = usePreferences();
  const formatTimestamp = useFormatTimestamp();
  const [filter, setFilter] = useState<FilterChip>('all');
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showNewHint, setShowNewHint] = useState(false);

  const activeSpaceIds = new Set(conversations.map((c) => c.spaceId).filter(Boolean) as string[]);
  const visibleSpaces = MOCK_SPACES.filter((s) => activeSpaceIds.has(s.id));

  const ALL_CHIPS: { key: FilterChip; label: string }[] = [
    { key: 'all',     label: t('conversation.filterAll') },
    { key: 'direct',  label: t('conversation.filterDirect') },
    { key: 'project', label: t('conversation.filterProjects') },
    { key: 'event',   label: t('conversation.filterEvents') },
    { key: 'council', label: t('conversation.filterCouncils') },
  ];
  // Simple/Calm mode: show only All, Direct, Projects
  const PRIMARY_CHIPS = isAdvanced ? ALL_CHIPS : ALL_CHIPS.slice(0, 3);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const wasDismissed = sessionStorage.getItem('earthos.install_hint_dismissed') === 'true';
    setShowInstall(!isStandalone && !wasDismissed);

    const hintDismissed = typeof window !== 'undefined' &&
      localStorage.getItem('earthos.messaging.firstNewConversationHintDismissed.v1') === 'true';
    setShowNewHint(!hintDismissed);
  }, []);

  function dismissInstallHint() {
    sessionStorage.setItem('earthos.install_hint_dismissed', 'true');
    setShowInstall(false);
  }

  const filtered = conversations
    .filter((conv) => {
      if (conv.isArchived) return false;
      if (filter !== 'all' && conv.type !== filter) return false;
      if (spaceId !== null && conv.spaceId !== spaceId) return false;
      const name = getConversationName(conv, viewerEarthId, t).toLowerCase();
      if (search && !name.includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <>
      <aside className="flex flex-col h-full w-full bg-transparent">

        {/* ── Single scroll container: header (sticky) + list ──────────────── */}
        {/* Wrapping both in one overflow-y-auto container means the header is      */}
        {/* never a flex-shrink-0 block that can consume all available height on   */}
        {/* small screens, leaving zero space for the list.                         */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain md:pb-0"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', paddingBottom: 'var(--qlpa-mobile-nav-h, 4.5rem)' }}>

        {/* ── Header (sticky) ──────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 px-4 pb-4 backdrop-blur-2xl md:px-5"
          style={{ background: 'hsl(212 48% 8% / 0.92)', boxShadow: '0 1px 0 var(--qlpa-divider-soft)', paddingTop: 'max(env(safe-area-inset-top, 0px), 1.25rem)' }}
        >
          {/* Top row: logo + mode bar */}
          <div className="flex items-center gap-2 min-w-0 mb-4">
            <EarthOSLogo size={32} className="flex-shrink-0" />
            <ModeBar />
          </div>

          {/* Calm trust banner — compact on mobile Simple, full on Advanced/desktop */}
          {showTesterBanner && (
            <div
              className="flex items-center gap-2 px-3 py-2 mb-3 rounded-[21px]"
              style={{ background: 'rgba(5,24,38,0.38)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'rgba(80,220,255,0.55)' }} />
              <div className="flex-1 min-w-0">
                {/* Simple mobile: one compact line */}
                {!isAdvanced ? (
                  <p className="text-[0.6875rem] font-semibold leading-snug truncate"
                    style={{ color: 'rgba(180,230,255,0.70)' }}>
                    {t('identityCard.title').split('.').slice(0, 2).join('.') + '.'}
                  </p>
                ) : (
                  <>
                    <p className="text-[0.6875rem] font-semibold leading-snug"
                      style={{ color: 'rgba(220,245,255,0.86)' }}>
                      {t('identityCard.title')}
                    </p>
                    <p className="text-[0.6875rem] mt-0.5 leading-snug"
                      style={{ color: 'rgba(120,200,240,0.50)' }}>
                      {t('identityCard.description')}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Install hint — Advanced+ only in conversation list */}
          {showInstall && isAdvanced && (
            <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-[21px]"
              style={{ background: 'rgba(5,24,38,0.30)' }}>
              <Download className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(120,200,240,0.55)' }} />
              <p className="flex-1 text-[0.6875rem] leading-snug" style={{ color: 'rgba(180,220,255,0.60)' }}>
                {t('conversation.addToHomeScreen')}
              </p>
              <button
                onClick={dismissInstallHint}
                className="text-[0.6875rem] hover:opacity-80 transition-opacity font-medium flex-shrink-0
                  min-w-[1.5rem] min-h-[1.5rem] flex items-center justify-center"
                style={{ color: 'rgba(120,180,220,0.40)' }}
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>
          )}

          {/* Sync badge */}
          {syncBadge && <div className="mb-3">{syncBadge}</div>}

          {/* Search + New conversation row */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[0.875rem] h-[0.875rem]
                pointer-events-none" style={{ color: 'rgba(140,200,240,0.40)' }} />
              <input
                type="text"
                placeholder={t('conversation.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-9 rounded-xl text-[0.875rem]
                  text-foreground placeholder:text-muted-foreground/40
                  focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/20
                  transition-all"
                style={{
                  background: 'rgba(8,28,48,0.42)',
                  border: '1px solid var(--qlpa-divider-hairline)',
                }}
              />
            </div>
            <button
              onClick={() => {
                setDrawerOpen(true);
                if (showNewHint) {
                  setShowNewHint(false);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('earthos.messaging.firstNewConversationHintDismissed.v1', 'true');
                  }
                }
              }}
              aria-label={t('commandBar.new')}
              title={t('commandBar.new')}
              className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-xl
                transition-all touch-manipulation active:scale-95"
              style={{
                minWidth: '2.75rem',
                height: '2.25rem',
                paddingLeft: isAdvanced ? '0.625rem' : '0.75rem',
                paddingRight: isAdvanced ? '0.625rem' : '0.75rem',
                background: 'rgba(30,120,190,0.16)',
                border: '1px solid rgba(80,200,240,0.22)',
                color: 'rgba(130,210,255,0.88)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(30,120,190,0.28)';
                el.style.borderColor = 'rgba(80,200,240,0.36)';
                el.style.color = 'rgba(190,235,255,0.95)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(30,120,190,0.16)';
                el.style.borderColor = 'rgba(80,200,240,0.22)';
                el.style.color = 'rgba(130,210,255,0.88)';
              }}
            >
              <Plus className="w-[0.9375rem] h-[0.9375rem] flex-shrink-0" />
              {!isAdvanced && (
                <span className="text-[0.6875rem] font-semibold whitespace-nowrap leading-none">
                  {t('commandBar.newShort')}
                </span>
              )}
            </button>
          </div>

          {/* Primary filter chips — one clean row */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-0.5">
            {PRIMARY_CHIPS.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`snap-start flex-shrink-0 px-3 h-7 rounded-full text-[0.6875rem] font-medium
                  transition-all touch-manipulation border whitespace-nowrap`}
                style={filter === chip.key ? {
                  background: 'rgba(30,130,200,0.18)',
                  borderColor: 'rgba(80,200,240,0.28)',
                  color: 'rgba(140,220,255,0.90)',
                } : {
                  background: 'transparent',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'rgba(160,200,230,0.50)',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Secondary space selector — Advanced only; Simple mode hides space complexity */}
          {isAdvanced && visibleSpaces.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none snap-x snap-mandatory pt-2 pb-0.5">
              <button
                onClick={() => setSpaceId(null)}
                className="snap-start flex-shrink-0 px-3 h-6 rounded-full text-[0.625rem] font-medium
                  transition-all touch-manipulation border whitespace-nowrap"
                style={spaceId === null ? {
                  background: 'rgba(255,255,255,0.06)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(200,230,255,0.60)',
                } : {
                  background: 'transparent',
                  borderColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(140,180,220,0.38)',
                }}
              >
                {t('spaces.all')}
              </button>
              {visibleSpaces.map((space) => (
                <button
                  key={space.id}
                  onClick={() => setSpaceId(spaceId === space.id ? null : space.id)}
                  className="snap-start flex-shrink-0 flex items-center gap-1 px-3 h-6 rounded-full
                    text-[0.625rem] font-medium transition-all touch-manipulation border whitespace-nowrap"
                  style={spaceId === space.id ? {
                    background: 'rgba(255,255,255,0.06)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(200,230,255,0.60)',
                  } : {
                    background: 'transparent',
                    borderColor: 'rgba(255,255,255,0.06)',
                    color: 'rgba(140,180,220,0.38)',
                  }}
                >
                  <span className="text-[0.5625rem] leading-none opacity-55">{space.icon}</span>
                  <span>{space.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── First-run hint ────────────────────────────────────────────────── */}
        {showNewHint && (
          <div
            className="mx-4 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(30,120,190,0.08)',
              border: '1px solid rgba(80,200,240,0.14)',
            }}
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(100,200,240,0.60)' }} />
            <p className="flex-1 text-[0.6875rem] leading-snug" style={{ color: 'rgba(160,215,245,0.65)' }}>
              {t('conversation.firstRunHint')}
            </p>
            <button
              onClick={() => {
                setShowNewHint(false);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('earthos.messaging.firstNewConversationHintDismissed.v1', 'true');
                }
              }}
              aria-label={t('common.close')}
              className="text-[0.6875rem] flex-shrink-0 flex items-center justify-center w-5 h-5
                rounded-full hover:opacity-80 transition-opacity"
              style={{ color: 'rgba(120,180,220,0.40)' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Conversation list ─────────────────────────────────────────────── */}
        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-36 gap-3 text-muted-foreground">
              <p className="text-[0.875rem]">
                {spaceId !== null ? t('spaces.empty') : t('conversation.noConversationsFound')}
              </p>
              {(filter !== 'all' || spaceId !== null) && (
                <button
                  onClick={() => { setFilter('all'); setSpaceId(null); }}
                  className="text-[0.75rem] text-primary hover:underline transition-colors"
                >
                  {t('conversation.showAll')}
                </button>
              )}
            </div>
          ) : (
            <ul>
              {filtered.map((conv) => {
                const name = getConversationName(conv, viewerEarthId, t);
                const avatar = getConversationAvatar(conv, viewerEarthId);
                const lastMsg = getLastMessage(conv.id);
                const trustLevel = getMemberTrustLevel(conv.id, viewerEarthId);
                const isSelected = conv.id === selectedConversationId;
                const typeIcon = CONV_TYPE_ICONS[conv.type];
                const space = conv.spaceId ? MOCK_SPACES.find((s) => s.id === conv.spaceId) : undefined;

                return (
                  <li key={conv.id}>
                    <button
                      onClick={() => onSelect(conv.id)}
                      className={`w-full flex items-center gap-4 px-5 text-left
                        transition-all duration-[369ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                        active:scale-[0.99] touch-manipulation
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                        ${isSelected
                          ? 'qlpa-active-glow bg-sky-500/8 backdrop-blur-sm border-l-2 border-l-sky-400/40'
                          : 'border-l-2 border-l-transparent hover:bg-white/[0.025]'
                        }`}
                      style={{ minHeight: '72px' }}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0 relative">
                        {avatar?.avatarUrl ? (
                          <img
                            src={avatar.avatarUrl}
                            alt={avatar.displayName}
                            className={`w-11 h-11 rounded-full object-cover ring-2 transition-all
                              ${isSelected ? 'ring-primary/35' : 'ring-border/25'}`}
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center
                              text-[0.8125rem] font-semibold ring-2 transition-all
                              ${isSelected
                                ? 'bg-sky-500/12 text-sky-300 ring-sky-500/22'
                                : 'bg-muted/60 text-muted-foreground ring-border/18'
                              }`}
                          >
                            {conv.type === 'direct'
                              ? name.slice(0, 2).toUpperCase()
                              : <span className="text-base leading-none">{typeIcon}</span>
                            }
                          </div>
                        )}
                        {conv.type === 'direct' && (
                          <span className="absolute -bottom-0.5 -right-0.5">
                            <TrustBadge level={trustLevel} />
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 py-3">
                        {/* Title + timestamp */}
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <span
                            className="truncate leading-snug font-semibold"
                            style={{
                              fontSize: '15px',
                              color: isSelected ? 'rgba(140,220,255,0.92)' : 'rgba(220,238,255,0.90)',
                            }}
                          >
                            {name}
                          </span>
                          {lastMsg && (
                            <span
                              className="flex-shrink-0 tabular-nums"
                              style={{
                                fontSize: '11px',
                                opacity: 0.72,
                                color: isSelected ? 'rgba(120,200,240,0.70)' : 'rgba(140,180,220,0.55)',
                              }}
                            >
                              {formatTimestamp(lastMsg.createdAt)}
                            </span>
                          )}
                        </div>

                        {/* Preview + category pill */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {lastMsg?.body ? (
                            <p
                              className="truncate leading-snug flex-1 min-w-0"
                              style={{
                                fontSize: '13px',
                                opacity: 0.64,
                                color: isSelected ? 'rgba(140,210,240,0.80)' : 'rgba(160,200,235,0.75)',
                              }}
                            >
                              {lastMsg.body}
                            </p>
                          ) : (
                            <p
                              className="truncate leading-snug italic flex-1 min-w-0"
                              style={{ fontSize: '13px', opacity: 0.40, color: 'rgba(160,200,235,0.70)' }}
                            >
                              {conv.description ?? ''}
                            </p>
                          )}
                          {space && spaceId === null && (
                            <span
                              className="flex-shrink-0 whitespace-nowrap leading-tight"
                              style={{
                                fontSize: '10px',
                                opacity: 0.72,
                                color: 'rgba(140,190,225,0.60)',
                                padding: '2px 8px',
                                borderRadius: 999,
                                border: '1px solid var(--qlpa-divider-hairline)',
                                background: 'rgba(20,60,100,0.28)',
                              }}
                            >
                              {space.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>{/* end conversation list */}
        </div>{/* end single scroll container */}

        {/* ── Bottom command bar — desktop (md+) only ─────────────────────────
             Golden ratio rail: outer 72px / inner buttons 44px (72/44 ≈ φ)        */}
        <div
          className="hidden md:flex flex-shrink-0 items-center justify-between gap-3
            border-t pb-safe-bottom"
          style={{
            height: 'var(--qlpa-bottom-layer-h, 4.5rem)',
            paddingLeft: 'var(--qlpa-bottom-pad-x, 0.8125rem)',
            paddingRight: 'var(--qlpa-bottom-pad-x, 0.8125rem)',
            background: 'var(--qlpa-bottom-bg, rgba(8,22,36,0.72))',
            borderColor: 'var(--qlpa-divider-soft)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Search — secondary, equal weight to Settings */}
          {onOpenSearch ? (
            <CommandBarButton
              icon={Search}
              label={t('commandBar.search')}
              onClick={onOpenSearch}
            />
          ) : <div />}

          {/* New conversation — primary accent, centered */}
          <CommandBarButton
            icon={Edit3}
            label={t('commandBar.new')}
            onClick={() => setDrawerOpen(true)}
            accent
          />

          {/* Settings — secondary, equal weight to Search */}
          {onOpenSettings ? (
            <CommandBarButton
              icon={Settings}
              label={t('commandBar.settings')}
              onClick={onOpenSettings}
            />
          ) : <div />}
        </div>
      </aside>

      <NewConversationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={(conv, member) => {
          onNewConversation(conv, member);
          setDrawerOpen(false);
        }}
        creatorEarthId={viewerEarthId}
      />
    </>
  );
}
