'use client';

import { format } from 'date-fns';
import { WifiOff, CloudOff, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react';
import type { SyncStatus } from '@/lib/messaging/sync';
import { useT } from '@/lib/i18n/useT';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  syncedAt: string | null;
  onRetry?: () => void;
  onSyncNow?: () => void;
  expanded?: boolean;
}

const STATUS_ICON: Record<SyncStatus, React.ElementType> = {
  idle:            CloudOff,
  syncing:         Loader2,
  synced:          CheckCircle2,
  error:           AlertCircle,
  offline:         WifiOff,
  unauthenticated: CloudOff,
};

const STATUS_CLASS: Record<SyncStatus, string> = {
  idle:            'text-muted-foreground',
  syncing:         'text-sky-400',
  synced:          'text-emerald-400',
  error:           'text-destructive',
  offline:         'text-muted-foreground',
  unauthenticated: 'text-muted-foreground',
};

const STATUS_DOT: Record<SyncStatus, string> = {
  idle:            'bg-muted-foreground/40',
  syncing:         'bg-sky-400',
  synced:          'bg-emerald-500',
  error:           'bg-destructive',
  offline:         'bg-muted-foreground/40',
  unauthenticated: 'bg-muted-foreground/40',
};

const SYNCABLE = new Set<SyncStatus>(['synced', 'error', 'idle']);

export function SyncStatusBadge({
  status,
  syncedAt,
  onRetry,
  onSyncNow,
  expanded = false,
}: SyncStatusBadgeProps) {
  const { t } = useT();

  const STATUS_LABEL: Record<SyncStatus, string> = {
    idle:            t('syncStatus.localOnly'),
    syncing:         t('syncStatus.syncing'),
    synced:          t('syncStatus.synced'),
    error:           t('syncStatus.syncError'),
    offline:         t('syncStatus.offline'),
    unauthenticated: t('syncStatus.localOnly'),
  };

  const Icon = STATUS_ICON[status];
  const cls = STATUS_CLASS[status];
  const dotCls = STATUS_DOT[status];
  const label = STATUS_LABEL[status];
  const isSpinning = status === 'syncing';
  const canSyncNow = SYNCABLE.has(status) && (onSyncNow ?? onRetry);
  const syncHandler = onSyncNow ?? onRetry;

  if (expanded) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 space-y-1.5">
        <div className={`flex items-center gap-2 text-xs font-medium ${cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCls} ${isSpinning ? 'animate-pulse' : ''}`} />
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{label}</span>
          {canSyncNow && syncHandler && (
            <button
              onClick={syncHandler}
              disabled={isSpinning}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              <RefreshCw className="w-3 h-3" />
              {t('syncStatus.syncNow')}
            </button>
          )}
        </div>
        {status === 'synced' && syncedAt && (
          <p className="text-[10px] text-muted-foreground pl-[26px]">
            {t('syncStatus.lastSynced')} {format(new Date(syncedAt), 'h:mm a')}
          </p>
        )}
        {status === 'error' && (
          <p className="text-[10px] text-destructive pl-[26px]">
            {t('syncStatus.syncFailed')}
          </p>
        )}
        {status === 'unauthenticated' && (
          <p className="text-[10px] text-muted-foreground pl-[26px]">
            {t('syncStatus.signInToSync')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotCls} ${isSpinning ? 'animate-pulse' : ''}`} />
      <Icon className={`w-3 h-3 flex-shrink-0 ${isSpinning ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{label}</span>
      {status === 'synced' && syncedAt && (
        <span className="hidden lg:inline text-muted-foreground font-normal">
          · {format(new Date(syncedAt), 'h:mm a')}
        </span>
      )}
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="underline underline-offset-2 hover:no-underline text-xs"
        >
          {t('syncStatus.retry')}
        </button>
      )}
      {canSyncNow && syncHandler && status !== 'error' && (
        <button
          onClick={syncHandler}
          disabled={isSpinning}
          className="hidden sm:flex items-center gap-0.5 text-xs text-primary hover:opacity-80 transition-opacity disabled:opacity-40"
          title={t('syncStatus.syncNow')}
        >
          <RefreshCw className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}
