'use client';

import { useState } from 'react';
import { Users, UserPlus, Search, X } from 'lucide-react';
import type { ConversationMember } from '@/lib/messaging/types';
import type { SimulatedMemberInfo } from './MembersPanel';
import { TrustBadge } from './TrustBadge';
import { useT } from '@/lib/i18n/useT';

interface ContactsTabProps {
  members: ConversationMember[];
  simulatedMemberInfo: SimulatedMemberInfo[];
  viewerEarthId: string;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const lower = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  const segments: Array<{ text: string; highlight: boolean }> = [];
  let cursor = 0;
  while (cursor < text.length) {
    const found = lower.indexOf(lowerQ, cursor);
    if (found === -1) { segments.push({ text: text.slice(cursor), highlight: false }); break; }
    if (found > cursor) segments.push({ text: text.slice(cursor, found), highlight: false });
    segments.push({ text: text.slice(found, found + lowerQ.length), highlight: true });
    cursor = found + lowerQ.length;
  }
  return (
    <span>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark key={i} className="bg-amber-500/25 text-foreground rounded-sm px-0.5 not-italic font-semibold">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  );
}

export function ContactsTab({ members, simulatedMemberInfo, viewerEarthId }: ContactsTabProps) {
  const { t } = useT();
  const [search, setSearch] = useState('');

  const allContacts = members.filter(
    (m, i, arr) =>
      m.earthId !== viewerEarthId &&
      arr.findIndex((x) => x.earthId === m.earthId) === i
  );

  function getDisplayName(earthId: string): string {
    const sim = simulatedMemberInfo.find((s) => s.earthId === earthId);
    if (sim) return sim.displayName;
    return earthId.slice(0, 8) + '…';
  }

  function getHandle(earthId: string): string {
    const sim = simulatedMemberInfo.find((s) => s.earthId === earthId);
    if (sim) return `@${sim.handle}`;
    return earthId.slice(0, 10);
  }

  const contacts = search.trim()
    ? allContacts.filter((m) => {
        const q = search.trim().toLowerCase();
        return (
          getDisplayName(m.earthId).toLowerCase().includes(q) ||
          getHandle(m.earthId).toLowerCase().includes(q)
        );
      })
    : allContacts;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 border-b border-border">
        <h1 className="text-base font-semibold text-foreground">{t('contacts.title')}</h1>
        <button className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border focus-within:border-primary/40 focus-within:bg-muted/70 transition-all">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('contacts.searchPlaceholder')}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            autoComplete="off"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[80px]"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
        {allContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('contacts.emptyTitle')}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('contacts.emptyDesc')}
              </p>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 px-8 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('contacts.noMatchTitle').replace('{query}', search)}</p>
              <button onClick={() => setSearch('')} className="text-xs text-primary hover:underline mt-1">
                {t('contacts.clearSearch')}
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border px-4">
            {contacts.map((m) => (
              <li key={m.earthId} className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-secondary-foreground flex-shrink-0">
                  {getDisplayName(m.earthId).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    <HighlightedText text={getDisplayName(m.earthId)} query={search} />
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    <HighlightedText text={getHandle(m.earthId)} query={search} />
                  </p>
                </div>
                <TrustBadge level={m.trustSnapshot} showLabel size="sm" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
