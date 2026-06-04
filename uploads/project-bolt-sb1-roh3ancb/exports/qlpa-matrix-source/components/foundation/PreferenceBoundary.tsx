'use client';

import type { ReactNode } from 'react';
import { usePreferences } from '@/lib/foundation/preferencesContext';
import type { InterfaceDepth } from '@/lib/foundation/modes';

interface PreferenceBoundaryProps {
  minDepth: InterfaceDepth;
  children: ReactNode;
  fallback?: ReactNode;
}

const DEPTH_ORDER: InterfaceDepth[] = ['simple', 'advanced', 'developer'];

/**
 * Renders children only when the current interface depth meets the minimum.
 * Use this to gate advanced/developer features at the component level.
 */
export function PreferenceBoundary({
  minDepth,
  children,
  fallback = null,
}: PreferenceBoundaryProps) {
  const { interfaceDepth } = usePreferences();
  const currentIndex = DEPTH_ORDER.indexOf(interfaceDepth);
  const minIndex = DEPTH_ORDER.indexOf(minDepth);
  if (currentIndex < minIndex) return <>{fallback}</>;
  return <>{children}</>;
}
