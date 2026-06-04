'use client';

import { MessageCircle, Users, ShieldCheck, Settings } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';
import { CSS_VARS } from '@/lib/qlpa/layoutTokens';

export type BottomNavTab = 'messages' | 'contacts' | 'trust' | 'settings';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
  unreadCount?: number;
}

export function BottomNav({ activeTab, onTabChange, unreadCount = 0 }: BottomNavProps) {
  const { t } = useT();

  const TABS: { id: BottomNavTab; label: string; Icon: React.ElementType }[] = [
    { id: 'messages',  label: t('nav.messages'),  Icon: MessageCircle },
    { id: 'contacts',  label: t('nav.contacts'),  Icon: Users },
    { id: 'trust',     label: t('nav.trust'),     Icon: ShieldCheck },
    { id: 'settings',  label: t('nav.settings'),  Icon: Settings },
  ];

  return (
    <nav
      className="flex-shrink-0 flex items-stretch border-t border-sky-500/10
        backdrop-blur-xl safe-area-bottom"
      style={{ background: 'hsl(214 40% 8% / 0.55)', boxShadow: '0 -1px 0 hsl(194 55% 70% / 0.10), 0 -8px 32px hsl(218 40% 4% / 0.40)' }}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        const showBadge = id === 'messages' && unreadCount > 0;

        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-[0.3125rem]
              px-phi-3 relative transition-colors duration-150
              touch-manipulation select-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
              ${isActive ? 'text-sky-400' : 'text-muted-foreground/70 active:text-foreground'}`}
            style={{ minHeight: `var(${CSS_VARS.bottomNavH}, 4.5rem)` }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Active indicator bar */}
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px]
                rounded-full animate-scale-in"
                style={{ background: 'linear-gradient(90deg, hsl(192 70% 52% / 0.80), hsl(194 65% 58% / 0.95), hsl(192 70% 52% / 0.80))' }}
              />
            )}

            {/* Icon */}
            <div className="relative w-[1.5rem] h-[1.5rem] flex items-center justify-center">
              <Icon className={`w-[1.25rem] h-[1.25rem] transition-all duration-150
                ${isActive ? 'scale-110' : 'scale-100'}`}
              />
              {showBadge && (
                <span className="absolute -top-[0.25rem] -right-[0.25rem]
                  min-w-[0.875rem] h-[0.875rem] px-[0.125rem]
                  rounded-full bg-destructive text-[0.5rem] font-bold text-white
                  flex items-center justify-center leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {/* Label */}
            <span className={`text-[0.6875rem] font-medium leading-none tracking-tight
              ${isActive ? 'text-sky-400' : 'text-muted-foreground/60'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
