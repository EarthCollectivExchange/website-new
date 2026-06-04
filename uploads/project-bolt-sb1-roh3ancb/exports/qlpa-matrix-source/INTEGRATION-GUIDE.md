# QLPA Matrix Source — Integration Guide

## Overview

This guide explains how to integrate the QLPA Matrix Source into a new project.

The source roots are framework-agnostic TypeScript. The guide covers Next.js and plain React integration.

---

## 1. Copy the Source

Copy these folders from the QLPA Matrix Source export into your project root:

```
lib/foundation/
lib/qlpa/
lib/design/
lib/i18n/
lib/privacy/
lib/security/
lib/stats/
components/foundation/
components/stats/
scripts/check-foundation.mjs
scripts/check-i18n.mjs
scripts/check-qlpa-language.mjs
scripts/check-stats-privacy.mjs
scripts/check-portability.mjs
docs/architecture/
QLPA-ETHICAL-USE.md
PROJECT-ADAPTATION.md
```

---

## 2. Path Alias Setup

The source uses `@/` as the root path alias.

### Next.js (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Plain React / Vite (vite.config.ts)

```ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

---

## 3. Preferences Provider Setup

Wrap your app root with `PreferencesProvider`:

### Next.js (app/layout.tsx)

```tsx
import { PreferencesProvider } from '@/lib/foundation/preferencesContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
```

### Plain React (main.tsx)

```tsx
import { PreferencesProvider } from '@/lib/foundation/preferencesContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <PreferencesProvider>
    <App />
  </PreferencesProvider>
);
```

---

## 4. Using Preferences

```tsx
import { usePreferences } from '@/lib/foundation/preferencesContext';

function MyComponent() {
  const { humanMode, interfaceDepth, isAdvancedOrDev, isDeveloper } = usePreferences();

  return (
    <div>
      <p>Mode: {humanMode}</p>
      {isAdvancedOrDev && <AdvancedPanel />}
      {isDeveloper && <DiagnosticsPanel />}
    </div>
  );
}
```

---

## 5. i18n Setup

```tsx
import { I18nProvider } from '@/lib/i18n/context';

// Wrap your app
<I18nProvider defaultLocale="en">
  <App />
</I18nProvider>
```

```tsx
import { useI18n } from '@/lib/i18n/context';

function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  return <p>{t('nav.conversations')}</p>;
}
```

Add your product-specific i18n keys to all active locale files. Keep `en.json` as the source of truth.

---

## 6. Mode Setup

```tsx
import { HUMAN_MODES, HUMAN_MODE_LIST } from '@/lib/foundation/modes';
import { usePreferences } from '@/lib/foundation/preferencesContext';

function ModeSelector() {
  const { humanMode, setHumanMode } = usePreferences();

  return (
    <div>
      {HUMAN_MODE_LIST.map((mode) => (
        <button
          key={mode.key}
          onClick={() => setHumanMode(mode.key)}
          className={humanMode === mode.key ? 'active' : ''}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
}
```

---

## 7. Stats Setup

```tsx
import { recordStatsEvent } from '@/lib/stats/lightAnalyzer';
import { statsMessageSent } from '@/lib/stats/statsEvents';
import { usePreferences } from '@/lib/foundation/preferencesContext';

function sendMessage() {
  const event = statsMessageSent({ storageMode: 'local_only', success: true });
  recordStatsEvent(event);
}
```

Stats mode is controlled through preferences:

```tsx
const { statsMode, setStatsMode } = usePreferences();
// statsMode: 'off' | 'light' | 'complete'
```

---

## 8. QLPA Language Protocol

```ts
import { scanTextForQlpaTerms, getQlpaReplacement } from '@/lib/qlpa/qlpaGuards';

// Developer tool — scan UI copy for discouraged terms
const result = scanTextForQlpaTerms('Delete forever from all devices');
if (result.found) {
  result.matches.forEach((m) => {
    console.warn(`Discouraged: "${m.term}" → use "${m.replacement}"`);
  });
}
```

---

## 9. Phi / Fibonacci Design Tokens

```ts
import { PHI, FIBONACCI, phiMajor } from '@/lib/design/phiTokens';
import { SPACING } from '@/lib/design/layoutRhythm';
import { MINIMUM_TOUCH_TARGET } from '@/lib/design/touchTargets';

// Spacing derived from Fibonacci
const gap = FIBONACCI.f13; // 13px gap

// Golden ratio column split
const sidebarWidth = phiMajor(1000); // 618px
```

---

## 10. Project Adaptation Steps

1. Update `lib/foundation/appConstants.ts` — set `APP_NAME`, `APP_VERSION`, and storage key prefixes
2. Update `lib/foundation/appCapabilities.ts` — enable capabilities your app supports
3. Add product i18n keys to all locale files
4. Apply your design skin over the Phi/Fibonacci token structure
5. Run validation scripts:
   - `node scripts/check-portability.mjs`
   - `node scripts/check-foundation.mjs`
   - `node scripts/check-i18n.mjs`
   - `node scripts/check-qlpa-language.mjs`
   - `node scripts/check-stats-privacy.mjs`

See `PROJECT-ADAPTATION.md` for the full customization checklist.
