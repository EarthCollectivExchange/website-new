'use client';

import { ChartBar as BarChart2 } from 'lucide-react';
import { StatsSummaryCard } from './StatsSummaryCard';
import { StatsPrivacyNotice } from './StatsPrivacyNotice';
import { StatsModeBadge } from './StatsModeBadge';
import { usePreferences } from '@/lib/foundation/preferencesContext';

export function StatsPlaceholderPanel() {
  const { statsMode } = usePreferences();

  if (statsMode === 'off') {
    return (
      <div className="rounded-xl border border-border bg-muted/10 px-4 py-6 text-center space-y-2">
        <BarChart2 className="w-6 h-6 text-muted-foreground/30 mx-auto" />
        <p className="text-xs text-muted-foreground">Stats are off.</p>
        <p className="text-[10px] text-muted-foreground/60">
          Enable Light Stats in Settings → Developer to track usage locally.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <BarChart2 className="w-4 h-4 text-sky-500" />
        <p className="text-xs font-semibold text-foreground">EarthOS Stats Analyzer</p>
        <StatsModeBadge mode={statsMode} showLabel />
      </div>

      <StatsSummaryCard />

      {statsMode === 'complete' && (
        <div className="rounded-xl border border-border bg-muted/10 px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Complete Stats Mode — full local analytics coming in a future update.
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Currently showing Light Stats aggregates.
          </p>
        </div>
      )}

      <StatsPrivacyNotice />
    </div>
  );
}
