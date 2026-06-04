'use client';

import { useEffect, useState } from 'react';
import { ChartBar as BarChart2 } from 'lucide-react';
import { getLightSummary } from '@/lib/stats/lightAnalyzer';
import type { StatsSummary } from '@/lib/stats/statsSelectors';

export function StatsSummaryCard() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);

  useEffect(() => {
    setSummary(getLightSummary());
  }, []);

  if (!summary) return null;

  const rows: { label: string; value: number }[] = [
    { label: 'Conversations',  value: summary.conversations },
    { label: 'Messages sent',  value: summary.messages },
    { label: 'Files shared',   value: summary.files },
    { label: 'Voice memos',    value: summary.voice },
    { label: 'Auto-clears',    value: summary.autoClears },
    { label: 'Exports',        value: summary.exports },
  ];

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-3.5 h-3.5 text-sky-500" />
        <p className="text-xs font-semibold text-foreground">Light Stats</p>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 ml-auto">
          local only
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground">{row.label}</span>
            <span className="text-[10px] font-semibold text-foreground tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
      {summary.lastActive && (
        <p className="text-[9px] text-muted-foreground/60">Last active: {summary.lastActive}</p>
      )}
    </div>
  );
}
