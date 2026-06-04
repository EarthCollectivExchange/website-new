'use client';

import { ChartBar as BarChart2, EyeOff, Layers } from 'lucide-react';
import type { StatsMode } from '@/lib/stats/statsTypes';

interface StatsModeBadgeProps {
  mode: StatsMode;
  showLabel?: boolean;
}

const MODE_CONFIG: Record<StatsMode, { icon: typeof BarChart2; label: string; color: string }> = {
  off:      { icon: EyeOff,    label: 'Stats off',      color: 'text-muted-foreground' },
  light:    { icon: BarChart2, label: 'Light stats',    color: 'text-sky-600' },
  complete: { icon: Layers,    label: 'Complete stats', color: 'text-emerald-600' },
};

export function StatsModeBadge({ mode, showLabel = false }: StatsModeBadgeProps) {
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${config.color}`} title={config.label}>
      <Icon className="w-3 h-3" />
      {showLabel && <span className="font-medium">{config.label}</span>}
    </span>
  );
}
