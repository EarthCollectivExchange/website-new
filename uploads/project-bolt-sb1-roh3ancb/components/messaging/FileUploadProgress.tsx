'use client';

import { Lock, CircleCheck as CheckCircle2, Circle as XCircle, HardDrive, Radio } from 'lucide-react';
import type { FileTransferStatus, FileStorageMode } from '@/lib/messaging/types';
import { formatFileSize } from '@/lib/messaging/files';
import { useT } from '@/lib/i18n/useT';

interface FileUploadProgressProps {
  fileName: string;
  sizeBytes: number;
  storageMode: FileStorageMode;
  status: FileTransferStatus;
  uploadedChunks: number;
  totalChunks: number;
  onCancel?: () => void;
}

function currentStepIndex(status: FileTransferStatus): number {
  if (['pending_local'].includes(status)) return 0;
  if (['encrypting'].includes(status)) return 1;
  if (['uploading'].includes(status)) return 2;
  if (['ready', 'delivered', 'local_only'].includes(status)) return 3;
  return -1;
}

export function FileUploadProgress({
  fileName,
  sizeBytes,
  storageMode,
  status,
  uploadedChunks,
  totalChunks,
  onCancel,
}: FileUploadProgressProps) {
  const { t } = useT();

  const STEPS = [
    t('files.uploadStepPreparing'),
    t('files.uploadStepEncrypting'),
    t('files.uploadStepSending'),
    t('files.uploadStepStored'),
  ];

  const idx = currentStepIndex(status);
  const isDone = status === 'ready' || status === 'delivered' || status === 'local_only';
  const isFailed = status === 'failed';
  const pct = isDone ? 100 : idx < 0 ? 0 : Math.round((idx / (STEPS.length - 1)) * 70 + (uploadedChunks / Math.max(totalChunks, 1)) * 30);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-primary/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(sizeBytes)}</p>
        </div>
        {isFailed && <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
        {isDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
      </div>

      {!isFailed && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {isDone ? STEPS[STEPS.length - 1] : STEPS[idx < 0 ? 0 : idx] ?? t('files.uploadProcessing')}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {storageMode === 'local_only'
                ? <HardDrive className="w-3 h-3" />
                : <Radio className="w-3 h-3" />}
              <span>{storageMode === 'local_only' ? t('files.uploadStorageLocal') : t('files.uploadStorageRelayOff')}</span>
            </div>
          </div>
        </div>
      )}

      {isFailed && (
        <p className="text-xs text-destructive">{t('files.uploadError')}</p>
      )}

      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done = isDone || i < idx;
          const active = !isDone && i === idx;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-all
                ${done ? 'bg-emerald-500 text-white' : active ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border text-muted-foreground/40'}`}>
                {done ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-[2px] flex-1 mx-1 rounded-full transition-all duration-500 ${done ? 'bg-emerald-400' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {onCancel && !isDone && !isFailed && (
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          {t('files.uploadCancel')}
        </button>
      )}
    </div>
  );
}
