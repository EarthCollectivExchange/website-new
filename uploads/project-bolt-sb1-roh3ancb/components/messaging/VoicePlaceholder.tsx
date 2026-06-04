'use client';

import { Mic, X } from 'lucide-react';

interface VoicePlaceholderProps {
  onClose: () => void;
}

export function VoicePlaceholder({ onClose }: VoicePlaceholderProps) {
  return (
    <div className="mx-0 mt-2 rounded-xl border border-border bg-muted/40 p-[13px] animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between mb-[8px]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">Voice Note</p>
        </div>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Voice note recording will be added in the next layer. This interaction point is reserved.
      </p>
    </div>
  );
}
