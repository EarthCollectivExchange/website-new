'use client';

import { Clock, Trash2, Download, Calendar } from 'lucide-react';
import type { FileRetentionPolicy, FileStorageMode } from '@/lib/messaging/types';
import { retentionLabel } from '@/lib/messaging/files';

interface FileRetentionSelectorProps {
  value: FileRetentionPolicy;
  onChange: (policy: FileRetentionPolicy) => void;
  storageMode: FileStorageMode;
}

const POLICY_ICONS: Record<FileRetentionPolicy, React.ReactNode> = {
  after_download: <Download className="w-3.5 h-3.5" />,
  '24h':          <Clock className="w-3.5 h-3.5" />,
  '7d':           <Calendar className="w-3.5 h-3.5" />,
  '30d':          <Calendar className="w-3.5 h-3.5" />,
  manual:         <Trash2 className="w-3.5 h-3.5" />,
};

function availablePolicies(mode: FileStorageMode): FileRetentionPolicy[] {
  if (mode === 'local_only') return ['manual'];
  if (mode === 'encrypted_relay') return ['after_download', '24h', '7d'];
  return ['after_download', '24h', '7d', '30d', 'manual'];
}

export function FileRetentionSelector({ value, onChange, storageMode }: FileRetentionSelectorProps) {
  if (storageMode === 'local_only') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Trash2 className="w-3.5 h-3.5" />
        <span>Local only — you control deletion</span>
      </div>
    );
  }

  const options = availablePolicies(storageMode);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Retention</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((policy) => (
          <button
            key={policy}
            onClick={() => onChange(policy)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all
              ${value === policy
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border/60'
              }
            `}
          >
            {POLICY_ICONS[policy]}
            {retentionLabel(policy)}
          </button>
        ))}
      </div>
    </div>
  );
}
