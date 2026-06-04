'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Pause, Play, X, Lock, HardDrive, Cloud, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import type { VoiceMemo, FileStorageMode, UserTier } from '@/lib/messaging/types';
import { TIER_LIMITS } from '@/lib/messaging/types';
import { encryptFileLocal, formatFileSize } from '@/lib/messaging/files';
import { useT } from '@/lib/i18n/useT';

const MAX_DURATION_MS = 3 * 60 * 1000; // 3 minutes

type RecorderState = 'idle' | 'permission_denied' | 'recording' | 'paused' | 'stopped' | 'encrypting' | 'ready' | 'failed';

interface VoiceRecorderPanelProps {
  conversationId: string;
  senderEarthId: string;
  tier?: UserTier;
  onMemoReady: (memo: VoiceMemo, messageBody: string) => void;
  onRecordingStarted?: () => void;
  onClose: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Thin waveform bars animated during recording
function WaveformBars({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 6, 4, 7, 5, 9, 6, 4, 7, 5, 8, 4, 6];
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full bg-primary/60 transition-all
            ${active ? 'animate-pulse' : 'opacity-30'}`}
          style={{
            height: active ? `${h * 3 + 4}px` : '4px',
            animationDelay: `${i * 60}ms`,
            animationDuration: `${600 + (i % 3) * 150}ms`,
          }}
        />
      ))}
    </div>
  );
}

// Static played-back waveform
function PlaybackWaveform({ durationMs }: { durationMs: number }) {
  const bars = [3, 5, 8, 6, 4, 7, 5, 9, 6, 4, 7, 5, 8, 4, 6, 3, 6, 8, 5, 4];
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary/50"
          style={{ height: `${h * 2 + 2}px` }}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground tabular-nums">
        {formatDuration(durationMs)}
      </span>
    </div>
  );
}

export function VoiceRecorderPanel({
  conversationId,
  senderEarthId,
  tier = 'free',
  onMemoReady,
  onRecordingStarted,
  onClose,
}: VoiceRecorderPanelProps) {
  const [recState, setRecState] = useState<RecorderState>('idle');
  const [durationMs, setDurationMs] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState('audio/webm');
  const [storageMode, setStorageMode] = useState<FileStorageMode>('local_only');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t } = useT();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const limits = TIER_LIMITS[tier];
  const canRelay = limits.allowedStorageModes.includes('encrypted_relay');

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Clamp at MAX_DURATION_MS
  useEffect(() => {
    if (recState === 'recording' && durationMs >= MAX_DURATION_MS) {
      handleStop();
    }
  }, [durationMs, recState]);

  useEffect(() => {
    return () => { stopTimer(); stopStream(); };
  }, [stopTimer, stopStream]);

  async function handleStart() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';
      setMimeType(mime);

      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: mime });
        setBlob(recorded);
        setRecState('stopped');
        stopStream();
      };

      mr.start(200); // collect data every 200ms
      startTimeRef.current = Date.now() - durationMs;
      setRecState('recording');
      onRecordingStarted?.();

      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('denied') || msg.includes('Permission') || msg.includes('NotAllowed')) {
        setRecState('permission_denied');
      } else {
        setRecState('failed');
        setErrorMsg(t('voice.micDeniedDesc'));
      }
    }
  }

  function handlePause() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      stopTimer();
      setRecState('paused');
    }
  }

  function handleResume() {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now() - durationMs;
      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 100);
      setRecState('recording');
    }
  }

  function handleStop() {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      stopStream();
      setRecState('stopped');
    }
  }

  function handleCancel() {
    stopTimer();
    stopStream();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    setDurationMs(0);
    setBlob(null);
    setRecState('idle');
    onClose();
  }

  async function handleSend() {
    if (!blob || recState !== 'stopped') return;
    setRecState('encrypting');

    try {
      // Encrypt the audio blob locally (same AES-GCM path as files)
      const audioFile = new File([blob], `voice-${Date.now()}.${mimeType.split('/')[1].split(';')[0]}`, { type: mimeType });
      const envelope = await encryptFileLocal(audioFile);
      const integrityHash = envelope.integrityHash;

      const id = `vm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();

      // Only create a local blob URL for local_only — relay mode doesn't expose content
      const localUrl = storageMode === 'local_only'
        ? URL.createObjectURL(blob)
        : undefined;

      const memo: VoiceMemo = {
        id,
        conversationId,
        senderEarthId,
        storageMode,
        status: storageMode === 'local_only' ? 'ready' : 'ready',
        durationMs,
        mimeType,
        sizeBytes: blob.size,
        integrityHash,
        retentionPolicy: storageMode === 'local_only' ? 'manual' : '7d',
        createdAt: now,
        localObjectUrl: localUrl,
        localBlob: storageMode === 'local_only' ? blob : undefined,
      };

      const modeLabel = storageMode === 'local_only' ? t('voice.localOnly') : t('voice.sealedRelay');
      const body = `[${t('voice.memo')} — ${formatDuration(durationMs)} — ${formatFileSize(blob.size)} — ${modeLabel}]`;

      setRecState('ready');
      onMemoReady(memo, body);
    } catch {
      setRecState('failed');
      setErrorMsg(t('errors.cryptoFailedDesc'));
    }
  }

  const isActive = recState === 'recording' || recState === 'paused';
  const hasRecording = recState === 'stopped';
  const isProcessing = recState === 'encrypting';
  const maxPct = Math.min((durationMs / MAX_DURATION_MS) * 100, 100);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background shadow-xl overflow-hidden w-full animate-in slide-in-from-bottom-2 duration-200">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary/70" />
          <span className="text-sm font-semibold text-foreground">{t('voice.memo')}</span>
        </div>
        <button
          onClick={handleCancel}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
          aria-label={t('voice.cancel')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">

        {/* Permission denied */}
        {recState === 'permission_denied' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{t('voice.micDeniedTitle')}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[260px]">
                {t('voice.micDeniedDesc')}
              </p>
            </div>
            <button
              onClick={() => setRecState('idle')}
              className="text-xs text-primary hover:underline"
            >
              {t('voice.tryAgain')}
            </button>
          </div>
        )}

        {/* Error */}
        {recState === 'failed' && errorMsg && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-destructive/8 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Idle — start prompt */}
        {recState === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-8 h-8 text-primary/70" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{t('voice.tapToRecord')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('voice.maxDuration')} {formatDuration(MAX_DURATION_MS)}</p>
            </div>
          </div>
        )}

        {/* Recording / paused */}
        {isActive && (
          <div className="flex flex-col items-center gap-3">
            <WaveformBars active={recState === 'recording'} />

            {/* Timer */}
            <div className="flex items-center gap-2">
              {recState === 'recording' && (
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              )}
              <span className="text-xl font-mono font-semibold text-foreground tabular-nums">
                {formatDuration(durationMs)}
              </span>
              <span className="text-xs text-muted-foreground">/ {formatDuration(MAX_DURATION_MS)}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${maxPct > 80 ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${maxPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Stopped — preview */}
        {hasRecording && blob && (
          <div className="flex flex-col gap-2">
            <PlaybackWaveform durationMs={durationMs} />
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{formatFileSize(blob.size)}</span>
              <span>{formatDuration(durationMs)}</span>
            </div>
          </div>
        )}

        {/* Encrypting */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-3 py-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">{t('voice.encryptingLocally')}</p>
          </div>
        )}

        {/* Storage mode selector */}
        {(isActive || hasRecording) && !isProcessing && (
          <div className="flex gap-2">
            <StorageModeChip
              mode="local_only"
              selected={storageMode === 'local_only'}
              disabled={false}
              onClick={() => setStorageMode('local_only')}
            />
            <StorageModeChip
              mode="encrypted_relay"
              selected={storageMode === 'encrypted_relay'}
              disabled={!canRelay}
              onClick={() => canRelay && setStorageMode('encrypted_relay')}
              disabledReason="Plus tier"
            />
          </div>
        )}

        {/* Privacy note */}
        {(isActive || hasRecording) && !isProcessing && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <Lock className="w-3 h-3" />
            <span>
              {storageMode === 'local_only'
                ? t('voice.audioLocalOnly')
                : t('voice.audioSealedRelay')}
            </span>
          </div>
        )}

        {/* Action buttons */}
        {recState === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" /> {t('voice.startRecording')}
          </button>
        )}

        {recState === 'recording' && (
          <div className="flex gap-2">
            <button
              onClick={handlePause}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-all flex items-center justify-center gap-2 text-foreground"
            >
              <Pause className="w-4 h-4" /> {t('messages.pause')}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/15 transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" /> {t('common.done')}
            </button>
          </div>
        )}

        {recState === 'paused' && (
          <div className="flex gap-2">
            <button
              onClick={handleResume}
              className="flex-1 py-2.5 rounded-xl border border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> {t('messages.play')}
            </button>
            <button
              onClick={handleStop}
              className="flex-1 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/15 transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" /> {t('common.done')}
            </button>
          </div>
        )}

        {hasRecording && (
          <div className="flex gap-2">
            <button
              onClick={() => { setBlob(null); setDurationMs(0); setRecState('idle'); }}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-all flex items-center justify-center gap-2 text-muted-foreground"
            >
              <X className="w-4 h-4" /> {t('voice.discard')}
            </button>
            <button
              onClick={handleSend}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {storageMode === 'local_only' ? t('voice.saveAndSend') : t('voice.sealAndSend')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── StorageModeChip ──────────────────────────────────────────────────────────

function StorageModeChip({
  mode,
  selected,
  disabled,
  onClick,
  disabledReason,
}: {
  mode: FileStorageMode;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  disabledReason?: string;
}) {
  const { t } = useT();
  const icon = mode === 'local_only' ? <HardDrive className="w-3 h-3" /> : <Cloud className="w-3 h-3" />;
  const label = mode === 'local_only' ? t('voice.localOnly') : t('voice.sealedRelay');
  const activeColor = mode === 'local_only'
    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
    : 'bg-sky-500/10 border-sky-500/30 text-sky-400';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-all
        ${selected ? activeColor : 'border-border text-muted-foreground hover:bg-muted/40'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon} {label}
      {disabled && disabledReason && <span className="opacity-60 text-[9px]">· {disabledReason}</span>}
    </button>
  );
}
