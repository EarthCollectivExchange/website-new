'use client';

import { useState } from 'react';
import { X, HardDrive, Cloud, Vault, Lock, ShieldCheck, Clock, Calendar, Download, Trash2, Info, ChevronRight, Settings2, TriangleAlert as AlertTriangle } from 'lucide-react';
import type { FileTransfer, FileRetentionPolicy, FileLocalPermissions, FileStorageMode } from '@/lib/messaging/types';
import {
  formatFileSize, storageModeLabel, retentionLabel, calculateRetentionExpiry, getMimeCategory,
} from '@/lib/messaging/files';
import { FilePermissionsPanel } from './FilePermissionsPanel';
import { FileRetentionSelector } from './FileRetentionSelector';

interface FileDetailsDrawerProps {
  transfer: FileTransfer;
  isOwn: boolean;
  onClose: () => void;
  onSaveFile?: (transfer: FileTransfer) => void;
  onDeleteLocally?: (transferId: string) => void;
  onDeleteForEveryone?: (transferId: string) => void;
  onUpdateRetention?: (transferId: string, policy: FileRetentionPolicy) => void;
  onUpdatePermissions?: (transferId: string, permissions: FileLocalPermissions) => void;
}

const STORAGE_MODE_META: Record<FileStorageMode, { icon: React.ReactNode; color: string; label: string }> = {
  local_only: {
    icon: <HardDrive className="w-4 h-4" />,
    color: 'text-emerald-400',
    label: 'Local only — stays on this device',
  },
  encrypted_relay: {
    icon: <Cloud className="w-4 h-4" />,
    color: 'text-sky-400',
    label: 'Sealed for relay',
  },
  encrypted_vault: {
    icon: <Vault className="w-4 h-4" />,
    color: 'text-amber-400',
    label: 'Encrypted vault',
  },
};

function ExpiryTimer({ expiresAt, policy }: { expiresAt?: string; policy: FileRetentionPolicy }) {
  if (policy === 'manual') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Trash2 className="w-3.5 h-3.5" /> Keep until manually deleted
      </span>
    );
  }
  if (policy === 'after_download') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Download className="w-3.5 h-3.5" /> Deleted after first download
      </span>
    );
  }
  if (!expiresAt) return null;

  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  const msLeft = exp - now;

  if (msLeft <= 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive font-medium">
        <AlertTriangle className="w-3.5 h-3.5" /> Expired
      </span>
    );
  }

  const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  const label = daysLeft >= 2
    ? `Expires in ${daysLeft} days`
    : hoursLeft >= 1
    ? `Expires in ${hoursLeft}h`
    : 'Expires in less than 1 hour';

  const urgent = hoursLeft < 24;

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${urgent ? 'text-amber-400' : 'text-muted-foreground'}`}>
      <Clock className={`w-3.5 h-3.5 ${urgent ? 'text-amber-400' : ''}`} />
      {label}
      <span className="text-muted-foreground/60 font-normal ml-1">
        ({new Date(expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})
      </span>
    </span>
  );
}

type Panel = 'details' | 'permissions' | 'retention';

export function FileDetailsDrawer({
  transfer,
  isOwn,
  onClose,
  onSaveFile,
  onDeleteLocally,
  onDeleteForEveryone,
  onUpdateRetention,
  onUpdatePermissions,
}: FileDetailsDrawerProps) {
  const [panel, setPanel] = useState<Panel>('details');
  const [localRetention, setLocalRetention] = useState<FileRetentionPolicy>(transfer.retentionPolicy);
  const [confirmDeleteLocal, setConfirmDeleteLocal] = useState(false);
  const [confirmDeleteRemote, setConfirmDeleteRemote] = useState(false);

  const modeMeta = STORAGE_MODE_META[transfer.storageMode];
  const fileName = transfer.localFileName ?? 'Sealed file';
  const category = getMimeCategory(transfer.localMimeType ?? 'application/octet-stream');
  const isLocalOnly = transfer.storageMode === 'local_only';
  const isExpired = transfer.status === 'expired';
  const isDeletedLocally = transfer.deletedLocally;
  const isDeleteRequestedRemote = transfer.deleteRequestedRemote;

  const defaultPermissions: FileLocalPermissions = transfer.localPermissions ?? {
    viewOnly: false,
    downloadAllowed: true,
    forwardAllowed: false,
    screenshotWarning: false,
  };

  function handleRetentionChange(policy: FileRetentionPolicy) {
    setLocalRetention(policy);
    onUpdateRetention?.(transfer.id, policy);
  }

  function handlePermissionsUpdate(patch: Partial<FileLocalPermissions>) {
    const updated = { ...defaultPermissions, ...patch };
    onUpdatePermissions?.(transfer.id, updated);
  }

  function handleDeleteLocally() {
    if (!confirmDeleteLocal) { setConfirmDeleteLocal(true); return; }
    onDeleteLocally?.(transfer.id);
    onClose();
  }

  function handleDeleteForEveryone() {
    if (!confirmDeleteRemote) { setConfirmDeleteRemote(true); return; }
    onDeleteForEveryone?.(transfer.id);
    onClose();
  }

  if (panel === 'permissions') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
          <button onClick={() => setPanel('details')} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <span className="text-sm font-semibold text-foreground">Permissions</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <FilePermissionsPanel
            permissions={defaultPermissions}
            storageMode={transfer.storageMode}
            isOwn={isOwn}
            onUpdate={handlePermissionsUpdate}
            onDeleteForEveryone={isOwn && !isLocalOnly ? handleDeleteForEveryone : undefined}
            onClose={() => setPanel('details')}
          />
        </div>
      </div>
    );
  }

  if (panel === 'retention') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
          <button onClick={() => setPanel('details')} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <span className="text-sm font-semibold text-foreground">Expiry / Retention</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Changing retention here updates your local record. For relay and vault files, the server policy was set at send time.
            </p>
          </div>

          <FileRetentionSelector
            value={localRetention}
            onChange={handleRetentionChange}
            storageMode={transfer.storageMode}
          />

          <div className="pt-2">
            <ExpiryTimer
              expiresAt={localRetention === transfer.retentionPolicy ? transfer.expiresAt : calculateRetentionExpiry(localRetention, transfer.createdAt)}
              policy={localRetention}
            />
          </div>

          <button
            onClick={() => setPanel('details')}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // Main details panel
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <span className="text-sm font-semibold text-foreground truncate pr-2">{fileName.length > 28 ? fileName.slice(0, 25) + '…' : fileName}</span>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* File metadata card */}
        <div className="rounded-xl border border-border bg-muted/20 divide-y divide-border/50">
          <MetaRow label="Type" value={category.charAt(0).toUpperCase() + category.slice(1)} />
          <MetaRow label="Size" value={formatFileSize(transfer.sizeBytes)} />
          {transfer.chunkCount > 1 && <MetaRow label="Chunks" value={`${transfer.chunkCount} encrypted chunks`} />}
          <MetaRow label="Created" value={new Date(transfer.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} />
          <MetaRow label="Integrity" value={
            transfer.integrityHash.startsWith('sha256::')
              ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> SHA-256 verified</span>
              : <span className="text-muted-foreground">Pending</span>
          } />
        </div>

        {/* Storage mode */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
          transfer.storageMode === 'local_only' ? 'bg-emerald-500/10 border-emerald-500/20'
          : transfer.storageMode === 'encrypted_relay' ? 'bg-sky-500/10 border-sky-500/20'
          : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          <span className={modeMeta.color}>{modeMeta.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${modeMeta.color}`}>{modeMeta.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{storageModeLabel(transfer.storageMode)}</p>
          </div>
          <Lock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
        </div>

        {/* Expiry */}
        <div className="flex items-center justify-between">
          <ExpiryTimer expiresAt={transfer.expiresAt} policy={transfer.retentionPolicy} />
          {isOwn && !isLocalOnly && (
            <button
              onClick={() => setPanel('retention')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" /> Change
            </button>
          )}
        </div>

        {/* Deletion state banners */}
        {isDeletedLocally && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/50 border border-border">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">Local reference removed. The file is no longer accessible on this device.</p>
          </div>
        )}
        {isDeleteRequestedRemote && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-destructive/8 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive leading-relaxed">Remote deletion requested. Pending confirmation from relay.</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* Open / Save */}
          {!isDeletedLocally && !isExpired && onSaveFile && (defaultPermissions.downloadAllowed || isOwn) && (
            <ActionButton
              icon={<Download className="w-4 h-4" />}
              label={isLocalOnly ? 'Open file' : 'Save file'}
              description={isLocalOnly ? 'Open the locally stored file.' : 'Save a local copy of this file.'}
              onClick={() => { onSaveFile(transfer); onClose(); }}
              variant="primary"
            />
          )}

          {/* Permissions */}
          <ActionButton
            icon={<Settings2 className="w-4 h-4" />}
            label="Permissions"
            description="View only, download, forward settings."
            onClick={() => setPanel('permissions')}
          />

          {/* Delete from this device */}
          {!isDeletedLocally && onDeleteLocally && (
            <ActionButton
              icon={<Trash2 className="w-4 h-4" />}
              label={confirmDeleteLocal ? 'Tap again to confirm' : 'Delete from this device'}
              description={confirmDeleteLocal ? 'Removes the local reference only — no remote delete.' : 'Removes content from this device only. Does not affect relay or vault.'}
              onClick={handleDeleteLocally}
              variant={confirmDeleteLocal ? 'destructive' : 'default'}
            />
          )}

          {/* Delete for everyone */}
          {isOwn && !isLocalOnly && !isDeleteRequestedRemote && (
            <ActionButton
              icon={<Trash2 className="w-4 h-4" />}
              label={confirmDeleteRemote ? 'Confirm: delete for everyone' : 'Delete for everyone'}
              description={confirmDeleteRemote ? 'Tap again to confirm. This requests removal from the relay/vault.' : 'Request removal from relay or vault. Cannot be undone.'}
              onClick={handleDeleteForEveryone}
              variant={confirmDeleteRemote ? 'destructive' : 'default'}
            />
          )}
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-muted/30">
          <Lock className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            Plaintext filename and content are never stored on any server. Only encrypted bytes are transmitted.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Helper subcomponents ─────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[60%]">{value}</span>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'destructive';
}

function ActionButton({ icon, label, description, onClick, variant = 'default' }: ActionButtonProps) {
  const colorMap = {
    default: 'border-border hover:bg-muted/40 text-foreground',
    primary: 'border-primary/30 hover:bg-primary/5 text-primary',
    destructive: 'border-destructive/30 hover:bg-destructive/5 text-destructive',
  };
  const iconColorMap = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    destructive: 'bg-destructive/10 text-destructive',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${colorMap[variant]}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColorMap[variant]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${variant === 'default' ? 'text-foreground' : ''}`}>{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
    </button>
  );
}

