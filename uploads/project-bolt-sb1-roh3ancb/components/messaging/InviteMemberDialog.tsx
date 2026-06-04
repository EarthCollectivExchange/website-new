'use client';

import { useState } from 'react';
import { X, UserPlus, ShieldCheck, CircleAlert as AlertCircle } from 'lucide-react';
import type { ConversationMember, TrustLevel } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InviteFormValues {
  displayName: string;
  handle: string;
  role: ConversationMember['role'];
  trustLevel: TrustLevel;
}

interface InviteMemberDialogProps {
  conversationId: string;
  onInvite: (member: ConversationMember, displayName: string, handle: string) => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSimulatedEarthId(handle: string): string {
  const normalized = handle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8).padEnd(8, '0');
  return `eid-sim-${normalized}-${Date.now().toString(36).slice(-4)}`;
}

// ─── Form field ───────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold" style={{ color: 'rgba(200,230,255,0.80)' }}>{label}</label>
      {children}
      {hint && <p className="text-[10px]" style={{ color: 'rgba(140,180,220,0.55)' }}>{hint}</p>}
    </div>
  );
}

// ─── Shared input style ───────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  background: 'rgba(3,16,28,0.68)',
  border: '1px solid rgba(120,220,255,0.16)',
  borderRadius: 13,
  color: 'rgba(210,240,255,0.90)',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function InviteMemberDialog({
  conversationId,
  onInvite,
  onClose,
}: InviteMemberDialogProps) {
  const { t } = useT();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState<ConversationMember['role']>('member');
  const [trustLevel, setTrustLevel] = useState<TrustLevel>('known');
  const [error, setError] = useState('');

  const ROLE_OPTIONS: { value: ConversationMember['role']; label: string; description: string }[] = [
    { value: 'member',   label: t('invite.roleMember'),   description: t('invite.roleMemberDesc') },
    { value: 'observer', label: t('invite.roleObserver'), description: t('invite.roleObserverDesc') },
    { value: 'admin',    label: t('invite.roleAdmin'),    description: t('invite.roleAdminDesc') },
  ];

  // Trust level options — unified dark accent, no per-level light-mode colour
  const TRUST_OPTIONS: { value: TrustLevel; label: string }[] = [
    { value: 'trusted',   label: t('invite.trustTrusted') },
    { value: 'known',     label: t('invite.trustKnown') },
    { value: 'community', label: t('invite.trustCommunity') },
    { value: 'unknown',   label: t('invite.trustUnknown') },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) { setError(t('invite.errorDisplayName')); return; }
    if (!handle.trim()) { setError(t('invite.errorHandle')); return; }
    if (!/^@?[a-zA-Z0-9_.-]{2,30}$/.test(handle.trim().replace(/^@/, ''))) {
      setError(t('invite.errorHandleFormat'));
      return;
    }

    const normalizedHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
    const simulatedEarthId = generateSimulatedEarthId(handle);

    const member: ConversationMember = {
      id: `mem-invited-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId,
      earthId: simulatedEarthId,
      role,
      trustSnapshot: trustLevel,
      joinedAt: new Date().toISOString(),
    };

    onInvite(member, displayName.trim(), normalizedHandle);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 backdrop-blur-sm"
        style={{ background: 'rgba(2,10,20,0.72)' }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm rounded-2xl shadow-2xl pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-150"
          style={{
            background: 'rgba(5,24,38,0.92)',
            border: '1px solid rgba(80,200,240,0.18)',
            backdropFilter: 'blur(32px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'rgba(80,200,240,0.12)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(80,200,240,0.12)', border: '1px solid rgba(80,200,240,0.20)' }}
              >
                <UserPlus className="w-4 h-4" style={{ color: 'rgba(120,220,255,0.88)' }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'rgba(210,240,255,0.92)' }}>{t('invite.title')}</h2>
                <p className="text-[10px]" style={{ color: 'rgba(140,180,220,0.55)' }}>{t('invite.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{ color: 'rgba(140,180,220,0.55)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

            <Field label={t('invite.displayName')} hint={t('invite.displayNameHint')}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. River Nakamura"
                autoFocus
                className="w-full px-3 py-2 text-sm focus:outline-none transition-colors"
                style={{
                  ...INPUT_STYLE,
                  caretColor: 'rgba(120,220,255,0.88)',
                }}
              />
            </Field>

            <Field label={t('invite.handle')} hint={t('invite.handleHint')}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
                  style={{ color: 'rgba(140,180,220,0.50)' }}>
                  @
                </span>
                <input
                  type="text"
                  value={handle.replace(/^@/, '')}
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                  placeholder="handle"
                  className="w-full pl-7 pr-3 py-2 text-sm focus:outline-none transition-colors"
                  style={{
                    ...INPUT_STYLE,
                    caretColor: 'rgba(120,220,255,0.88)',
                  }}
                />
              </div>
            </Field>

            <Field label={t('invite.role')}>
              <div className="space-y-1.5">
                {ROLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors"
                    style={role === opt.value ? {
                      background: 'rgba(80,200,240,0.10)',
                      border: '1px solid rgba(80,200,240,0.28)',
                    } : {
                      background: 'rgba(5,24,38,0.52)',
                      border: '1px solid rgba(120,220,255,0.10)',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={role === opt.value}
                      onChange={() => setRole(opt.value)}
                      className="mt-0.5"
                      style={{ accentColor: 'rgba(80,200,240,0.88)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: 'rgba(200,230,255,0.88)' }}>{opt.label}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(140,180,220,0.55)' }}>{opt.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Field>

            <Field label={t('invite.trustLevel')} hint={t('invite.trustLevelHint')}>
              <div className="grid grid-cols-2 gap-1.5">
                {TRUST_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTrustLevel(opt.value)}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                    style={trustLevel === opt.value ? {
                      background: 'rgba(80,200,240,0.10)',
                      border: '1px solid rgba(80,200,240,0.36)',
                      color: 'rgba(220,248,255,0.92)',
                    } : {
                      background: 'rgba(5,24,38,0.52)',
                      border: '1px solid rgba(120,220,255,0.12)',
                      color: 'rgba(160,195,225,0.65)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Simulation notice */}
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(5,24,38,0.52)', border: '1px solid rgba(80,200,240,0.10)' }}
            >
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(120,200,240,0.50)' }} />
              <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(140,180,220,0.55)' }}>
                {t('invite.simulationNotice')}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(80,20,28,0.30)', border: '1px solid rgba(255,110,110,0.26)' }}
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,160,160,0.88)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,160,160,0.88)' }}>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: 'rgba(5,24,38,0.52)',
                  border: '1px solid rgba(120,220,255,0.12)',
                  color: 'rgba(160,195,225,0.65)',
                }}
              >
                {t('invite.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(180deg, rgba(80,200,240,0.34), rgba(24,108,138,0.34))',
                  border: '1px solid rgba(120,230,255,0.34)',
                  color: 'rgba(232,250,255,0.92)',
                  boxShadow: '0 0 13px rgba(80,200,240,0.14)',
                }}
              >
                {t('invite.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
