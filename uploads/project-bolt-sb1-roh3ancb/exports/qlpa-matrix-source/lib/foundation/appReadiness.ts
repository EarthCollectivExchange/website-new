/**
 * EarthOS App Readiness
 * Runtime checks for whether foundational systems are ready.
 * Used by dev tools and the foundation status badge.
 */

export interface ReadinessCheck {
  id: string;
  labelKey: string;
  pass: boolean;
  noteKey?: string;
}

export interface ReadinessReport {
  allPassed: boolean;
  checks: ReadinessCheck[];
  passedCount: number;
  totalCount: number;
}

type ReadinessChecker = () => ReadinessCheck;

const READINESS_CHECKERS: ReadinessChecker[] = [
  () => ({
    id: 'localStorage',
    labelKey: 'readiness.localStorage',
    pass: typeof window !== 'undefined' && !!window.localStorage,
  }),
  () => ({
    id: 'crypto',
    labelKey: 'readiness.crypto',
    pass: typeof window !== 'undefined' && !!window.crypto?.subtle,
  }),
  () => ({
    id: 'indexedDB',
    labelKey: 'readiness.indexedDB',
    pass: typeof window !== 'undefined' && !!window.indexedDB,
    noteKey: 'readiness.indexedDBNote',
  }),
  () => ({
    id: 'serviceWorker',
    labelKey: 'readiness.serviceWorker',
    pass: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    noteKey: 'readiness.serviceWorkerNote',
  }),
];

export function runReadinessChecks(): ReadinessReport {
  if (typeof window === 'undefined') {
    return { allPassed: false, checks: [], passedCount: 0, totalCount: 0 };
  }
  const checks = READINESS_CHECKERS.map((fn) => fn());
  const passedCount = checks.filter((c) => c.pass).length;
  return {
    allPassed: passedCount === checks.length,
    checks,
    passedCount,
    totalCount: checks.length,
  };
}
