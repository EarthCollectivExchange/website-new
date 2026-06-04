'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, Database, ArrowRight, Loader as Loader2, Eye, EyeOff } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import { EarthOSLogoTile } from '@/components/EarthOSLogo';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onContinueLocal: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onCreateAccount: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

type Screen = 'welcome' | 'sign_in' | 'create';

// ─── Feature pill ─────────────────────────────────────────────────────────────

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-500/18 text-xs text-sky-300/80"
      style={{ background: 'hsl(212 48% 11% / 0.55)', backdropFilter: 'blur(12px)' }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ─── Auth form ────────────────────────────────────────────────────────────────

function AuthForm({
  mode,
  onSubmit,
  onBack,
  isLoading,
  error,
}: {
  mode: 'sign_in' | 'create';
  onSubmit: (email: string, password: string) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
}) {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isCreate = mode === 'create';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(email.trim(), password);
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-12 pb-6">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          {t('auth.back')}
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 gap-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {isCreate ? t('auth.createEarthIdTitle') : t('auth.signInTitle')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isCreate ? t('auth.createEarthIdSubtitle') : t('auth.signInSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">{t('auth.emailLabel')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-sky-500/20 text-sm
                text-foreground placeholder:text-muted-foreground/50
                focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500/35 transition-all"
              style={{ background: 'hsl(212 48% 11% / 0.65)', backdropFilter: 'blur(16px)', boxShadow: '0 1px 0 hsl(192 70% 80% / 0.05) inset' }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">{t('auth.passwordLabel')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isCreate ? t('auth.passwordPlaceholderCreate') : t('auth.passwordPlaceholderSignIn')}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-11 rounded-xl border border-sky-500/20 text-sm
                  text-foreground placeholder:text-muted-foreground/50
                  focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500/35 transition-all"
                style={{ background: 'hsl(212 48% 11% / 0.65)', backdropFilter: 'blur(16px)', boxShadow: '0 1px 0 hsl(192 70% 80% / 0.05) inset' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl qlpa-soft-danger">
              <p className="text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3.5 rounded-xl qlpa-primary-water text-sm font-semibold
              hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
              transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isCreate ? t('auth.creatingAccount') : t('auth.signingIn')}
              </>
            ) : (
              isCreate ? t('auth.createEarthIdButton') : t('auth.signInButton')
            )}
          </button>
        </form>

        {isCreate && (
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            {t('auth.consentNotice')}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OnboardingScreen({
  onContinueLocal,
  onSignIn,
  onCreateAccount,
  isLoading = false,
  error = null,
}: OnboardingScreenProps) {
  const { t } = useT();
  const [screen, setScreen] = useState<Screen>('welcome');

  if (screen === 'sign_in') {
    return (
      <div className="flex flex-col h-full bg-transparent">
        <AuthForm
          mode="sign_in"
          onSubmit={onSignIn}
          onBack={() => setScreen('welcome')}
          isLoading={isLoading}
          error={error}
        />
      </div>
    );
  }

  if (screen === 'create') {
    return (
      <div className="flex flex-col h-full bg-transparent">
        <AuthForm
          mode="create"
          onSubmit={onCreateAccount}
          onBack={() => setScreen('welcome')}
          isLoading={isLoading}
          error={error}
        />
      </div>
    );
  }

  // Welcome screen — background is owned by NatureBackdrop (earthos-earth-moon-hero in portrait,
  // earthos-space-sunrise-shell in landscape). This component is transparent glass above it.
  return (
    <div className="flex flex-col h-full bg-transparent">

      {/* Spacer — lets Earth/sunrise show through the top half of the screen */}
      <div className="flex-1" />

      {/* Glass content panel — floats above the Earth backdrop */}
      <div className="flex flex-col items-center px-8 pb-10 gap-8">

        {/* Mark — crystalline glass tile */}
        <EarthOSLogoTile tileSize={89} symbolSize={72} badge />

        {/* Wordmark + tagline */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('onboarding.appName')}</h1>
          <p className="text-base font-medium text-sky-300">{t('onboarding.appSubtitle')}</p>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mt-3">
            {t('onboarding.tagline')}
            <br />
            {t('onboarding.taglineTwo')}
          </p>
        </div>

        {/* Feature pills — glass */}
        <div className="flex flex-wrap justify-center gap-2">
          <FeaturePill icon={<Lock className="w-3.5 h-3.5" />} label={t('onboarding.featureE2E')} />
          <FeaturePill icon={<Database className="w-3.5 h-3.5" />} label={t('onboarding.featureLocalFirst')} />
          <FeaturePill icon={<ShieldCheck className="w-3.5 h-3.5" />} label={t('onboarding.featureConsent')} />
        </div>

        {/* Action buttons — glass panel */}
        <div className="w-full space-y-3 max-w-sm">
          <button
            onClick={() => setScreen('create')}
            className="w-full py-4 rounded-2xl qlpa-primary-water text-base font-semibold
              hover:opacity-90 active:scale-[0.98] transition-all
              flex items-center justify-center gap-2"
          >
            {t('onboarding.createEarthId')}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setScreen('sign_in')}
            className="w-full py-3.5 rounded-2xl border border-sky-500/18 text-sm font-semibold
              text-foreground/80 hover:border-sky-500/30 hover:text-foreground active:scale-[0.98] transition-all"
            style={{ background: 'hsl(212 48% 11% / 0.55)', backdropFilter: 'blur(16px)' }}
          >
            {t('onboarding.signInAction')}
          </button>

          <button
            onClick={onContinueLocal}
            className="w-full py-3 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            {t('onboarding.continueLocalAction')}
          </button>

          <p className="text-center text-[10px] text-muted-foreground/60 leading-relaxed">
            {t('onboarding.noAccountNotice')}
            <br />
            {t('onboarding.noAccountSyncNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}
