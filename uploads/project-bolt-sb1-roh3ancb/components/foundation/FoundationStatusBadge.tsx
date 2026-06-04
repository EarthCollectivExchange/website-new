'use client';

import { CircleCheck as CheckCircle2, Circle } from 'lucide-react';
import { APP_VERSION, APP_MATURITY } from '@/lib/foundation/appConstants';
import { getActiveLayers } from '@/lib/foundation/appLayers';

interface FoundationStatusBadgeProps {
  compact?: boolean;
}

export function FoundationStatusBadge({ compact = false }: FoundationStatusBadgeProps) {
  const activeLayers = getActiveLayers();

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        EarthOS v{APP_VERSION} · {APP_MATURITY}
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 px-3 py-2.5 space-y-1.5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <p className="text-xs font-semibold text-foreground">
          EarthOS Foundation v{APP_VERSION}
        </p>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium">
          {APP_MATURITY}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 pl-5">
        {activeLayers.map((layer) => (
          <span
            key={layer.id}
            className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
          >
            {layer.id}
          </span>
        ))}
      </div>
    </div>
  );
}
