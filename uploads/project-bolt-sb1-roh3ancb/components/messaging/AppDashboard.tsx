'use client';

import { useState } from 'react';
import {
  ShieldCheck, Lock, Database, Globe, ChevronDown, ChevronUp,
  CircleCheck as CheckCircle2, Circle, Radio, Package, Download, Users,
} from 'lucide-react';
import type { LocalStore } from '@/lib/messaging/localPersistence';
import type { Locale } from '@/lib/i18n/useT';
import { useT } from '@/lib/i18n/useT';
import { LOCALES } from '@/lib/i18n/dictionary';
import { ProductLoopPanel } from './ProductLoopPanel';
import { MVPStatusPanel } from './MVPStatusPanel';

interface AppDashboardProps {
  store: LocalStore;
  viewerEarthId: string;
  locale: Locale;
  onStartConversation: () => void;
  onExportData: () => void;
  t: (key: string) => string;
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
      style={ok
        ? { background: 'hsl(158 58% 46% / 0.12)', borderColor: 'hsl(158 58% 46% / 0.28)', color: 'hsl(158 58% 68%)' }
        : { background: 'hsl(214 30% 16% / 0.60)', borderColor: 'hsl(214 30% 28% / 0.40)', color: 'hsl(210 16% 58%)' }
      }>
      {ok
        ? <CheckCircle2 className="w-2.5 h-2.5" />
        : <Circle className="w-2.5 h-2.5" />
      }
      {label}
    </span>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function DashSection({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="qlpa-glass-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/4 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground">{title}</span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppDashboard({
  store,
  viewerEarthId,
  locale,
  onStartConversation,
  onExportData,
  t,
}: AppDashboardProps) {
  const { t: tLocal } = useT();
  const hasEncryption = store.messages.some((m) => m.encryptionStatus === 'local_encrypted');
  const hasIdentity = Boolean(viewerEarthId && viewerEarthId !== '');
  const localeName = LOCALES.find((l) => l.code === locale)?.nativeName ?? locale;

  return (
    <div className="w-full space-y-3">
      {/* Dashboard header — text only, logo lives in the sidebar header */}
      <div className="px-1 pt-1">
        <p className="text-sm font-semibold text-foreground">{t('dashboard.title')}</p>
        <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-snug">
          {t('identityCard.title')}
        </p>
      </div>

      {/* Quick status strip */}
      <div className="qlpa-glass-card px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Database className="w-3 h-3" /> {t('dashboard.localFirst')}
            </span>
            <StatusPill ok={true} label={t('dashboard.localFirstActive')} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> {t('dashboard.encryption')}
            </span>
            <StatusPill ok={hasEncryption} label={hasEncryption ? t('dashboard.encryptionActive') : 'AES-GCM-256'} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {tLocal('dashboard.identity')}
            </span>
            <StatusPill ok={hasIdentity} label={hasIdentity ? viewerEarthId.slice(0, 12) + '…' : tLocal('dashboard.notSet')} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" /> {t('dashboard.language')}
            </span>
            <StatusPill ok={true} label={localeName} />
          </div>
        </div>
      </div>

      {/* First Mission — closed by default */}
      <DashSection icon={<Radio className="w-3.5 h-3.5" />} title={t('dashboard.firstMission')} defaultOpen={false}>
        <div className="p-3">
          <ProductLoopPanel
            store={store}
            viewerEarthId={viewerEarthId}
            onStartConversation={onStartConversation}
            onExportData={onExportData}
          />
        </div>
      </DashSection>

      {/* MVP Status — closed by default */}
      <DashSection icon={<ShieldCheck className="w-3.5 h-3.5" />} title={t('dashboard.mvpStatus')} defaultOpen={false}>
        <div className="p-3">
          <MVPStatusPanel store={store} viewerEarthId={viewerEarthId} compact />
        </div>
      </DashSection>
    </div>
  );
}
