'use client';

import { useState, useEffect } from 'react';
import {
  X, MessageCircle, FolderOpen, Calendar, Users, Heart,
  Sprout, MapPin, Database, ShieldCheck, ChevronRight, Check,
} from 'lucide-react';
import type {
  ConversationType, Conversation, ConversationMember, StorageMode, TrustLevel,
} from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';
import { QLPA_SPACE, QLPA_RADIUS, QLPA_MOTION } from '@/lib/qlpa/tokens';
import { useQLPARuntime } from '@/lib/qlpa/QLPARuntimeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConversationTypeOption {
  type: ConversationType;
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
}

type DrawerStep = 'type' | 'details' | 'sovereignty' | 'review';

interface NewConversationDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (conversation: Conversation, creatorMember: ConversationMember) => void;
  creatorEarthId: string;
}

// ─── DrawerShell sub-components ───────────────────────────────────────────────

function DrawerHeader({
  title,
  subtitle,
  step,
  totalSteps,
  onClose,
}: {
  title: string;
  subtitle: string;
  step: number;
  totalSteps: number;
  onClose: () => void;
}) {
  const { t } = useT();
  return (
    <div
      className="flex items-center justify-between flex-shrink-0"
      style={{
        padding: `${QLPA_SPACE.x13}px ${QLPA_SPACE.x21}px`,
        borderBottom: '1px solid rgba(80,200,240,0.08)',
      }}
    >
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(220,242,255,0.92)' }}>{title}</h2>
        <p style={{ fontSize: 11, color: 'rgba(140,200,235,0.50)', marginTop: 2 }}>{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {totalSteps > 1 && <DrawerProgress step={step} total={totalSteps} />}
        <button
          onClick={onClose}
          aria-label={t('newConversationDrawer.closeButton')}
          style={{
            width: 30, height: 30,
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(180,220,255,0.50)',
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

function DrawerProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all ${
            i === step
              ? 'w-4 h-1.5 bg-primary'
              : i < step
              ? 'w-1.5 h-1.5 bg-primary/40'
              : 'w-1.5 h-1.5 bg-border'
          }`}
        />
      ))}
    </div>
  );
}

function DrawerBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
      {children}
    </div>
  );
}

function DrawerFooter({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: `${QLPA_SPACE.x9}px ${QLPA_SPACE.x21}px`,
      paddingBottom: `calc(var(--qlpa-mobile-nav-h, 4rem) + max(env(safe-area-inset-bottom, 0px), ${QLPA_SPACE.x13}px))`,
      borderTop: '1px solid rgba(80,200,240,0.08)',
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

// ─── Nav button pair ──────────────────────────────────────────────────────────

function NavRow({
  onBack,
  onNext,
  nextLabel,
  nextType = 'button',
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel: string;
  nextType?: 'button' | 'submit';
}) {
  const { t } = useT();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: onBack ? '1fr 1fr' : '1fr', gap: QLPA_SPACE.x9, marginTop: QLPA_SPACE.x21 }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            height: QLPA_SPACE.x55,
            borderRadius: QLPA_RADIUS.soft,
            background: 'rgba(5,20,38,0.42)',
            border: '1px solid rgba(80,200,240,0.14)',
            color: 'rgba(160,210,240,0.60)',
            fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {t('newConversationDrawer.backButton')}
        </button>
      )}
      <button
        type={nextType}
        onClick={nextType === 'button' ? onNext : undefined}
        style={{
          height: QLPA_SPACE.x55,
          borderRadius: QLPA_RADIUS.soft,
          background: 'rgba(20,80,150,0.55)',
          border: '1px solid rgba(80,200,255,0.28)',
          color: 'rgba(210,242,255,0.90)',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

// ─── ConversationTypeButton ───────────────────────────────────────────────────

function ConversationTypeButton({
  option,
  onClick,
}: {
  option: ConversationTypeOption;
  onClick: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: `${QLPA_SPACE.x55}px 1fr ${QLPA_SPACE.x21}px`,
        alignItems: 'center',
        gap: QLPA_SPACE.x13,
        minHeight: QLPA_SPACE.x89,
        padding: `${QLPA_SPACE.x13}px 16px`,
        borderRadius: QLPA_RADIUS.card,
        background: 'rgba(5,24,38,0.72)',
        border: '1px solid rgba(80,220,255,0.16)',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        transition: `all ${QLPA_MOTION.fast}ms ${QLPA_MOTION.ease}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(10,40,70,0.80)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(80,220,255,0.28)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(5,24,38,0.72)';
        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(80,220,255,0.16)';
      }}
    >
      <div style={{
        width: 44, height: 44,
        borderRadius: QLPA_RADIUS.soft,
        background: `${option.accent}18`,
        border: `1px solid ${option.accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 18, height: 18, color: option.accent }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(220,242,255,0.90)', marginBottom: 3, lineHeight: 1.2 }}>
          {option.label}
        </p>
        <p style={{ fontSize: 12, color: 'rgba(140,200,235,0.52)', lineHeight: 1.5, whiteSpace: 'normal' }}>
          {option.description}
        </p>
      </div>
      <ChevronRight style={{ width: 16, height: 16, color: 'rgba(120,200,240,0.30)', flexShrink: 0 }} />
    </button>
  );
}

// ─── ReviewRow ────────────────────────────────────────────────────────────────

function ReviewRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: `${QLPA_SPACE.x9}px ${QLPA_SPACE.x13}px`,
      borderRadius: QLPA_RADIUS.soft,
      background: 'rgba(5,20,38,0.42)',
      border: '1px solid rgba(80,200,240,0.10)',
    }}>
      <p style={{ fontSize: 11, color: 'rgba(140,200,235,0.55)', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: accent ?? 'rgba(220,242,255,0.84)' }}>{value}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NewConversationDrawer({
  open,
  onClose,
  onCreated,
  creatorEarthId,
}: NewConversationDrawerProps) {
  const { t, locale } = useT();
  const { setActiveSheet } = useQLPARuntime();
  const [step, setStep] = useState<DrawerStep>('type');
  const [selectedType, setSelectedType] = useState<ConversationTypeOption | null>(null);

  // Sync open/close state with the canonical QLPA active sheet.
  // ConsentAction: 'invite-member' — opening this drawer initiates a new
  // conversation which may include inviting members.
  useEffect(() => {
    setActiveSheet(open ? 'new-conversation' : null);
  }, [open, setActiveSheet]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [storageMode, setStorageMode] = useState<StorageMode>('encrypted_relay');
  const [trustLevel, setTrustLevel] = useState<TrustLevel>('known');

  const CONVERSATION_TYPES: ConversationTypeOption[] = [
    { type: 'direct',         label: t('newConversation.typeDirect'),        description: t('newConversation.typeDirectDesc'),        icon: MessageCircle, accent: 'hsl(199 80% 58%)' },
    { type: 'project',        label: t('newConversation.typeProject'),        description: t('newConversation.typeProjectDesc'),        icon: FolderOpen,    accent: 'hsl(170 60% 52%)' },
    { type: 'event',          label: t('newConversation.typeEvent'),          description: t('newConversation.typeEventDesc'),          icon: Calendar,      accent: 'hsl(36 75% 58%)'  },
    { type: 'council',        label: t('newConversation.typeCouncil'),        description: t('newConversation.typeCouncilDesc'),        icon: Users,         accent: 'hsl(152 55% 52%)' },
    { type: 'support_circle', label: t('newConversation.typeSupportCircle'), description: t('newConversation.typeSupportCircleDesc'), icon: Heart,         accent: 'hsl(350 65% 62%)' },
    { type: 'cause',          label: t('newConversation.typeCause'),          description: t('newConversation.typeCauseDesc'),          icon: Sprout,        accent: 'hsl(88 55% 52%)'  },
    { type: 'place',          label: t('newConversation.typePlace'),          description: t('newConversation.typePlaceDesc'),          icon: MapPin,        accent: 'hsl(22 70% 58%)'  },
  ];

  const STORAGE_OPTIONS: { value: StorageMode; label: string; description: string }[] = [
    { value: 'encrypted_relay',  label: t('newConversation.storageRelayLabel'),  description: t('newConversation.storageRelayDesc') },
    { value: 'local_only',       label: t('newConversation.storageLocalLabel'),  description: t('newConversation.storageLocalDesc') },
    { value: 'encrypted_backup', label: t('newConversation.storageBackupLabel'), description: t('newConversation.storageBackupDesc') },
  ];

  const TRUST_OPTIONS: { value: TrustLevel; label: string; description: string }[] = [
    { value: 'trusted',   label: t('newConversation.trustTrustedLabel'),   description: t('newConversation.trustTrustedDesc') },
    { value: 'known',     label: t('newConversation.trustKnownLabel'),     description: t('newConversation.trustKnownDesc') },
    { value: 'community', label: t('newConversation.trustCommunityLabel'), description: t('newConversation.trustCommunityDesc') },
    { value: 'unknown',   label: t('newConversation.trustUnknownLabel'),   description: t('newConversation.trustUnknownDesc') },
  ];

  const isDirect    = selectedType?.type === 'direct';
  const totalSteps  = isDirect ? 1 : 4;
  const stepIndex   = step === 'type' ? 0 : step === 'details' ? 1 : step === 'sovereignty' ? 2 : 3;

  const STEP_HEADERS: Record<DrawerStep, { title: string; subtitle: string }> = {
    type:        { title: t('newConversation.drawerTitle'),     subtitle: t('newConversation.stepType') },
    details:     { title: `${selectedType?.label ?? ''} · ${t('newConversation.nameLabel')}`, subtitle: t('newConversation.stepDetails') },
    sovereignty: { title: t('newConversation.sovereigntyTitle'), subtitle: t('newConversation.stepSovereignty') },
    review:      { title: t('newConversationDrawer.reviewTitle'), subtitle: t('newConversationDrawer.reviewSubtitle') },
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: `${QLPA_SPACE.x9}px 14px`,
    borderRadius: QLPA_RADIUS.soft,
    background: 'rgba(5,20,38,0.60)',
    border: '1px solid rgba(80,200,240,0.16)',
    color: 'rgba(220,242,255,0.88)',
    fontSize: 14,
    outline: 'none',
    transition: `border-color ${QLPA_MOTION.fast}ms ease`,
  };

  const toggleRowStyle = (active: boolean): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: QLPA_SPACE.x13,
    minHeight: QLPA_SPACE.x55,
    padding: `${QLPA_SPACE.x9}px ${QLPA_SPACE.x13}px`,
    borderRadius: QLPA_RADIUS.soft,
    border: active ? '1px solid rgba(80,200,240,0.28)' : '1px solid rgba(80,200,240,0.10)',
    background: active ? 'rgba(20,60,100,0.30)' : 'rgba(5,20,38,0.42)',
    cursor: 'pointer',
    transition: `all ${QLPA_MOTION.fast}ms ease`,
  });

  function handleSelectType(option: ConversationTypeOption) {
    setSelectedType(option);
    if (option.type === 'direct') {
      createConversation(option.type);
    } else {
      setStep('details');
    }
  }

  function createConversation(
    type: ConversationType,
    convTitle?: string,
    convDesc?: string,
    storage?: StorageMode,
    trust?: TrustLevel,
  ) {
    const now = new Date().toISOString();
    const convId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const hasCustomTitle = Boolean(convTitle);
    const conv: Conversation = {
      id: convId,
      type,
      title: convTitle || undefined,
      titleKind: hasCustomTitle ? 'custom' : 'default',
      titleLocale: hasCustomTitle ? locale : undefined,
      description: convDesc || undefined,
      createdByEarthId: creatorEarthId,
      storageMode: storage ?? 'encrypted_relay',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      initialTrustLevel: trust,
    };
    const creatorMember: ConversationMember = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: convId,
      earthId: creatorEarthId,
      role: 'owner',
      trustSnapshot: 'self',
      joinedAt: now,
    };
    onCreated(conv, creatorMember);
    handleClose();
  }

  function handleDetailsNext(e: React.FormEvent) {
    e.preventDefault();
    setStep('sovereignty');
  }

  function handleSovereigntyNext(e: React.FormEvent) {
    e.preventDefault();
    setStep('review');
  }

  function handleCreate() {
    if (!selectedType) return;
    createConversation(selectedType.type, title.trim() || undefined, description.trim() || undefined, storageMode, trustLevel);
  }

  function handleClose() {
    setStep('type');
    setSelectedType(null);
    setTitle('');
    setDescription('');
    setStorageMode('encrypted_relay');
    setTrustLevel('known');
    onClose();
  }

  if (!open) return null;

  const { title: headerTitle, subtitle: headerSubtitle } = STEP_HEADERS[step];

  return (
    <>
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm animate-in fade-in duration-200"
        style={{ background: 'rgba(0,8,24,0.55)' }}
        onClick={handleClose}
      />

      <div
        className="fixed z-50 flex flex-col overflow-hidden min-h-0 new-conv-drawer-shell animate-sheet-up md:animate-in md:slide-in-from-left md:duration-300"
        style={{
          background: 'linear-gradient(180deg, hsl(218 44% 7% / 0.98) 0%, hsl(220 48% 5% / 0.99) 100%)',
        }}
      >
        <DrawerHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          step={stepIndex}
          totalSteps={totalSteps}
          onClose={handleClose}
        />

        <DrawerBody>

          {/* ── Step 1: Choose type ───────────────────────────────────── */}
          {step === 'type' && (
            <div style={{ padding: QLPA_SPACE.x13, display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x9 }}>
              {CONVERSATION_TYPES.map((option) => (
                <ConversationTypeButton
                  key={option.type}
                  option={option}
                  onClick={() => handleSelectType(option)}
                />
              ))}
            </div>
          )}

          {/* ── Step 2: Name and intention ────────────────────────────── */}
          {step === 'details' && selectedType && (
            <form
              onSubmit={handleDetailsNext}
              style={{ padding: `${QLPA_SPACE.x21}px`, display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x21 }}
            >
              {/* Selected type badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: QLPA_SPACE.x13,
                padding: `${QLPA_SPACE.x9}px ${QLPA_SPACE.x13}px`,
                borderRadius: QLPA_RADIUS.soft,
                background: `${selectedType.accent}10`,
                border: `1px solid ${selectedType.accent}22`,
              }}>
                <div style={{
                  width: 34, height: 34,
                  borderRadius: QLPA_RADIUS.soft,
                  background: `${selectedType.accent}18`,
                  border: `1px solid ${selectedType.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <selectedType.icon style={{ width: 16, height: 16, color: selectedType.accent }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(220,242,255,0.88)' }}>{selectedType.label}</p>
                  <p style={{ fontSize: 11, color: 'rgba(140,200,235,0.48)' }}>{selectedType.description}</p>
                </div>
              </div>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(180,220,255,0.60)', letterSpacing: '0.06em' }}>
                  {t('newConversation.nameLabel')}{' '}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>{t('newConversation.nameOptional')}</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={selectedType.label}
                  autoFocus
                  style={inputStyle}
                />
              </div>

              {/* Intention */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(180,220,255,0.60)', letterSpacing: '0.06em' }}>
                  {t('newConversation.intentionLabel')}{' '}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>{t('newConversation.nameOptional')}</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('newConversation.intentionPlaceholder')}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              <NavRow
                onBack={() => setStep('type')}
                nextLabel={t('newConversation.nextButton')}
                nextType="submit"
              />
            </form>
          )}

          {/* ── Step 3: Privacy and trust ─────────────────────────────── */}
          {step === 'sovereignty' && selectedType && (
            <form
              onSubmit={handleSovereigntyNext}
              style={{ padding: `${QLPA_SPACE.x21}px`, display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x21 }}
            >
              {/* Storage mode */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: QLPA_SPACE.x6, marginBottom: 4 }}>
                  <Database style={{ width: 13, height: 13, color: 'rgba(140,200,235,0.55)' }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(180,220,255,0.60)', letterSpacing: '0.06em' }}>
                    {t('newConversation.storageModeLabel')}
                  </p>
                </div>
                {STORAGE_OPTIONS.map((opt) => (
                  <label key={opt.value} style={toggleRowStyle(storageMode === opt.value)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(220,242,255,0.84)' }}>{opt.label}</p>
                      <p style={{ fontSize: 11, color: 'rgba(140,200,235,0.48)', lineHeight: 1.5 }}>{opt.description}</p>
                    </div>
                    <input
                      type="radio"
                      name="storage"
                      value={opt.value}
                      checked={storageMode === opt.value}
                      onChange={() => setStorageMode(opt.value)}
                      style={{ accentColor: 'hsl(192 65% 48%)', flexShrink: 0, justifySelf: 'end' }}
                    />
                  </label>
                ))}
              </div>

              {/* Trust level */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: QLPA_SPACE.x6, marginBottom: 4 }}>
                  <ShieldCheck style={{ width: 13, height: 13, color: 'rgba(140,200,235,0.55)' }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(180,220,255,0.60)', letterSpacing: '0.06em' }}>
                    {t('newConversation.trustLevelLabel')}
                  </p>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(89px, 1fr))',
                  gap: QLPA_SPACE.x9,
                }}>
                  {TRUST_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTrustLevel(opt.value)}
                      style={{
                        padding: `${QLPA_SPACE.x9}px ${QLPA_SPACE.x9}px`,
                        borderRadius: QLPA_RADIUS.soft,
                        border: trustLevel === opt.value ? '1px solid rgba(80,200,240,0.30)' : '1px solid rgba(80,200,240,0.10)',
                        background: trustLevel === opt.value ? 'rgba(20,60,100,0.35)' : 'rgba(5,20,38,0.42)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: `all ${QLPA_MOTION.fast}ms ease`,
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(220,242,255,0.84)' }}>{opt.label}</p>
                      <p style={{ fontSize: 10, color: 'rgba(140,200,235,0.45)', marginTop: 2, lineHeight: 1.4 }}>{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <NavRow
                onBack={() => setStep('details')}
                nextLabel={t('newConversation.nextButton')}
                nextType="submit"
              />
            </form>
          )}

          {/* ── Step 4: Review and create ─────────────────────────────── */}
          {step === 'review' && selectedType && (
            <div style={{ padding: `${QLPA_SPACE.x21}px`, display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x13 }}>
              {/* Summary icon */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: QLPA_SPACE.x13,
                padding: `${QLPA_SPACE.x13}px`,
                borderRadius: QLPA_RADIUS.card,
                background: `${selectedType.accent}10`,
                border: `1px solid ${selectedType.accent}22`,
                marginBottom: QLPA_SPACE.x9,
              }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: QLPA_RADIUS.soft,
                  background: `${selectedType.accent}18`,
                  border: `1px solid ${selectedType.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <selectedType.icon style={{ width: 20, height: 20, color: selectedType.accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(220,242,255,0.92)' }}>
                    {title || selectedType.label}
                  </p>
                  {description && (
                    <p style={{ fontSize: 11, color: 'rgba(140,200,235,0.55)', marginTop: 2, lineHeight: 1.5 }}>
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Review rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: QLPA_SPACE.x6 }}>
                <ReviewRow label={t('newConversationDrawer.reviewLabelType').toUpperCase()} value={selectedType.label} />
                <ReviewRow
                  label={t('newConversationDrawer.reviewLabelStorage').toUpperCase()}
                  value={STORAGE_OPTIONS.find((o) => o.value === storageMode)?.label ?? storageMode}
                />
                <ReviewRow
                  label={t('newConversationDrawer.reviewLabelTrust').toUpperCase()}
                  value={TRUST_OPTIONS.find((o) => o.value === trustLevel)?.label ?? trustLevel}
                />
              </div>

              {/* Create button */}
              <button
                onClick={handleCreate}
                style={{
                  marginTop: QLPA_SPACE.x13,
                  height: QLPA_SPACE.x55,
                  borderRadius: QLPA_RADIUS.soft,
                  background: 'rgba(20,80,150,0.65)',
                  border: '1px solid rgba(80,200,255,0.32)',
                  color: 'rgba(210,242,255,0.92)',
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Check style={{ width: 15, height: 15 }} />
                {t('newConversation.createButton')}
              </button>

              <button
                type="button"
                onClick={() => setStep('sovereignty')}
                style={{
                  height: 36,
                  borderRadius: QLPA_RADIUS.soft,
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(140,200,235,0.50)',
                  fontSize: 12, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {t('newConversationDrawer.backButton')}
              </button>
            </div>
          )}

        </DrawerBody>

        <DrawerFooter>
          <p style={{ fontSize: 10, color: 'rgba(120,180,220,0.38)', textAlign: 'center', lineHeight: 1.5 }}>
            {t('newConversation.footer')}
          </p>
        </DrawerFooter>
      </div>
    </>
  );
}
