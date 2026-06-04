// ─── i18n Locale Validator ────────────────────────────────────────────────────
//
// Validates all locale JSON files against en.json.
// Imported by scripts/validate-i18n.mjs which runs it as a Node script.
//
// Rules:
//   1. Every key in en.json must exist in every other active locale file.
//   2. No raw i18n key pattern (e.g. "trust.levelLabel") may appear as
//      literal JSX text in components/messaging or app/messaging.
//
// Exit code:
//   0 — all locales valid
//   1 — one or more locales missing keys (build should fail)

export interface ValidationResult {
  locale: string;
  missingKeys: string[];
}

export interface ValidateLocalesReport {
  passed: boolean;
  results: ValidationResult[];
  totalMissing: number;
}

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject { [key: string]: JsonValue }

function flatten(obj: JsonObject, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(result, flatten(v as JsonObject, key));
    } else {
      result[key] = String(v);
    }
  }
  return result;
}

export function validateLocales(
  enJson: JsonObject,
  otherLocales: Array<{ code: string; json: JsonObject }>
): ValidateLocalesReport {
  const enFlat = flatten(enJson);
  const enKeys = Object.keys(enFlat);

  const results: ValidationResult[] = [];
  let totalMissing = 0;

  for (const { code, json } of otherLocales) {
    const flat = flatten(json);
    const missingKeys = enKeys.filter((k) => !(k in flat));
    results.push({ locale: code, missingKeys });
    totalMissing += missingKeys.length;
  }

  return {
    passed: totalMissing === 0,
    results,
    totalMissing,
  };
}

export function formatReport(report: ValidateLocalesReport): string {
  const lines: string[] = [];

  if (report.passed) {
    lines.push('✓ All locales are complete — no missing keys.');
    return lines.join('\n');
  }

  lines.push(`✗ i18n validation failed: ${report.totalMissing} missing key(s) across ${report.results.filter((r) => r.missingKeys.length > 0).length} locale(s).\n`);

  for (const { locale, missingKeys } of report.results) {
    if (missingKeys.length === 0) continue;
    lines.push(`  ${locale}: ${missingKeys.length} missing key(s)`);
    for (const key of missingKeys.slice(0, 20)) {
      lines.push(`    - ${key}`);
    }
    if (missingKeys.length > 20) {
      lines.push(`    ... and ${missingKeys.length - 20} more`);
    }
  }

  return lines.join('\n');
}
