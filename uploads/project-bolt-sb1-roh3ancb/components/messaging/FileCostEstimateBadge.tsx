'use client';

import { HardDrive, Cloud, Vault } from 'lucide-react';
import type { FileStorageMode } from '@/lib/messaging/types';
import type { FileCostEstimate } from '@/lib/messaging/files';

interface FileCostEstimateBadgeProps {
  estimate: FileCostEstimate;
  showDetail?: boolean;
}

const MODE_ICONS: Record<FileStorageMode, React.ReactNode> = {
  local_only:      <HardDrive className="w-3.5 h-3.5" />,
  encrypted_relay: <Cloud className="w-3.5 h-3.5" />,
  encrypted_vault: <Vault className="w-3.5 h-3.5" />,
};

const MODE_COLORS: Record<FileStorageMode, string> = {
  local_only:      'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  encrypted_relay: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  encrypted_vault: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
};

export function FileCostEstimateBadge({ estimate, showDetail = false }: FileCostEstimateBadgeProps) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${MODE_COLORS[estimate.storageMode]}`}>
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0">{MODE_ICONS[estimate.storageMode]}</span>
        <span className="text-xs font-semibold">{estimate.storageCostLabel}</span>
      </div>
      {showDetail && (
        <p className="text-[10px] mt-1 opacity-70 leading-relaxed">
          {estimate.serverSideLabel}
          {estimate.retentionLabel && (
            <span className="ml-1 opacity-80">· {estimate.retentionLabel}</span>
          )}
        </p>
      )}
    </div>
  );
}
