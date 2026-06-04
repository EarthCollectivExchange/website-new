'use client';

import { useEffect } from 'react';
import { NatureBackdrop } from './NatureBackdrop';

interface NatureAppShellProps {
  children: React.ReactNode;
  backdropIntensity?: 'light' | 'medium' | 'deep';
}

export function NatureAppShell({ children, backdropIntensity = 'medium' }: NatureAppShellProps) {
  useEffect(() => {
    document.body.classList.add('nature-skin');
    return () => document.body.classList.remove('nature-skin');
  }, []);

  return (
    <div className="relative flex flex-col overflow-hidden w-full max-w-full"
      style={{ height: '100svh', minHeight: '100svh' }}>
      <NatureBackdrop intensity={backdropIntensity} />
      <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden pb-safe-bottom w-full">
        {children}
      </div>
    </div>
  );
}
