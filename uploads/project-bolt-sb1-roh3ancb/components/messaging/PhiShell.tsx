'use client';

import { X } from 'lucide-react';

interface PhiShellProps {
  /** Left column — conversation list (38.2% on desktop) */
  leftPanel: React.ReactNode;
  /** Main area — active conversation (61.8% on desktop, full on mobile) */
  children: React.ReactNode;
  /** Whether a conversation is selected (controls mobile visibility) */
  hasActiveConversation: boolean;
  /** Overlay drawer content */
  rightDrawer?: React.ReactNode;
  /** Whether the right drawer is visible */
  showRightDrawer?: boolean;
  /** Close the right drawer */
  onCloseRightDrawer?: () => void;
  /** Bottom navigation (mobile only) */
  bottomNav?: React.ReactNode;
}

/**
 * PhiShell — Golden Ratio layout wrapper.
 *
 * Desktop: leftPanel (38.2%) | children (61.8%)
 *          rightDrawer overlays the right side as an animated sheet
 *
 * Mobile: one panel visible at a time, bottom nav always accessible
 *
 * Spacing scale: 8, 13, 21, 34, 55, 89px (Fibonacci)
 */
export function PhiShell({
  leftPanel,
  children,
  hasActiveConversation,
  rightDrawer,
  showRightDrawer = false,
  onCloseRightDrawer,
  bottomNav,
}: PhiShellProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Left column — conversation list (phi minor = 38.2%) ── */}
        <div
          className={`
            flex-shrink-0 overflow-hidden
            earthos-surface-glass backdrop-blur-2xl
            transition-all duration-250 ease-in-out
            ${hasActiveConversation
              ? 'hidden md:flex md:flex-col'
              : 'flex flex-col w-full'}
            md:w-phi-minor md:min-w-[264px] md:max-w-[360px]
            md:border-r
          `}
          style={{ borderColor: 'var(--qlpa-divider-soft)', boxShadow: '1px 0 0 rgba(125,220,255,0.06)' }}
        >
          {leftPanel}
        </div>

        {/* ── Main area — active conversation (phi major = 61.8%) ── */}
        <div
          className={`
            flex-1 overflow-hidden flex flex-col relative
            ${hasActiveConversation ? 'flex' : 'hidden md:flex'}
          `}
        >
          {children}
        </div>

        {/* ── Right overlay drawer ── */}
        {showRightDrawer && rightDrawer && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/15 backdrop-blur-[3px] z-30 animate-fade-in
                md:left-0"
              onClick={onCloseRightDrawer}
            />
            {/* Drawer panel — 38.2% width, full height */}
            <div
              className="absolute right-0 top-0 bottom-0 z-40
                w-full sm:w-[380px] md:w-phi-minor md:min-w-[280px] md:max-w-[380px]
                glass border-l
                animate-slide-in-right flex flex-col"
              style={{ borderColor: 'var(--qlpa-divider-soft)', boxShadow: '-4px 0 40px rgba(0,0,0,0.28), -1px 0 0 rgba(125,220,255,0.06)' }}
            >
              {rightDrawer}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom nav (mobile only) ── */}
      {bottomNav && (
        <div className="md:hidden flex-shrink-0">{bottomNav}</div>
      )}
    </div>
  );
}
