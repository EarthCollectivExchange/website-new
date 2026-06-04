'use client';

import { ShieldCheck } from 'lucide-react';
import { STATS_PRIVACY_NOTICE } from '@/lib/stats/statsPrivacy';

export function StatsPrivacyNotice() {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <p className="text-xs font-semibold text-foreground">Stats Privacy</p>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground font-medium">Collects</p>
        <ul className="space-y-0.5">
          {STATS_PRIVACY_NOTICE.collects.map((item) => (
            <li key={item} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
              <span className="text-emerald-500 mt-0.5">+</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground font-medium mt-2">Never collects</p>
        <ul className="space-y-0.5">
          {STATS_PRIVACY_NOTICE.neverCollects.map((item) => (
            <li key={item} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
              <span className="text-muted-foreground/50 mt-0.5">–</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground/70 mt-2">{STATS_PRIVACY_NOTICE.storage}</p>
      </div>
    </div>
  );
}
