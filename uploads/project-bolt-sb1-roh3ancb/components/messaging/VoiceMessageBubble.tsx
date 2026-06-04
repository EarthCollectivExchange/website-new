'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Download, HardDrive, Cloud, Lock,
  ShieldCheck, Clock, TriangleAlert as AlertTriangle,
  CircleCheck as CheckCircle2, Timer, Trash2,
  MoveHorizontal as MoreHorizontal,
} from 'lucide-react';
import type { VoiceMemo, FileStorageMode } from '@/lib/messaging/types';
import { formatFileSize } from '@/lib/messaging/files';
import { useExpiryCountdown } from '@/lib/messaging/hooks';
import { useT } from '@/lib/i18n/useT';

interface VoiceMessageBubbleProps {
  memo: VoiceMemo;
  isOwn: boolean;
  onPlay?: (memo: VoiceMemo) => void;
  onSave?: (memo: VoiceMemo) => void;
  onDeleteLocally?: (memoId: string) => void;
}

const STORAGE_ICONS: Record<FileStorageMode, React.ReactNode> = {
  local_only:      <HardDrive className="w-3 h-3" />,
  encrypted_relay: <Cloud className="w-3 h-3" />,
  encrypted_vault: <Cloud className="w-3 h-3" />,
};

const STORAGE_LABEL_KEYS: Record<FileStorageMode, string> = {
  local_only:      'voice.localOnly',
  encrypted_relay: 'voice.sealedRelay',
  encrypted_vault: 'voice.vault',
};

const STORAGE_COLOR: Record<FileStorageMode, string> = {
  local_only:      'text-emerald-400',
  encrypted_relay: 'text-sky-400',
  encrypted_vault: 'text-amber-400',
};

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const WAVEFORM_BARS = [3, 5, 8, 6, 4, 9, 5, 7, 4, 6, 8, 5, 3, 7, 6, 4, 8, 5, 6, 3];

function StaticWaveform({ isOwn, progress }: { isOwn: boolean; progress: number }) {
  const filledCount = Math.floor(progress * WAVEFORM_BARS.length);
  return (
    <div className="flex items-center gap-[2px] h-8 flex-1">
      {WAVEFORM_BARS.map((h, i) => (
        <div
          key={i}
          className="rounded-full transition-colors duration-150"
          style={{
            width: '3px',
            height: `${h * 2 + 2}px`,
            backgroundColor: i < filledCount
              ? (isOwn ? 'rgba(255,255,255,0.9)' : 'hsl(var(--primary))')
              : (isOwn ? 'rgba(255,255,255,0.3)' : 'hsl(var(--muted-foreground) / 0.3)'),
          }}
        />
      ))}
    </div>
  );
}

export function VoiceMessageBubble({ memo, isOwn, onPlay, onSave, onDeleteLocally }: VoiceMessageBubbleProps) {
  const { t } = useT();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const { label: expiryLabel, urgent: expiryUrgent, expired: timerExpired } = useExpiryCountdown(memo.expiresAt);
  const isExpired = memo.status === 'expired' || timerExpired;
  const isDeletedLocally = memo.deletedLocally ?? false;
  const canPlay = !!memo.localObjectUrl && !isExpired && !isDeletedLocally;

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showMenu) return;
    const handler = () => { setShowMenu(false); setConfirmDelete(false); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showMenu]);

  function handleDeleteClick() {
    if (isDeletedLocally) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDeleteLocally?.(memo.id);
    setShowMenu(false);
    setConfirmDelete(false);
  }

  function tick() {
    const audio = audioRef.current;
    if (!audio) return;
    const cur = audio.currentTime * 1000;
    const dur = audio.duration * 1000 || memo.durationMs;
    setCurrentMs(cur);
    setProgress(dur > 0 ? Math.min(cur / dur, 1) : 0);
    if (!audio.paused && !audio.ended) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }

  async function handlePlayPause() {
    if (!canPlay) return;

    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    // Create audio element if needed
    if (!audioRef.current) {
      const audio = new Audio(memo.localObjectUrl!);
      audio.onended = () => {
        setPlaying(false);
        setProgress(1);
        setCurrentMs(memo.durationMs);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        onPlay?.(memo);
      };
      audio.onerror = () => {
        setPlaying(false);
      };
      audioRef.current = audio;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      setPlaying(false);
    }
  }

  function handleSave() {
    if (!memo.localObjectUrl || !canPlay) return;
    const a = document.createElement('a');
    a.href = memo.localObjectUrl;
    a.download = `voice-memo-${memo.id}.${memo.mimeType.split('/')[1]?.split(';')[0] ?? 'webm'}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onSave?.(memo);
  }

  const displayDuration = playing ? formatDuration(currentMs) : formatDuration(memo.durationMs);

  return (
    <div className={`relative rounded-phi-lg border overflow-hidden min-w-[220px] max-w-[280px] shadow-nature
      ${isOwn
        ? 'rounded-br-[4px] border-primary/20 bg-primary text-primary-foreground'
        : 'rounded-bl-[4px] border-border bg-background'}
      ${isExpired || isDeletedLocally ? 'opacity-60' : ''}`}>

      <div className={`h-[3px] w-full ${isOwn ? 'bg-white/25' : 'bg-primary/20'}`} />

      <div className="p-3">
        {/* Player row */}
        <div className="relative flex items-center gap-3 mb-3">
          {/* Play/pause button */}
          <button
            onClick={handlePlayPause}
            disabled={!canPlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all touch-manipulation
              ${canPlay ? 'hover:opacity-80 active:scale-95' : 'opacity-40 cursor-not-allowed'}
              ${isOwn ? 'bg-white/20' : 'bg-primary/10'}`}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing
              ? <Pause className={`w-4 h-4 ${isOwn ? 'text-white' : 'text-primary'}`} />
              : <Play className={`w-4 h-4 ml-0.5 ${isOwn ? 'text-white' : 'text-primary'}`} />}
          </button>

          {/* Waveform + duration */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <StaticWaveform isOwn={isOwn} progress={progress} />
            <div className="flex items-center justify-between">
              <span className={`text-[10px] tabular-nums ${isOwn ? 'text-white/60' : 'text-muted-foreground'}`}>
                {displayDuration}
              </span>
              <span className={`text-[10px] ${isOwn ? 'text-white/50' : 'text-muted-foreground/60'}`}>
                {formatFileSize(memo.sizeBytes)}
              </span>
            </div>
          </div>

          {/* Actions menu trigger */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => { if (v) setConfirmDelete(false); return !v; }); }}
            className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 transition-colors
              ${showMenu
                ? (isOwn ? 'bg-white/20 text-white' : 'bg-muted text-foreground')
                : (isOwn ? 'text-white/50 hover:bg-white/15' : 'text-muted-foreground hover:bg-muted')}`}
            aria-label="Voice memo actions"
            aria-expanded={showMenu}
            aria-haspopup="menu"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Inline actions menu */}
          {showMenu && (
            <div
              className="absolute z-20 top-8 right-0 w-56 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleDeleteClick}
                disabled={isDeletedLocally}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors
                  ${isDeletedLocally
                    ? 'opacity-40 cursor-not-allowed'
                    : confirmDelete
                    ? 'bg-destructive/8 hover:bg-destructive/12'
                    : 'hover:bg-muted/60'}`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isDeletedLocally ? 'bg-muted' : confirmDelete ? 'bg-destructive/15' : 'bg-destructive/10'}`}>
                  <Trash2 className={`w-3.5 h-3.5 ${isDeletedLocally ? 'text-muted-foreground' : 'text-destructive'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight
                    ${isDeletedLocally ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {isDeletedLocally
                      ? t('voice.removedFromDevice')
                      : confirmDelete
                      ? t('voice.tapToConfirm')
                      : t('voice.deleteFromDevice')}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                    {isDeletedLocally ? t('voice.contentRemovedLocally') : t('voice.localOnlyNoRemote')}
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Storage + status row */}
        <div className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 mb-2
          ${isOwn ? 'bg-white/12' : 'bg-muted/60'}`}>
          <div className={`flex items-center gap-1.5 text-[10px] font-medium
            ${isOwn ? 'text-white/80' : STORAGE_COLOR[memo.storageMode]}`}>
            {STORAGE_ICONS[memo.storageMode]}
            <span>{t(STORAGE_LABEL_KEYS[memo.storageMode])}</span>
          </div>
          <StatusBadge memo={memo} isOwn={isOwn} />
        </div>

        {/* Encryption row */}
        {!isDeletedLocally && (
          <div className={`flex items-center gap-1.5 text-[10px] ${isOwn ? 'text-white/50' : 'text-muted-foreground/50'}`}>
            <Lock className="w-3 h-3" />
            <span>{memo.storageMode === 'local_only' ? t('messages.sealedBeforeSaving') : t('messages.sealedBeforeUpload')}</span>
            {memo.integrityHash.startsWith('sha256::') && (
              <><span className="mx-0.5">·</span><ShieldCheck className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">{t('messages.verified')}</span></>
            )}
          </div>
        )}

        {/* Deleted locally */}
        {isDeletedLocally && (
          <div className={`flex items-center gap-1.5 text-[10px] ${isOwn ? 'text-white/50' : 'text-muted-foreground/60'}`}>
            <AlertTriangle className="w-3 h-3" />
            <span>{t('voice.removedFromDevice')}</span>
          </div>
        )}

        {/* Expired */}
        {isExpired && !isDeletedLocally && (
          <div className={`flex items-center gap-1.5 text-[10px] mt-1 ${isOwn ? 'text-white/50' : 'text-muted-foreground/60'}`}>
            <Clock className="w-3 h-3" />
            <span>{t('messages.voiceMemoExpired')}</span>
          </div>
        )}

        {/* Explicit save button — only for recipient, only when local blob exists */}
        {!isOwn && canPlay && memo.storageMode === 'local_only' && (
          <button
            onClick={handleSave}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium
              bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all touch-manipulation"
          >
            <Download className="w-3.5 h-3.5" /> {t('voice.saveAudio')}
          </button>
        )}

        {/* Expiry countdown */}
        {expiryLabel && !isExpired && (
          <div className={`flex items-center justify-center gap-1 mt-1.5
            ${expiryUrgent
              ? (isOwn ? 'text-amber-200' : 'text-amber-400')
              : (isOwn ? 'text-white/40' : 'text-muted-foreground/40')
            }`}>
            <Timer className="w-2.5 h-2.5" />
            <p className="text-[9px] tabular-nums">{expiryLabel}</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ memo, isOwn }: { memo: VoiceMemo; isOwn: boolean }) {
  const { t } = useT();
  switch (memo.status) {
    case 'ready':
      return (
        <span className={`flex items-center gap-1 text-[10px] font-medium ${isOwn ? 'text-white/70' : 'text-emerald-600 dark:text-emerald-400'}`}>
          <CheckCircle2 className="w-3 h-3" />
          {memo.storageMode === 'local_only' ? t('voice.savedLocally') : t('voice.sealed')}
        </span>
      );
    case 'played':
      return (
        <span className={`flex items-center gap-1 text-[10px] ${isOwn ? 'text-white/70' : 'text-muted-foreground/60'}`}>
          <CheckCircle2 className="w-3 h-3" /> {t('voice.played')}
        </span>
      );
    case 'encrypting':
      return <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>{t('voice.encrypting')}</span>;
    case 'expired':
      return (
        <span className={`flex items-center gap-1 text-[10px] ${isOwn ? 'text-white/70' : 'text-muted-foreground/60'}`}>
          <Clock className="w-3 h-3" /> {t('voice.expired')}
        </span>
      );
    case 'failed':
      return (
        <span className={`flex items-center gap-1 text-[10px] ${isOwn ? 'text-white/70' : 'text-destructive'}`}>
          <AlertTriangle className="w-3 h-3" /> {t('voice.failed')}
        </span>
      );
    default:
      return null;
  }
}
