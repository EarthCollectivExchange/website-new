'use client';

import type { ReactNode } from 'react';
import { usePreferences } from '@/lib/foundation/preferencesContext';

interface DeveloperOnlyProps {
  children: ReactNode;
}

/**
 * Renders children only in Developer interface depth.
 * Zero footprint in Simple and Advanced view.
 */
export function DeveloperOnly({ children }: DeveloperOnlyProps) {
  const { isDeveloper } = usePreferences();
  if (!isDeveloper) return null;
  return <>{children}</>;
}
