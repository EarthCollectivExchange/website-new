'use client';

import { Eye, Download, Forward, ShieldAlert, Trash2, Users, Lock, Info } from 'lucide-react';
import type { FileLocalPermissions, FileStorageMode } from '@/lib/messaging/types';

interface FilePermissionsPanelProps {
  permissions: FileLocalPermissions;
  storageMode: FileStorageMode;
  isOwn: boolean;
  onUpdate: (patch: Partial<FileLocalPermissions>) => void;
  onDeleteForEveryone?: () => void;
  onClose: () => void;
}

interface PermissionRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  disabledReason?: string;
  placeholder?: boolean;
  onChange: (val: boolean) => void;
}

function PermissionRow({
  icon, label, description, checked, disabled, disabledReason, placeholder, onChange,
}: PermissionRowProps) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors
      ${disabled ? 'opacity-50' : 'hover:bg-muted/40 cursor-pointer'}
      ${placeholder ? 'opacity-40' : ''}`}
      onClick={() => !disabled && !placeholder && onChange(!checked)}
      role={placeholder ? undefined : 'checkbox'}
      aria-checked={placeholder ? undefined : checked}
      tabIndex={placeholder || disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!disabled && !placeholder) onChange(!checked); } }}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
        ${checked && !placeholder ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {placeholder && (
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Coming soon</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {disabledReason ?? description}
        </p>
      </div>
      {!placeholder && (
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all
          ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
          {checked && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      )}
    </div>
  );
}

export function FilePermissionsPanel({
  permissions,
  storageMode,
  isOwn,
  onUpdate,
  onDeleteForEveryone,
  onClose,
}: FilePermissionsPanelProps) {
  const isLocalOnly = storageMode === 'local_only';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary/70" />
          <span className="text-sm font-semibold text-foreground">File permissions</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
        >
          Done
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">

        {/* Context notice for local_only */}
        {isLocalOnly && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/22 mb-3">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300 leading-relaxed">
              This file is stored locally only. Permissions apply to how it&apos;s handled on this device.
            </p>
          </div>
        )}

        {!isOwn && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/22 mb-3">
            <Users className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sky-300 leading-relaxed">
              These are your local handling preferences for this received file.
            </p>
          </div>
        )}

        <PermissionRow
          icon={<Eye className="w-4 h-4" />}
          label="View only"
          description="File can be previewed but not saved to device."
          checked={permissions.viewOnly}
          onChange={(val) => onUpdate({ viewOnly: val, downloadAllowed: val ? false : permissions.downloadAllowed })}
        />

        <PermissionRow
          icon={<Download className="w-4 h-4" />}
          label="Download allowed"
          description="File can be saved to this device."
          checked={permissions.downloadAllowed}
          disabled={permissions.viewOnly}
          disabledReason={permissions.viewOnly ? 'Disabled while view-only is on.' : undefined}
          onChange={(val) => onUpdate({ downloadAllowed: val })}
        />

        <PermissionRow
          icon={<Forward className="w-4 h-4" />}
          label="Forward allowed"
          description="File can be shared to other conversations."
          checked={permissions.forwardAllowed}
          placeholder
          onChange={(val) => onUpdate({ forwardAllowed: val })}
        />

        <PermissionRow
          icon={<ShieldAlert className="w-4 h-4" />}
          label="Screenshot warning"
          description="Show a warning if a screenshot is detected while this file is open."
          checked={permissions.screenshotWarning}
          placeholder
          onChange={(val) => onUpdate({ screenshotWarning: val })}
        />

        {/* Delete section */}
        {isOwn && (
          <div className="pt-3 border-t border-border/60 mt-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              Danger zone
            </p>

            {/* Delete for everyone — placeholder for relay/vault */}
            <button
              onClick={onDeleteForEveryone}
              disabled={!onDeleteForEveryone}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                ${onDeleteForEveryone
                  ? 'border-destructive/30 hover:bg-destructive/5 cursor-pointer'
                  : 'border-border opacity-40 cursor-not-allowed'}`}
            >
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Delete for everyone</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isLocalOnly
                    ? 'Not available for local-only files.'
                    : onDeleteForEveryone
                    ? 'Request removal from relay or vault. Cannot be undone.'
                    : 'Available for relay and vault files (coming soon).'}
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
