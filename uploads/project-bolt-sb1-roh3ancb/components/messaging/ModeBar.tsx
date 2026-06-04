'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, Eye, Code as Code2, Leaf, Shield, Target, Heart, Pencil, ShieldCheck, X, ChevronDown, CircleCheck as CheckCircle2, CircleMinus as MinusCircle } from 'lucide-react';
import {
  type HumanModeKey, type InterfaceDepth,
  HUMAN_MODES, HUMAN_MODE_LIST, INTERFACE_DEPTHS,
  type HumanMode,
} from '@/lib/messaging/modes';
import { useT } from '@/lib/i18n/useT';
import { usePreferences } from '@/lib/messaging/preferencesContext';
import { QLPA_MODE_COLORS, getHumanModeAtmosphere } from '@/lib/qlpa/tokens';

const MODE_ICONS: Record<HumanModeKey, React.ReactNode> = {
  calm:      <Leaf className="w-3 h-3" />,
  sovereign: <Shield className="w-3 h-3" />,
  focus:     <Target className="w-3 h-3" />,
  care:      <Heart className="w-3 h-3" />,
  creator:   <Pencil className="w-3 h-3" />,
  shield:    <ShieldCheck className="w-3 h-3" />,
  emergency: <ShieldCheck className="w-3 h-3" />,
};

const DEPTH_ICONS: Record<InterfaceDepth, React.ReactNode> = {
  simple:    <User className="w-3 h-3" />,
  advanced:  <Eye className="w-3 h-3" />,
  developer: <Code2 className="w-3 h-3" />,
};

const DEPTH_BADGE_STYLE: Record<InterfaceDepth, React.CSSProperties> = {
  simple:    { background: 'hsl(158 58% 46% / 0.12)', borderColor: 'hsl(158 58% 46% / 0.28)', color: 'hsl(158 58% 68%)' },
  advanced:  { background: 'hsl(208 72% 50% / 0.12)', borderColor: 'hsl(208 72% 50% / 0.28)', color: 'hsl(208 72% 70%)' },
  developer: { background: 'rgba(104,218,220,0.10)',  borderColor: 'rgba(104,218,220,0.28)',  color: 'rgba(160,235,238,0.88)' },
};

// Base inactive card style — same structure for all modes, only accent changes
const INACTIVE_CARD_STYLE: React.CSSProperties = {
  background: 'rgba(5,24,38,0.62)',
  borderColor: 'rgba(255,255,255,0.07)',
  borderRadius: 13,
};

function getModeCardStyle(key: HumanModeKey, isActive: boolean): React.CSSProperties {
  if (!isActive) return INACTIVE_CARD_STYLE;
  const c = getHumanModeAtmosphere(key);
  return {
    background: `linear-gradient(180deg, ${c.bg}, rgba(5,24,38,0.72))`,
    borderColor: c.border,
    borderRadius: 13,
    boxShadow: `0 0 18px ${c.glow}`,
  };
}

const MODE_SUMMARY_KEY: Record<HumanModeKey, string> = {
  calm:      'modeCard.calmSummary',
  sovereign: 'modeCard.sovereignSummary',
  focus:     'modeCard.focusSummary',
  care:      'modeCard.careSummary',
  creator:   'modeCard.creatorSummary',
  shield:    'modeCard.shieldSummary',
  emergency: 'modeCard.shieldSummary',
};

// Only optional composer features shown as enabled/disabled in mode card.
// retentionTimer is a core sovereignty tool and is always available.
const FEATURE_KEYS: Array<{ key: keyof HumanMode['visibleFeatures']; labelKey: string }> = [
  { key: 'voiceMemo',       labelKey: 'modeCard.voiceMemo' },
  { key: 'fileTransfer',    labelKey: 'modeCard.fileTransfer' },
  { key: 'ritualNote',      labelKey: 'modeCard.ritualNote' },
  { key: 'intentionMirror', labelKey: 'modeCard.intentionMirror' },
];

export function ModeBar() {
  const { t } = useT();
  const { humanMode, setHumanMode, interfaceDepth, setInterfaceDepth } = usePreferences();
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mode = HUMAN_MODES[humanMode];
  const depth = INTERFACE_DEPTHS.find((d) => d.key === interfaceDepth)!;
  const activeColors = getHumanModeAtmosphere(humanMode);

  function openDropdown() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const DROPDOWN_WIDTH = Math.min(352, window.innerWidth - 32);
    const MARGIN = 12;
    const fitsRight = (window.innerWidth - rect.left) >= DROPDOWN_WIDTH + MARGIN;
    const left = fitsRight
      ? Math.min(rect.left, window.innerWidth - DROPDOWN_WIDTH - MARGIN)
      : Math.max(MARGIN, rect.right - DROPDOWN_WIDTH);
    setDropdownPos({ top: rect.bottom + 6, left: Math.max(MARGIN, left), width: DROPDOWN_WIDTH });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    function handleResize() { setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  const dropdown = open && dropdownPos ? (
    <div
      ref={dropdownRef}
      style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999, width: dropdownPos.width, maxWidth: 'calc(100vw - 24px)', maxHeight: 'min(82dvh, calc(100dvh - 80px))', overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
      className="w-[22rem] max-w-[calc(100vw-2rem)] qlpa-glass-drawer rounded-2xl animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header — tinted with active mode gradient */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          background: activeColors.panelGradient,
          borderColor: activeColors.border,
        }}
      >
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {t('modes.selectorTitle')}
        </p>
        <button
          onClick={() => setOpen(false)}
          aria-label={t('common.close')}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Human Mode grid */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('modes.humanMode')}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {HUMAN_MODE_LIST.map((m) => {
              const isActive = humanMode === m.key;
              const mc = getHumanModeAtmosphere(m.key);
              return (
                <button
                  key={m.key}
                  onClick={() => { setHumanMode(m.key); setOpen(false); }}
                  style={getModeCardStyle(m.key, isActive)}
                  className="flex items-start gap-2 p-2.5 border text-left transition-all duration-150 hover:opacity-90"
                >
                  <span className="text-sm flex-shrink-0 leading-none mt-0.5" style={{ color: mc.accent }}>
                    {MODE_ICONS[m.key]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p
                        className="text-xs font-semibold leading-tight"
                        style={{ color: isActive ? mc.accent : 'rgba(190,215,225,0.72)' }}
                      >
                        {t(m.labelKey)}
                      </p>
                      {/* Universal function tag */}
                      <span
                        className="text-[8px] font-semibold px-1 py-px rounded-full leading-none flex-shrink-0"
                        style={{
                          background: isActive ? mc.bg : 'rgba(255,255,255,0.04)',
                          color: isActive ? mc.accentSoft : 'rgba(160,195,215,0.40)',
                          border: `1px solid ${isActive ? mc.border : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        {m.universalFunction}
                      </span>
                    </div>
                    <p className="text-[9px] leading-snug mt-0.5 line-clamp-2 break-words"
                      style={{ color: 'rgba(160,195,215,0.50)' }}>
                      {m.shortDescription}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active mode explanation card */}
        <ActiveModeCard mode={mode} humanMode={humanMode} t={t} activeColors={activeColors} />

        {/* Interface Depth section */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            {t('modes.interfaceDepth')}
          </p>
          <div className="flex gap-1.5">
            {INTERFACE_DEPTHS.map((d) => {
              const isActive = interfaceDepth === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => { setInterfaceDepth(d.key); setOpen(false); }}
                  style={isActive ? DEPTH_BADGE_STYLE[d.key] : { background: 'rgba(5,24,38,0.62)', borderColor: 'rgba(255,255,255,0.07)' }}
                  className="flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-center transition-all hover:opacity-90"
                >
                  <span className="flex-shrink-0" style={{ color: isActive ? undefined : 'rgba(160,195,215,0.55)' }}>
                    {DEPTH_ICONS[d.key]}
                  </span>
                  <p className="text-[10px] font-semibold leading-tight"
                    style={{ color: isActive ? undefined : 'rgba(160,195,215,0.55)' }}>
                    {t(d.labelKey)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <button
        ref={triggerRef}
        onClick={openDropdown}
        style={{
          background: activeColors.bg,
          borderColor: activeColors.border,
          color: activeColors.text,
        }}
        className="flex items-center gap-1.5 h-[2.375rem] px-3 rounded-phi-lg border backdrop-blur-sm hover:opacity-85 active:scale-95 transition-all touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title={`${t(mode.labelKey)} · ${t(depth.labelKey)}`}
      >
        {/* Mode colour dot */}
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: activeColors.dot }}
        />
        <span className="flex-shrink-0" style={{ color: activeColors.accent }}>
          {MODE_ICONS[humanMode]}
        </span>
        <span className="text-[11px] font-semibold max-w-[4rem] truncate" style={{ color: activeColors.text }}>
          {t(mode.labelKey)}
        </span>
        <span className="text-[9px] opacity-50 flex-shrink-0">·</span>
        <span className="flex-shrink-0 opacity-70">
          {DEPTH_ICONS[interfaceDepth]}
        </span>
        <ChevronDown className={`w-2.5 h-2.5 opacity-50 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}

// ─── Active mode explanation card ─────────────────────────────────────────────

function ActiveModeCard({
  mode,
  humanMode,
  t,
  activeColors,
}: {
  mode: HumanMode;
  humanMode: HumanModeKey;
  t: (key: string) => string;
  activeColors: ReturnType<typeof getHumanModeAtmosphere>;
}) {
  const enabled  = FEATURE_KEYS.filter((f) => mode.visibleFeatures[f.key]);
  const disabled = FEATURE_KEYS.filter((f) => !mode.visibleFeatures[f.key]);

  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{
        background: `linear-gradient(180deg, ${activeColors.bg}, rgba(5,24,38,0.68))`,
        border: `1px solid ${activeColors.border}`,
        backdropFilter: 'blur(16px)',
        boxShadow: `0 0 24px ${activeColors.glow}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: activeColors.bg, color: activeColors.accent }}
        >
          {MODE_ICONS[humanMode]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-semibold leading-tight" style={{ color: activeColors.text }}>
              {t(MODE_SUMMARY_KEY[humanMode])}
            </p>
            <span
              className="text-[8px] font-bold px-1.5 py-px rounded-full flex-shrink-0"
              style={{ background: activeColors.bg, color: activeColors.accentSoft, border: `1px solid ${activeColors.border}` }}
            >
              {mode.universalFunction.toUpperCase()}
            </span>
          </div>
          <p className="text-[9px] mt-0.5 leading-snug" style={{ color: 'rgba(160,195,215,0.55)' }}>
            {mode.shortDescription}
          </p>
        </div>
      </div>

      {enabled.length > 0 && (
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'rgba(160,195,215,0.55)' }}>
            {t('modeCard.featuresLabel')}
          </p>
          <div className="flex flex-wrap gap-1">
            {enabled.map((f) => (
              <span
                key={f.key}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                style={{
                  background: activeColors.bg,
                  border: `1px solid ${activeColors.border}`,
                  color: activeColors.accent,
                }}
              >
                <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />
                {t(f.labelKey)}
              </span>
            ))}
          </div>
        </div>
      )}

      {disabled.length > 0 && (
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'rgba(160,195,215,0.55)' }}>
            {t('modeCard.hiddenLabel')}
          </p>
          <div className="flex flex-wrap gap-1">
            {disabled.map((f) => (
              <span
                key={f.key}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(160,195,215,0.45)',
                }}
              >
                <MinusCircle className="w-2.5 h-2.5 flex-shrink-0" />
                {t(f.labelKey)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
