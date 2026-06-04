'use client';

import { Lock, Radio, HardDrive } from 'lucide-react';
import type { StorageMode } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

interface StorageBadgeProps {
  mode: StorageMode;
  showLabel?: boolean;
}

const STORAGE_ICON: Record<StorageMode, typeof Lock> = {
  local_only:       HardDrive,
  encrypted_relay:  Radio,
  encrypted_backup: Lock,
};

const STORAGE_COLOR: Record<StorageMode, string> = {
  local_only:       'text-teal-400',
  encrypted_relay:  'text-sky-400',
  encrypted_backup: 'text-amber-400',
};

export function StorageBadge({ mode, showLabel = false }: StorageBadgeProps) {
  const { t } = useT();
  const Icon = STORAGE_ICON[mode];
  const color = STORAGE_COLOR[mode];
  const LABEL: Record<StorageMode, string> = {
    local_only:       t('badge.storage.localOnly'),
    encrypted_relay:  t('badge.storage.encryptedRelay'),
    encrypted_backup: t('badge.storage.encryptedBackup'),
  };
  const label = LABEL[mode];

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`} title={label}>
      <Icon className="w-3 h-3" />
      {showLabel && <span className="font-medium">{label}</span>}
    </span>
  );
}
