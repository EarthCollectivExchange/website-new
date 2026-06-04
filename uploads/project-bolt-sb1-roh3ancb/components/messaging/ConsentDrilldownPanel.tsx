'use client';

import { X, ShieldCheck, ShieldOff, Clock, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle } from 'lucide-react';
import type { ConversationSovereigntySettings, TrustLevel } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

interface ConsentDrilldownPanelProps {
  trustLevel: TrustLevel;
  conversationSettings: ConversationSovereigntySettings;
  onUpdateSettings: (patch: Partial<ConversationSovereigntySettings> & { conversationId: string }) => void;
  onClose: () => void;
}

// ─── QLPA semantic state palette ─────────────────────────────────────────────

const STATE = {
  allowed: {
    bg:     'rgba(5,38,24,0.34)',
    border: 'rgba(97,214,178,0.24)',
    text:   'rgba(140,220,190,0.88)',
    icon:   'rgba(97,214,178,0.84)',
  },
  waiting: {
    bg:     'rgba(44,34,12,0.24)',
    border: 'rgba(218,190,108,0.20)',
    text:   'rgba(235,210,150,0.82)',
    icon:   'rgba(218,190,108,0.78)',
  },
  blocked: {
    bg:     'rgba(80,20,28,0.26)',
    border: 'rgba(255,110,110,0.24)',
    text:   'rgba(255,150,150,0.86)',
    icon:   'rgba(255,120,120,0.82)',
  },
};

// ─── Trust level dark glass palette ──────────────────────────────────────────

const TRUST_PALETTE: Record<TrustLevel, { bg: string; border: string; text: string }> = {
  self:      { bg: 'rgba(80,200,240,0.08)',  border: 'rgba(80,200,240,0.22)',  text: 'rgba(150,220,245,0.88)' },
  trusted:   { bg: 'rgba(5,38,24,0.34)',     border: 'rgba(97,214,178,0.24)',  text: 'rgba(140,220,190,0.88)' },
  known:     { bg: 'rgba(5,28,44,0.34)',     border: 'rgba(80,200,240,0.22)',  text: 'rgba(150,220,245,0.88)' },
  community: { bg: 'rgba(5,30,38,0.34)',     border: 'rgba(80,210,220,0.20)',  text: 'rgba(130,215,220,0.84)' },
  unknown:   { bg: 'rgba(44,34,12,0.24)',    border: 'rgba(218,190,108,0.20)', text: 'rgba(235,210,150,0.82)' },
  blocked:   { bg: 'rgba(80,20,28,0.26)',    border: 'rgba(255,110,110,0.24)', text: 'rgba(255,150,150,0.86)' },
};

// ─── ConsentToggle ────────────────────────────────────────────────────────────

function ConsentToggle({
  label,
  description,
  checked,
  onChange,
  destructive = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  destructive?: boolean;
}) {
  return (
    <div className="qlpa-toggle-row">
      <div className="qlpa-toggle-copy">
        <div className={`qlpa-toggle-title${destructive ? ' destructive' : ''}`}>{label}</div>
        <div className="qlpa-toggle-description">{description}</div>
      </div>
      <div className="qlpa-toggle-slot">
        <button
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className="qlpa-switch-track"
          style={{
            background: checked
              ? (destructive ? 'hsl(4 60% 50%)' : 'linear-gradient(135deg, hsl(192 52% 40%) 0%, hsl(194 48% 34%) 100%)')
              : 'hsl(214 32% 18%)',
            border: checked
              ? (destructive ? '1px solid hsl(4 60% 60% / 0.36)' : '1px solid hsl(192 60% 50% / 0.38)')
              : '1px solid hsl(214 30% 28%)',
          }}
        >
          <span
            className="qlpa-switch-thumb"
            style={{
              transform: checked ? 'translateX(16px)' : 'translateX(0px)',
              background: checked ? 'hsl(192 20% 96%)' : 'hsl(210 20% 52%)',
            }}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ConsentDrilldownPanel({
  trustLevel,
  conversationSettings,
  onUpdateSettings,
  onClose,
}: ConsentDrilldownPanelProps) {
  const { t } = useT();

  const TRUST_COPY: Record<TrustLevel, { label: string; body: string }> = {
    self:      { label: t('consent.trustSelf'),      body: t('consent.trustSelfBody') },
    trusted:   { label: t('consent.trustTrusted'),   body: t('consent.trustTrustedBody') },
    known:     { label: t('consent.trustKnown'),     body: t('consent.trustKnownBody') },
    community: { label: t('consent.trustCommunity'), body: t('consent.trustCommunityBody') },
    unknown:   { label: t('consent.trustUnknown'),   body: t('consent.trustUnknownBody') },
    blocked:   { label: t('consent.trustBlocked'),   body: t('consent.trustBlockedBody') },
  };

  const trust    = TRUST_COPY[trustLevel];
  const tp       = TRUST_PALETTE[trustLevel];
  const isBlocked = conversationSettings.isBlocked;
  const isPending = conversationSettings.requireApproval;
  const s = isBlocked ? STATE.blocked : isPending ? STATE.waiting : STATE.allowed;

  function patch(p: Partial<ConversationSovereigntySettings>) {
    onUpdateSettings({ ...p, conversationId: conversationSettings.conversationId });
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-phi-3 py-phi-2 border-b"
        style={{ borderColor: 'rgba(80,200,240,0.10)' }}
      >
        <div className="flex items-center gap-phi-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: isBlocked ? STATE.blocked.bg : 'rgba(80,200,240,0.10)',
              border: `1px solid ${isBlocked ? STATE.blocked.border : 'rgba(80,200,240,0.18)'}`,
            }}
          >
            {isBlocked
              ? <ShieldOff className="w-4 h-4" style={{ color: STATE.blocked.icon }} />
              : <ShieldCheck className="w-4 h-4" style={{ color: 'rgba(80,200,240,0.80)' }} />
            }
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('consent.title')}</h3>
            <p className="text-[10px] text-muted-foreground">{t('consent.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t('common.close')}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-phi-3 py-phi-3 space-y-phi-3" style={{ touchAction: 'pan-y' }}>

        {/* Current consent state — soft, not aggressive */}
        <div
          className="flex items-start gap-phi-2 p-phi-3 rounded-2xl"
          style={{ background: s.bg, border: `1px solid ${s.border}` }}
        >
          <div className="flex-shrink-0 mt-0.5">
            {isBlocked
              ? <AlertTriangle className="w-4 h-4" style={{ color: s.icon }} />
              : isPending
              ? <Clock className="w-4 h-4" style={{ color: s.icon }} />
              : <CheckCircle2 className="w-4 h-4" style={{ color: s.icon }} />
            }
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: s.text }}>
              {isBlocked ? t('consent.blocked') : isPending ? t('consent.pendingApproval') : t('consent.consentAllowed')}
            </p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: s.text, opacity: 0.78 }}>
              {isBlocked ? t('consent.blockedDesc') : isPending ? t('consent.pendingDesc') : t('consent.allowedDesc')}
            </p>
          </div>
        </div>

        {/* Trust level badge */}
        <div
          className="flex items-center gap-phi-2 px-phi-3 py-phi-2 rounded-2xl"
          style={{ background: tp.bg, border: `1px solid ${tp.border}` }}
        >
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tp.text }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: tp.text }}>
              {trust.label} {t('trust.trustLevel').toLowerCase()}
            </p>
            <p className="text-[10px] mt-0.5 leading-snug" style={{ color: tp.text, opacity: 0.72 }}>
              {trust.body}
            </p>
          </div>
        </div>

        {/* Editable consent toggles — contained, no overflow */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(5,18,34,0.55)', border: '1px solid rgba(80,200,240,0.10)' }}
        >
          <ConsentToggle
            label={t('consent.requireApproval')}
            description={t('consent.requireApprovalDesc')}
            checked={conversationSettings.requireApproval}
            onChange={(v) => patch({ requireApproval: v })}
          />
          <div style={{ height: 1, background: 'rgba(80,200,240,0.08)', margin: '0 16px' }} />
          <ConsentToggle
            label={t('consent.muteConversation')}
            description={t('consent.muteConversationDesc')}
            checked={conversationSettings.isMuted}
            onChange={(v) => patch({ isMuted: v })}
          />
          <div style={{ height: 1, background: 'rgba(80,200,240,0.08)', margin: '0 16px' }} />
          <ConsentToggle
            label={t('consent.blockConversation')}
            description={t('consent.blockConversationDesc')}
            checked={conversationSettings.isBlocked}
            onChange={(v) => patch({ isBlocked: v })}
            destructive
          />
        </div>
      </div>
    </div>
  );
}
