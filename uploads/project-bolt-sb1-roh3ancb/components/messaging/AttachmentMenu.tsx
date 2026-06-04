'use client';

import { useEffect, useRef } from 'react';
import { FileText, Image, Mic, Flower2 } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

interface AttachmentMenuProps {
  onClose: () => void;
  onSelect: (type: 'file' | 'image' | 'voice_note' | 'ritual_note') => void;
  showFileOptions?: boolean;
  showVoiceOption?: boolean;
  showRitualNote?: boolean;
}

export function AttachmentMenu({
  onClose,
  onSelect,
  showFileOptions = true,
  showVoiceOption = true,
  showRitualNote = true,
}: AttachmentMenuProps) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);

  const ALL_OPTIONS = [
    { type: 'file' as const,        label: t('composer.file'),      icon: FileText, color: 'text-sky-400',   bg: 'bg-sky-500/10',   visible: showFileOptions },
    { type: 'image' as const,       label: t('composer.image'),     icon: Image,    color: 'text-teal-400',  bg: 'bg-teal-500/10',  visible: showFileOptions },
    { type: 'voice_note' as const,  label: t('composer.voiceNote'), icon: Mic,      color: 'text-amber-400', bg: 'bg-amber-500/10', visible: showVoiceOption },
    { type: 'ritual_note' as const, label: t('composer.ritualNote'),icon: Flower2,  color: 'text-rose-400',  bg: 'bg-rose-500/10',  visible: showRitualNote },
  ];
  const OPTIONS = ALL_OPTIONS.filter((o) => o.visible);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-full left-0 mb-2 w-44 rounded-2xl border border-border bg-background shadow-lg z-20 animate-in slide-in-from-bottom-2 duration-150">
      <ul className="p-[8px] space-y-[4px]">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <li key={opt.type}>
              <button
                onClick={() => { onSelect(opt.type); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <span className={`w-7 h-7 rounded-lg ${opt.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                </span>
                <span className="text-sm text-foreground">{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
