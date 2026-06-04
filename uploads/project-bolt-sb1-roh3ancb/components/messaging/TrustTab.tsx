'use client';

import { ShieldCheck, Lock, Database, Radio, Users } from 'lucide-react';
import type { LocalStore } from '@/lib/messaging/localPersistence';
import { MVPStatusPanel } from './MVPStatusPanel';
import { useT } from '@/lib/i18n/useT';

interface TrustTabProps {
  store: LocalStore;
  viewerEarthId: string;
}

// ─── Principle card ───────────────────────────────────────────────────────────

const PRINCIPLE_TONE_BG: Record<string, string> = {
  water: 'bg-sky-500/10 border-sky-500/20',
  heart: 'bg-emerald-500/10 border-emerald-500/20',
  solar: 'bg-amber-500/10 border-amber-500/20',
  care:  'bg-rose-500/10 border-rose-500/20',
  crown: 'bg-violet-500/10 border-violet-500/20',
};
const PRINCIPLE_TONE_ICON: Record<string, string> = {
  water: 'text-sky-400',
  heart: 'text-emerald-400',
  solar: 'text-amber-400',
  care:  'text-rose-400',
  crown: 'text-violet-400',
};

function PrincipleCard({
  icon,
  title,
  desc,
  tone = 'heart',
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone?: 'water' | 'heart' | 'solar' | 'care' | 'crown';
}) {
  return (
    <div className="qlpa-glass-card flex items-start gap-3 p-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${PRINCIPLE_TONE_BG[tone]}`}>
        <span className={PRINCIPLE_TONE_ICON[tone]}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrustTab({ store, viewerEarthId }: TrustTabProps) {
  const { t } = useT();

  const TRUST_LEVELS = [
    { level: 'self',      bg: 'bg-emerald-500/8',  border: 'border-emerald-500/22', dot: 'bg-emerald-400',    text: 'text-emerald-300', label: t('trust.levelSelfLabel'),      desc: t('trust.levelSelfDesc') },
    { level: 'trusted',   bg: 'bg-sky-500/8',      border: 'border-sky-500/22',     dot: 'bg-sky-400',        text: 'text-sky-300',     label: t('trust.levelTrustedLabel'),   desc: t('trust.levelTrustedDesc') },
    { level: 'known',     bg: 'bg-teal-500/8',     border: 'border-teal-500/22',    dot: 'bg-teal-400',       text: 'text-teal-300',    label: t('trust.levelKnownLabel'),     desc: t('trust.levelKnownDesc') },
    { level: 'community', bg: 'bg-emerald-500/5',  border: 'border-emerald-500/16', dot: 'bg-emerald-400/60', text: 'text-emerald-400/80', label: t('trust.levelCommunityLabel'), desc: t('trust.levelCommunityDesc') },
    { level: 'unknown',   bg: 'bg-amber-500/8',    border: 'border-amber-500/20',   dot: 'bg-amber-400',      text: 'text-amber-300',   label: t('trust.levelUnknownLabel'),   desc: t('trust.levelUnknownDesc') },
    { level: 'blocked',   bg: 'bg-red-500/8',      border: 'border-red-500/20',     dot: 'bg-red-400',        text: 'text-red-300',     label: t('trust.levelBlockedLabel'),   desc: t('trust.levelBlockedDesc') },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="px-4 pt-safe-top pt-4 pb-3 border-b border-border/40">
        <h1 className="text-base font-semibold text-foreground">{t('trust.tabTitle')}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{t('trust.tabSubtitle')}</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-5 scrollbar-none pb-[80px]"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>

        {/* Principles */}
        <section>
          <p className="qlpa-section-label mb-2">{t('trust.sectionPrinciples')}</p>
          <div className="space-y-2">
            <PrincipleCard tone="heart" icon={<Lock className="w-4 h-4" />}       title={t('trust.principleE2ETitle')}       desc={t('trust.principleE2EDesc')} />
            <PrincipleCard tone="water" icon={<Database className="w-4 h-4" />}   title={t('trust.principleLocalTitle')}     desc={t('trust.principleLocalDesc')} />
            <PrincipleCard tone="heart" icon={<ShieldCheck className="w-4 h-4" />} title={t('trust.principleConsentTitle')}   desc={t('trust.principleConsentDesc')} />
            <PrincipleCard tone="solar" icon={<Radio className="w-4 h-4" />}       title={t('trust.principleRelayTitle')}     desc={t('trust.principleRelayDesc')} />
            <PrincipleCard tone="care"  icon={<Users className="w-4 h-4" />}       title={t('trust.principleGradientTitle')}  desc={t('trust.principleGradientDesc')} />
          </div>
        </section>

        {/* Trust levels */}
        <section>
          <p className="qlpa-section-label mb-2">{t('trust.sectionLevels')}</p>
          <div className="space-y-1.5">
            {TRUST_LEVELS.map((lvl) => (
              <div
                key={lvl.level}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${lvl.bg} ${lvl.border}`}
                style={{ backdropFilter: 'blur(12px)' }}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${lvl.dot}`} />
                <div>
                  <p className={`text-xs font-semibold ${lvl.text}`}>{lvl.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{lvl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MVP Status */}
        <section>
          <p className="qlpa-section-label mb-2">{t('trust.sectionStatus')}</p>
          <MVPStatusPanel store={store} viewerEarthId={viewerEarthId} />
        </section>

      </div>
    </div>
  );
}
