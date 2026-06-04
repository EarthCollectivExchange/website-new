'use client';

import { useState, useRef } from 'react';
import { ShieldCheck, Mail, Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ArrowLeft, X, Info } from 'lucide-react';
import { signInWithOtp } from '@/lib/messaging/authBridge';
import { useT } from '@/lib/i18n/useT';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'idle' | 'sending' | 'check_email' | 'error';

// ─── Component ────────────────────────────────────────────────────────────────

interface EarthIdSignInPanelProps {
  onClose: () => void;
}

export function EarthIdSignInPanel({ onClose }: EarthIdSignInPanelProps) {
  const { t } = useT();
  const [step, setStep] = useState<Step>('idle');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function isValidEmail(val: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErrorMessage(t('earthIdSignIn.invalidEmailError'));
      setStep('error');
      return;
    }

    setStep('sending');
    setErrorMessage('');

    const result = await signInWithOtp(email);

    if (result.sent) {
      setStep('check_email');
    } else {
      setErrorMessage(result.error ?? t('earthIdSignIn.sendFailedError'));
      setStep('error');
    }
  }

  function handleRetry() {
    setStep('idle');
    setErrorMessage('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground leading-tight">{t('syncPanel.connectEarthId')}</h2>
              <p className="text-[10px] text-muted-foreground">{t('earthIdSignIn.panelSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">

          {/* idle / error: show form */}
          {(step === 'idle' || step === 'error') && (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('earthIdSignIn.introText')}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="earth-id-email" className="text-xs font-medium text-foreground">
                    {t('earthIdSignIn.emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      ref={inputRef}
                      id="earth-id-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (step === 'error') setStep('idle');
                      }}
                      placeholder={t('earthIdSignIn.emailPlaceholder')}
                      autoComplete="email"
                      autoFocus
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background
                        text-sm text-foreground placeholder:text-muted-foreground/60
                        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                        transition-all"
                    />
                  </div>
                </div>

                {step === 'error' && errorMessage && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-destructive leading-relaxed">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!email.trim()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl
                    bg-primary text-primary-foreground text-sm font-medium
                    hover:opacity-90 active:scale-[0.98] transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('earthIdSignIn.sendLinkButton')}
                </button>
              </form>

              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border">
                <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {t('earthIdSignIn.supabaseNote')}
                </p>
              </div>
            </>
          )}

          {/* sending */}
          {step === 'sending' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">{t('earthIdSignIn.sendingTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('earthIdSignIn.sendingSubtitle')}</p>
              </div>
            </div>
          )}

          {/* check_email */}
          {step === 'check_email' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">{t('earthIdSignIn.checkEmailTitle')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('earthIdSignIn.checkEmailSent')}
                  </p>
                  <p className="text-xs font-medium text-foreground break-all">{email}</p>
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 border border-border px-3 py-2.5 space-y-1">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('earthIdSignIn.checkEmailInstructions')}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('earthIdSignIn.localMessagesNote')}
                </p>
              </div>

              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 text-xs text-muted-foreground
                  hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                {t('earthIdSignIn.differentEmailLink')}
              </button>
            </div>
          )}

        </div>

        {/* Footer note */}
        <div className="px-5 pb-4">
          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            {t('earthIdSignIn.footerNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
