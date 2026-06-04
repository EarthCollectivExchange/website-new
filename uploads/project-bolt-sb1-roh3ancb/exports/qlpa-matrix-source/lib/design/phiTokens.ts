/**
 * Phi (Golden Ratio) Design Tokens
 * The Golden Ratio (φ ≈ 1.618) governs proportions throughout QLPA Matrix Source.
 *
 * Core principle: Major elements take 61.8% of space; minor elements take 38.2%.
 * This creates inherent visual harmony without conscious effort.
 */

/** The Golden Ratio */
export const PHI = 1.618033988749895;

/** Inverse of PHI — the minor portion */
export const INVERSE_PHI = 0.6180339887498949;

/** Major portion of a space (the larger segment) */
export const MAJOR_RATIO = 0.618;

/** Minor portion of a space (the smaller segment) */
export const MINOR_RATIO = 0.382;

/** Used to derive secondary sizes from primary sizes */
export const PHI_SCALE = {
  xs:  Math.round(8 * INVERSE_PHI),    // ~5px
  sm:  8,                               // base
  md:  Math.round(8 * PHI),            // ~13px
  lg:  Math.round(8 * PHI * PHI),      // ~21px
  xl:  Math.round(8 * PHI * PHI * PHI), // ~34px
  xxl: Math.round(8 * Math.pow(PHI, 4)), // ~55px
} as const;

/**
 * Apply PHI to a base value to get the major component.
 * e.g. phiMajor(1000) → 618 (the wider column in a two-column layout)
 */
export function phiMajor(total: number): number {
  return Math.round(total * MAJOR_RATIO);
}

/**
 * Apply PHI to a base value to get the minor component.
 * e.g. phiMinor(1000) → 382 (the narrower column)
 */
export function phiMinor(total: number): number {
  return Math.round(total * MINOR_RATIO);
}

/**
 * Given a total width, return both column widths using the golden ratio split.
 */
export function phiColumns(totalPx: number): { major: number; minor: number } {
  return { major: phiMajor(totalPx), minor: phiMinor(totalPx) };
}
