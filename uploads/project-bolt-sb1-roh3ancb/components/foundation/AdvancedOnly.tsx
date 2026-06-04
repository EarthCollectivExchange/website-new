'use client';

import type { ReactNode } from 'react';
import { usePreferences } from '@/lib/foundation/preferencesContext';

interface AdvancedOnlyProps {
  children: ReactNode;
}

/**
 * Renders children only in Advanced or Developer interface depth.
 * Zero footprint in Simple view.
 */
export function AdvancedOnly({ children }: AdvancedOnlyProps) {
  const { isAdvancedOrDev } = usePreferences();
  if (!isAdvancedOrDev) return null;
  return <>{children}</>;
}
