/**
 * Fibonacci Scale
 * Spacing values derived from the Fibonacci sequence.
 * Use these as the foundation for all layout rhythm decisions.
 *
 * Usage: prefer these values over arbitrary px amounts.
 * Every gap, padding, margin, and size should trace back to one of these.
 */

export const FIBONACCI = {
  f1:  1,
  f2:  2,
  f3:  3,
  f5:  5,
  f8:  8,
  f13: 13,
  f21: 21,
  f34: 34,
  f55: 55,
  f89: 89,
  f144: 144,
} as const;

export type FibonacciValue = typeof FIBONACCI[keyof typeof FIBONACCI];

/** All Fibonacci values as an ordered array */
export const FIBONACCI_SEQUENCE: number[] = Object.values(FIBONACCI);

/**
 * Find the nearest Fibonacci number for a given px value.
 * Useful when mapping arbitrary design values to the grid.
 */
export function nearestFibonacci(value: number): number {
  return FIBONACCI_SEQUENCE.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

/**
 * Tailwind-compatible spacing class generator.
 * Maps Fibonacci values to Tailwind spacing units (1 unit = 4px).
 */
export const FIBONACCI_TAILWIND: Record<keyof typeof FIBONACCI, string> = {
  f1:   'p-0',    // 0px (nearest: skip, use border)
  f2:   'p-px',   // 1px
  f3:   'p-0.5',  // 2px  → 0.5 unit
  f5:   'p-1',    // 4px  ≈ 5
  f8:   'p-2',    // 8px  exact
  f13:  'p-3',    // 12px ≈ 13
  f21:  'p-5',    // 20px ≈ 21
  f34:  'p-8',    // 32px ≈ 34
  f55:  'p-14',   // 56px ≈ 55
  f89:  'p-24',   // 96px ≈ 89 (gap)
  f144: 'p-36',   // 144px exact
};
