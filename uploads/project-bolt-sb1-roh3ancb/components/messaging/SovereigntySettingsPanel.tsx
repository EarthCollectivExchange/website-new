'use client';

import { useState } from 'react';
import {
  X, Database, ShieldCheck, Lock, Eye,
  TriangleAlert as AlertTriangle,
  Download, Trash2, Ban, Flag, Zap, ChevronDown, ClipboardList, Radio, Key, Code as Code2, Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import type {
  Conversation,
  ConversationMember,
  ConversationSovereigntySettings,
  UserSovereigntySettings,
  StorageMode,
  TrustLevel,
  ReflectionMode,
  LedgerEvent,
  Message,
} from '@/lib/messaging/types';
import type { SyncResult } from '@/lib/messaging/sync';
import type { AuthBridgeResult } from '@/lib/messaging/authBridge';
import { SyncStatusBadge } from './SyncStatusBadge';
import { SyncQAPanel } from './SyncQAPanel';
import { CryptoDevPanel } from './CryptoDevPanel';
import { RelayQAPanel } from './RelayQAPanel';
import { ConsentQAPanel } from './ConsentQAPanel';
import { useT } from '@/lib/i18n/useT';

// ─── QA domain primitives ─────────────────────────────────────────────────────

// QLPA dark-mode domain colours — no light backgrounds
const DOMAIN_COLORS = {
  sky:     { border: 'border-sky-500/20',     bg: 'bg-sky-500/5',     icon: 'bg-sky-500/12 text-sky-300',     label: 'text-sky-300/80',    badge: 'bg-sky-500/12 text-sky-300 border-sky-500/20' },
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', icon: 'bg-emerald-500/12 text-emerald-300', label: 'text-emerald-300/80', badge: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/20' },
  amber:   { border: 'border-amber-500/22',   bg: 'bg-amber-500/5',   icon: 'bg-amber-500/12 text-amber-300',   label: 'text-amber-300/80',  badge: 'bg-amber-500/12 text-amber-300 border-amber-500/22' },
};

function QaDomain({
  label,
  icon,
  color,
  devOnly = false,
  developerMode = false,
  devLockedHint,
  devLockedBadge,
  devUnlockedBadge,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  color: keyof typeof DOMAIN_COLORS;
  devOnly?: boolean;
  developerMode?: boolean;
  devLockedHint?: string;
  devLockedBadge?: string;
  devUnlockedBadge?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const c = DOMAIN_COLORS[color];
  const locked = devOnly && !developerMode;

  return (
    <div className={`rounded-2xl border ${c.border} overflow-hidden mb-3`}>
      <button
        onClick={() => !locked && setOpen((v) => !v)}
        className={`flex items-center gap-2.5 w-full px-3 py-2.5 ${c.bg}
          ${locked ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90 transition-opacity'}`}
      >
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          {icon}
        </div>
        <p className={`flex-1 text-xs font-semibold text-left ${c.label}`}>{label}</p>
        {devOnly && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${c.badge}`}>
            {developerMode ? (devUnlockedBadge ?? 'developer') : (devLockedBadge ?? 'locked')}
          </span>
        )}
        {!locked && (
          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 ${c.label} transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      {!locked && open && (
        <div className="px-3 pt-2 pb-3 space-y-3" style={{ background: 'rgba(3,14,26,0.72)' }}>
          {children}
        </div>
      )}
      {locked && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-t border-border">
          <Code2 className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground/70">{devLockedHint ?? 'Enable Developer mode to access Integrity & Security tools.'}</p>
        </div>
      )}
    </div>
  );
}

function QaGroup({
  title,
  sublabel,
  children,
}: {
  title: string;
  sublabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{sublabel}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-border bg-muted/5">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Entry card ───────────────────────────────────────────────────────────────

const ENTRY_COLORS = {
  emerald: { border: 'border-emerald-500/20', header: 'bg-emerald-500/8', icon: 'bg-emerald-500/12 text-emerald-300', label: 'text-emerald-300/90' },
  sky:     { border: 'border-sky-500/20',     header: 'bg-sky-500/8',     icon: 'bg-sky-500/12 text-sky-300',         label: 'text-sky-300/90' },
  amber:   { border: 'border-amber-500/22',   header: 'bg-amber-500/8',   icon: 'bg-amber-500/12 text-amber-300',     label: 'text-amber-300/90' },
};

function EntryCard({
  active, onToggle, icon, label, status, statusCls, color, children,
}: {
  active: boolean; onToggle: () => void; icon: React.ReactNode;
  label: string; status: string; statusCls: string;
  color: keyof typeof ENTRY_COLORS; children: React.ReactNode;
}) {
  const c = ENTRY_COLORS[color];
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${c.border}`}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-2.5 w-full px-3 py-2.5 ${c.header} hover:opacity-90 transition-opacity`}
      >
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>{icon}</div>
        <div className="flex-1 min-w-0 text-left">
          <p className={`text-xs font-semibold ${c.label}`}>{label}</p>
          <p className={`text-[10px] font-medium mt-0.5 ${statusCls}`}>{status}</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${active ? 'rotate-180' : ''}`} />
      </button>
      {active && (
        <div className="px-3 pt-2 pb-3 space-y-1" style={{ background: 'rgba(3,14,26,0.72)' }}>{children}</div>
      )}
    </div>
  );
}

function ToggleRow({
  label, description, checked, onChange, destructive = false,
}: {
  label: string; description: string; checked: boolean;
  onChange: (v: boolean) => void; destructive?: boolean;
}) {
  return (
    <div className="qlpa-toggle-row">
      <div className="qlpa-toggle-copy">
        <p className={`text-xs font-medium ${destructive ? 'text-destructive' : 'text-foreground'}`}>{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <div className="qlpa-toggle-slot">
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full flex-shrink-0"
          style={{
            width: '2.25rem', height: '1.25rem', position: 'relative', borderRadius: '9999px',
            transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
            background: checked
              ? (destructive ? 'hsl(4 60% 50%)' : 'linear-gradient(135deg, hsl(192 72% 50%) 0%, hsl(194 70% 42%) 100%)')
              : 'hsl(214 32% 18%)',
            border: checked
              ? (destructive ? '1.5px solid hsl(4 60% 60% / 0.40)' : '1.5px solid hsl(192 75% 58% / 0.50)')
              : '1.5px solid hsl(214 30% 32%)',
          }}
        >
          <span
            style={{
              position: 'absolute', top: '1px',
              width: '1rem', height: '1rem', borderRadius: '9999px',
              transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), background 0.2s',
              transform: checked ? 'translateX(1rem)' : 'translateX(1px)',
              background: checked ? 'hsl(192 20% 96%)' : 'hsl(210 20% 58%)',
            }}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-[21px] pb-[8px]">
      {children}
    </p>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="qlpa-toggle-row border-b border-border last:border-0" style={{ borderRadius: 0, padding: '11px 0' }}>
      <div className="qlpa-toggle-copy">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="qlpa-toggle-slot">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        width: '2.25rem', height: '1.25rem', position: 'relative', borderRadius: '9999px',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        background: checked
          ? 'linear-gradient(135deg, hsl(192 72% 50%) 0%, hsl(194 70% 42%) 100%)'
          : 'hsl(214 32% 18%)',
        border: checked
          ? '1.5px solid hsl(192 75% 58% / 0.50)'
          : '1.5px solid hsl(214 30% 32%)',
        boxShadow: checked ? '0 0 0 2px hsl(192 65% 48% / 0.15)' : 'inset 0 1px 3px hsl(220 40% 3% / 0.25)',
      }}
    >
      <span
        style={{
          position: 'absolute', top: '1px',
          width: '1rem', height: '1rem', borderRadius: '9999px',
          transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), background 0.2s',
          transform: checked ? 'translateX(1rem)' : 'translateX(1px)',
          background: checked ? 'hsl(192 20% 96%)' : 'hsl(210 20% 58%)',
          boxShadow: checked ? '0 1px 4px hsl(192 65% 30% / 0.38)' : '0 1px 3px hsl(220 40% 3% / 0.25)',
        }}
      />
    </button>
  );
}

function SelectPill<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none bg-muted border border-border rounded-lg px-3 py-1.5 pr-7 text-xs
          font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function PlaceholderBadge({ label }: { label: string }) {
  return (
    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
      {label}
    </span>
  );
}

// ─── In-app confirmation dialog ───────────────────────────────────────────────

interface ConfirmState {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}

function ConfirmDialog({
  state,
  onCancel,
  cancelLabel,
}: {
  state: ConfirmState;
  onCancel: () => void;
  cancelLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in slide-in-from-bottom duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <h3 className="text-sm font-semibold text-foreground mb-2">{state.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-5">{state.body}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { state.onConfirm(); onCancel(); }}
            className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-colors"
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Info dialog (non-destructive placeholder actions) ────────────────────────

interface InfoDialogState {
  title: string;
  body: string;
}

function InfoDialog({ state, onClose, closeLabel }: { state: InfoDialogState; onClose: () => void; closeLabel: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in slide-in-from-bottom duration-200">
        <h3 className="text-sm font-semibold text-foreground mb-2">{state.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-5">{state.body}</p>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Ledger event label helpers ───────────────────────────────────────────────

const LEDGER_EVENT_KEYS: Record<string, string> = {
  consent_validated:    'Consent validated',
  consent_denied:       'Consent denied',
  trust_checked:        'Trust checked',
  trust_denied:         'Trust denied',
  safety_checked:       'Safety checked',
  safety_denied:        'Safety denied',
  rate_limit_checked:   'Rate limit checked',
  rate_limit_exceeded:  'Rate limit exceeded',
  storage_validated:    'Storage validated',
  mirror_reflected:     'Mirror reflected',
  mirror_overrode:      'Mirror acknowledged',
  message_created:      'Message sent',
  message_blocked:      'Message blocked',
  message_deleted:      'Message deleted',
  conversation_created: 'Conversation created',
};

function ledgerLabel(eventType: string): string {
  return LEDGER_EVENT_KEYS[eventType] ?? eventType.replace(/_/g, ' ');
}

function ledgerDotColor(eventType: string, passed: boolean): string {
  if (!passed || eventType.includes('denied') || eventType.includes('exceeded') || eventType.includes('blocked')) {
    return 'bg-red-400';
  }
  if (eventType.includes('mirror')) return 'bg-amber-400';
  return 'bg-emerald-400';
}

// ─── QLPA Net Shield foundation card (developer mode only) ───────────────────

function NetShieldFoundationCard({ t }: { t: (key: string) => string }) {
  return (
    <div className="rounded-2xl border border-amber-500/25 overflow-hidden mb-3">
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-amber-500/10">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500/15 text-amber-400">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-300">{t('netShield.title')}</p>
          <p className="text-[9px] text-amber-400/70 mt-0.5">{t('netShield.subtitle')}</p>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/25 flex-shrink-0">
          {t('sovereignty.placeholderBadge')}
        </span>
      </div>
      <div className="px-3 py-2.5 bg-background space-y-1.5">
        <p className="text-[10px] text-muted-foreground leading-snug mb-2">
          {t('netShield.calmProtectionLanguage')}
        </p>
        {[
          [t('netShield.levels.protected'),       t('netShield.levels.protected')],
          [t('netShield.status.localOnly'),        t('netShield.status.localOnly')],
          [t('netShield.remoteDeleteFuture'),      t('netShield.status.futureRelayRequired')],
          [t('netShield.guardianReview'),          t('sovereignty.placeholderBadge')],
        ].map(([label, value], i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-[10px] font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface SovereigntySettingsPanelProps {
  conversation: Conversation;
  convSettings: ConversationSovereigntySettings;
  userSettings: UserSovereigntySettings;
  ledgerEvents: LedgerEvent[];
  allMessages?: Message[];
  members?: ConversationMember[];
  viewerEarthId?: string;
  syncResult?: SyncResult;
  authResult?: AuthBridgeResult | null;
  advancedView?: boolean;
  developerMode?: boolean;
  onUpdateConvSettings: (patch: Partial<ConversationSovereigntySettings> & { conversationId: string }) => void;
  onUpdateUserSettings: (patch: Partial<Pick<UserSovereigntySettings, 'intentionMirror'>>) => void;
  onExportData: () => void;
  onResetLocalData: () => void;
  onDeleteConversation: () => void;
  onSyncNow?: () => Promise<void> | void;
  onRebuildBridge?: () => Promise<void> | void;
  onSignOut?: () => Promise<void> | void;
  onClose: () => void;
}

export function SovereigntySettingsPanel({
  conversation,
  convSettings,
  userSettings,
  ledgerEvents,
  syncResult,
  authResult,
  onUpdateConvSettings,
  onUpdateUserSettings,
  onExportData,
  onResetLocalData,
  onDeleteConversation,
  onSyncNow,
  onRebuildBridge,
  onSignOut,
  onClose,
  allMessages,
  members,
  viewerEarthId,
  advancedView = false,
  developerMode = false,
}: SovereigntySettingsPanelProps) {
  const { t } = useT();
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [infoState, setInfoState] = useState<InfoDialogState | null>(null);
  type EntrySection = 'trust' | 'privacy' | 'delivery' | null;
  const [activeSection, setActiveSection] = useState<EntrySection>(null);

  function toggleSection(s: EntrySection) {
    setActiveSection((prev) => (prev === s ? null : s));
  }

  // ConsentAction: 'change-trust' (when patch.trustLevel is set)
  // ConsentAction: 'change-retention' (when patch.autoDeleteEnabled or retention fields set)
  // ConsentAction: 'enable-relay' (when patch.storageMode changes to 'encrypted_relay')
  function patchConv(patch: Partial<Omit<ConversationSovereigntySettings, 'conversationId' | 'updatedAt'>>) {
    onUpdateConvSettings({ ...patch, conversationId: conversation.id });
  }

  function patchMirror(patch: Partial<UserSovereigntySettings['intentionMirror']>) {
    onUpdateUserSettings({
      intentionMirror: { ...userSettings.intentionMirror, ...patch },
    });
  }

  function confirm(state: ConfirmState) {
    setConfirmState(state);
  }

  function info(state: InfoDialogState) {
    setInfoState(state);
  }

  const mirror = userSettings.intentionMirror;

  const STORAGE_OPTIONS: { value: StorageMode; label: string }[] = [
    { value: 'local_only',       label: t('sovereignty.storageLocalOnly') },
    { value: 'encrypted_relay',  label: t('sovereignty.storageEncryptedRelay') },
    { value: 'encrypted_backup', label: t('sovereignty.storageEncryptedBackup') },
  ];

  const TRUST_OPTIONS: { value: TrustLevel; label: string }[] = [
    { value: 'trusted',   label: t('sovereignty.trustOptions.trusted') },
    { value: 'known',     label: t('sovereignty.trustOptions.known') },
    { value: 'community', label: t('sovereignty.trustOptions.community') },
    { value: 'unknown',   label: t('sovereignty.trustOptions.unknown') },
    { value: 'blocked',   label: t('sovereignty.trustOptions.blocked') },
  ];

  const REFLECTION_OPTIONS: { value: ReflectionMode; label: string }[] = [
    { value: 'soft',   label: t('sovereignty.reflectionOptions.soft') },
    { value: 'clear',  label: t('sovereignty.reflectionOptions.clear') },
    { value: 'strict', label: t('sovereignty.reflectionOptions.strict') },
  ];

  const STORAGE_STATUS_LABELS: Record<StorageMode, string> = {
    local_only:       t('sovereignty.storageLocalOnly'),
    encrypted_relay:  t('sovereignty.storageEncryptedRelay'),
    encrypted_backup: t('sovereignty.storageEncryptedBackup'),
  };

  const storageDesc =
    convSettings.storageMode === 'local_only'
      ? t('sovereignty.storageLocalDesc')
      : convSettings.storageMode === 'encrypted_relay'
      ? t('sovereignty.storageRelayDesc')
      : t('sovereignty.storageBackupDesc');

  const reflectionDesc =
    userSettings.intentionMirror.reflectionMode === 'soft'
      ? t('sovereignty.reflectionSoftDesc')
      : userSettings.intentionMirror.reflectionMode === 'clear'
      ? t('sovereignty.reflectionClearDesc')
      : t('sovereignty.reflectionStrictDesc');

  // Latest 9 ledger events, newest first, filtered to this conversation
  const convLedger = [...ledgerEvents]
    .filter((e) => e.conversationId === conversation.id || !e.conversationId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 9);

  return (
    <>
      {confirmState && (
        <ConfirmDialog
          state={confirmState}
          onCancel={() => setConfirmState(null)}
          cancelLabel={t('sovereignty.cancelButton')}
        />
      )}
      {infoState && (
        <InfoDialog
          state={infoState}
          onClose={() => setInfoState(null)}
          closeLabel={t('sovereignty.understoodButton')}
        />
      )}

      <div className="flex flex-col h-full border-l border-border bg-background w-80 flex-shrink-0 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-[21px] py-[21px] border-b border-border flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('sovereignty.panelTitle')}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t('sovereignty.panelSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-[21px] pb-[80px]"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>

          {/* ── Primary controls (always shown) ─────────────────────────── */}
          <div className="pt-3 pb-2 space-y-2">
            {/* Trust card */}
            <EntryCard
              active={activeSection === 'trust'}
              onToggle={() => toggleSection('trust')}
              icon={<ShieldCheck className="w-4 h-4" />}
              label={t('sovereignty.trustCardLabel')}
              status={convSettings.isBlocked ? t('sovereignty.trustOptions.blocked') : convSettings.trustLevel}
              statusCls={convSettings.isBlocked ? 'text-destructive' : 'text-emerald-700'}
              color="emerald"
            >
              <SettingRow
                label={t('sovereignty.trustLevelLabel')}
                description={t('sovereignty.trustLevelDesc')}
              >
                <SelectPill
                  value={convSettings.trustLevel}
                  options={TRUST_OPTIONS}
                  onChange={(v) => patchConv({ trustLevel: v })}
                />
              </SettingRow>

              <div className="space-y-2 pb-2">
                <ToggleRow
                  label={t('sovereignty.requireApproval')}
                  description={t('sovereignty.requireApprovalDesc')}
                  checked={convSettings.requireApproval}
                  onChange={(v) => patchConv({ requireApproval: v })}
                />
                <ToggleRow
                  label={t('sovereignty.blockConversation')}
                  description={t('sovereignty.blockConversationDesc')}
                  checked={convSettings.isBlocked}
                  onChange={(v) => patchConv({ isBlocked: v })}
                  destructive
                />
                <ToggleRow
                  label={t('sovereignty.muteConversation')}
                  description={t('sovereignty.muteConversationDesc')}
                  checked={convSettings.isMuted}
                  onChange={(v) => patchConv({ isMuted: v })}
                />
              </div>
            </EntryCard>

            {/* Privacy card */}
            <EntryCard
              active={activeSection === 'privacy'}
              onToggle={() => toggleSection('privacy')}
              icon={<Lock className="w-4 h-4" />}
              label={t('sovereignty.privacyCardLabel')}
              status={STORAGE_STATUS_LABELS[convSettings.storageMode]}
              statusCls="text-sky-700"
              color="sky"
            >
              <SettingRow
                label={t('sovereignty.storageDesc')}
                description={storageDesc}
              >
                <SelectPill
                  value={convSettings.storageMode}
                  options={STORAGE_OPTIONS}
                  onChange={(v) => patchConv({ storageMode: v })}
                />
              </SettingRow>

              {convSettings.storageMode === 'encrypted_backup' && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300 leading-relaxed">
                    {t('sovereignty.storageBackupWarning')}
                  </p>
                </div>
              )}

              <div className="space-y-2 pb-2">
                <ToggleRow
                  label={t('sovereignty.allowDirectMessages')}
                  description={t('sovereignty.allowDirectMessagesDesc')}
                  checked={convSettings.allowDirectMessages}
                  onChange={(v) => patchConv({ allowDirectMessages: v })}
                />
                <ToggleRow
                  label={t('sovereignty.allowLocationMessages')}
                  description={t('sovereignty.allowLocationMessagesDesc')}
                  checked={convSettings.allowLocationMessages}
                  onChange={(v) => patchConv({ allowLocationMessages: v })}
                />
              </div>
            </EntryCard>

            {/* Delivery card */}
            <EntryCard
              active={activeSection === 'delivery'}
              onToggle={() => toggleSection('delivery')}
              icon={<Radio className="w-4 h-4" />}
              label={t('sovereignty.deliveryCardLabel')}
              status={convSettings.requireApproval ? t('sovereignty.deliveryStatusPending') : t('sovereignty.deliveryStatusReady')}
              statusCls={convSettings.requireApproval ? 'text-amber-700' : 'text-emerald-700'}
              color="amber"
            >
              <ToggleRow
                label={t('sovereignty.intentionMirror')}
                description={t('sovereignty.intentionMirrorDesc')}
                checked={userSettings.intentionMirror.enabled}
                onChange={(v) => patchMirror({ enabled: v })}
              />
              {userSettings.intentionMirror.enabled && (
                <SettingRow
                  label={t('sovereignty.reflectionMode')}
                  description={reflectionDesc}
                >
                  <SelectPill
                    value={userSettings.intentionMirror.reflectionMode}
                    options={REFLECTION_OPTIONS}
                    onChange={(v) => patchMirror({ reflectionMode: v })}
                  />
                </SettingRow>
              )}
            </EntryCard>
          </div>

          {/* Advanced tools — gated behind advanced view */}
          {advancedView && (
            <>
              <SectionHeader>
                <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> {t('sovereignty.advancedToolsHeader')}</span>
              </SectionHeader>

              <QaDomain
                label={t('sovereignty.identityKeys')}
                icon={<Key className="w-3.5 h-3.5" />}
                color="sky"
              >
                <QaGroup title={t('sovereignty.authSyncQA')} sublabel={t('sovereignty.authSyncQADesc')}>
                  <SyncQAPanel
                    authResult={authResult ?? null}
                    syncResult={syncResult ?? null}
                    isSyncing={syncResult?.status === 'syncing'}
                    onSyncNow={onSyncNow ?? (() => {})}
                    onRebuildBridge={onRebuildBridge ?? (() => {})}
                    onSignOut={onSignOut ?? (() => {})}
                  />
                </QaGroup>
              </QaDomain>

              <QaDomain
                label={t('sovereignty.messageTrustFlow')}
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                color="emerald"
              >
                <QaGroup title={t('sovereignty.consentPermissionsQA')} sublabel={t('sovereignty.consentPermissionsQADesc')}>
                  <ConsentQAPanel
                    convSettings={convSettings}
                    viewerEarthId={viewerEarthId ?? ''}
                    recipientCount={
                      (members ?? []).filter(
                        (m) => m.conversationId === convSettings.conversationId && m.earthId !== (viewerEarthId ?? '')
                      ).length
                    }
                  />
                </QaGroup>
                <QaGroup title={t('sovereignty.relayBoundaryQA')} sublabel={t('sovereignty.relayBoundaryQADesc')}>
                  <RelayQAPanel
                    convSettings={convSettings}
                    members={members ?? []}
                    viewerEarthId={viewerEarthId ?? ''}
                  />
                </QaGroup>
              </QaDomain>
            </>
          )}

          {/* Developer diagnostics — gated behind developer mode */}
          {developerMode && (
            <>
              <SectionHeader>
                <span className="flex items-center gap-2"><Code2 className="w-3.5 h-3.5" /> {t('sovereignty.developerDiagnosticsHeader')}</span>
              </SectionHeader>

              <QaDomain
                label={t('sovereignty.integritySecurityLabel')}
                icon={<Lock className="w-3.5 h-3.5" />}
                color="amber"
              >
                <QaGroup title={t('sovereignty.encryptionFoundation')} sublabel={t('sovereignty.encryptionFoundationDesc')}>
                  <CryptoDevPanel messages={allMessages ?? []} />
                </QaGroup>
              </QaDomain>

              {/* QLPA Net Shield — foundation status card */}
              <NetShieldFoundationCard t={t} />

              {/* Local Ledger — developer-level detail */}
              <SectionHeader>
                <span className="flex items-center gap-2"><ClipboardList className="w-3.5 h-3.5" /> {t('sovereignty.localLedger')}</span>
              </SectionHeader>
              <p className="text-xs text-muted-foreground pb-[8px] leading-relaxed">
                {t('sovereignty.localLedgerDesc')}
              </p>

              {convLedger.length === 0 ? (
                <div className="py-[8px] text-center">
                  <p className="text-xs text-muted-foreground/70">{t('sovereignty.noEventsYet')}</p>
                </div>
              ) : (
                <div className="space-y-[6px] pb-[8px]">
                  {convLedger.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-muted/40 border border-border"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px] ${ledgerDotColor(event.eventType, event.passed)}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-tight">
                          {ledgerLabel(event.eventType)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-1">
                          {event.detail ?? '—'}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5 tabular-nums">
                        {format(new Date(event.createdAt), 'h:mm a')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Data Portability */}
          <SectionHeader>
            <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> {t('sovereignty.dataPortability')}</span>
          </SectionHeader>
          <p className="text-xs text-muted-foreground pb-[8px] leading-relaxed">
            {t('sovereignty.dataPortabilityDesc')}
          </p>

          <div className="space-y-2 pb-[21px]">
            {/* ConsentAction: 'export-data' */}
            <button
              onClick={onExportData}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-border text-xs
                text-foreground hover:bg-muted transition-colors text-left font-medium"
            >
              <Download className="w-3.5 h-3.5 flex-shrink-0" />
              {t('sovereignty.exportDataJson')}
            </button>

            {/* ConsentAction: 'clear-data' */}
            <button
              onClick={() =>
                confirm({
                  title: t('sovereignty.deleteConversationTitle'),
                  body: t('sovereignty.deleteConversationBody'),
                  confirmLabel: t('sovereignty.deleteConfirmLabel'),
                  onConfirm: onDeleteConversation,
                })
              }
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-dashed border-border
                text-xs text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5
                transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
              {t('sovereignty.deleteConversation')}
            </button>

            {/* ConsentAction: 'clear-data' */}
            <button
              onClick={() =>
                confirm({
                  title: t('sovereignty.clearAllDataTitle'),
                  body: t('sovereignty.clearAllDataBody'),
                  confirmLabel: t('sovereignty.clearEverything'),
                  onConfirm: onResetLocalData,
                })
              }
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-dashed border-border
                text-xs text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5
                transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
              {t('sovereignty.clearAllData')}
            </button>

            <button
              onClick={() =>
                info({
                  title: t('sovereignty.migrateEarthId'),
                  body: t('sovereignty.migrateEarthIdBody'),
                })
              }
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-border text-xs
                text-muted-foreground hover:bg-muted transition-colors text-left"
            >
              <Zap className="w-3.5 h-3.5 flex-shrink-0" />
              {t('sovereignty.migrateEarthId')}
              <PlaceholderBadge label={t('sovereignty.placeholderBadge')} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
