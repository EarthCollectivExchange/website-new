'use client';

import { X, Lock, Shield, Download, ChevronRight, Database, Key } from 'lucide-react';
import type { StorageMode, MessageEncryptionStatus } from '@/lib/messaging/types';
import { useT } from '@/lib/i18n/useT';

interface PrivacyDrilldownPanelProps {
  storageMode: StorageMode;
  encryptionStatus?: MessageEncryptionStatus;
  advancedView?: boolean;
  onExportData: () => void;
  onOpenAdvancedKeys?: () => void;
  onClose: () => void;
}

export function PrivacyDrilldownPanel({
  storageMode,
  encryptionStatus,
  advancedView = false,
  onExportData,
  onOpenAdvancedKeys,
  onClose,
}: PrivacyDrilldownPanelProps) {
  const { t } = useT();

  const STORAGE_COPY: Record<StorageMode, { headline: string; body: string; icon: React.ReactNode }> = {
    local_only: {
      headline: t('privacy.localOnlyHeadline'),
      body: t('privacy.localOnlyBody'),
      icon: <Shield className="w-5 h-5" style={{ color: 'rgba(97,214,178,0.88)' }} />,
    },
    encrypted_relay: {
      headline: t('privacy.relayHeadline'),
      body: t('privacy.relayBody'),
      icon: <Lock className="w-5 h-5" style={{ color: 'rgba(80,200,240,0.88)' }} />,
    },
    encrypted_backup: {
      headline: t('privacy.backupHeadline'),
      body: t('privacy.backupBody'),
      icon: <Database className="w-5 h-5" style={{ color: 'rgba(218,190,108,0.88)' }} />,
    },
  };

  const ENC_COPY: Record<MessageEncryptionStatus, { label: string; color: string }> = {
    local_encrypted:  { label: t('privacy.encLocalFull'), color: 'rgba(97,214,178,0.88)' },
    prototype_key:    { label: t('privacy.encProto'),     color: 'rgba(218,190,108,0.88)' },
    unencrypted:      { label: t('privacy.encNone'),      color: 'rgba(160,195,215,0.55)' },
    integrity_failed: { label: t('privacy.encFailed'),    color: 'rgba(255,130,130,0.88)' },
  };

  const storage = STORAGE_COPY[storageMode];
  const enc = encryptionStatus ? ENC_COPY[encryptionStatus] : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-phi-3 py-phi-2"
        style={{ borderBottom: '1px solid var(--qlpa-divider-soft)' }}
      >
        <div className="flex items-center gap-phi-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(80,200,240,0.08)', border: '1px solid var(--qlpa-divider-hairline)' }}
          >
            <Lock className="w-4 h-4" style={{ color: 'rgba(80,200,240,0.80)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('privacy.panelTitle')}</h3>
            <p className="text-[10px] text-muted-foreground">{t('privacy.howProtected')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors text-muted-foreground"
          aria-label={t('common.close')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-phi-3 py-phi-3 space-y-phi-3" style={{ touchAction: 'pan-y' }}>
        {/* Storage mode card */}
        <div className="glass-card rounded-2xl p-phi-4">
          <div className="flex items-start gap-phi-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(5,24,38,0.50)', border: '1px solid var(--qlpa-divider-hairline)' }}
            >
              {storage.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">{storage.headline}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{storage.body}</p>
            </div>
          </div>
        </div>

        {/* Encryption status */}
        {enc && (
          <div className="glass-card rounded-2xl p-phi-4">
            <div className="flex items-center gap-phi-2">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">{t('privacy.encryptionTitle')}</p>
                <p className="text-[11px] mt-0.5 font-medium" style={{ color: enc.color }}>{enc.label}</p>
              </div>
            </div>
          </div>
        )}

        {/* What this means */}
        <div
          className="px-phi-3 py-phi-3 rounded-2xl backdrop-blur-sm"
          style={{ background: 'rgba(80,200,240,0.05)', border: '1px solid var(--qlpa-divider-soft)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(140,210,240,0.85)' }}>
            <strong>{t('privacy.whatThisMeans')}</strong> {t('privacy.whatThisMeansBody')}
          </p>
        </div>

        {/* Export data */}
        <button
          onClick={onExportData}
          className="w-full flex items-center justify-between px-phi-3 py-phi-2 rounded-2xl glass-card hover:bg-muted/30 transition-colors active:scale-[0.99] touch-manipulation"
        >
          <div className="flex items-center gap-phi-2">
            <Download className="w-4 h-4 text-muted-foreground" />
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground">{t('privacy.exportDataLabel')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t('privacy.exportDataDesc')}</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        </button>

        {/* Advanced keys */}
        {advancedView && onOpenAdvancedKeys && (
          <button
            onClick={onOpenAdvancedKeys}
            className="w-full flex items-center justify-between px-phi-3 py-phi-2 rounded-2xl transition-colors active:scale-[0.99] touch-manipulation"
            style={{ background: 'rgba(5,24,38,0.52)', border: '1px solid rgba(80,200,240,0.12)' }}
          >
            <div className="flex items-center gap-phi-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground">{t('privacy.advancedKeys')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('privacy.advancedKeysDesc')}</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          </button>
        )}

        {!advancedView && (
          <p className="text-[10px] text-muted-foreground/50 text-center">
            {t('privacy.enableAdvanced')}
          </p>
        )}
      </div>
    </div>
  );
}
