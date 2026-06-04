'use client';

import { useState } from 'react';
import { Clock, Timer, Trash2, Info, CircleCheck as CheckCircle2, X, TriangleAlert as AlertTriangle, ChevronRight } from 'lucide-react';
import type { MessageRetentionTimer, MessageDeleteScope } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

export interface RetentionSettings {
  timer: MessageRetentionTimer;
  customDurationMs?: number;
  deleteScope: MessageDeleteScope;
}

interface MessageRetentionPanelProps {
  current: RetentionSettings;
  onChange: (settings: RetentionSettings) => void;
  onClose: () => void;
  onBack?: () => void;
}

interface TimerOption {
  value: MessageRetentionTimer;
  labelKey: string;
  sublabelKey: string;
  durationMs?: number;
}

const MIN_MS = 30_000;
const MAX_MS = 7 * 24 * 60 * 60_000;

const TIMER_OPTIONS: TimerOption[] = [
  { value: 'off',    labelKey: 'retention.off',    sublabelKey: 'retention.offSublabel' },
  { value: '30s',    labelKey: 'retention.30s',    sublabelKey: 'retention.30sSublabel',   durationMs: 30_000 },
  { value: '1min',   labelKey: 'retention.1min',   sublabelKey: 'retention.1minSublabel',  durationMs: 60_000 },
  { value: '1h',     labelKey: 'retention.1h',     sublabelKey: 'retention.1hSublabel',    durationMs: 60 * 60_000 },
  { value: '24h',    labelKey: 'retention.24h',    sublabelKey: 'retention.24hSublabel',   durationMs: 24 * 60 * 60_000 },
  { value: '7d',     labelKey: 'retention.7d',     sublabelKey: 'retention.7dSublabel',    durationMs: 7 * 24 * 60 * 60_000 },
  { value: 'custom', labelKey: 'retention.custom', sublabelKey: 'retention.customSublabel' },
];

const SCOPE_OPTIONS: Array<{
  value: MessageDeleteScope;
  labelKey: string;
  descKey: string;
  caveatKey?: string;
  disabled?: boolean;
}> = [
  {
    value: 'local_only',
    labelKey: 'retention.scopeLocal',
    descKey: 'retention.scopeLocalDesc',
  },
  {
    value: 'request_recipient_delete',
    labelKey: 'retention.scopeRequest',
    descKey: 'retention.scopeRequestDesc',
    caveatKey: 'retention.scopeRequestCaveat',
    disabled: false,
  },
  {
    value: 'both_devices_when_supported',
    labelKey: 'retention.scopeBoth',
    descKey: 'retention.scopeBothDesc',
    caveatKey: 'retention.scopeBothCaveat',
    disabled: true,
  },
];

type CustomUnit = 'minutes' | 'hours' | 'days';

const UNIT_MS: Record<CustomUnit, number> = {
  minutes: 60_000,
  hours:   60 * 60_000,
  days:    24 * 60 * 60_000,
};

function customToMs(value: number, unit: CustomUnit): number {
  return value * UNIT_MS[unit];
}

function validateCustomMs(ms: number): 'retention.minError' | 'retention.maxError' | null {
  if (ms < MIN_MS) return 'retention.minError';
  if (ms > MAX_MS) return 'retention.maxError';
  return null;
}

function summariseCustom(ms: number, t: (key: string) => string): string {
  if (ms >= 24 * 60 * 60_000) {
    const d = Math.round(ms / (24 * 60 * 60_000));
    return (d === 1 ? t('timeUnits.day') : t('timeUnits.days')).replace('{n}', String(d));
  }
  if (ms >= 60 * 60_000) {
    const h = Math.round(ms / (60 * 60_000));
    return (h === 1 ? t('timeUnits.hour') : t('timeUnits.hours')).replace('{n}', String(h));
  }
  const m = Math.round(ms / 60_000);
  if (m >= 1) return (m === 1 ? t('timeUnits.minute') : t('timeUnits.minutes')).replace('{n}', String(m));
  const s = Math.round(ms / 1000);
  return t('timeUnits.seconds').replace('{n}', String(s));
}

export function timerDurationMs(timer: MessageRetentionTimer, customMs?: number): number | null {
  switch (timer) {
    case '30s':   return 30_000;
    case '1min':  return 60_000;
    case '1h':    return 60 * 60_000;
    case '24h':   return 24 * 60 * 60_000;
    case '7d':    return 7 * 24 * 60 * 60_000;
    case 'custom': return customMs ?? null;
    default: return null;
  }
}

export function computeExpiresAt(timer: MessageRetentionTimer, fromIso: string, customMs?: number): string | undefined {
  const ms = timerDurationMs(timer, customMs);
  if (ms === null) return undefined;
  return new Date(new Date(fromIso).getTime() + ms).toISOString();
}

// ─── Custom duration input ────────────────────────────────────────────────────

interface CustomInputProps {
  currentMs?: number;
  onConfirm: (ms: number) => void;
}

function CustomDurationInput({ currentMs, onConfirm }: CustomInputProps) {
  const { t } = useT();
  const [value, setValue] = useState<string>(() => {
    if (!currentMs) return '5';
    if (currentMs >= 24 * 60 * 60_000 && currentMs % (24 * 60 * 60_000) === 0) return String(currentMs / (24 * 60 * 60_000));
    if (currentMs >= 60 * 60_000 && currentMs % (60 * 60_000) === 0) return String(currentMs / (60 * 60_000));
    return String(Math.round(currentMs / 60_000));
  });
  const [unit, setUnit] = useState<CustomUnit>(() => {
    if (!currentMs) return 'minutes';
    if (currentMs >= 24 * 60 * 60_000 && currentMs % (24 * 60 * 60_000) === 0) return 'days';
    if (currentMs >= 60 * 60_000 && currentMs % (60 * 60_000) === 0) return 'hours';
    return 'minutes';
  });

  const parsed = parseFloat(value);
  const ms = isNaN(parsed) || parsed <= 0 ? 0 : customToMs(parsed, unit);
  const errorKey = ms > 0 ? validateCustomMs(ms) : null;
  const isValid = ms > 0 && errorKey === null;

  return (
    <div className="mt-2 space-y-2 px-1">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/40 tabular-nums"
          placeholder="5"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as CustomUnit)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="minutes">{t('retention.minutes')}</option>
          <option value="hours">{t('retention.hours')}</option>
          <option value="days">{t('retention.days')}</option>
        </select>
        <button
          onClick={() => isValid && onConfirm(ms)}
          disabled={!isValid}
          className="px-3 py-2 rounded-lg text-sm font-medium transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
            bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
        >
          {t('retention.setButton')}
        </button>
      </div>

      {errorKey && (
        <div className="flex items-center gap-1.5 text-[11px] text-destructive">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span>{t(errorKey)}</span>
        </div>
      )}

      {isValid && (
        <p className="text-[11px] text-muted-foreground">
          {t('retention.willDisappearAfterLabel')} <strong>{summariseCustom(ms, t)}</strong>.
        </p>
      )}

      <p className="text-[10px] text-muted-foreground/60">
        {t('retention.rangeNote')}
      </p>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function MessageRetentionPanel({ current, onChange, onClose, onBack }: MessageRetentionPanelProps) {
  const { t } = useT();
  const [pendingCustomMs, setPendingCustomMs] = useState<number | undefined>(current.customDurationMs);

  function selectTimer(t: MessageRetentionTimer) {
    if (t === 'custom') {
      onChange({ ...current, timer: 'custom', customDurationMs: pendingCustomMs });
    } else {
      onChange({ ...current, timer: t, customDurationMs: undefined });
    }
  }

  function confirmCustom(ms: number) {
    setPendingCustomMs(ms);
    onChange({ ...current, timer: 'custom', customDurationMs: ms });
  }

  function setScope(s: MessageDeleteScope) {
    onChange({ ...current, deleteScope: s });
  }

  const activeTimer = current.timer;
  const activeScope = current.deleteScope;
  const isOn = activeTimer !== 'off';

  const activeSummary = (() => {
    if (!isOn) return null;
    if (activeTimer === 'custom' && current.customDurationMs) return summariseCustom(current.customDurationMs, t);
    const opt = TIMER_OPTIONS.find((o) => o.value === activeTimer);
    return opt ? t(opt.labelKey) : activeTimer;
  })();

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background shadow-xl overflow-hidden w-full animate-in slide-in-from-bottom-2 duration-200">

      {/* Header */}
      <div className="flex items-center px-3 py-3 border-b border-border bg-muted/30" style={{ minHeight: 52 }}>
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
        <div className="flex-1 min-w-0 px-2 flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary/70 flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">{t('retention.panelTitle')}</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
          aria-label={t('common.close')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4" style={{ touchAction: 'pan-y' }}>

        {/* Timer options */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-0.5">
            {t('retention.autoDeleteTimer')}
          </p>
          <div className="space-y-1">
            {TIMER_OPTIONS.map((opt) => {
              const selected = activeTimer === opt.value;
              return (
                <div key={opt.value}>
                  <button
                    onClick={() => selectTimer(opt.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all touch-manipulation
                      ${selected
                        ? 'border-primary/40 bg-primary/8'
                        : 'border-border hover:bg-muted/40'}`}
                    style={{ touchAction: 'pan-y' }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${selected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {opt.value === 'off'
                        ? <X className="w-3.5 h-3.5" />
                        : <Clock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${selected ? 'text-primary' : 'text-foreground'}`}>
                        {t(opt.labelKey)}
                        {opt.value === 'custom' && selected && current.customDurationMs
                          ? ` — ${summariseCustom(current.customDurationMs, t)}`
                          : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(opt.sublabelKey)}</p>
                    </div>
                    {selected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>

                  {/* Custom input — shown inline when custom is selected */}
                  {opt.value === 'custom' && selected && (
                    <CustomDurationInput
                      currentMs={current.customDurationMs}
                      onConfirm={confirmCustom}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scope options */}
        {isOn && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-0.5">
              {t('retention.deleteScope')}
            </p>
            <div className="space-y-1">
              {SCOPE_OPTIONS.map((opt) => {
                const selected = activeScope === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => !opt.disabled && setScope(opt.value)}
                    disabled={opt.disabled}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left transition-all touch-manipulation
                      ${opt.disabled ? 'opacity-40 cursor-not-allowed border-border' :
                        selected ? 'border-primary/40 bg-primary/8' : 'border-border hover:bg-muted/40'}`}
                    style={{ touchAction: 'pan-y' }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                      ${selected && !opt.disabled ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${selected && !opt.disabled ? 'text-primary' : 'text-foreground'}`}>
                          {t(opt.labelKey)}
                        </p>
                        {opt.disabled && (
                          <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            {t('retention.comingSoon')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(opt.descKey)}</p>
                      {opt.caveatKey && (
                        <p className="text-[10px] text-amber-400 mt-1 leading-relaxed">
                          {t(opt.caveatKey)}
                        </p>
                      )}
                    </div>
                    {selected && !opt.disabled && (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Applies to notice */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('retention.appliesToNew')} <strong>text</strong>, <strong>file</strong>, {t('retention.appliesToTypes')}
            </p>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              {t('retention.metadataNote')}
            </p>
          </div>
        </div>

        {/* Active summary */}
        {isOn && activeSummary && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <Timer className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300 leading-relaxed">
              {t('retention.willDisappearAfter')} <strong>{activeSummary}</strong>. {t('retention.existingNotAffected')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
