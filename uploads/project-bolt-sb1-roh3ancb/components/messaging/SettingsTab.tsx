'use client';

import { useState, useRef, useEffect } from 'react';
import {
  User, Lock, Database, ShieldCheck, Download, ChevronRight, LogOut,
  Trash2, Info, ChevronDown, ChevronUp, CircleCheck as CheckCircle2,
  Circle, Radio, Package, Camera, Leaf, TriangleAlert as AlertTriangle,
  Car, Eye, Code as Code2, Globe,
} from 'lucide-react';
import { ReleaseReadinessPanel } from './ReleaseReadinessPanel';
import { AppDashboard } from './AppDashboard';
import { PhoneQAPanel } from './PhoneQAPanel';
import { getCurrentStageLabelKey } from '@/lib/qlpa/releaseContract';
import { createDiagnosticRecord, getDeviceRuntimeSummary } from '@/lib/qlpa/testDiagnostics';
import { saveDiagnosticRecord, listDiagnosticRecords, clearDiagnosticRecords } from '@/lib/qlpa/localTestLog';
import { useQLPARuntime, useActiveSheet } from '@/lib/qlpa/QLPARuntimeContext';
import { useT, type Locale } from '@/lib/i18n/useT';
import { useI18n } from '@/lib/i18n/context';
import { LOCALES } from '@/lib/i18n/dictionary';
import type { LocalStore } from '@/lib/messaging/localPersistence';
import { isAdvancedOrDev, isDeveloper, type InterfaceDepth, type AppMode } from '@/lib/messaging/modes';
import { usePreferences } from '@/lib/messaging/preferencesContext';
import { ALL_HARMONY_MODES, type LanguageHarmonyMode } from '@/lib/qlpa/languageHarmonyPolicy';

export type { AppMode };

interface SettingsTabProps {
  viewerEarthId: string;
  onExportData: () => void;
  onResetLocalData?: () => void;
  onSignOut?: () => void;
  isAuthenticated?: boolean;
  store?: LocalStore;
  onStartConversation?: () => void;
}

// ─── MVP Checklist (developer-only) ──────────────────────────────────────────

function MvpChecklist({
  store,
  viewerEarthId = '',
}: {
  store?: LocalStore;
  viewerEarthId?: string;
}) {
  const { t } = useT();
  const hasIdentity       = Boolean(viewerEarthId && viewerEarthId !== '');
  const hasConsent        = Boolean(store?.ledgerEvents.some((e) => e.eventType === 'consent_granted' || e.eventType === 'consent_checked'));
  const hasEncryption     = Boolean(store?.messages.some((m) => m.encryptionStatus === 'local_encrypted'));
  const hasRelayEnvelope  = Boolean(store?.messages.some((m) => m.relayEnvelope !== undefined));
  const hasExport         = Boolean(store && (store.messages.length > 0 || store.ledgerEvents.length > 0));
  const isInstallReady    = typeof window !== 'undefined'
    ? (window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
    : false;

  const items: { label: string; detail: string; done: boolean; icon: React.ReactNode }[] = [
    { label: t('settings.mvpIdentity'),      detail: hasIdentity     ? t('settings.mvpIdentityDone')     : t('settings.mvpIdentityPending'),     done: hasIdentity,      icon: <User className="w-3.5 h-3.5" /> },
    { label: t('settings.mvpConsentEngine'), detail: hasConsent      ? t('settings.mvpConsentDone')      : t('settings.mvpConsentPending'),      done: hasConsent,       icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { label: t('settings.mvpEncryption'),    detail: hasEncryption   ? t('settings.mvpEncryptionDone')   : t('settings.mvpEncryptionPending'),   done: hasEncryption,    icon: <Lock className="w-3.5 h-3.5" /> },
    { label: t('settings.mvpRelayEnvelope'), detail: hasRelayEnvelope? t('settings.mvpRelayDone')        : t('settings.mvpRelayPending'),        done: hasRelayEnvelope, icon: <Radio className="w-3.5 h-3.5" /> },
    { label: t('settings.mvpExport'),        detail: hasExport       ? t('settings.mvpExportDone')       : t('settings.mvpExportPending'),       done: hasExport,        icon: <Download className="w-3.5 h-3.5" /> },
    { label: t('settings.mvpInstallReady'),  detail: isInstallReady  ? t('settings.mvpInstallDone')      : t('settings.mvpInstallPending'),      done: isInstallReady,   icon: <Package className="w-3.5 h-3.5" /> },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const pct = doneCount / items.length;

  return (
    <div className="qlpa-glass-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{t('settings.mvpReadiness')}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('settings.mvpChecksComplete').replace('{done}', String(doneCount)).replace('{total}', String(items.length))}</p>
        </div>
        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden flex-shrink-0">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct * 100}%`, background: pct === 1 ? 'oklch(0.74 0.15 155)' : 'oklch(0.64 0.12 155)' }}
          />
        </div>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-3 px-4 py-2.5">
            <div className="flex-shrink-0 mt-0.5">
              {item.done
                ? <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(152 58% 46% / 0.15)', border: '1px solid hsl(152 58% 46% / 0.30)' }}>
                    <CheckCircle2 className="w-3 h-3" style={{ color: 'hsl(152 58% 62%)' }} />
                  </div>
                : <div className="w-4.5 h-4.5 rounded-full border border-border bg-muted/30 flex items-center justify-center">
                    <Circle className="w-3 h-3 text-muted-foreground/40" />
                  </div>
              }
            </div>
            <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
              style={item.done
                ? { background: 'hsl(152 58% 46% / 0.12)', color: 'hsl(152 58% 62%)' }
                : { background: 'hsl(214 30% 16% / 0.60)', color: 'hsl(210 16% 50%)' }
              }>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${item.done ? 'text-foreground' : 'text-muted-foreground/70'}`}>{item.label}</p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
      style={{
        width: '2.5rem', height: '1.5rem', position: 'relative', borderRadius: '9999px',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        background: checked
          ? 'linear-gradient(135deg, hsl(192 72% 50%) 0%, hsl(194 70% 42%) 100%)'
          : 'hsl(214 32% 18%)',
        border: checked
          ? '1.5px solid hsl(192 75% 58% / 0.50)'
          : '1.5px solid hsl(214 30% 32%)',
        boxShadow: checked
          ? '0 0 0 2px hsl(192 65% 48% / 0.18), 0 2px 8px hsl(192 65% 40% / 0.28)'
          : 'inset 0 1px 3px hsl(220 40% 3% / 0.28)',
      }}
    >
      <span
        style={{
          position: 'absolute', top: '2px',
          width: '1.125rem', height: '1.125rem', borderRadius: '9999px',
          transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), background 0.2s',
          transform: checked ? 'translateX(1.125rem)' : 'translateX(2px)',
          background: checked ? 'hsl(192 20% 96%)' : 'hsl(210 20% 58%)',
          boxShadow: checked ? '0 1px 4px hsl(192 65% 30% / 0.40)' : '0 1px 3px hsl(220 40% 3% / 0.28)',
        }}
      />
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="qlpa-section-label px-1 mb-1.5 mt-4 first:mt-0">
      {children}
    </p>
  );
}

// ─── Capability status line (Advanced/Developer) ─────────────────────────────

function CapabilityLine({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-emerald-400' : 'bg-muted-foreground/30'}`} />
      <p className={`text-[10px] ${active ? 'text-emerald-300' : 'text-muted-foreground/60'}`}>{label}</p>
    </div>
  );
}

// ─── Settings row ─────────────────────────────────────────────────────────────

function SettingRow({ icon, label, sublabel, right, onClick, destructive }: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const cls = destructive ? 'text-destructive' : 'text-foreground';
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl
        ${onClick ? 'hover:bg-white/4 active:bg-white/6 transition-colors cursor-pointer' : 'cursor-default'}
        disabled:opacity-60`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border
        ${destructive
          ? 'bg-red-500/10 border-red-500/20'
          : 'bg-sky-500/8 border-sky-500/16'
        }`}>
        <span className={destructive ? 'text-red-400' : 'text-sky-400'}>{icon}</span>
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-xs font-semibold leading-tight ${cls}`}>{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{sublabel}</p>}
      </div>
      {right ?? (onClick ? <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" /> : null)}
    </button>
  );
}

// ─── View Mode Selector ───────────────────────────────────────────────────────

const VIEW_LEVEL_STYLES: Record<string, React.CSSProperties> = {
  simple:    { background: 'hsl(158 58% 46% / 0.12)', borderColor: 'hsl(158 58% 46% / 0.28)', color: 'hsl(158 58% 68%)' },
  advanced:  { background: 'hsl(208 72% 50% / 0.12)', borderColor: 'hsl(208 72% 50% / 0.28)', color: 'hsl(208 72% 70%)' },
  developer: { background: 'hsl(262 50% 60% / 0.12)', borderColor: 'hsl(262 50% 60% / 0.28)', color: 'hsl(262 50% 78%)' },
};

const VIEW_LEVELS: { key: InterfaceDepth; icon: React.ReactNode; labelKey: string; descKey: string; badgeKey: string; badgeClass: string }[] = [
  {
    key: 'simple',
    icon: <User className="w-4 h-4" />,
    labelKey: 'settings.userView',
    descKey: 'settings.userViewDesc',
    badgeKey: 'viewLevelBadge.simple',
    badgeClass: 'border',
  },
  {
    key: 'advanced',
    icon: <Eye className="w-4 h-4" />,
    labelKey: 'settings.advancedView',
    descKey: 'settings.advancedViewDesc',
    badgeKey: 'viewLevelBadge.advanced',
    badgeClass: 'border',
  },
  {
    key: 'developer',
    icon: <Code2 className="w-4 h-4" />,
    labelKey: 'settings.developerView',
    descKey: 'settings.developerViewDesc',
    badgeKey: 'viewLevelBadge.developer',
    badgeClass: 'border',
  },
];

function ViewModeSelector({ viewLevel, onChange, t }: {
  viewLevel: InterfaceDepth;
  onChange: (level: InterfaceDepth) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="qlpa-glass-card overflow-hidden">
      {VIEW_LEVELS.map((level, idx) => {
        const isActive = viewLevel === level.key;
        return (
          <button
            key={level.key}
            onClick={() => onChange(level.key)}
            className={`flex items-center gap-3 w-full px-3 py-3 text-left transition-all
              ${idx < VIEW_LEVELS.length - 1 ? 'border-b border-border/50' : ''}
              ${isActive ? '' : 'hover:bg-white/4'}`}
            style={isActive ? { background: `${Object.values(VIEW_LEVEL_STYLES[level.key])[0].toString().replace('0.12', '0.08')}` } : undefined}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={isActive ? { ...VIEW_LEVEL_STYLES[level.key], background: VIEW_LEVEL_STYLES[level.key].background?.toString().replace('0.12', '0.20') } : { background: 'hsl(216 28% 16%)', color: 'hsl(210 16% 52%)' }}
            >
              {level.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {t(level.labelKey)}
                </p>
                {isActive && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${level.badgeClass}`}
                    style={VIEW_LEVEL_STYLES[level.key]}
                  >
                    {t(level.badgeKey)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t(level.descKey)}</p>
            </div>
            <div
              className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={isActive ? { borderColor: VIEW_LEVEL_STYLES[level.key].color } : { borderColor: 'hsl(214 30% 24%)' }}
            >
              {isActive && (
                <div className="w-2 h-2 rounded-full"
                  style={{ background: VIEW_LEVEL_STYLES[level.key].color }} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Language Selector ────────────────────────────────────────────────────────

function LanguageSelector({ locale, onChange, t }: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="qlpa-glass-card overflow-hidden">
      {LOCALES.map((lang, idx) => {
        const isActive = locale === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors
              ${idx < LOCALES.length - 1 ? 'border-b border-border/40' : ''}
              ${isActive ? 'bg-primary/8' : 'hover:bg-muted/50'}`}
          >
            <span className="text-xl flex-shrink-0 w-7 text-center">{lang.flag}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {lang.nativeName}
              </p>
              <p className="text-[10px] text-muted-foreground">{t(`languages.${lang.code}`)}</p>
            </div>
            {isActive && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Language Harmony Mode selector ──────────────────────────────────────────

const HARMONY_MODE_LABELS: Record<LanguageHarmonyMode, { labelKey: string; descKey: string }> = {
  off:      { labelKey: 'settings.harmonyOff',      descKey: 'settings.harmonyOffDesc' },
  soft:     { labelKey: 'settings.harmonySoft',     descKey: 'settings.harmonySoftDesc' },
  clear:    { labelKey: 'settings.harmonyClear',    descKey: 'settings.harmonyClearDesc' },
  strict:   { labelKey: 'settings.harmonyStrict',   descKey: 'settings.harmonyStrictDesc' },
  guardian: { labelKey: 'settings.harmonyGuardian', descKey: 'settings.harmonyGuardianDesc' },
};

function HarmonyModeSelector({
  mode,
  onChange,
  t,
}: {
  mode: LanguageHarmonyMode;
  onChange: (m: LanguageHarmonyMode) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="qlpa-glass-card overflow-hidden">
      {(ALL_HARMONY_MODES as readonly LanguageHarmonyMode[]).map((m, i) => {
        const isActive = m === mode;
        const { labelKey, descKey } = HARMONY_MODE_LABELS[m];
        const isLast = i === ALL_HARMONY_MODES.length - 1;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors
              ${!isLast ? 'border-b border-border/40' : ''}
              ${isActive ? 'bg-sky-500/5' : 'hover:bg-white/4'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${isActive ? 'border-sky-400' : 'border-border'}`}>
              {isActive && <div className="w-2 h-2 rounded-full bg-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isActive ? 'text-sky-300' : 'text-foreground'}`}>
                {t(labelKey)}
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{t(descKey)}</p>
            </div>
            {isActive && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'hsl(208 72% 50% / 0.12)', border: '1px solid hsl(208 72% 50% / 0.28)', color: 'hsl(208 72% 70%)' }}>
                {t('settings.active')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsTab({
  viewerEarthId,
  onExportData,
  onResetLocalData,
  onSignOut,
  isAuthenticated = false,
  store,
  onStartConversation,
}: SettingsTabProps) {
  const { t } = useT();
  const { locale, setLocale } = useI18n();
  const { deviceRuntime } = useQLPARuntime();
  const [activeSheet] = useActiveSheet();
  const {
    interfaceDepth: viewLevel,
    setInterfaceDepth: onChangeViewLevel,
    appMode,
    setAppMode: onChangeAppMode,
    backgroundMode: bgModePref,
    setBackgroundMode: setBgModePref,
    languageHarmonyMode,
    setLanguageHarmonyMode,
  } = usePreferences();
  // Map context values to local UI aliases for readability
  const backgroundMode = bgModePref === 'live_world_future' ? 'camera' : 'earth';
  const setBackgroundMode = (mode: 'earth' | 'camera') =>
    setBgModePref(mode === 'camera' ? 'live_world_future' : 'earth_alive');
  // Camera permission is v0.1 display-only — real permission check deferred
  const cameraBlocked = false;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [showRelease, setShowRelease] = useState(false);
  const [showMvpChecklist, setShowMvpChecklist] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [diagNoteStatus, setDiagNoteStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, []);
  const shortId = viewerEarthId.length > 16
    ? viewerEarthId.slice(0, 8) + '…' + viewerEarthId.slice(-4)
    : viewerEarthId;

  const currentLocale = LOCALES.find((l) => l.code === locale);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-safe-top pt-4 pb-3 border-b border-sky-500/10 backdrop-blur-xl"
        style={{ background: 'hsl(212 48% 8% / 0.50)' }}>
        <h1 className="text-base font-semibold text-foreground">{t('settings.title')}</h1>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[80px]"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        <div className="mx-auto w-full max-w-2xl px-4 py-4">

        {/* ═══ A. EXPERIENCE ═══════════════════════════════════════════════ */}
        <SectionLabel>{t('settings.experience')}</SectionLabel>

        {/* Interface View */}
        <div className="flex items-center justify-between px-1 mb-1.5">
          <p className="text-[10px] font-medium text-muted-foreground">{t('settings.viewMode')}</p>
          {(() => {
            const active = VIEW_LEVELS.find((v) => v.key === viewLevel)!;
            return (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${active.badgeClass}`}>
                {t(active.badgeKey)}
              </span>
            );
          })()}
        </div>
        <div className="mb-3">
          <ViewModeSelector viewLevel={viewLevel} onChange={onChangeViewLevel} t={t} />
        </div>

        {/* Language */}
        <div className="mb-3">
          <button
            onClick={() => setShowLanguage((v) => !v)}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-2xl text-sm font-semibold text-foreground hover:bg-white/4 transition-colors"
            style={{ background: 'hsl(212 48% 11% / 0.60)', border: '1px solid hsl(194 55% 70% / 0.12)' }}
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {t('settings.language')}
              <span className="text-[10px] font-normal text-muted-foreground">
                {currentLocale?.flag} {currentLocale?.nativeName}
              </span>
            </span>
            {showLanguage
              ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            }
          </button>
          {showLanguage && (
            <div className="mt-2">
              <LanguageSelector locale={locale} onChange={setLocale} t={t} />
            </div>
          )}
        </div>

        {/* Language Harmony Mode */}
        <div className="mb-3">
          <p className="text-[10px] font-medium text-muted-foreground px-1 mb-1.5">
            {t('settings.languageHarmonyMode')}
          </p>
          <HarmonyModeSelector mode={languageHarmonyMode} onChange={setLanguageHarmonyMode} t={t} />
        </div>

        {/* Background */}
        <div className="qlpa-glass-card overflow-hidden mb-3">
          <button
            onClick={() => setBackgroundMode('earth')}
            className={`flex items-center gap-3 w-full px-3 py-3 border-b border-border/40 transition-colors text-left
              ${backgroundMode === 'earth' ? 'bg-emerald-500/5' : 'hover:bg-white/4'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${backgroundMode === 'earth' ? 'border-primary' : 'border-border'}`}>
              {backgroundMode === 'earth' && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <div className="w-10 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-border/50"
              style={{ background: [
                'radial-gradient(circle at 30% 30%, rgba(140,255,210,0.42), transparent 42%)',
                'linear-gradient(135deg, rgba(5,24,38,0.90), rgba(8,40,55,0.72))',
              ].join(', ') }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <p className="text-sm font-medium text-foreground">{t('settings.earthAlive')}</p>
                {backgroundMode === 'earth' && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">{t('settings.active')}</span>}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t('settings.earthAliveDesc')}</p>
            </div>
          </button>
          <div>
            <button
              onClick={() => !cameraBlocked && setBackgroundMode('camera')}
              disabled={cameraBlocked}
              className={`flex items-center gap-3 w-full px-3 py-3 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed
                ${backgroundMode === 'camera' ? 'bg-sky-500/5' : 'hover:bg-white/4'}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${backgroundMode === 'camera' ? 'border-primary' : 'border-border'}`}>
                {backgroundMode === 'camera' && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div className="w-10 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border/50">
                <Camera className="w-3.5 h-3.5 text-muted-foreground/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-sky-600" />
                  <p className="text-sm font-medium text-foreground">{t('settings.liveWorld')}</p>
                  {backgroundMode === 'camera' && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border" style={{ background: 'hsl(208 72% 50% / 0.12)', borderColor: 'hsl(208 72% 50% / 0.28)', color: 'hsl(208 72% 70%)' }}>{t('settings.active')}</span>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t('settings.liveWorldDesc')}</p>
              </div>
            </button>
            {backgroundMode === 'camera' && (
              <div className="camera-safety-banner mx-3 mb-3 rounded-xl px-3 py-2.5 flex items-start gap-2">
                <Car className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-amber-300 leading-snug">{t('settings.cameraWarningTitle')}</p>
                  <p className="text-[10px] text-amber-400/80 mt-0.5 leading-relaxed">{t('settings.cameraWarningDesc')}</p>
                </div>
              </div>
            )}
            {backgroundMode === 'earth' && (
              <div className="flex items-center gap-2 px-3 pb-2.5">
                <AlertTriangle className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                <p className="text-[9px] text-muted-foreground/50 leading-snug">{t('settings.cameraWarningDesc')}</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ B. PROTECTION ═══════════════════════════════════════════════ */}
        <SectionLabel>{t('settings.privacyData')}</SectionLabel>
        <div className="qlpa-glass-card overflow-hidden mb-3 divide-y divide-border/30">
          <SettingRow icon={<Lock className="w-4 h-4" />}        label={t('settings.encryption')}        sublabel={t('settings.encryptionDesc')} />
          <SettingRow icon={<Database className="w-4 h-4" />}    label={t('settings.localFirstStorage')} sublabel={t('settings.localFirstStorageDesc')} />
          <SettingRow icon={<ShieldCheck className="w-4 h-4" />} label={t('settings.consentEngine')}     sublabel={t('settings.consentEngineDesc')} />
          <SettingRow icon={<Download className="w-4 h-4" />}    label={t('settings.exportData')}        sublabel={t('settings.exportDataDesc')} onClick={onExportData} />
        </div>

        {/* ═══ C. IDENTITY ═════════════════════════════════════════════════ */}
        <SectionLabel>{t('settings.identity')}</SectionLabel>
        <div className="qlpa-glass-card overflow-hidden mb-3">
          <div className="flex items-center gap-3 px-3 py-3.5 border-b border-border/40">
            <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-sky-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {isAuthenticated ? t('settings.identityActive') : t('settings.identityLocal')}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{shortId}</p>
            </div>
            <span
              className="text-[9px] font-semibold px-2 py-1 rounded-full border flex-shrink-0"
              style={isAuthenticated
                ? { background: 'hsl(158 58% 46% / 0.12)', borderColor: 'hsl(158 58% 46% / 0.28)', color: 'hsl(158 58% 68%)' }
                : { background: 'hsl(208 72% 50% / 0.12)', borderColor: 'hsl(208 72% 50% / 0.28)', color: 'hsl(208 72% 70%)' }
              }>
              {isAuthenticated ? t('settings.signedIn') : t('settings.local')}
            </span>
          </div>
          {isAuthenticated && onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {t('settings.signOut')}
            </button>
          )}
        </div>

        {/* ═══ D. APP STATUS (Advanced+ only) ═════════════════════════════ */}
        {isAdvancedOrDev(viewLevel) && (
          <>
            <SectionLabel>{t('settings.appStatus')}</SectionLabel>

            {/* App Mode */}
            <div className="qlpa-glass-card overflow-hidden mb-3">
              {(['local_first', 'demo'] as const).map((mode) => {
                const configMap: Record<string, { label: string; sublabel: string }> = {
                  local_first: { label: t('settings.localFirst'), sublabel: t('settings.localFirstDesc') },
                  demo:        { label: t('settings.demo'),       sublabel: t('settings.demoDesc') },
                };
                const config = configMap[mode];
                const isActive = appMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => onChangeAppMode?.(mode)}
                    className={`flex items-center gap-3 w-full px-3 py-3 border-b border-border/30 last:border-0 transition-colors text-left
                      ${isActive ? 'bg-sky-500/5' : 'hover:bg-white/4'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? 'border-sky-400' : 'border-border/60'}`}>
                      {isActive && <div className="w-2 h-2 rounded-full bg-sky-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground leading-tight">{config.label}</p>
                        {isActive && <span className="qlpa-chip qlpa-chip-water">{t('settings.active')}</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{config.sublabel}</p>
                    </div>
                  </button>
                );
              })}
              <div className="flex items-center gap-3 px-3 py-3 opacity-35 cursor-not-allowed">
                <div className="w-4 h-4 rounded-full border-2 border-border/50 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground leading-tight">{t('settings.network')}</p>
                    <span className="qlpa-chip qlpa-chip-muted">{t('settings.comingSoon')}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t('settings.networkDesc')}</p>
                </div>
              </div>
            </div>

            {/* App Dashboard */}
            {store && (
              <div className="mb-3">
                <AppDashboard
                  store={store}
                  viewerEarthId={viewerEarthId}
                  locale={locale}
                  onStartConversation={onStartConversation ?? (() => {})}
                  onExportData={onExportData}
                  t={t}
                />
              </div>
            )}
          </>
        )}

        {/* ═══ E. DEVELOPER ONLY ══════════════════════════════════════════ */}
        {isDeveloper(viewLevel) && (
          <>
            <SectionLabel>{t('settings.developer')}</SectionLabel>

            <button
              onClick={() => setShowMvpChecklist((v) => !v)}
              aria-expanded={showMvpChecklist}
              aria-label={showMvpChecklist ? t('settings.hideMvpReadiness') : t('settings.mvpReadiness')}
              className="qlpa-glass-card flex items-center justify-between w-full px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-violet-500/5 transition-colors mb-2"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                {t('settings.mvpReadiness')}
              </span>
              {showMvpChecklist ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
            </button>
            {showMvpChecklist && <div className="mb-2"><MvpChecklist store={store} viewerEarthId={viewerEarthId} /></div>}

            <button
              onClick={() => setShowRelease((v) => !v)}
              aria-expanded={showRelease}
              aria-label={showRelease ? t('settings.hideReleaseStatus') : t('settings.releaseStatus')}
              className="qlpa-glass-card flex items-center justify-between w-full px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-violet-500/5 transition-colors mb-2"
            >
              <span className="flex items-center gap-2"><Info className="w-3.5 h-3.5 text-violet-400" />{t('settings.releaseStatus')}</span>
              {showRelease ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
            </button>
            {showRelease && (
              <div className="mb-2">
                <ReleaseReadinessPanel store={store} viewerEarthId={viewerEarthId} onStartConversation={onStartConversation} onExportData={onExportData} />
              </div>
            )}

            {/* ── Phone QA panel — local-only device test checklist ── */}
            <PhoneQAPanel
              interfaceMode={viewLevel}
              activeSheet={activeSheet ?? undefined}
            />

            {/* ── Internal diagnostics panel ── */}
            <div className="qlpa-glass-card overflow-hidden mb-2">
              <div className="px-3 py-2.5 border-b border-border/50 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{t('diagnostics.title')}</p>
                  <p className="text-[9px] text-muted-foreground">{t('diagnostics.localOnly')}</p>
                </div>
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                <p className="text-[9px] text-muted-foreground/70 font-mono leading-snug break-all">
                  {deviceRuntime ? getDeviceRuntimeSummary(deviceRuntime) : t('diagnostics.deviceSummary')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t('diagnostics.records')}: <span className="font-mono text-sky-300">{listDiagnosticRecords().length}</span>
                </p>
              </div>
              <div className="px-3 pb-3 flex gap-2">
                <button
                  onClick={() => {
                    const rec = createDiagnosticRecord({
                      surface:        'settings',
                      issueCategory:  'unknown',
                      severity:       'note',
                      description:    'Manual test note',
                      language:       locale,
                      interfaceDepth: viewLevel,
                      appMode,
                    });
                    saveDiagnosticRecord(rec);
                    setDiagNoteStatus('saved');
                    setTimeout(() => setDiagNoteStatus('idle'), 2000);
                  }}
                  className="flex-1 py-2 rounded-xl border border-sky-500/25 bg-sky-500/8 text-[10px] font-medium text-sky-300 hover:bg-sky-500/15 transition-colors"
                >
                  {diagNoteStatus === 'saved' ? t('diagnostics.noteCreated') : t('diagnostics.createNote')}
                </button>
                <button
                  onClick={() => {
                    clearDiagnosticRecords();
                    setDiagNoteStatus('cleared');
                    setTimeout(() => setDiagNoteStatus('idle'), 2000);
                  }}
                  className="flex-1 py-2 rounded-xl border border-border text-[10px] font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
                >
                  {diagNoteStatus === 'cleared' ? t('diagnostics.logCleared') : t('diagnostics.clearLog')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ═══ F. DANGER ZONE ═════════════════════════════════════════════ */}
        {onResetLocalData && (
          <>
            <SectionLabel>{t('settings.dangerZone')}</SectionLabel>
            <div className="rounded-2xl overflow-hidden mb-3" style={{ background: 'hsl(4 60% 55% / 0.05)', border: '1px dashed hsl(4 60% 55% / 0.28)' }}>
              {!showResetConfirm ? (
                <SettingRow
                  icon={<Trash2 className="w-4 h-4" />}
                  label={t('settings.resetLocalData')}
                  sublabel={t('settings.resetLocalDataDesc')}
                  onClick={() => { setShowResetConfirm(true); setResetInput(''); }}
                  destructive
                />
              ) : (
                <div className="px-4 py-4 space-y-3">
                  <p className="text-xs font-semibold text-destructive">{t('settings.confirmReset')}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{t('settings.confirmResetDesc')}</p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{t('settings.typeReset')}</label>
                    <input
                      type="text"
                      value={resetInput}
                      onChange={(e) => setResetInput(e.target.value)}
                      placeholder="RESET"
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive placeholder:text-destructive/30 font-mono focus:outline-none focus:ring-2 focus:ring-destructive/20 focus:border-destructive/50 transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowResetConfirm(false); setResetInput(''); }} className="flex-1 py-2 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">{t('settings.cancel')}</button>
                    <button
                      disabled={resetInput !== 'RESET'}
                      onClick={() => { setShowResetConfirm(false); setResetInput(''); onResetLocalData!(); }}
                      className="flex-1 py-2 rounded-xl text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      style={{ background: 'hsl(4 60% 55% / 0.18)', border: '1px solid hsl(4 60% 55% / 0.36)', color: 'hsl(4 60% 72%)' }}
                    >{t('settings.eraseEverything')}</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── ABOUT ── */}
        <SectionLabel>{t('settings.about')}</SectionLabel>
        <div className="qlpa-glass-card overflow-hidden mb-3">
          <SettingRow icon={<Info className="w-4 h-4" />} label={t('settings.earthosMessaging')} sublabel={t('settings.earthosMessagingDesc')} />

          {/* Controlled test marker — visible in all modes */}
          <div className="px-4 py-3 border-t border-border/50">
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-amber-300 leading-snug">
                  {t('release.controlledTestBadge')}
                </p>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                  {t('release.useDemoDataOnly')}
                </p>
              </div>
            </div>
          </div>

          {/* Advanced/Developer: capability status rows */}
          {isAdvancedOrDev(viewLevel) && (
            <div className="px-4 pb-3 pt-1 border-t border-border/30 space-y-1.5">
              <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wider pt-1">
                {t('release.currentStage')}: {t(getCurrentStageLabelKey() as Parameters<typeof t>[0])}
              </p>
              <CapabilityLine label={t('release.capabilityLocalMessaging')} active />
              <CapabilityLine label={t('release.capabilityRelayNotActive')} active={false} />
              <CapabilityLine label={t('release.capabilityProductionE2EENotActive')} active={false} />
              <CapabilityLine label={t('release.capabilityTokenRewardsInactive')} active={false} />
            </div>
          )}
        </div>

        <div className="py-6 text-center">
          <p className="text-[9px] text-muted-foreground/50 font-mono">{t('settingsFooter.versionLine')}</p>
          <p className="text-[9px] text-muted-foreground/35 font-mono mt-0.5">
            {t(getCurrentStageLabelKey() as Parameters<typeof t>[0])} · local-first prototype
          </p>
        </div>

        </div>
      </div>
    </div>
  );
}
