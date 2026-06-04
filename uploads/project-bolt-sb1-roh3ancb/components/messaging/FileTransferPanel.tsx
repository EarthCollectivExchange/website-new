'use client';

import { useState, useRef, useCallback, useId, useEffect } from 'react';
import { Upload, X, HardDrive, Cloud, Vault, Lock, ChevronDown, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Loader as Loader2, File as FileIcon } from 'lucide-react';
import type { FileStorageMode, FileRetentionPolicy, FileTransfer, UserTier } from '@/lib/messaging/types';
import { TIER_LIMITS } from '@/lib/messaging/types';
import {
  validateFileForTier,
  createFileTransfer,
  formatFileSize,
  storageModeLabel,
  estimateFileCost,
  resolveDefaultRetention,
} from '@/lib/messaging/files';
import { FileCostEstimateBadge } from './FileCostEstimateBadge';
import { FileRetentionSelector } from './FileRetentionSelector';
import { useT } from '@/lib/i18n/useT';

interface FileTransferPanelProps {
  conversationId: string;
  senderEarthId: string;
  tier?: UserTier;
  onTransferReady: (transfer: FileTransfer, messageBody: string) => void;
  onClose: () => void;
}

type FileItemStatus = 'pending' | 'processing' | 'done' | 'error';

interface FileQueueItem {
  id: string;
  file: File;
  status: FileItemStatus;
  validationError?: string;
  transfer?: FileTransfer;
  step?: string;
}

// Returns true if the drag event carries at least one file
function hasFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files');
}

export function FileTransferPanel({
  conversationId,
  senderEarthId,
  tier = 'free',
  onTransferReady,
  onClose,
}: FileTransferPanelProps) {
  const { t } = useT();
  const [queue, setQueue] = useState<FileQueueItem[]>([]);
  const [storageMode, setStorageMode] = useState<FileStorageMode>('local_only');
  const [retention, setRetention] = useState<FileRetentionPolicy>('manual');
  const [sending, setSending] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const uid = useId();

  const limits = TIER_LIMITS[tier];

  const MODE_OPTIONS: Array<{
    mode: FileStorageMode;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    requiredTier: UserTier;
    colorText: string;
    colorBg: string;
  }> = [
    {
      mode: 'local_only',
      label: t('files.transferLocalLabel'),
      sublabel: t('files.transferLocalSublabel'),
      icon: <HardDrive className="w-4 h-4" />,
      requiredTier: 'free',
      colorText: 'text-emerald-300',
      colorBg: 'bg-emerald-500/10 border-emerald-500/25',
    },
    {
      mode: 'encrypted_relay',
      label: t('files.transferRelayLabel'),
      sublabel: t('files.transferRelaySublabel'),
      icon: <Cloud className="w-4 h-4" />,
      requiredTier: 'plus',
      colorText: 'text-sky-300',
      colorBg: 'bg-sky-500/10 border-sky-500/25',
    },
    {
      mode: 'encrypted_vault',
      label: t('files.transferVaultLabel'),
      sublabel: t('files.transferVaultSublabel'),
      icon: <Vault className="w-4 h-4" />,
      requiredTier: 'sovereign',
      colorText: 'text-amber-300',
      colorBg: 'bg-amber-500/10 border-amber-500/25',
    },
  ];

  const addFiles = useCallback((files: File[]) => {
    const items: FileQueueItem[] = files.map((file) => {
      const v = validateFileForTier(file, tier, storageMode);
      return {
        id: `${uid}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: v.valid ? 'pending' : 'error',
        validationError: v.valid ? undefined : (v.reason ?? 'File not allowed'),
      };
    });
    setQueue((prev) => [...prev, ...items]);
  }, [tier, storageMode, uid]);

  useEffect(() => {
    function onDragEnter(e: DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      if (dragDepth.current === 1) setDragOver(true);
    }
    function onDragOver(e: DragEvent) {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }
    function onDragLeave(e: DragEvent) {
      if (!hasFiles(e)) return;
      dragDepth.current -= 1;
      if (dragDepth.current <= 0) {
        dragDepth.current = 0;
        setDragOver(false);
      }
    }
    function onDrop(e: DragEvent) {
      e.preventDefault();
      dragDepth.current = 0;
      setDragOver(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length) addFiles(files);
    }
    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragover',  onDragOver);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('drop',      onDrop);
    return () => {
      document.removeEventListener('dragenter', onDragEnter);
      document.removeEventListener('dragover',  onDragOver);
      document.removeEventListener('dragleave', onDragLeave);
      document.removeEventListener('drop',      onDrop);
    };
  }, [addFiles]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addFiles(files);
    e.target.value = '';
  }

  function removeItem(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  function handleModeChange(mode: FileStorageMode) {
    setStorageMode(mode);
    setRetention(resolveDefaultRetention(mode));
    setShowModes(false);
    setQueue((prev) => prev.map((item) => {
      if (item.status === 'done' || item.status === 'processing') return item;
      const v = validateFileForTier(item.file, tier, mode);
      return { ...item, status: v.valid ? 'pending' : 'error', validationError: v.valid ? undefined : (v.reason ?? 'Not allowed') };
    }));
  }

  async function handleSendAll() {
    const readyItems = queue.filter((item) => item.status === 'pending');
    if (!readyItems.length || sending) return;
    setSending(true);

    for (const item of readyItems) {
      setQueue((prev) => prev.map((q) =>
        q.id === item.id ? { ...q, status: 'processing', step: t('files.transferEncrypting') } : q
      ));

      try {
        const { transfer } = await createFileTransfer(
          item.file, conversationId, senderEarthId, storageMode, tier
        );

        if (storageMode !== 'local_only') {
          setQueue((prev) => prev.map((q) =>
            q.id === item.id ? { ...q, step: t('files.transferSealing') } : q
          ));
          await new Promise((r) => setTimeout(r, 300));
        }

        const final: FileTransfer = {
          ...transfer,
          status: storageMode === 'local_only' ? 'local_only' : 'ready',
          retentionPolicy: retention,
          uploadedChunks: transfer.chunkCount,
        };

        setQueue((prev) => prev.map((q) =>
          q.id === item.id ? { ...q, status: 'done', transfer: final, step: undefined } : q
        ));

        const body = `[File: ${item.file.name} — ${formatFileSize(item.file.size)} — ${storageModeLabel(storageMode)}]`;
        onTransferReady(final, body);

        await new Promise((r) => setTimeout(r, 150));
      } catch (err) {
        const msg = err instanceof Error ? err.message : t('files.transferProcessing');
        setQueue((prev) => prev.map((q) =>
          q.id === item.id ? { ...q, status: 'error', validationError: msg, step: undefined } : q
        ));
      }
    }

    setSending(false);
  }

  const selectedOption = MODE_OPTIONS.find((o) => o.mode === storageMode) ?? MODE_OPTIONS[0];
  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const totalCostEstimate = estimateFileCost(
    queue.filter((q) => q.status === 'pending').reduce((sum, q) => sum + q.file.size, 0),
    storageMode
  );
  const allDone = queue.length > 0 && queue.every((q) => q.status === 'done' || q.status === 'error');

  const headerLabel = queue.length > 0
    ? `${queue.length} ${queue.length > 1 ? t('files.transferFilesSelectedPlural') : t('files.transferFilesSelected')}`
    : t('files.transferSendFiles');

  const sendLabel = (() => {
    if (storageMode === 'local_only') {
      return pendingCount > 1
        ? t('files.transferSaveLocallyN').replace('{n}', String(pendingCount))
        : t('files.transferSaveLocally');
    }
    return pendingCount > 1
      ? t('files.transferSealSendN').replace('{n}', String(pendingCount))
      : t('files.transferSealSend');
  })();

  return (
    <div
      ref={panelRef}
      className="relative flex flex-col rounded-2xl border border-border bg-background shadow-xl overflow-hidden w-full animate-in slide-in-from-bottom-2 duration-200"
    >
      {/* Full-panel drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 rounded-2xl
          bg-primary/10 border-2 border-dashed border-primary pointer-events-none">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Upload className="w-7 h-7 text-primary animate-bounce" />
          </div>
          <p className="text-base font-semibold text-primary">{t('files.transferDropFiles')}</p>
          <p className="text-xs text-primary/70">{t('files.transferDropFilesDesc')}</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
        aria-label={t('files.transferFilePicker')}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary/70" />
          <span className="text-sm font-semibold text-foreground">{headerLabel}</span>
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          aria-label={t('files.transferClose')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">

        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label={t('files.transferDropHere')}
          className={`cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-5 px-4 text-center transition-all select-none
            ${dragOver
              ? 'border-primary bg-primary/8 scale-[1.01]'
              : queue.length > 0
              ? 'border-border/60 hover:border-primary/40 hover:bg-muted/20 py-3'
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
            }`}
        >
          {dragOver ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5 text-primary animate-bounce" />
              </div>
              <p className="text-sm font-semibold text-primary">{t('files.transferRelease')}</p>
            </>
          ) : queue.length > 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span className="text-xs">{t('files.transferAddMore')}</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                <Upload className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">{t('files.transferDropHere')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                or click to browse · max {formatFileSize(limits.maxFileSizeBytes)} · multiple files OK
              </p>
            </>
          )}
        </div>

        {/* File queue */}
        {queue.length > 0 && (
          <div className="space-y-2">
            {queue.map((item) => (
              <FileQueueRow
                key={item.id}
                item={item}
                storageMode={storageMode}
                onRemove={() => removeItem(item.id)}
                savedLabel={t('files.transferSavedToDevice')}
                sealedLabel={t('files.transferSealedReady')}
                readyLocalLabel={t('files.transferReadyLocal')}
                readyRelayLabel={t('files.transferReadyRelay')}
                processingLabel={t('files.transferProcessing')}
                removeLabel={t('files.transferRemoveFile')}
              />
            ))}
          </div>
        )}

        {/* Storage mode picker */}
        {!allDone && (
          <div>
            <button
              onClick={() => setShowModes((v) => !v)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedOption.colorBg}`}
            >
              <span className={selectedOption.colorText}>{selectedOption.icon}</span>
              <div className="flex-1 text-left">
                <p className={`text-xs font-semibold ${selectedOption.colorText}`}>{selectedOption.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{selectedOption.sublabel}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showModes ? 'rotate-180' : ''}`} />
            </button>

            {showModes && (
              <div className="mt-1.5 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                {MODE_OPTIONS.map((opt) => {
                  const ok = limits.allowedStorageModes.includes(opt.mode);
                  return (
                    <button
                      key={opt.mode}
                      disabled={!ok}
                      onClick={() => handleModeChange(opt.mode)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                        ${opt.mode === storageMode ? opt.colorBg + ' ring-1 ring-primary/30' : 'border-border hover:bg-muted/40'}
                        ${!ok ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={ok ? opt.colorText : 'text-muted-foreground'}>{opt.icon}</span>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${ok ? opt.colorText : 'text-muted-foreground'}`}>
                          {opt.label}
                          {!ok && <span className="ml-1.5 font-normal opacity-70">· {t('files.transferRequiresTier')} {opt.requiredTier}</span>}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{opt.sublabel}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Retention selector */}
        {!allDone && storageMode !== 'local_only' && pendingCount > 0 && (
          <FileRetentionSelector value={retention} onChange={setRetention} storageMode={storageMode} />
        )}

        {/* Cost estimate */}
        {!allDone && pendingCount > 0 && (
          <FileCostEstimateBadge estimate={totalCostEstimate} showDetail />
        )}

        {/* Send button */}
        {!allDone && (
          <button
            onClick={handleSendAll}
            disabled={pendingCount === 0 || sending}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold
              hover:opacity-90 active:scale-[0.98] transition-all touch-manipulation
              disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t('files.transferProcessing')}</>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {sendLabel}
              </>
            )}
          </button>
        )}

        {allDone && (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold
              hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            {t('files.transferDone')}
          </button>
        )}

        <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
          {storageModeLabel(storageMode)}
        </p>
      </div>
    </div>
  );
}

// ─── FileQueueRow ─────────────────────────────────────────────────────────────

interface FileQueueRowProps {
  item: FileQueueItem;
  storageMode: FileStorageMode;
  onRemove: () => void;
  savedLabel: string;
  sealedLabel: string;
  readyLocalLabel: string;
  readyRelayLabel: string;
  processingLabel: string;
  removeLabel: string;
}

function FileQueueRow({ item, storageMode, onRemove, savedLabel, sealedLabel, readyLocalLabel, readyRelayLabel, processingLabel, removeLabel }: FileQueueRowProps) {
  const isProcessing = item.status === 'processing';
  const isDone = item.status === 'done';
  const isError = item.status === 'error';

  const statusLabel = (() => {
    if (isDone) {
      if (item.transfer?.storageMode === 'local_only') return savedLabel;
      return sealedLabel;
    }
    if (isError) return item.validationError ?? 'Error';
    if (isProcessing) return item.step ?? processingLabel;
    if (storageMode === 'local_only') return readyLocalLabel;
    return readyRelayLabel;
  })();

  const displayName = item.file.name.length > 36
    ? item.file.name.slice(0, 33) + '…'
    : item.file.name;

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all
      ${isDone ? 'bg-emerald-500/10 border-emerald-500/20'
      : isError ? 'bg-destructive/5 border-destructive/20'
      : isProcessing ? 'bg-primary/5 border-primary/20'
      : 'bg-muted/30 border-border/60'}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0
        ${isDone ? 'bg-emerald-500/15'
        : isError ? 'bg-destructive/10'
        : 'bg-muted'}`}
      >
        {isDone
          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          : isError
          ? <AlertCircle className="w-4 h-4 text-destructive" />
          : isProcessing
          ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
          : <FileIcon className="w-4 h-4 text-muted-foreground" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{formatFileSize(item.file.size)}</span>
          <span className="text-[10px] text-muted-foreground/40">·</span>
          <span className={`text-[10px] truncate
            ${isDone ? 'text-emerald-600 dark:text-emerald-400'
            : isError ? 'text-destructive'
            : isProcessing ? 'text-primary'
            : 'text-muted-foreground'}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {!isProcessing && (
        <button
          onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground/60 hover:text-muted-foreground flex-shrink-0"
          aria-label={`${removeLabel} ${item.file.name}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
