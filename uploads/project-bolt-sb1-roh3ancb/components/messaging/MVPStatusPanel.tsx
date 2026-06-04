'use client';

import {
  CircleCheck as CheckCircle2,
  Circle,
  ShieldCheck,
  Lock,
  Radio,
  Database,
  Users,
  Layers,
} from 'lucide-react';
import type { LocalStore } from '@/lib/messaging/localPersistence';
import { useT } from '@/lib/i18n/useT';

interface MVPStatusPanelProps {
  store: LocalStore;
  viewerEarthId: string;
  compact?: boolean;
}

interface StatusItem {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  ready: boolean;
  detail: string;
}

function StatusRow({ item, readyLabel, pendingLabel }: { item: StatusItem; readyLabel: string; pendingLabel: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex-shrink-0 mt-0.5">
        {item.ready ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground/30" />
        )}
      </div>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
        ${item.ready ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground/50'}`}
      >
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-xs font-semibold ${item.ready ? 'text-foreground' : 'text-muted-foreground/60'}`}>
            {item.label}
          </p>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0
            ${item.ready
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-muted/50 border-border text-muted-foreground/50'
            }`}>
            {item.ready ? readyLabel : pendingLabel}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{item.detail}</p>
      </div>
    </div>
  );
}

export function MVPStatusPanel({ store, viewerEarthId, compact = false }: MVPStatusPanelProps) {
  const { t } = useT();

  const hasIdentity = Boolean(viewerEarthId && viewerEarthId !== '');
  const hasConversation = store.conversations.length > 0;
  const hasEncryptedMessage = store.messages.some((m) => m.encryptionStatus === 'local_encrypted');
  const hasConsentActive = store.conversationSettings.some((s) => !s.isBlocked);
  const hasRelayEnvelope = store.messages.some((m) => m.relayEnvelope !== undefined);
  const hasLedgerEvents = store.ledgerEvents.length > 0;
  const hasMessage = store.messages.length > 0;
  const hasInvitedMember =
    store.ledgerEvents.some((e) => e.eventType === 'member_invited') ||
    store.members.some((m) => m.earthId !== viewerEarthId && m.earthId.startsWith('eid-sim-')) ||
    store.members.filter((m) => m.earthId !== viewerEarthId).length > 0;

  const encryptedCount = store.messages.filter((m) => m.encryptionStatus === 'local_encrypted').length;

  const loopSteps = [
    hasIdentity && t('mvp.loopStepIdentity'),
    hasConversation && t('mvp.loopStepConversation'),
    hasInvitedMember && t('mvp.loopStepMember'),
    hasEncryptedMessage && t('mvp.loopStepEncryption'),
    hasRelayEnvelope && t('mvp.loopStepRelay'),
  ].filter(Boolean) as string[];

  const items: StatusItem[] = [
    {
      key: 'identity',
      label: t('mvp.identityLabel'),
      sublabel: t('mvp.identitySublabel'),
      icon: <Users className="w-4 h-4" />,
      ready: hasIdentity,
      detail: hasIdentity
        ? t('mvp.identityActive').replace('{id}', viewerEarthId)
        : t('mvp.identityInactive'),
    },
    {
      key: 'consent',
      label: t('mvp.consentLabel'),
      sublabel: t('mvp.consentSublabel'),
      icon: <ShieldCheck className="w-4 h-4" />,
      ready: hasConsentActive,
      detail: hasConsentActive
        ? t('mvp.consentActive').replace('{n}', String(store.conversationSettings.length))
        : t('mvp.consentInactive'),
    },
    {
      key: 'encryption',
      label: t('mvp.encryptionLabel'),
      sublabel: t('mvp.encryptionSublabel'),
      icon: <Lock className="w-4 h-4" />,
      ready: hasEncryptedMessage,
      detail: hasEncryptedMessage
        ? t('mvp.encryptionActive').replace('{n}', String(encryptedCount))
        : t('mvp.encryptionInactive'),
    },
    {
      key: 'relay',
      label: t('mvp.relayLabel'),
      sublabel: t('mvp.relaySublabel'),
      icon: <Radio className="w-4 h-4" />,
      ready: hasRelayEnvelope,
      detail: hasRelayEnvelope ? t('mvp.relayActive') : t('mvp.relayInactive'),
    },
    {
      key: 'portability',
      label: t('mvp.portabilityLabel'),
      sublabel: t('mvp.portabilitySublabel'),
      icon: <Database className="w-4 h-4" />,
      ready: hasLedgerEvents || hasMessage,
      detail: hasLedgerEvents
        ? t('mvp.portabilityActive').replace('{n}', String(store.ledgerEvents.length))
        : t('mvp.portabilityInactive'),
    },
    {
      key: 'product_loop',
      label: t('mvp.loopLabel'),
      sublabel: t('mvp.loopSublabel'),
      icon: <Layers className="w-4 h-4" />,
      ready: hasIdentity && hasConversation && hasInvitedMember && hasEncryptedMessage && hasRelayEnvelope,
      detail: loopSteps.length === 5
        ? t('mvp.loopComplete')
        : t('mvp.loopStepsOf').replace('{done}', String(loopSteps.length)).replace('{steps}', loopSteps.join(', ')),
    },
  ];

  const readyCount = items.filter((i) => i.ready).length;
  const readyLabel = t('mvp.statusReady');
  const pendingLabel = t('mvp.statusPending');

  if (compact) {
    return (
      <div className="divide-y divide-border">
        {items.map((item) => (
          <StatusRow key={item.key} item={item} readyLabel={readyLabel} pendingLabel={pendingLabel} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/10">
        <div>
          <p className="text-xs font-semibold text-foreground">{t('mvp.panelTitle')}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t('mvp.panelSubtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {items.map((item) => (
              <div
                key={item.key}
                className={`w-1.5 h-4 rounded-full ${item.ready ? 'bg-emerald-400' : 'bg-border'}`}
                title={item.label}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {readyCount}/{items.length}
          </span>
        </div>
      </div>

      <div className="px-4 divide-y divide-border">
        {items.map((item) => (
          <StatusRow key={item.key} item={item} readyLabel={readyLabel} pendingLabel={pendingLabel} />
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(readyCount / items.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground flex-shrink-0">
            {readyCount === items.length
              ? t('mvp.fullLoopReady')
              : `${Math.round((readyCount / items.length) * 100)}${t('mvp.percentComplete')}`}
          </p>
        </div>
      </div>
    </div>
  );
}
