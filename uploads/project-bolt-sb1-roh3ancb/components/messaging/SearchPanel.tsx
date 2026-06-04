'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MessageSquare, Users, File, Clock, ChevronRight } from 'lucide-react';
import {
  search,
  splitHighlights,
  type SearchResult,
  type SearchFilter,
} from '@/lib/messaging/searchIndex';
import { useT } from '@/lib/i18n/useT';

interface SearchPanelProps {
  /** Called when user clicks a message result to navigate to that conversation */
  onSelectConversation: (conversationId: string, messageId?: string) => void;
  /** Called when the panel should be dismissed */
  onClose: () => void;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  const lower = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  const segments: Array<{ text: string; highlight: boolean }> = [];
  let cursor = 0;
  while (cursor < text.length) {
    const found = lower.indexOf(lowerQ, cursor);
    if (found === -1) {
      segments.push({ text: text.slice(cursor), highlight: false });
      break;
    }
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

function MessageResult({ result, query, onClick }: { result: SearchResult; query: string; onClick: () => void }) {
  const msg = result.message!;
  const preview = msg.body.length > 120 ? msg.body.slice(0, 120) + '…' : msg.body;
  const date = new Date(msg.createdAt);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/60 active:bg-muted transition-colors group"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <MessageSquare className="w-3.5 h-3.5 text-primary/70" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-semibold text-foreground truncate">
            <HighlightedText text={msg.conversationTitle || 'Conversation'} query={query} />
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{dateStr}</span>
        </div>
        <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
          <span className="text-muted-foreground font-medium mr-1">
            <HighlightedText text={msg.senderDisplayName} query={query} />:
          </span>
          <HighlightedText text={preview} query={query} />
        </p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

function ContactResult({ result, query }: { result: SearchResult; query: string }) {
  const contact = result.contact!;
  const initials = contact.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/60 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          <HighlightedText text={contact.displayName} query={query} />
        </p>
        <p className="text-xs text-muted-foreground truncate">
          <HighlightedText text={`@${contact.handle}`} query={query} />
        </p>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex-shrink-0 capitalize">
        {contact.trustLevel}
      </span>
    </div>
  );
}

export function SearchPanel({ onSelectConversation, onClose }: SearchPanelProps) {
  const { t } = useT();
  const FILTER_OPTIONS: { key: SearchFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all',      label: t('search.filterAll'),      icon: <Search className="w-3.5 h-3.5" /> },
    { key: 'messages', label: t('search.filterMessages'), icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'contacts', label: t('search.filterContacts'), icon: <Users className="w-3.5 h-3.5" /> },
  ];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('earthos.search.recent') ?? '[]');
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runSearch = useCallback(async (q: string, f: SearchFilter) => {
    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const found = await search(q, f);
      setResults(found);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(() => {
      runSearch(query, filter);
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, filter, runSearch]);

  function saveRecentQuery(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recentQueries.filter((r) => r !== trimmed)].slice(0, 5);
    setRecentQueries(next);
    try {
      localStorage.setItem('earthos.search.recent', JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function handleSelectMessage(result: SearchResult) {
    saveRecentQuery(query);
    onSelectConversation(result.message!.conversationId, result.message!.id);
    onClose();
  }

  const messageResults = results.filter((r) => r.type === 'message');
  const contactResults = results.filter((r) => r.type === 'contact');
  const hasResults = results.length > 0;
  const showEmpty = query.trim().length > 0 && !isSearching && !hasResults;

  return (
    <div className="flex flex-col h-full bg-background/98 backdrop-blur-xl overflow-hidden">
      {/* ── Search header ── */}
      <div className="flex-shrink-0 border-b border-border px-4 pt-safe-top pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/60 border border-border focus-within:border-primary/40 focus-within:bg-muted/80 transition-all">
            {isSearching ? (
              <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin flex-shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && query.trim()) saveRecentQuery(query);
              }}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            {t('search.cancel')}
          </button>
        </div>

        {/* ── Filter chips ── */}
        <div className="flex gap-1.5 mt-3">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${filter === opt.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                }
              `}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results / empty / recent ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* Recent queries (no active search) */}
        {!query.trim() && recentQueries.length > 0 && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-xs font-medium text-muted-foreground">{t('search.recentSearches')}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {recentQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!query.trim() && recentQueries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-8 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-4.5 h-4.5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('search.emptyTitle')}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t('search.emptyLocal')}
              </p>
            </div>
          </div>
        )}

        {/* No results */}
        {showEmpty && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-8 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-4.5 h-4.5 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t('search.noResultsTitle').replace('{query}', query)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('search.noResultsHint')}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {hasResults && (
          <div className="py-1">
            {/* Message results */}
            {messageResults.length > 0 && (
              <section>
                {(filter === 'all') && (
                  <div className="px-4 py-2 flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                      {t('search.messagesSection').replace('{n}', String(messageResults.length))}
                    </span>
                  </div>
                )}
                {messageResults.map((r) => (
                  <MessageResult
                    key={r.message!.id}
                    result={r}
                    query={query}
                    onClick={() => handleSelectMessage(r)}
                  />
                ))}
              </section>
            )}

            {/* Contact results */}
            {contactResults.length > 0 && (
              <section>
                {(filter === 'all') && (
                  <div className="px-4 py-2 flex items-center gap-2 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground/60" />
                    <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                      {t('search.contactsSection').replace('{n}', String(contactResults.length))}
                    </span>
                  </div>
                )}
                {contactResults.map((r) => (
                  <ContactResult key={r.contact!.earthId} result={r} query={query} />
                ))}
              </section>
            )}
          </div>
        )}
      </div>

      {/* ── Privacy footer ── */}
      <div className="flex-shrink-0 px-4 py-2.5 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground/40 text-center">
          {t('search.privacyFooter')}
        </p>
      </div>
    </div>
  );
}
