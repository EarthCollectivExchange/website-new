'use client';

import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Circle, Globe, Smartphone, Database, Code as Code2, Download, Lock, Radio, ShieldCheck, TriangleAlert as AlertTriangle, Package, FileText, Bell, Key } from 'lucide-react';
import type { LocalStore } from '@/lib/messaging/localPersistence';
import { ProductLoopPanel } from './ProductLoopPanel';
import { useT } from '@/lib/i18n/useT';

// ─── Types ────────────────────────────────────────────────────────────────────

type ItemStatus = 'ready' | 'demo' | 'blocked';

interface ReadinessItem {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  status: ItemStatus;
}

interface BlockerItem {
  key: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  severity: 'required' | 'recommended';
}

interface EnvItem {
  key: string;
  label: string;
  value: string;
  status: 'ok' | 'demo' | 'proto';
}

// ─── Data ────────────────────────────────────────────────────────────────────

const READINESS_ITEMS: ReadinessItem[] = [
  {
    key: 'pwa',
    label: 'PWA manifest',
    sublabel: 'manifest.json present, icons placeholder, standalone display mode.',
    icon: <Globe className="w-4 h-4" />,
    status: 'ready',
  },
  {
    key: 'mobile',
    label: 'Mobile layout',
    sublabel: '100dvh, safe area insets, bottom nav, no user-scalable.',
    icon: <Smartphone className="w-4 h-4" />,
    status: 'ready',
  },
  {
    key: 'local_messaging',
    label: 'Local-first messaging',
    sublabel: 'localStorage persistence, ledger events, export/reset all working.',
    icon: <Database className="w-4 h-4" />,
    status: 'ready',
  },
  {
    key: 'dev_mode',
    label: 'Developer mode hidden',
    sublabel: 'QA panels gated behind Settings → Developer mode toggle.',
    icon: <Code2 className="w-4 h-4" />,
    status: 'ready',
  },
  {
    key: 'data_portability',
    label: 'Export / reset available',
    sublabel: 'JSON export and local data reset accessible from Settings.',
    icon: <Download className="w-4 h-4" />,
    status: 'ready',
  },
  {
    key: 'consent',
    label: 'Consent engine',
    sublabel: 'QLPA consent + trust gradient enforced on every message.',
    icon: <ShieldCheck className="w-4 h-4" />,
    status: 'ready',
  },
  {
    key: 'auth',
    label: 'Auth',
    sublabel: 'Email/password via Supabase Auth — demo project, no production domain.',
    icon: <Lock className="w-4 h-4" />,
    status: 'demo',
  },
  {
    key: 'relay',
    label: 'Relay',
    sublabel: 'Relay envelope structure complete — transport layer is prototype only.',
    icon: <Radio className="w-4 h-4" />,
    status: 'demo',
  },
  {
    key: 'appstore',
    label: 'App Store build',
    sublabel: 'Not yet configured. Capacitor / Expo packaging not set up.',
    icon: <Package className="w-4 h-4" />,
    status: 'blocked',
  },
];

const ENV_ITEMS: EnvItem[] = [
  { key: 'mode',    label: 'App mode',       value: 'Demo / Bolt preview',     status: 'demo' },
  { key: 'auth',    label: 'Auth',           value: 'Supabase email (demo)',   status: 'demo' },
  { key: 'storage', label: 'Storage',        value: 'localStorage (local)',    status: 'ok'   },
  { key: 'sync',    label: 'Sync',           value: 'Supabase metadata only',  status: 'demo' },
  { key: 'crypto',  label: 'Encryption',     value: 'AES-GCM-256 prototype',   status: 'proto'},
  { key: 'relay',   label: 'Relay',          value: 'Envelope only, no transport', status: 'proto'},
];

const BLOCKERS: BlockerItem[] = [
  {
    key: 'auth_domain',
    label: 'Production auth domain',
    detail: 'Supabase project auth callback URL must be set to production domain before submission.',
    icon: <Lock className="w-3.5 h-3.5" />,
    severity: 'required',
  },
  {
    key: 'db_project',
    label: 'Production database project',
    detail: 'Current Supabase project is a shared demo. A dedicated project with RLS and backups is required.',
    icon: <Database className="w-3.5 h-3.5" />,
    severity: 'required',
  },
  {
    key: 'e2ee',
    label: 'Real E2EE key exchange',
    detail: 'Current encryption is local prototype. Full Diffie-Hellman / Signal Protocol key exchange is required.',
    icon: <Key className="w-3.5 h-3.5" />,
    severity: 'required',
  },
  {
    key: 'push',
    label: 'Push notifications',
    detail: 'No notification infrastructure yet. Requires APNs / FCM registration and service worker setup.',
    icon: <Bell className="w-3.5 h-3.5" />,
    severity: 'required',
  },
  {
    key: 'packaging',
    label: 'App Store / Play Store packaging',
    detail: 'PWA-only currently. Native packaging via Capacitor or Expo needed for store submission.',
    icon: <Package className="w-3.5 h-3.5" />,
    severity: 'required',
  },
  {
    key: 'legal',
    label: 'Privacy policy + terms',
    detail: 'Both documents required for App Store submission. Must accurately describe local-first data model.',
    icon: <FileText className="w-3.5 h-3.5" />,
    severity: 'required',
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ItemStatus, { icon: React.ReactNode; cls: string; label: string }> = {
  ready:   { icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', label: 'ready'   },
  demo:    { icon: <AlertCircle  className="w-3.5 h-3.5" />, cls: 'text-amber-400  bg-amber-500/10  border-amber-500/25',     label: 'demo'    },
  blocked: { icon: <Circle       className="w-3.5 h-3.5" />, cls: 'text-rose-400   bg-rose-500/10   border-rose-500/25',      label: 'not yet' },
};

const ENV_STATUS_CONFIG: Record<EnvItem['status'], { cls: string; label: string }> = {
  ok:    { cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300', label: 'ok'    },
  demo:  { cls: 'bg-amber-500/10  border-amber-500/25  text-amber-300',    label: 'demo'  },
  proto: { cls: 'bg-sky-500/10    border-sky-500/25    text-sky-300',      label: 'proto' },
};

// ─── Readiness row ────────────────────────────────────────────────────────────

function ReadinessRow({ item }: { item: ReadinessItem }) {
  const s = STATUS_CONFIG[item.status];
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5
        ${item.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400'
          : item.status === 'demo' ? 'bg-amber-500/10 text-amber-400'
          : 'bg-rose-500/10 text-rose-400'}`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold text-foreground">{item.label}</p>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${s.cls}`}>
            {s.icon}
            {s.label}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{item.sublabel}</p>
      </div>
    </div>
  );
}

// ─── Env row ──────────────────────────────────────────────────────────────────

function EnvRow({ item }: { item: EnvItem }) {
  const s = ENV_STATUS_CONFIG[item.status];
  return (
    <div className="flex items-center gap-2 py-2 border-b border-border last:border-0">
      <p className="text-xs font-medium text-foreground w-24 flex-shrink-0">{item.label}</p>
      <p className="flex-1 text-[10px] text-muted-foreground truncate">{item.value}</p>
      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${s.cls}`}>
        {s.label}
      </span>
    </div>
  );
}

// ─── Blocker row ──────────────────────────────────────────────────────────────

function BlockerRow({ item }: { item: BlockerItem }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-0">
      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center mt-0.5">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-foreground">{item.label}</p>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-rose-500/10 border-rose-500/25 text-rose-400">
            required
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{item.detail}</p>
      </div>
    </div>
  );
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function SummaryBar({ items }: { items: ReadinessItem[] }) {
  const ready   = items.filter((i) => i.status === 'ready').length;
  const demo    = items.filter((i) => i.status === 'demo').length;
  const blocked = items.filter((i) => i.status === 'blocked').length;
  const total   = items.length;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-muted/10 border-b border-border">
      <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden flex gap-px">
        <div className="bg-emerald-400 rounded-l-full transition-all" style={{ width: `${(ready / total) * 100}%` }} />
        <div className="bg-amber-400 transition-all"                  style={{ width: `${(demo  / total) * 100}%` }} />
        <div className="bg-rose-400 rounded-r-full transition-all"    style={{ width: `${(blocked / total) * 100}%` }} />
      </div>
      <div className="flex items-center gap-2 text-[9px] font-semibold flex-shrink-0">
        <span className="text-emerald-400">{ready} ready</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-amber-400">{demo} demo</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-rose-400">{blocked} pending</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ReleaseReadinessPanelProps {
  store?: LocalStore;
  viewerEarthId?: string;
  onStartConversation?: () => void;
  onExportData?: () => void;
}

export function ReleaseReadinessPanel({
  store,
  viewerEarthId = '',
  onStartConversation,
  onExportData,
}: ReleaseReadinessPanelProps = {}) {
  const { t } = useT();
  return (
    <div className="space-y-4">

      {/* ── First Mission loop ──────────────────────────────────────────── */}
      {store && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-foreground">First Mission progress</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Your product loop completion status</p>
          </div>
          <div className="px-4 py-3">
            <ProductLoopPanel
              store={store}
              viewerEarthId={viewerEarthId}
              onStartConversation={onStartConversation ?? (() => {})}
              onExportData={onExportData ?? (() => {})}
              compact
            />
          </div>
        </div>
      )}

      {/* ── Release Readiness ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-foreground">{t('dashboard.releaseReadiness')}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Current build status for public testing and app-store submission
          </p>
        </div>
        <SummaryBar items={READINESS_ITEMS} />
        <div className="px-4">
          {READINESS_ITEMS.map((item) => (
            <ReadinessRow key={item.key} item={item} />
          ))}
        </div>
      </div>

      {/* ── Environment Status ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-foreground">Environment status</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Active mode for each system layer
          </p>
        </div>
        <div className="px-4">
          {ENV_ITEMS.map((item) => (
            <EnvRow key={item.key} item={item} />
          ))}
        </div>
      </div>

      {/* ── Production Blockers ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-rose-500/25 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-rose-300">Production blockers</p>
            <p className="text-[10px] text-rose-400/80 mt-0.5">
              {BLOCKERS.length} items must be resolved before public release
            </p>
          </div>
        </div>
        <div className="px-4">
          {BLOCKERS.map((item) => (
            <BlockerRow key={item.key} item={item} />
          ))}
        </div>
      </div>

    </div>
  );
}
