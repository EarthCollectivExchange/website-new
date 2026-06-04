'use client';

import { Eye, Code as Code2, User } from 'lucide-react';

export type ViewLevel = 'user' | 'advanced' | 'developer';

interface AdvancedViewSettingsProps {
  viewLevel: ViewLevel;
  onChange: (level: ViewLevel) => void;
}

const LEVELS: { key: ViewLevel; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'user',
    label: 'User view',
    description: 'Clean app experience. Dev panels, QA badges, and diagnostics are hidden.',
    icon: <User className="w-4 h-4" />,
  },
  {
    key: 'advanced',
    label: 'Advanced view',
    description: 'Shows Privacy, Delivery, and Consent panels inside conversations.',
    icon: <Eye className="w-4 h-4" />,
  },
  {
    key: 'developer',
    label: 'Developer mode',
    description: 'Reveals MVP status, First Mission, Release readiness, relay boundary, ledger, and QA diagnostics.',
    icon: <Code2 className="w-4 h-4" />,
  },
];

export function AdvancedViewSettings({ viewLevel, onChange }: AdvancedViewSettingsProps) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      {LEVELS.map((level, idx) => {
        const isActive = viewLevel === level.key;
        return (
          <button
            key={level.key}
            onClick={() => onChange(level.key)}
            className={`flex items-center gap-3 w-full px-3 py-3 text-left transition-colors
              ${idx < LEVELS.length - 1 ? 'border-b border-border' : ''}
              ${isActive ? 'bg-primary/8' : 'hover:bg-muted/50'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {level.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>{level.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{level.description}</p>
            </div>
            {isActive && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

const KEY = 'earthos.view_level';
const LEGACY_DEV_KEY = 'earthos.dev_mode';
const LEGACY_ADV_KEY = 'earthos.advanced_view';

export function loadViewLevel(): ViewLevel {
  if (typeof window === 'undefined') return 'user';
  const stored = localStorage.getItem(KEY) as ViewLevel | null;
  if (stored === 'user' || stored === 'advanced' || stored === 'developer') return stored;
  // Migrate from legacy keys
  const legacyDev = localStorage.getItem(LEGACY_DEV_KEY) === 'true';
  const legacyAdv = localStorage.getItem(LEGACY_ADV_KEY) === 'true';
  if (legacyDev) return 'developer';
  if (legacyAdv) return 'advanced';
  return 'user';
}

export function saveViewLevel(level: ViewLevel) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, level);
}
