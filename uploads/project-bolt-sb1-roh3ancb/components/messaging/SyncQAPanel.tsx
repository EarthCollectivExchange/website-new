'use client';

import { useState } from 'react';
import {
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  Minus,
  Loader as Loader2,
  RefreshCw,
  Unplug,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import type { AuthBridgeResult } from '@/lib/messaging/authBridge';
import type { SyncResult, TableSyncResult, SyncTableMap } from '@/lib/messaging/sync';
import { EarthIdSignInPanel } from './EarthIdSignInPanel';
import { useT } from '@/lib/i18n/useT';

// ─── Types ────────────────────────────────────────────────────────────────────

type TableKey = keyof SyncTableMap;
type SyncButtonState = 'idle' | 'syncing' | 'success' | 'error' | 'unavailable';
type BridgeButtonState = 'idle' | 'resolving' | 'success' | 'error' | 'unavailable';

// ─── Table checklist config ───────────────────────────────────────────────────

const TABLE_ORDER: TableKey[] = [
  'earth_ids',
  'conversations',
  'conversation_members',
  'conversation_sovereignty_settings',
  'user_sovereignty_settings',
  'ledger_events',
];

// ─── Table row ────────────────────────────────────────────────────────────────

function TableRow({ tableKey, result, labelKey, descKey }: {
  tableKey: TableKey;
  result: TableSyncResult | null;
  labelKey: string;
  descKey: string;
}) {
  const { t } = useT();

  const icon =
    !result || result.status === 'pending' ? (
      <Minus className="w-3.5 h-3.5 text-muted-foreground/50" />
    ) : result.status === 'skipped' ? (
      <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />
    ) : result.status === 'synced' ? (
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
    ) : (
      <AlertCircle className="w-3.5 h-3.5 text-destructive" />
    );

  const badge =
    result?.status === 'synced'  ? (
      <span className="text-[10px] text-emerald-700 font-medium tabular-nums">
        {result.rowsSynced !== 1
          ? t('syncPanel.rowsSyncedPlural').replace('{n}', String(result.rowsSynced))
          : t('syncPanel.rowsSynced').replace('{n}', String(result.rowsSynced))}
      </span>
    ) : result?.status === 'skipped' ? (
      <span className="text-[10px] text-muted-foreground/60">{t('syncPanel.skipped')}</span>
    ) : result?.status === 'error' ? (
      <span className="text-[10px] text-destructive">{t('syncPanel.error')}</span>
    ) : (
      <span className="text-[10px] text-muted-foreground/40">—</span>
    );

  return (
    <div className="flex items-start gap-2 py-[7px] border-b border-border last:border-0">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono font-medium text-foreground leading-tight">{t(labelKey)}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t(descKey)}</p>
        {result?.status === 'error' && result.error && (
          <p className="text-[10px] text-destructive mt-0.5 leading-snug break-words">{result.error}</p>
        )}
      </div>
      <div className="flex-shrink-0 mt-0.5">{badge}</div>
    </div>
  );
}

// ─── EarthID status card ──────────────────────────────────────────────────────

function EarthIdCard({
  authResult,
  isSigningOut,
  onSignInClick,
  onSignOut,
}: {
  authResult: AuthBridgeResult | null;
  isSigningOut: boolean;
  onSignInClick: () => void;
  onSignOut: () => void;
}) {
  const { t } = useT();
  const isAuth = !!(authResult?.isAuthenticated && authResult.earthId);

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
          ${isAuth ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
          {isAuth ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {isAuth ? t('syncPanel.authenticated') : t('syncPanel.unauthenticated')}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isAuth ? t('syncPanel.earthIdLinked') : t('syncPanel.localModeOnly')}
          </p>
        </div>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0
          ${isAuth ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
          {isAuth ? t('syncPanel.activeLabel') : t('syncPanel.localLabel')}
        </span>
      </div>

      {isAuth && authResult?.earthId && (
        <div className="pl-8 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-muted-foreground w-[72px] flex-shrink-0">{t('syncPanel.rowDisplayName')}</span>
            <span className="text-[10px] font-medium text-foreground truncate">{authResult.earthId.displayName}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-muted-foreground w-[72px] flex-shrink-0">{t('syncPanel.rowHandle')}</span>
            <span className="text-[10px] font-mono text-foreground truncate">{authResult.earthId.handle}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-muted-foreground w-[72px] flex-shrink-0">{t('syncPanel.rowEarthId')}</span>
            <span className="text-[10px] font-mono text-muted-foreground truncate" title={authResult.earthId.id}>
              {authResult.earthId.id.slice(0, 8)}…
            </span>
          </div>
          <div className="pt-1">
            <button
              onClick={onSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground
                hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isSigningOut
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <LogOut className="w-3 h-3" />
              }
              {isSigningOut ? t('syncPanel.signingOut') : t('syncPanel.signOut')}
            </button>
          </div>
        </div>
      )}

      {!isAuth && (
        <div className="pl-8 space-y-2">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t('syncPanel.signInRequired')}
          </p>
          <button
            onClick={onSignInClick}
            className="flex items-center gap-1.5 text-[11px] font-medium text-primary
              hover:opacity-80 transition-opacity"
          >
            <LogIn className="w-3 h-3" />
            {t('syncPanel.connectEarthId')}
          </button>
        </div>
      )}

      {authResult?.error && (
        <div className="pl-8">
          <p className="text-[10px] text-destructive leading-relaxed">
            {t('syncPanel.bridgeError').replace('{msg}', authResult.error)}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Error log viewer ─────────────────────────────────────────────────────────

function ErrorLog({ syncResult }: { syncResult: SyncResult | null }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  const errors: { table: string; error: string }[] = [];
  if (syncResult?.tables) {
    for (const key of TABLE_ORDER) {
      const tbl = syncResult.tables[key];
      if (tbl?.status === 'error' && tbl.error) errors.push({ table: key, error: tbl.error });
    }
  }
  if (syncResult?.error && errors.length === 0) {
    errors.push({ table: 'general', error: syncResult.error });
  }

  if (errors.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="text-xs text-muted-foreground">{t('syncPanel.noSyncErrors')}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
        <span className="text-xs text-destructive font-medium flex-1">
          {errors.length !== 1
            ? t('syncPanel.syncErrorsPlural').replace('{n}', String(errors.length))
            : t('syncPanel.syncErrors').replace('{n}', String(errors.length))}
        </span>
        {open
          ? <ChevronDown className="w-3 h-3 text-destructive/70" />
          : <ChevronRight className="w-3 h-3 text-destructive/70" />
        }
      </button>
      {open && (
        <div className="border-t border-destructive/20 px-3 pb-3 pt-2 space-y-2">
          {errors.map((e, i) => (
            <div key={i}>
              <p className="text-[10px] font-mono font-medium text-destructive">{e.table}</p>
              <p className="text-[10px] text-destructive/80 leading-snug break-words">{e.error}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sync button ──────────────────────────────────────────────────────────────

function SyncButton({ state, isAuth, onClick }: {
  state: SyncButtonState;
  isAuth: boolean;
  onClick: () => void;
}) {
  const { t } = useT();
  const disabled = !isAuth || state === 'syncing';

  const label =
    state === 'syncing'     ? t('syncPanel.syncWorking') :
    state === 'success'     ? t('syncPanel.syncDone') :
    state === 'error'       ? t('syncPanel.syncError') :
    state === 'unavailable' ? t('syncPanel.syncUnavailable') :
                              t('syncPanel.syncIdle');

  const icon =
    state === 'syncing' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
    state === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
    state === 'error'   ? <AlertCircle className="w-3.5 h-3.5" /> :
                          <RefreshCw className="w-3.5 h-3.5" />;

  const colorClass =
    state === 'success' ? 'bg-emerald-600 text-white' :
    state === 'error'   ? 'bg-destructive text-destructive-foreground' :
    !isAuth             ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                          'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl
        text-xs font-medium transition-all ${colorClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Bridge button ────────────────────────────────────────────────────────────

function BridgeButton({ state, isAuth, onClick }: {
  state: BridgeButtonState;
  isAuth: boolean;
  onClick: () => void;
}) {
  const { t } = useT();
  const disabled = state === 'resolving';

  const label =
    state === 'resolving'   ? t('syncPanel.bridgeResolving') :
    state === 'success'     ? t('syncPanel.bridgeSuccess') :
    state === 'error'       ? t('syncPanel.bridgeError2') :
    state === 'unavailable' ? t('syncPanel.bridgeUnavailable') :
                              t('syncPanel.bridgeIdle');

  const icon =
    state === 'resolving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
    state === 'success'   ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
    state === 'error'     ? <AlertCircle className="w-3.5 h-3.5 text-destructive" /> :
                            <Unplug className="w-3.5 h-3.5" />;

  const textClass =
    state === 'success' ? 'text-emerald-700' :
    state === 'error'   ? 'text-destructive' :
    !isAuth             ? 'text-muted-foreground/60' :
                          'text-muted-foreground hover:text-foreground';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl
        border border-border bg-background text-xs font-medium transition-colors
        disabled:opacity-40 disabled:cursor-not-allowed ${textClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Main QA panel ────────────────────────────────────────────────────────────

interface SyncQAPanelProps {
  authResult: AuthBridgeResult | null;
  syncResult: SyncResult | null;
  isSyncing: boolean;
  onSyncNow: () => Promise<void> | void;
  onRebuildBridge: () => Promise<void> | void;
  onSignOut: () => Promise<void> | void;
}

const TABLE_META: Record<TableKey, { labelKey: string; descKey: string }> = {
  earth_ids:                         { labelKey: 'syncPanel.tableEarthIds',     descKey: 'syncPanel.tableEarthIdsDesc' },
  conversations:                     { labelKey: 'syncPanel.tableConversations', descKey: 'syncPanel.tableConversationsDesc' },
  conversation_members:              { labelKey: 'syncPanel.tableMembers',       descKey: 'syncPanel.tableMembersDesc' },
  conversation_sovereignty_settings: { labelKey: 'syncPanel.tableSovereignty',   descKey: 'syncPanel.tableSovereigntyDesc' },
  user_sovereignty_settings:         { labelKey: 'syncPanel.tableUserSettings',  descKey: 'syncPanel.tableUserSettingsDesc' },
  ledger_events:                     { labelKey: 'syncPanel.tableLedger',        descKey: 'syncPanel.tableLedgerDesc' },
};

export function SyncQAPanel({
  authResult,
  syncResult,
  isSyncing,
  onSyncNow,
  onRebuildBridge,
  onSignOut,
}: SyncQAPanelProps) {
  const { t } = useT();
  const isAuth = !!(authResult?.isAuthenticated && authResult.earthId);

  const [syncState, setSyncState] = useState<SyncButtonState>(isAuth ? 'idle' : 'unavailable');
  const [bridgeState, setBridgeState] = useState<BridgeButtonState>(isAuth ? 'idle' : 'unavailable');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  async function handleSyncNow() {
    if (!isAuth) { setSyncState('unavailable'); return; }
    setSyncState('syncing');
    try {
      await onSyncNow();
      setSyncState('success');
      setTimeout(() => setSyncState('idle'), 3000);
    } catch {
      setSyncState('error');
      setTimeout(() => setSyncState('idle'), 4000);
    }
  }

  async function handleRebuildBridge() {
    if (!isAuth) { setBridgeState('unavailable'); return; }
    setBridgeState('resolving');
    try {
      await onRebuildBridge();
      setBridgeState('success');
      setTimeout(() => setBridgeState('idle'), 3000);
    } catch {
      setBridgeState('error');
      setTimeout(() => setBridgeState('idle'), 4000);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  const effectiveSyncState: SyncButtonState =
    !isAuth ? 'unavailable' : isSyncing ? 'syncing' : syncState;

  const effectiveBridgeState: BridgeButtonState =
    !isAuth && bridgeState === 'idle' ? 'unavailable' : bridgeState;

  return (
    <>
      {showSignIn && <EarthIdSignInPanel onClose={() => setShowSignIn(false)} />}

      <div className="space-y-[13px]">
        <EarthIdCard
          authResult={authResult}
          isSigningOut={isSigningOut}
          onSignInClick={() => setShowSignIn(true)}
          onSignOut={handleSignOut}
        />

        {/* Metadata sync checklist */}
        <div className="rounded-xl border border-border bg-background overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t('syncPanel.checklistTitle')}
            </p>
            {syncResult?.syncedAt && (
              <p className="text-[10px] text-muted-foreground tabular-nums">
                {t('syncPanel.lastSynced').replace('{time}', format(new Date(syncResult.syncedAt), 'h:mm:ss a'))}
              </p>
            )}
          </div>
          <div className="px-3">
            {TABLE_ORDER.map((key) => (
              <TableRow
                key={key}
                tableKey={key}
                result={syncResult?.tables?.[key] ?? null}
                labelKey={TABLE_META[key].labelKey}
                descKey={TABLE_META[key].descKey}
              />
            ))}
          </div>
        </div>

        <ErrorLog syncResult={syncResult} />

        <div className="space-y-2">
          <SyncButton state={effectiveSyncState} isAuth={isAuth} onClick={handleSyncNow} />
          <BridgeButton state={effectiveBridgeState} isAuth={isAuth} onClick={handleRebuildBridge} />

          {!isAuth && (
            <button
              onClick={() => setShowSignIn(true)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl
                border border-primary/40 bg-primary/5 text-xs font-medium text-primary
                hover:bg-primary/10 active:scale-[0.98] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('syncPanel.connectEarthId')}
            </button>
          )}
        </div>

        {!isAuth && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {t('syncPanel.localModeNote')}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
