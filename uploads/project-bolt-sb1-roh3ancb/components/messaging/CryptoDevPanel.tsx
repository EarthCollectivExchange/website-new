'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  RefreshCw,
  Copy,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  Loader as Loader2,
  Info,
  ShieldCheck,
  FlaskConical,
  ListChecks,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getDeviceCryptoMeta,
  generateDeviceKeyPair,
  exportPublicKey,
  verifyLocalMessageIntegrity,
  testEncryptDecryptRoundtrip,
  type CryptoDeviceMeta,
  type IntegrityCheckResult,
  type RoundtripTestResult,
} from '@/lib/messaging/crypto';
import type { Message } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionState = 'idle' | 'working' | 'done' | 'error';

interface CryptoDevPanelProps {
  messages: Message[];
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] text-muted-foreground w-[72px] flex-shrink-0">{label}</span>
      <span className={`text-[10px] text-foreground truncate ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── QA test result row ───────────────────────────────────────────────────────

function QARow({ label, passed, detail, passBadge, failBadge }: {
  label: string;
  passed: boolean;
  detail?: string;
  passBadge: string;
  failBadge: string;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
      {passed
        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
        : <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
      }
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {detail && <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{detail}</p>}
      </div>
      <span className={`flex-shrink-0 text-[10px] font-semibold ${passed ? 'text-emerald-600' : 'text-destructive'}`}>
        {passed ? passBadge : failBadge}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CryptoDevPanel({ messages }: CryptoDevPanelProps) {
  const { t } = useT();
  const [meta, setMeta] = useState<CryptoDeviceMeta | null>(null);
  const [regenState, setRegenState] = useState<ActionState>('idle');
  const [exportState, setExportState] = useState<ActionState>('idle');
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [integrityState, setIntegrityState] = useState<ActionState>('idle');
  const [integrityResult, setIntegrityResult] = useState<IntegrityCheckResult | null>(null);

  const [qaState, setQaState] = useState<ActionState>('idle');
  const [qaResult, setQaResult] = useState<RoundtripTestResult | null>(null);

  useEffect(() => {
    setMeta(getDeviceCryptoMeta());
  }, []);

  async function handleRegenerate() {
    if (regenState === 'working') return;
    setRegenState('working');
    setExportedKey(null);
    try {
      await generateDeviceKeyPair();
      setMeta(getDeviceCryptoMeta());
      setRegenState('done');
      setTimeout(() => setRegenState('idle'), 3000);
    } catch {
      setRegenState('error');
      setTimeout(() => setRegenState('idle'), 4000);
    }
  }

  async function handleExportKey() {
    if (exportState === 'working') return;
    setExportState('working');
    try {
      const key = await exportPublicKey();
      setExportedKey(key);
      setExportState('done');
    } catch {
      setExportState('error');
      setTimeout(() => setExportState('idle'), 4000);
    }
  }

  async function handleCopy() {
    if (!exportedKey) return;
    await navigator.clipboard.writeText(exportedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleIntegrityCheck() {
    if (integrityState === 'working') return;
    setIntegrityState('working');
    setIntegrityResult(null);
    try {
      const result = await verifyLocalMessageIntegrity(
        messages.map((m) => ({
          id: m.id,
          body: m.body,
          senderId: m.senderId,
          createdAt: m.createdAt,
          integrityHash: m.integrityHash,
        }))
      );
      setIntegrityResult(result);
      setIntegrityState('done');
    } catch {
      setIntegrityState('error');
      setTimeout(() => setIntegrityState('idle'), 4000);
    }
  }

  async function handleRunQA() {
    if (qaState === 'working') return;
    setQaState('working');
    setQaResult(null);
    try {
      const result = await testEncryptDecryptRoundtrip();
      setQaResult(result);
      setQaState('done');
    } catch {
      setQaState('error');
      setTimeout(() => setQaState('idle'), 4000);
    }
  }

  const regenLabel =
    regenState === 'working' ? t('cryptoPanel.regenWorking') :
    regenState === 'done'    ? t('cryptoPanel.regenDone') :
    regenState === 'error'   ? t('cryptoPanel.regenError') :
                               t('cryptoPanel.regenIdle');

  const exportLabel =
    exportState === 'working' ? t('cryptoPanel.exportWorking') :
    exportState === 'done'    ? t('cryptoPanel.exportDone') :
    exportState === 'error'   ? t('cryptoPanel.exportError') :
                                t('cryptoPanel.exportIdle');

  return (
    <div className="space-y-4">

      {/* Prototype warning */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/22">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[11px] font-semibold text-amber-300">{t('cryptoPanel.protoWarningTitle')}</p>
          <p className="text-[10px] text-amber-400/80 leading-relaxed">{t('cryptoPanel.protoWarningDesc')}</p>
        </div>
      </div>

      {/* ── Device key ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('cryptoPanel.deviceKeyTitle')}
          </p>
          {meta?.exists && (
            <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              {t('cryptoPanel.activeLabel')}
            </span>
          )}
        </div>
        <div className="px-3 py-2.5 space-y-2">
          {meta === null ? (
            <p className="text-[10px] text-muted-foreground">{t('cryptoPanel.loadingKey')}</p>
          ) : !meta.exists ? (
            <p className="text-[10px] text-muted-foreground">{t('cryptoPanel.noKeyFound')}</p>
          ) : (
            <>
              <Row label={t('cryptoPanel.rowAlgorithm')} value={meta.algorithm ?? '—'} mono />
              <Row label={t('cryptoPanel.rowFingerprint')} value={meta.publicKeyFingerprint ?? '—'} mono />
              <Row label={t('cryptoPanel.rowLabel')} value={meta.label ?? '—'} />
              <Row
                label={t('cryptoPanel.rowGenerated')}
                value={
                  meta.generatedAt
                    ? format(new Date(meta.generatedAt), 'MMM d, yyyy h:mm a')
                    : '—'
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Exported key display */}
      {exportedKey && (
        <div className="rounded-xl border border-border bg-muted/20 px-3 py-2.5 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t('cryptoPanel.publicKeyPlaceholder')}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[10px] font-mono text-foreground break-all leading-relaxed">
              {exportedKey}
            </code>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              title={t('cryptoPanel.copyToClipboard')}
            >
              {copied
                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                : <Copy className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>
      )}

      {/* Key action buttons */}
      <div className="space-y-2">
        <button
          onClick={handleExportKey}
          disabled={!meta?.exists || exportState === 'working'}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl
            border border-border bg-background text-xs font-medium text-muted-foreground
            hover:bg-muted hover:text-foreground transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exportState === 'working' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
           exportState === 'done'    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
                                       <Copy className="w-3.5 h-3.5" />}
          {exportLabel}
        </button>

        <button
          onClick={handleRegenerate}
          disabled={regenState === 'working'}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl
            border border-dashed border-border bg-background text-xs font-medium text-muted-foreground
            hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {regenState === 'working' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
           regenState === 'done'    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> :
           regenState === 'error'   ? <AlertCircle className="w-3.5 h-3.5 text-destructive" /> :
                                      <RefreshCw className="w-3.5 h-3.5" />}
          {regenLabel}
        </button>
      </div>

      {/* ── Integrity check ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
          <ListChecks className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">
            {t('cryptoPanel.integrityTitle')}
          </p>
          <button
            onClick={handleIntegrityCheck}
            disabled={integrityState === 'working'}
            className="flex items-center gap-1 text-[10px] font-medium text-primary
              hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {integrityState === 'working'
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <ShieldCheck className="w-3 h-3" />
            }
            {integrityState === 'working' ? t('cryptoPanel.integrityRunWorking') : t('cryptoPanel.integrityRunIdle')}
          </button>
        </div>

        <div className="px-3 py-3">
          {integrityResult === null ? (
            <p className="text-[10px] text-muted-foreground">{t('cryptoPanel.integrityDesc')}</p>
          ) : (
            <div className="space-y-2">
              <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${
                integrityResult.allPassed
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : 'bg-destructive/5 border-destructive/20'
              }`}>
                {integrityResult.allPassed
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                }
                <div className="space-y-0.5">
                  <p className={`text-[11px] font-semibold ${integrityResult.allPassed ? 'text-emerald-400' : 'text-destructive'}`}>
                    {integrityResult.allPassed
                      ? t('cryptoPanel.integrityAllPassed')
                      : (integrityResult.failedIds.length !== 1
                          ? t('cryptoPanel.integrityFailedPlural').replace('{n}', String(integrityResult.failedIds.length))
                          : t('cryptoPanel.integrityFailed').replace('{n}', String(integrityResult.failedIds.length)))
                    }
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t('cryptoPanel.integrityStats')
                      .replace('{checked}', String(integrityResult.checkedCount))
                      .replace('{skipped}', String(integrityResult.skippedCount))}
                  </p>
                </div>
              </div>

              {integrityResult.failedIds.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider">
                    {t('cryptoPanel.integrityFailedIds')}
                  </p>
                  {integrityResult.failedIds.map((id) => (
                    <p key={id} className="text-[10px] font-mono text-destructive/80 break-all leading-snug">{id}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Encrypt / Decrypt QA ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/20">
          <FlaskConical className="w-3 h-3 text-muted-foreground" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex-1">
            {t('cryptoPanel.qaTitle')}
          </p>
          <button
            onClick={handleRunQA}
            disabled={qaState === 'working'}
            className="flex items-center gap-1 text-[10px] font-medium text-primary
              hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {qaState === 'working'
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <FlaskConical className="w-3 h-3" />
            }
            {qaState === 'working' ? t('cryptoPanel.qaRunWorking') : t('cryptoPanel.qaRunIdle')}
          </button>
        </div>

        <div className="px-3 py-3">
          {qaResult === null ? (
            <p className="text-[10px] text-muted-foreground">{t('cryptoPanel.qaDesc')}</p>
          ) : (
            <div className="space-y-0">
              <QARow
                label={t('cryptoPanel.qaRoundtripLabel')}
                passed={qaResult.plaintextOut === qaResult.plaintextIn}
                detail={
                  qaResult.plaintextOut === qaResult.plaintextIn
                    ? t('cryptoPanel.qaRoundtripPass')
                    : qaResult.error ?? t('cryptoPanel.qaRoundtripFail')
                }
                passBadge={t('cryptoPanel.qaPassBadge')}
                failBadge={t('cryptoPanel.qaFailBadge')}
              />
              <QARow
                label={t('cryptoPanel.qaHashLabel')}
                passed={qaResult.hashMatch}
                detail={qaResult.hashMatch ? t('cryptoPanel.qaHashPass') : t('cryptoPanel.qaHashFail')}
                passBadge={t('cryptoPanel.qaPassBadge')}
                failBadge={t('cryptoPanel.qaFailBadge')}
              />
              <QARow
                label={t('cryptoPanel.qaOverallLabel')}
                passed={qaResult.passed}
                detail={qaResult.passed ? t('cryptoPanel.qaOverallPass') : qaResult.error ?? t('cryptoPanel.qaOverallFail')}
                passBadge={t('cryptoPanel.qaPassBadge')}
                failBadge={t('cryptoPanel.qaFailBadge')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border">
        <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {t('cryptoPanel.footerNote').replace('{key}', 'earthos.messaging.crypto')}
        </p>
      </div>

    </div>
  );
}
