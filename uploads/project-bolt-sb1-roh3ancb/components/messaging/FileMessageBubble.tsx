'use client';

import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Music, Video, File as FileIcon, Lock, HardDrive, Cloud, Vault, Download, Clock, CircleCheck as CheckCircle2, ShieldCheck, TriangleAlert as AlertTriangle, Loader as Loader2, MoveHorizontal as MoreHorizontal, Timer, Trash2 } from 'lucide-react';
import type { FileTransfer, FileStorageMode, FileTransferStatus, FileRetentionPolicy, FileLocalPermissions } from '@/lib/messaging/types';
import { formatFileSize, storageModeShortLabel, getMimeCategory } from '@/lib/messaging/files';
import { FileDetailsDrawer } from './FileDetailsDrawer';
import { useExpiryCountdown } from '@/lib/messaging/hooks';
import { useT } from '@/lib/i18n/useT';

interface FileMessageBubbleProps {
  transfer: FileTransfer;
  isOwn: boolean;
  onDownload?: (transfer: FileTransfer) => void;
  onDeleteLocally?: (transferId: string) => void;
  onDeleteForEveryone?: (transferId: string) => void;
  onUpdateRetention?: (transferId: string, policy: FileRetentionPolicy) => void;
  onUpdatePermissions?: (transferId: string, permissions: FileLocalPermissions) => void;
}

const CATEGORY_ICONS: Record<ReturnType<typeof getMimeCategory>, React.ReactNode> = {
  image:    <ImageIcon className="w-5 h-5" />,
  video:    <Video className="w-5 h-5" />,
  audio:    <Music className="w-5 h-5" />,
  document: <FileText className="w-5 h-5" />,
  other:    <FileIcon className="w-5 h-5" />,
};

const STORAGE_ICONS: Record<FileStorageMode, React.ReactNode> = {
  local_only:      <HardDrive className="w-3 h-3" />,
  encrypted_relay: <Cloud className="w-3 h-3" />,
  encrypted_vault: <Vault className="w-3 h-3" />,
};

const STORAGE_TEXT: Record<FileStorageMode, string> = {
  local_only:      'text-emerald-400',
  encrypted_relay: 'text-sky-400',
  encrypted_vault: 'text-amber-400',
};

function statusLabel(
  status: FileTransferStatus,
  storageMode: FileStorageMode,
  isOwn: boolean,
  t: (key: string) => string,
): {
  text: string;
  color: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case 'local_only':
      return { text: t('files.statusSavedOnDevice'), color: 'text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" /> };
    case 'ready':
      if (storageMode === 'encrypted_relay') {
        return { text: isOwn ? t('files.statusSealedReady') : t('files.statusReadyToOpen'), color: 'text-sky-400', icon: <CheckCircle2 className="w-3 h-3" /> };
      }
      if (storageMode === 'encrypted_vault') {
        return { text: t('files.statusStoredInVault'), color: 'text-amber-400', icon: <CheckCircle2 className="w-3 h-3" /> };
      }
      return { text: t('files.statusReady'), color: 'text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" /> };
    case 'delivered':
      return { text: t('files.statusDelivered'), color: 'text-emerald-400', icon: <CheckCircle2 className="w-3 h-3" /> };
    case 'encrypting':
      return { text: t('files.statusEncrypting'), color: 'text-muted-foreground', icon: <Loader2 className="w-3 h-3 animate-spin" /> };
    case 'uploading':
      return { text: t('files.statusUploadPending'), color: 'text-sky-400', icon: <Loader2 className="w-3 h-3 animate-spin" /> };
    case 'pending_local':
      return { text: t('files.statusPreparing'), color: 'text-muted-foreground', icon: <Loader2 className="w-3 h-3 animate-spin" /> };
    case 'downloading':
      return { text: t('files.statusDownloading'), color: 'text-sky-400', icon: <Download className="w-3 h-3 animate-bounce" /> };
    case 'failed':
      return { text: t('files.statusFailed'), color: 'text-destructive', icon: <AlertTriangle className="w-3 h-3" /> };
    case 'expired':
      return { text: t('files.statusExpired'), color: 'text-muted-foreground/60', icon: <Clock className="w-3 h-3" /> };
    default:
      return { text: status, color: 'text-muted-foreground', icon: null };
  }
}

export function FileMessageBubble({
  transfer,
  isOwn,
  onDownload,
  onDeleteLocally,
  onDeleteForEveryone,
  onUpdateRetention,
  onUpdatePermissions,
}: FileMessageBubbleProps) {
  const { t } = useT();
  const [verifying, setVerifying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mimeType = transfer.localMimeType ?? 'application/octet-stream';
  const category = getMimeCategory(mimeType);
  const isReady = transfer.status === 'ready' || transfer.status === 'delivered' || transfer.status === 'local_only';
  const { label: expiryLabel, urgent: expiryUrgent, expired: timerExpired } = useExpiryCountdown(transfer.expiresAt);
  const isExpired = transfer.status === 'expired' || timerExpired;
  const isDeletedLocally = transfer.deletedLocally ?? false;
  const isDeleteRequestedRemote = transfer.deleteRequestedRemote ?? false;

  const fileName = transfer.localFileName ?? t('files.sealedFile');
  const displayName = fileName.length > 32 ? fileName.slice(0, 29) + '…' : fileName;

  const { text: stText, color: stColor, icon: stIcon } = statusLabel(transfer.status, transfer.storageMode, isOwn, t);

  const permissions = transfer.localPermissions ?? {
    viewOnly: false,
    downloadAllowed: true,
    forwardAllowed: false,
    screenshotWarning: false,
  };

  // Sender encrypted_relay: no local blob, no save button.
  // Recipient: show save button when ready and download is permitted.
  const showDownloadButton = !isOwn && isReady && !isExpired && !isDeletedLocally && permissions.downloadAllowed;
  const showSenderSaveButton = isOwn && transfer.storageMode === 'local_only' && isReady && !!transfer.localObjectUrl && !isDeletedLocally;

  useEffect(() => {
    if (!showMenu) return;
    const handler = () => { setShowMenu(false); setConfirmDelete(false); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showMenu]);

  async function handleDownload() {
    if (!onDownload || isExpired || !isReady) return;
    setVerifying(true);
    try { await onDownload(transfer); }
    finally { setVerifying(false); }
  }

  function handleDeleteClick() {
    if (isDeletedLocally) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDeleteLocally?.(transfer.id);
    setShowMenu(false);
    setConfirmDelete(false);
  }

  return (
    <>
      <div className={`relative rounded-phi-lg border overflow-hidden min-w-[220px] max-w-[280px] shadow-nature
        ${isOwn ? 'rounded-br-[4px] border-primary/20 bg-primary text-primary-foreground' : 'rounded-bl-[4px] border-border bg-background'}
        ${isExpired || isDeletedLocally ? 'opacity-60' : ''}`}>

        <div className={`h-[3px] w-full ${isOwn ? 'bg-white/25' : 'bg-primary/20'}`} />

        <div className="p-3">
          {/* File name + size + actions button */}
          <div className="relative flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${isOwn ? 'bg-white/20 text-white/90' : 'bg-primary/10 text-primary'}`}>
              {CATEGORY_ICONS[category]}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className={`text-[0.875rem] font-semibold truncate leading-snug ${isOwn ? 'text-white' : 'text-foreground'}`}>
                {displayName}
              </p>
              <p className={`text-[0.75rem] mt-0.5 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                {formatFileSize(transfer.sizeBytes)}
                {transfer.chunkCount > 1 && <span className="ml-1 opacity-60">· {transfer.chunkCount} chunks</span>}
              </p>
            </div>
            {/* Actions menu trigger */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu((v) => { if (v) setConfirmDelete(false); return !v; }); }}
              className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-colors
                ${showMenu
                  ? (isOwn ? 'bg-white/20 text-white' : 'bg-muted text-foreground')
                  : (isOwn ? 'text-white/60 hover:bg-white/15' : 'text-muted-foreground hover:bg-muted')}`}
              aria-label="File actions"
              aria-expanded={showMenu}
              aria-haspopup="menu"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Inline actions menu */}
            {showMenu && (
              <div
                className="absolute z-20 top-7 right-0 w-56 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Delete from this device */}
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeletedLocally}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors
                    ${isDeletedLocally
                      ? 'opacity-40 cursor-not-allowed'
                      : confirmDelete
                      ? 'bg-destructive/8 hover:bg-destructive/12'
                      : 'hover:bg-muted/60'}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isDeletedLocally ? 'bg-muted' : confirmDelete ? 'bg-destructive/15' : 'bg-destructive/10'}`}>
                    <Trash2 className={`w-3.5 h-3.5 ${isDeletedLocally ? 'text-muted-foreground' : 'text-destructive'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight
                      ${isDeletedLocally ? 'text-muted-foreground' : 'text-destructive'}`}>
                      {isDeletedLocally
                        ? t('files.removedFromDevice')
                        : confirmDelete
                        ? t('messages.tapToConfirm')
                        : t('files.deleteFromDevice')}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                      {isDeletedLocally ? t('messages.contentRemovedLocally') : t('messages.localOnlyNoRemote')}
                    </p>
                  </div>
                </button>

                <div className="mx-3 border-t border-border/40" />

                {/* More details */}
                <button
                  onClick={() => { setShowDetails(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 bg-muted">
                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">{t('files.moreOptions')}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{t('files.retentionPermissions')}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Deleted locally state */}
          {isDeletedLocally && (
            <div className={`flex items-center gap-1.5 text-[10px] mb-2 ${isOwn ? 'text-white/50' : 'text-muted-foreground/60'}`}>
              <AlertTriangle className="w-3 h-3" />
              <span>{t('files.removedFromDevice')}</span>
            </div>
          )}

          {/* Delete requested remote state */}
          {isDeleteRequestedRemote && (
            <div className={`flex items-center gap-1.5 text-[10px] mb-2 ${isOwn ? 'text-white/50' : 'text-destructive/70'}`}>
              <AlertTriangle className="w-3 h-3" />
              <span>{t('files.remoteDeletionRequested')}</span>
            </div>
          )}

          {/* Storage mode + status row + encryption */}
          {!isDeletedLocally && (
            <>
              <div className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 mb-2.5
                ${isOwn ? 'bg-white/12' : 'bg-muted/60'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isOwn ? 'text-white/80' : STORAGE_TEXT[transfer.storageMode]}`}>
                  {STORAGE_ICONS[transfer.storageMode]}
                  <span>{storageModeShortLabel(transfer.storageMode)}</span>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-medium ${isOwn ? 'text-white/70' : stColor}`}>
                  {stIcon}
                  {stText}
                </span>
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] mb-3 ${isOwn ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                <Lock className="w-3 h-3" />
                <span>{transfer.storageMode === 'local_only' ? t('files.sealedBeforeSaving') : t('files.sealedBeforeUpload')}</span>
                {transfer.integrityHash.startsWith('sha256::') && (
                  <><span className="mx-0.5">·</span><ShieldCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{t('files.verified')}</span></>
                )}
              </div>
            </>
          )}

          {/* Recipient download button */}
          {showDownloadButton && (
            <button
              onClick={handleDownload}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
            >
              {verifying
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('messages.verifying')}</>
                : <><Download className="w-3.5 h-3.5" /> {t('messages.saveFile')}</>}
            </button>
          )}

          {/* View-only notice for recipient */}
          {!isOwn && isReady && !isExpired && !isDeletedLocally && permissions.viewOnly && !permissions.downloadAllowed && (
            <div className={`flex items-center justify-center gap-1.5 py-1.5 text-[10px] ${isOwn ? 'text-white/50' : 'text-muted-foreground/60'}`}>
              <Lock className="w-3 h-3" />
              <span>{t('messages.viewOnly')}</span>
            </div>
          )}

          {/* Expired state for recipient */}
          {!isOwn && isExpired && (
            <div className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {t('messages.fileExpired')}
            </div>
          )}

          {/* Sender save button (local_only only) */}
          {showSenderSaveButton && (
            <button
              onClick={handleDownload}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation disabled:opacity-40 bg-white/20 text-white hover:bg-white/30 active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" /> {t('files.openFile')}
            </button>
          )}

          {/* Expiry countdown */}
          {expiryLabel && !isExpired && !isDeletedLocally && (
            <div className={`flex items-center justify-center gap-1 mt-1.5
              ${expiryUrgent
                ? (isOwn ? 'text-amber-200' : 'text-amber-400')
                : (isOwn ? 'text-white/40' : 'text-muted-foreground/40')
              }`}>
              <Timer className="w-2.5 h-2.5" />
              <p className="text-[9px] tabular-nums">{expiryLabel}</p>
            </div>
          )}

        </div>
      </div>

      {/* File details drawer — rendered as an overlay anchored above the bubble */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" onClick={() => setShowDetails(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-sm mx-4 mb-4 md:mb-0 max-h-[85vh] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <FileDetailsDrawer
              transfer={transfer}
              isOwn={isOwn}
              onClose={() => setShowDetails(false)}
              onSaveFile={onDownload ? (t) => { onDownload(t); } : undefined}
              onDeleteLocally={onDeleteLocally}
              onDeleteForEveryone={onDeleteForEveryone}
              onUpdateRetention={onUpdateRetention}
              onUpdatePermissions={onUpdatePermissions}
            />
          </div>
        </div>
      )}
    </>
  );
}
